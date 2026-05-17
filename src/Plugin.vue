<style module>
div.row-item {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: flex-start;
    gap: 10px;
    width: 100%;
}

div.item-tip {
    width: 5rem;
}

div.stdout {
    white-space: pre-wrap;
    font-size: smaller;
    color: #2b8a3e;
}

div.stderr {
    white-space: pre-wrap;
    font-size: smaller;
    color: #c92a2a;
}
</style>

<template>
    <!-- <item-panel title="插件路径">
    <el-input v-model="refs.plugin_fold" placeholder="xyzrender.exe 路径"></el-input>
  </item-panel> -->
    <item-panel title="显示氢原子">
        <el-switch v-model="refs.showHatom"></el-switch>
    </item-panel>
    <item-panel title="图片类型">
        <el-radio-group v-model="refs.imgType">
            <el-radio label="png">png</el-radio>
            <el-radio label="svg">svg</el-radio>
        </el-radio-group>
    </item-panel>
    <item-panel title="图片风格">
        <el-select v-model="refs.style">
            <el-option v-for="style in styles" :key="style" :label="style" :value="style"></el-option>
        </el-select>
    </item-panel>
    <div>
        <el-button @click="gen_img">生成图片</el-button>
    </div>
    <img :src="refs.imgPath" v-if="refs.imgPath != ''" style="width: 100%; height: auto" />
</template>

<script setup lang="ts">
import ItemPanel from "./ItemPanel.vue";
import { ElButton, ElInput, ElSwitch, ElRadioGroup, ElRadio, ElSelect, ElOption } from "element-plus";
import { ref, inject } from "vue";
import * as THREE from "three";
import { listen } from "@tauri-apps/api/event";
import { convertFileSrc } from "@tauri-apps/api/core";
import { writeTextFile, readTextFile } from "@tauri-apps/plugin-fs";
import type { Scene } from "./WmObj";
const wmapi = window.WmAPI;

const refs = ref({
    plugin_fold: "",
    imgPath: "",
    stderr: [] as string[],
    stdout: [] as string[],
    testnum: 0,
    showHatom: false,
    imgType: "png",
    style: "default",
    fog: false,
    fog_strength: 0.0,
});
const styles = ["default", "flat", "paton", "pmol", "skeletal", "tube", "mtube", "btube", "wire", "graph"];

// 开发时的插件文件夹
if (import.meta.env.DEV) {
    refs.value.plugin_fold = "E:/code/wmview/plugins/wmview.xyzrender";
}
// 运行时的插件文件夹
if (import.meta.env.PROD) {
    refs.value.plugin_fold = window.WmAPI.get_plugFold() + "/wmview.xyzrender";
}

const get_moleAtoms = () => {
    const scene = wmapi.get_scene();
    const mole = scene.moles.get();
    if (!mole) return;
    const syms = [];
    const xyzs = [];
    const atoms = mole.atoms.getAll();
    for (const atom of atoms) {
        syms.push(atom.sym);
        xyzs.push(atom.position.toArray());
    }
    return { syms, xyzs };
};

const camera_matrix = () => {
    const scene = wmapi.get_scene();
    const camera = scene.get_camera();
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

const scene = inject("scene") as Scene;

const pythonPath = `${refs.value.plugin_fold}/python-3.10/pythonw.exe`;

const chk_deps = async () => {
    wmapi.show_loading("xyzrender检查依赖中...");
    const args = [`${refs.value.plugin_fold}/deps.py`];
    const success = await wmapi.run_exe("plugin_xyzrender", pythonPath, args, "");
    wmapi.hide_loading();
    return success;
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
    const mole = scene.moles.get();
    if (!mole) return;
    if (!(await chk_deps())) return;
    wmapi.show_loading("xyzrender渲染中...");
    // await gen_files()
    const scriptPath = `${refs.value.plugin_fold}/main.py`;
    const args = [scriptPath];
    const atoms = get_moleAtoms();
    if (!atoms) return;
    const camera = camera_matrix();
    const input: MainParas = {
        moleSyms: atoms.syms,
        moleXyzs: atoms.xyzs,
        cameraMatrix: camera,
        molePath: `${wmapi.get_moleFold()}/${mole.name}`,
        showHatom: refs.value.showHatom,
        imgType: refs.value.imgType,
        style: refs.value.style,
    };
    const success = await wmapi.run_exe("plugin_xyzrender", pythonPath, args, JSON.stringify(input));
    console.log("exe执行结果:", success);
    if (success) {
        const imgPath = convertFileSrc(`${refs.value.plugin_fold}/main.${refs.value.imgType}`);
        refs.value.imgPath = `${imgPath}?t=${Date.now()}`;
    } else {
        wmapi.notify("执行错误", "error");
    }
    wmapi.hide_loading();
};

listen("plugin_xyzrender:RunExe:stdout", (event) => {
    console.log("exe stdout:", event.payload);
    wmapi.add_logText("xyzrender", `${event.payload}`);
});
</script>
