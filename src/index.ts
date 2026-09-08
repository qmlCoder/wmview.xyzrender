import Sider from './Sider.vue'
import icon from './icon.png'
import type { Plugin } from './plugin'

/**
 * 插件入口（格式与主程序约定，见 开发指南.md / AGENTS.md「插件契约」）
 *
 * 必须同时导出：
 * - `plugin` 命名导出：本地/生产安装加载（主程序读 module.plugin）
 * - `default` 导出：开发模式加载（主程序回退读 module.default）
 *
 * 本文件被 vite.config.ts 中 exposes['./index'] 指向。
 */
export const plugin: Plugin = {
  name: 'xyzrender', // 侧边栏/日志里显示的名字
  sider: { name: 'xyzrender', icon, comp: Sider }, // icon 内联为 data URL，主程序原样显示
  position: 'right', // 侧边栏位置：'left' | 'right'
  device: ['windows'],
}

export default plugin // 加载器优先读 plugin 导出，回退读 default
