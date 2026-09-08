# wmview.xyzrender

这是一个 wmview 程序的插件项目，需要结合 wmview 使用。

该插件调用 xyzrender 把当前分子按 wmview 视图朝向渲染成出版级图片（png/svg）。

- xyzrender: https://github.com/aligfellow/xyzrender
- wmview: http://www.wmview.xyz/

## 使用方式

将 `wmview.xyzrender.zip` 解压到 wmview 程序根目录下的 `plugs/wmview.xyzrender/`，
重新启动 wmview 程序即可（插件开发指南见同目录 `开发指南.md`）。

插件目录包含：

- `index.js` + `assets/` —— Module Federation 插件入口（宿主加载 `./index` 导出）
- `xyzrender.exe` —— 渲染引擎，已内置 Python 运行时与 xyzrender 依赖，**无需用户安装
  python、无需联网装依赖**

## 开发

- 前端：`npm install` → `npm run dev`（端口 3001，配合主程序 dev 联调）
  → `npm run type-check` / `npm run build`
- 渲染引擎 exe：`python build_exe.py`（使用 `build/venv`，内含 xyzrender 与 pyinstaller；
  产物为根目录 `xyzrender.exe`）
- 发布打包：先 `npm run build`，再 `python pack.py`（把 `dist/index.js + dist/assets +
  xyzrender.exe` 打成 `wmview.xyzrender.zip`，无顶层目录）

说明：开发模式下前端仍直接跑源码 `main.py`（需要本仓库的嵌入式 `python-3.10/` 环境），
发布版一律走 `xyzrender.exe`，两者输入输出协议一致（stdin JSON → 同目录输出
`main.png/main.svg`、`ref.xyz`、`log.txt`）。
