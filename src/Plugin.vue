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
  <div>
    <el-button @click="gen_img">生成图片</el-button>
  </div>
  <div :class="$style.stdout">{{ refs.stdout }}</div>
  <div :class="$style.stderr">{{ refs.stderr }}</div>
  <img :src="refs.imgPath" v-if="refs.imgPath != ''" style="width: 100%;height: auto;">
</template>


<script setup lang="ts">
import ItemPanel from "./ItemPanel.vue";
import { ElButton, ElInput, ElSwitch } from "element-plus";
import { inject, ref } from "vue";
import * as THREE from "three";
import type { Scene } from "./wmview";
const { run_exe, get_moleXyzs, save_text } = window.WmAPI;


const refs = ref({
  plugin_fold: "",
  imgPath: "",
  stderr: "标准输出:",
  stdout: "标准错误:",
  testnum: 0,
  showHatom: false
})

if (import.meta.env.DEV) {
  refs.value.plugin_fold = "E:/code/wmview/plugins/wmview.xyzrender"
}
if (import.meta.env.PROD) {
  refs.value.plugin_fold = window.WmAPI.get_appRoot() + "/plugins/wmview.xyzrender"
}

// import { Command } from '@tauri-apps/plugin-shell';
const scene = inject('scene') as Scene;

console.log("测试组件被加载了", scene)


const gen_files = async () => {
  let xyz_text = ""
  const [syms, xyzs] = get_moleXyzs()
  for (let i = 0; i < syms.length; i++) {
    const sym = syms[i]?.padStart(2, ' ');
    const xyz = xyzs[i] as number[];
    const x = xyz[0]?.toFixed(4).padStart(10, ' ');
    const y = xyz[1]?.toFixed(4).padStart(10, ' ');
    const z = xyz[2]?.toFixed(4).padStart(10, ' ');
    xyz_text += `${sym}          ${x}${y}${z}\n`
  }
  await save_text(`${refs.value.plugin_fold}/atom_xyzs.txt`, xyz_text)
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
  await save_text(`${refs.value.plugin_fold}/cameraMatrix.txt`, camera_text)
}

const gen_img = async () => {
  const mole = scene.moles.get();
  if (!mole) return;
  await gen_files()
  const pythonPath = `${refs.value.plugin_fold}/python-3.10/python.exe`;
  const scriptPath = `${refs.value.plugin_fold}/main.py`;
  const args = [scriptPath]
  const [success, out, err] = await run_exe(pythonPath, args)

  console.log(out)
  if (success) {
    refs.value.stdout = out
    const imgPath = window.WmAPI.convertFileSrc(`${refs.value.plugin_fold}/test.svg`)
    refs.value.imgPath = `${imgPath}?t=${Date.now()}`
  } else {
    refs.value.stderr = err
    console.error(err)
  }
}
</script>