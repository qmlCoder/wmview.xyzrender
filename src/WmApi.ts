export interface WmAPI {
  /**
   * 执行本地的二进制程序
   * @param exe 要执行的 exe 文件完整路径
   * @param args 传递给程序的命令行参数数组
   * @returns 执行结果文本（成功/错误信息）
   */
  run_exe: (exe: string, args: string[]) => Promise<[boolean, string, string]>;

  /**
   * 获取当前项目所在的文件夹目录
   * @returns 本地文件夹绝对路径
   */
  get_fileFolder: () => string;

  /**
   * 获取当前加载的分子名称
   * @returns 分子名称字符串
   */
  get_moleName: () => string;

  /**
   * 获取分子的原子坐标
   */
  get_moleXyzs: () => [string[], number[][]];

  /**
   * 程序弹出提醒
   */
  notify: (
    message: string,
    type: "success" | "warning" | "info" | "error",
  ) => void;

  /**
   * 保存文本内容到本地文件
   */
  save_text: (path: string, text: string) => Promise<void>;

  convertFileSrc: (path: string) => string;

  get_appRoot: () => string;
}
