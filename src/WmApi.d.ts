export * from './WmObj'

export interface WmAPI {
  // 执行外部程序
  run_exe: (source: string, exe: string, args: string[], input: string) => Promise<boolean>
  // 显示通知
  notify: (message: string, type: 'success' | 'warning' | 'info' | 'error') => void
  // 获取分子文件夹
  get_moleFold: () => string
  // 获取插件文件夹
  get_plugFold: () => string
  // 获取三维场景
  get_scene: () => Scene
  // 添加日志文本
  add_logText: (from: string, text: string) => void
  // 显示加载面板
  show_loading: (tip: string) => void
  // 隐藏加载面板
  hide_loading: () => void
}
