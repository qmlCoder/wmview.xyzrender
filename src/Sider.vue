<style module>
div.actions {
    display: flex;
    gap: 8px;
    margin: 0 5px 10px;
}

img.preview {
    width: 100%;
    height: auto;
    margin: 0 5px;
}
</style>

<template>
    <panel-group title="xyzrender 渲染">
        <panel-item title="显示氢原子">
            <el-switch v-model="refs.showHatom"></el-switch>
        </panel-item>
        <panel-item title="图片类型">
            <el-radio-group v-model="refs.imgType">
                <el-radio value="png">png</el-radio>
                <el-radio value="svg">svg</el-radio>
            </el-radio-group>
        </panel-item>
        <panel-item title="图片风格">
            <el-select v-model="refs.style" style="width: 100%">
                <el-option v-for="style in styles" :key="style" :label="style" :value="style"></el-option>
            </el-select>
        </panel-item>
    </panel-group>
    <div :class="$style.actions">
        <el-button type="primary" :loading="refs.busy" @click="gen_img">生成图片</el-button>
    </div>
    <img v-if="refs.imgPath != ''" :src="refs.imgPath" :class="$style.preview" />
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import * as THREE from 'three'
import { ElButton, ElSwitch, ElRadioGroup, ElRadio, ElSelect, ElOption } from 'element-plus'
import { listen } from '@tauri-apps/api/event'
import { convertFileSrc } from '@tauri-apps/api/core'
import PanelGroup from './comps/Panel-Group.vue'
import PanelItem from './comps/Panel-Item.vue'

const cores = window.wmapi_cores
const files = window.wmapi_files
const wmscene = window.wmapi_scene

// run_exe 的事件/日志前缀，需与主程序约定一致
const SOURCE = 'plugin_xyzrender'
// 开发时插件跑在源码目录（内嵌 python 就在这），发布时跑在宿主 plugs 的安装目录
const DEV_FOLD = 'E:/code/wmview/plugins/wmview.xyzrender'

const refs = ref({
    imgPath: '',
    showHatom: false,
    imgType: 'png',
    style: 'default',
    busy: false,
});
const styles = ["default", "flat", "paton", "pmol", "skeletal", "tube", "mtube", "btube", "wire", "graph"];

/**
 * 主程序通过 Vue provide('scene') 提供场景对象（开发指南/AGENTS.md 约定），
 * 这里只用来读取相机朝向；分子结构一律走 wmapi_scene 公开 API。
 */
type SceneWithCamera = {
    get_camera: () => THREE.PerspectiveCamera | THREE.OrthographicCamera;
};
const scene = inject<SceneWithCamera | null>('scene', null);

/** 插件目录：dev 用本地源码目录，发布用宿主 plugs 下的安装目录 */
let foldP: Promise<string> | undefined;
const plugin_fold = () => {
    if (!foldP) {
        foldP = (async () => {
            if (import.meta.env.DEV) return DEV_FOLD;
            // get_plugFold 依赖后端根目录初始化完成，先 wait_root 再取路径
            await files.wait_root();
            return `${files.get_plugFold()}/wmview.xyzrender`;
        })();
    }
    return foldP;
};

/** 从 wmapi_scene 取当前显示的分子名与几何（坐标单位埃） */
const get_moleAtoms = () => {
    const name = wmscene.get_mole_name();
    if (!name) return;
    const geom = wmscene.get_mole_geom(name);
    if (!geom?.length) return;
    const syms: string[] = [];
    const xyzs: number[][] = [];
    for (const [sym, x, y, z] of geom) {
        syms.push(sym);
        xyzs.push([x, y, z]);
    }
    return { name, syms, xyzs };
};

/**
 * 相机朝向矩阵：取 scene 相机世界矩阵的三个轴方向，把分子坐标转到“当前视角”
 * 坐标系，供 main.py 对齐渲染朝向。拿不到 scene 时回退为单位矩阵（按文件原始朝向）。
 */
const camera_matrix = () => {
    const camera = scene?.get_camera();
    if (!camera) {
        return [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
        ];
    }
    const dirX = new THREE.Vector3();
    const dirY = new THREE.Vector3();
    const dirZ = new THREE.Vector3();
    dirX.set(1, 0, 0).transformDirection(camera.matrixWorld);
    dirY.set(0, 1, 0).transformDirection(camera.matrixWorld);
    dirZ.set(0, 0, 1).transformDirection(camera.matrixWorld);
    const [xx, xy, xz] = dirX.toArray();
    const [yx, yy, yz] = dirY.toArray();
    const [zx, zy, zz] = dirZ.toArray();
    return [
        [xx, xy, xz],
        [yx, yy, yz],
        [zx, zy, zz],
    ];
};

// 发布版直接调打包好的 xyzrender.exe（已内置 python 运行时与依赖），
// 不再需要嵌入式 python / 首次 pip 装依赖；开发版仍跑源码 python 环境
const isProd = import.meta.env.PROD;

const chk_deps = async () => {
    const fold = await plugin_fold();
    cores.show_loading('xyzrender检查依赖中...');
    try {
        const [ok] = await cores.run_exe(SOURCE, `${fold}/python-3.10/pythonw.exe`, [`${fold}/deps.py`], '');
        if (!ok) cores.notify('依赖安装失败，请看日志', 'error');
        return ok;
    } finally {
        cores.hide_loading();
    }
};

/** 渲染器启动命令：发布版 xyzrender.exe，开发版 pythonw + main.py */
const render_cmd = async () => {
    const fold = await plugin_fold();
    if (isProd) return { exe: `${fold}/xyzrender.exe`, args: [] as string[] };
    return { exe: `${fold}/python-3.10/pythonw.exe`, args: [`${fold}/main.py`] };
};

interface MainParas {
    moleSyms: string[];
    moleXyzs: number[][];
    cameraMatrix: number[][];
    molePath: string;
    showHatom: boolean;
    imgType: string;
    style: string;
}

const gen_img = async () => {
    const mole = get_moleAtoms();
    if (!mole) {
        cores.notify('场景中没有分子', 'warning');
        return;
    }
    if (!isProd && !(await chk_deps())) return;
    refs.value.busy = true;
    cores.show_loading('xyzrender渲染中...');
    try {
        // 先取插件目录(PROD 内部会 wait_root，保证 get_moleFold 可用)
        const fold = await plugin_fold();
        const input: MainParas = {
            moleSyms: mole.syms,
            moleXyzs: mole.xyzs,
            cameraMatrix: camera_matrix(),
            molePath: `${files.get_moleFold()}/${mole.name}`,
            showHatom: refs.value.showHatom,
            imgType: refs.value.imgType,
            style: refs.value.style,
        };
        const { exe, args } = await render_cmd();
        const [ok, out] = await cores.run_exe(SOURCE, exe, args, JSON.stringify(input));
        console.log('exe执行结果:', ok, out);
        if (ok) {
            // convertFileSrc 转成 asset 协议 URL（如 http://asset.localhost/...），主程序可直接显示
            const imgPath = convertFileSrc(`${fold}/main.${refs.value.imgType}`);
            refs.value.imgPath = `${imgPath}?t=${Date.now()}`;
        } else {
            cores.notify('渲染失败，请看日志', 'error');
        }
    } finally {
        refs.value.busy = false;
        cores.hide_loading();
    }
};

// python 的 stdout 实时事件（{source}:RunExe:stdout），转发到主程序日志面板
listen(`${SOURCE}:RunExe:stdout`, (event) => {
    console.log('exe stdout:', event.payload);
    cores.add_logText('xyzrender', `${event.payload}`);
});
</script>
