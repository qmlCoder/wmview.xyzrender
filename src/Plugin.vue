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
  <item-panel title="插件路径">
    <el-input v-model="refs.plugin_fold" placeholder="xyzrender.exe 路径"></el-input>
  </item-panel>
  <item-panel title="显示氢原子">
    <el-switch v-model="refs.showHatom"></el-switch>
  </item-panel>
  <item-panel title="图片类型"></item-panel>
  <div>
    <el-button @click="gen_img">生成图片</el-button>
  </div>
  <img :src="refs.imgPath" v-if="refs.imgPath != ''" style="width: 100%;height: auto;">
</template>


<script setup lang="ts">
import ItemPanel from "./ItemPanel.vue";
import { ElButton, ElInput, ElSwitch } from "element-plus";
import { ref } from "vue";
import * as THREE from "three";
import { listen } from "@tauri-apps/api/event";
import { convertFileSrc } from "@tauri-apps/api/core";
import { writeTextFile, readTextFile } from "@tauri-apps/plugin-fs";
const wmapi = window.WmAPI;


const refs = ref({
  plugin_fold: "",
  imgPath: "",
  stderr: [] as string[],
  stdout: [] as string[],
  testnum: 0,
  showHatom: false
})

// 开发时的插件文件夹
if (import.meta.env.DEV) {
  refs.value.plugin_fold = "E:/code/wmview/plugins/wmview.xyzrender"
}
// 运行时的插件文件夹
if (import.meta.env.PROD) {
  refs.value.plugin_fold = window.WmAPI.get_appRoot() + "/plugins/wmview.xyzrender"
}


const gen_files = async () => {
  let xyz_text = ""
  const scene = wmapi.get_scene()
  const mole = scene.moles.get()
  if (!mole) return;
  const syms = [];
  const xyzs = [];
  const atoms = mole.atoms.getAll();
  for (const atom of atoms) {
    syms.push(atom.sym);
    xyzs.push(atom.position.toArray());
  }
  for (let i = 0; i < syms.length; i++) {
    const sym = syms[i]?.padStart(2, ' ');
    const xyz = xyzs[i] as number[];
    const x = xyz[0]?.toFixed(4).padStart(10, ' ');
    const y = xyz[1]?.toFixed(4).padStart(10, ' ');
    const z = xyz[2]?.toFixed(4).padStart(10, ' ');
    xyz_text += `${sym}          ${x}${y}${z}\n`
  }
  await writeTextFile(`${refs.value.plugin_fold}/atom_xyzs.txt`, xyz_text)
  const camera = scene.get_camera()
  const dirX = new THREE.Vector3();
  const dirY = new THREE.Vector3();
  const dirZ = new THREE.Vector3();
  dirX.set(1, 0, 0).transformDirection(camera.matrixWorld);
  dirY.set(0, 1, 0).transformDirection(camera.matrixWorld);
  dirZ.set(0, 0, 1).transformDirection(camera.matrixWorld);
  let camera_text = ""
  for (const dir of [dirX, dirY, dirZ]) {
    for (const val of dir) {
      camera_text += val.toFixed(4).padStart(10, ' ')
    }
    camera_text += '\n'
  }
  await writeTextFile(`${refs.value.plugin_fold}/cameraMatrix.txt`, camera_text)
}

interface Stdin {
  showHatom: boolean;
}

const gen_img = async () => {
  const mole = wmapi.get_scene().moles.get();
  if (!mole) return;
  wmapi.show_loading("xyzrender渲染中...")
  await gen_files()
  const pythonPath = `${refs.value.plugin_fold}/python-3.10/pythonw.exe`;
  const scriptPath = `${refs.value.plugin_fold}/main.py`;
  const args = [scriptPath]
  const input: Stdin = {
    showHatom: refs.value.showHatom,
  }
  const success = await wmapi.run_exe("plugin_xyzrender", pythonPath, args, JSON.stringify(input));
  console.log("exe执行结果:", success)
  if (success) {
    const imgPath = convertFileSrc(`${refs.value.plugin_fold}/test.svg`)
    refs.value.imgPath = `${imgPath}?t=${Date.now()}`
  }
  wmapi.hide_loading()
}

listen("plugin_xyzrender:RunExe:stdout", (event) => {
  console.log("exe stdout:", event.payload)
  wmapi.add_logText("xyzrender", `${event.payload}`)
})
</script>