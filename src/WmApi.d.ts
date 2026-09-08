/**
 * wmview 插件 API 类型声明（模板自带，自包含、无外部 import）
 *
 * 覆盖三类能力桥（其余如 editor/script/wfana 按需向主程序侧 d.ts 查阅）：
 * - wmapi_cores 核心：运行外部程序 / 通知 / 日志 / 文件读写 / 加载面板 / 对话框
 * - wmapi_files 文件：根目录 / 分子文件夹 / 插件文件夹 / 文件列表
 * - wmapi_scene 场景：背景色 / 分子结构 / 原子选择 / 添加箭头、线、轨道、等值面、坐标系
 *
 * 用法：插件代码直接使用 window.wmapi_cores / wmapi_files / wmapi_scene；
 * 类型由文件底部 `declare global` 提供，也可 `import type { wmapi_cores }`。
 */

// ===================== 场景参数类型 =====================

/** 箭头参数 */
export interface ArrowArgs {
  pos: [number, number, number] // pos 箭头起点位置 长度为3的数组
  dir: [number, number, number] // dir 箭头方向 长度为3的数组
  len: number // len 箭头长度
  rad: number // rad 箭头半径
  bind: number[] // bind 箭头绑定的物体索引
  color: string // color 箭头颜色
}

/** 线段参数 */
export interface LineArgs {
  points: [number, number, number][] // points 线段的顶点数组
  dashed: boolean // dashed 是否虚线
}

/** 原子轨道参数 */
export interface PobtArgs {
  position: number[] // position 添加的原子轨道所在的位置 长度为3的数组
  ratio: number // ratio 正相位和负相位的大小比例 默认应该为0.5
  direction: number[] // direction 原子轨道朝向
  scale: number[] // scale 三个方向的缩放，默认应该为1
}

/** 等值面参数 */
export interface SurfArgs {
  verts: number[] // verts 顶点数组
  types: number[] // types 顶点数值类型
  colors: [string, string, string] // colors 颜色映射数组 负值，零值和正值对应的颜色
  name: string // name 等值面名称
}

/** 局部坐标系参数 */
export interface SystmArgs {
  cent: [number, number, number] // cent 坐标系原点位置 长度为3的数组
  dirs: [number, number, number][] // dirs 坐标系方向数组
  length: number // length 坐标系长度
}

/** 等值面对象（主程序内部对象，这里只给出结构近似，勿依赖其它字段） */
export interface Surf {
  uuid: string
}

// ===================== 核心 API =====================

/**
 * wmview的核心api
 */
export interface wmapi_cores {
  /**
   * 执行外部程序命令
   */
  run_exe: (source: string, exe: string, args: string[], input: string) => Promise<[boolean, string]>
  /**
   * 显示通知
   */
  notify: (message: string, type: 'success' | 'warning' | 'info' | 'error') => void
  /*添加结果文本 */
  add_reslog: (from: string, text: string) => void
  /**
   * 添加日志文本
   * from: 日志的来源，用于标识
   * text: 日志的内容
   */
  add_logText: (from: string, text: string) => void
  /**
   * 显示加载面板
   */
  show_loading: (tip: string) => void
  /**
   * 隐藏加载面板
   */
  hide_loading: () => void
  /**
   * 保存文本内容到本地文件
   */
  save_text: (path: string, text: string) => void

  read_text: (path: string) => Promise<string>

  save_file_dialog: () => Promise<string | null>

  // 设置底部信息
  set_bottom_message: (message: string) => void

  // 当前显示的siderl和siderr
  get_show_siders: () => [string, string]
}

// ===================== 文件 API =====================

export type MoleInfo = {
  syms: string[]
  xyzs: number[][]
  bonds: [number, number][]
  open: boolean
  obts: [number, number][]
  eles: number[]
  atos: [number, string][]
}

/**
 * 关于文件的API
 */
export interface wmapi_files {
  /**
   * 获取程序的根文件夹
   */
  get_rootFold: () => string
  /**
   * 等待程序根目录初始化完成(异步获取),返回根目录。读取 root/plugs 相关路径前应先调用
   */
  wait_root: () => Promise<string>
  /**
   * 获取分子文件夹
   */
  get_moleFold: () => string
  /**
   * 获取插件文件夹
   */
  get_plugFold: () => string

  /**
   * 获取当前分子文件夹下的所有分子名称
   * @returns 分子名称列表
   */
  get_files: () => string[]

  /**
   * 显示指定名称的分子文件
   * @param name 分子文件名
   */
  show_file: (name: string) => void

  get_moleInfo: (name: string) => MoleInfo

  // 获取选择的文件
  get_selects: () => string[]
}

// ===================== 场景 API =====================

/**
 * 关于场景的API
 */
export interface wmapi_scene {
  /**
   * 设置场景的背景颜色，只能使用hex字符串，例如 #ff0000
   */
  set_color: (color: string) => void
  /**
   * 获取当前显示的分子的名称
   */
  get_mole_name: () => string | undefined

  /**
   * 获取当前分子的结构信息
   * @param mole_name 分子名称
   * @returns 原子信息列表，每个元素为 [原子符号, x, y, z]
   */
  get_mole_geom: (mole_name: string) => [string, number, number, number][]

  // 获取用户选择的原子的索引
  get_atom_select: (mole_name: string) => number[]

  // 添加一个箭头
  add_arrow: (mole_name: string, args: ArrowArgs) => void

  // 添加一条线，可以是实线也可以是虚线
  // #AI 用户可能会让在两个原子之间添加虚线，这个时候使用两个原子的位置作为参数
  add_line: (mole_name: string, args: LineArgs) => void

  // 在指定的分子内添加一个p轨道
  add_pobt: (mole_name: string, args: PobtArgs) => void

  add_surf: (mole_name: string, args: SurfArgs) => string | undefined

  get_surf: (mole_name: string) => Surf | undefined

  /**
   * 在分子指定的位置添加一个局部坐标系
   * @param mole_name 分子名
   * @param args cent: 局部坐标系的中心位置 dirs: 局部坐标系的方向
   * @returns
   */
  add_systm: (mole_name: string, args: SystmArgs) => void

  /**
   * 清空一个组
   * @param group_name 组名
   * @returns
   */
  clear_group: (group_name?: string) => void
}

declare global {
  interface Window {
    wmapi_cores: wmapi_cores
    wmapi_files: wmapi_files
    wmapi_scene: wmapi_scene
  }
}
