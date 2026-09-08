import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { federation } from '@module-federation/vite'

export default defineConfig({
  plugins: [
    vue(), // 插件界面是 .vue 组件，必须编译 SFC
    vueDevTools(),
    federation({
      // 名称规则：发布版 = wmview_<短名>，与安装目录 wmview.xyzrender 对应；
      // 开发联调时主程序写死按 wmview_xtb 加载 localhost:3001（见主程序 src/plugin/dev.ts），
      // 需要临时把这里改为 'wmview_xtb' 才能被主程序 dev 自动加载
      name: 'wmview_xyzrender',
      filename: 'index.js', // 入口文件名固定，主程序只认 index.js
      exposes: {
        // 与 src/index.ts 导出插件对象的文件保持一致；主程序统一加载 remote 的 './index'
        './index': './src/index.ts',
      },
      bundleAllCSS: true, // 暴露模块时把组件样式一起带上，避免消费端拿不到 CSS
      dts: false, // 插件侧不生成给消费端用的类型（类型由主程序 wmapi d.ts + 插件 d.ts 维护）
      shared: {
        // vue/element-plus/three 由主程序(MF Host)以 singleton 提供，插件不再各自打包
        vue: { singleton: true, requiredVersion: false },
        'element-plus': { singleton: true, requiredVersion: false },
        three: { singleton: true, requiredVersion: false },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3001, // 固定端口：主程序 dev 启动时自动加载 http://localhost:3001/index.js
    strictPort: true,
    cors: true,
    hmr: true,
    origin: 'http://localhost:3001',
  },
  build: {
    // 保持产物可读，便于调试
    minify: false,
    // 侧边栏图标(icon.png)随入口直接内联成 data URL，
    // 避免打成相对路径资源后在宿主页面里解析失败
    assetsInlineLimit: 100 * 1024,
  },
})
