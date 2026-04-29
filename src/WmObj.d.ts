import * as THREE from "three";

export interface Scene {
  declare moles: Moles;
  constructor();

  /**
   * 设置相机控制器的焦点
   * @param x 焦点坐标x
   * @param y 焦点坐标y
   * @param z 焦点坐标z
   */
  set_focus(x: number, y: number, z: number): void;

  /**
   * 获取当前相机，返回透视相机或正交相机，场景中只有这两个相机
   * @returns {THREE.PerspectiveCamera | THREE.OrthographicCamera} 当前相机
   */
  get_camera(): THREE.PerspectiveCamera | THREE.OrthographicCamera;
  set_camera(idx: number): void;
  save_image(name: string): void;
  save_model(name: string, type: string): void;
  show_mol(uuid: string): void;
  set_sceneMode(mode: string): void;
  set_visual(type: string): void;
}

export class Moles {
  declare scene: Scene;
  declare nowUuid: string;

  /**
   * 添加一个分子
   * @param name 分子名
   * @param syms 原子符号
   * @param xyzs 原子坐标
   * @param showLabel 是否显示标签
   */
  append(
    name: string,
    syms: string[],
    xyzs: number[][],
    showLabel: boolean,
  ): Mole;

  /**
   * 获取所有分子
   * @returns {Mole[]} 所有分子
   */
  getAll(): Mole[];

  /**
   * 获取当前分子或指定分子
   * @param name 分子名
   * @param uuid 分子uuid
   */
  get(
    name: string = "",
    uuid: string = "",
    notify: boolean = true,
  ): Mole | undefined;

  /**
   * 显示指定分子分子
   * @param uuid 分子uuid
   */
  show_mol(uuid: string): void;
}

export class Mole {
  declare scene: Scene;
  declare atoms: Atoms;
  declare bonds: Bonds;
  declare labels: Labels;
  declare arrows: Arrows;
  constructor(name: string, scene: Scene);

  /**
   * 设置当前分子是否可见
   * @param visible 是否可见
   */
  set_visible(visible: boolean): void;

  /**
   * 改变指定原子的类型
   * @param idx 原子索引
   * @param symbol 元素符号
   */
  convert_atom(idx: number, symbol: string): void;

  /**
   * 从指定原子查找一个组的原子
   * @param idx 指定原子的索引
   * @param pass 忽略的原子
   */
  search_group(idx: number, pass: number[]): void;

  /**
   * 根据传入的原子数量，获取键长、键角、二面角等数据
   * @param  atms 原子索引
   */
  get_value(atms: number[]): number[];

  /**
   * 隐藏指定类型的原子
   * @param {string} sym 要隐藏的元素类型
   * @param {boolean} vis 是否可见
   */
  set_atomVisibleByS(sym: string, vis: boolean): void;

  /**
   * 获取分子的空间边界
   */
  space_border(): number[][];
}

export class Atoms {
  declare mole: Mole;
  constructor(mole: Mole);

  /**
   * 添加一个原子
   * @param sym 原子符号
   * @param xyz 原子坐标
   * @param idx 原子编号
   * @param showLabel 是否显示标签
   */
  append(sym: string, xyz: number[], idx: number, showLabel: boolean): Atom;

  /**
   * 删除指定索引的原子
   * @param idx 原子索引
   */
  delete(idx: number): void;

  /**
   * 获取指定索引的原子
   * @param idx 原子索引
   */
  get(idx: number): Atom;

  /**
   * 获取所有原子
   */
  getAll(): Atom[];

  /**
   * 添加选择的原子
   * @param atms 原子索引数组
   * @param delOld 是否取消选择已经选择的原子(默认fasle)
   */
  add_selects(atms: number[], delOld?: boolean): void;

  /**
   * 清空选择的原子
   */
  clear_select(): void;

  /**
   * 计算指定原子的重量
   * @param atms 原子数组
   */
  calc_weight(atms: number[]): number;

  /**
   * 恢复所有原子原本的颜色
   */
  reset_color(): void;

  /**
   * 设置原子的属性
   * @param func 属性/函数名称
   * @param type 类型，属性的类型，可以为value，arrow，label
   * @param vals 属性值
   * @param show 是否立即显示，默认为true
   */
  set_props(
    func: string,
    type: string,
    vals: number[][] | [number, string][],
    show?: boolean,
  ): void;

  /**
   * 显示原子的属性
   * @param func 属性/函数名称
   * @param type 属性类型，可以为value，arrow，label
   */
  show_props(func: string, type: string): void;

  /**
   * 重新为原子编号，并返回原子编号的映射关系
   * @param atomLabelType 原子标签类型，可选参数，可以设为idx，sym，mix
   */
  re_number(atomLabelType?: string): { [key: number]: number };

  /**
   * 获取指定原子的中心坐标
   * @param atms 原子索引数组
   */
  get_center(atms: number[]): number[];
}

export class Atom extends THREE.Mesh {
  sym: string;
  idx: number;
  constructor(mole: Mole, sym: string, xyz: number[][], idx: number);

  /**
   * 获取该原子的相邻原子，根据是否成键来确定相邻原子
   */
  neighbors(): number[];

  /**
   * 取消选中原子
   */
  un_select(): void;

  /**
   * 设置该原子的原子类型
   * @param symbol 原子类型
   */
  set_type(symbol: string): void;

  /**
   * 设置原子坐标
   * @param x 原子坐标x
   * @param y 原子坐标y
   * @param z 原子坐标z
   */
  set_coord(x: number, y: number, z: number): void;

  /**
   * 设置该原子半径
   * @param radius 原子半径
   */
  set_radius(radius: number): void;

  /**
   * 设置原子材质
   * @param name 原子材质名称
   */
  set_material(name: string): void;

  /**
   * 设置该原子的可见性
   * @param visible 是否可见
   */
  set_visible(visible: boolean): void;

  /**
   * 获取该原子与周围原子排斥最小的方向
   */
  get_minRepDir(): THREE.Vector3 | undefined;

  /**
   * 设置原子的颜色，相当于创建了一个新的材质（未记录）
   * @param color 颜色值，如： #FFFFFF
   */
  set_color(color: string): void;

  /**
   * 恢复原子原本的颜色
   */
  reset_color(): void;
}

export class AtomProp {
  name: string;
  type: string;
  vals: number[][] | [number, string][];
  constructor(
    name: string,
    type: string,
    vals: number[][] | [number, string][],
  );
}

export class Bonds {
  mole: Mole;
  constructor(mole: Mole);
  /**
   * 添加一个键，如果两个原子索引相同则会添加失败
   * @param atm1 第一个原子索引
   * @param atm2 第二个原子索引
   * @param type 键的类型，默认为mesh
   */
  append(atm1: number, atm2: number, type?: string): Bond | undefined;

  /**
   * 删除指定的键
   * @param atm1 第一个原子的索引
   * @param atm2 第二个原子的索引
   */
  delete(atm1: number, atm2: number): void;

  /**
   * 根据传入的原子构造键，若不传入则默认构造所有的键
   * @param atms 原子索引数组
   * @param delOld 是否删除旧的键，默认为true
   */
  build(atms?: number[], delOld?: boolean): void;

  /**
   * 根据索引获得键
   * @param atm1 第一个原子索引
   * @param atm2 第二个原子索引
   */
  get(atm1: number, atm2: number): Bond;

  /**
   * 获取所有的键
   */
  getAll(): Bond[];

  /**
   * 设置键的类型
   * @param atm1 第一个原子的索引
   * @param atm2 第二个原子的索引
   * @param type 键的类型
   */
  set_bondType(atm1: number, atm2: number, type: string): void;
}

export class Bond {
  mole: Mole;
  atm1: number;
  atm2: number;

  /**
   * 设置键的类型
   * @param type 键的类型
   */
  set_type(type: string): void;

  /**
   * 设置键的颜色
   * @param color 颜色值，如： #FFFFFF
   */
  set_color(color: string): void;
}

export class Labels {
  mole: Mole;
  /**
   * 添加一个标签
   * @param text 标签文本
   * @param bind 绑定的原子
   * @param show 是否显示
   */
  append(text: string, bind: number[], show: boolean): Label;

  /**
   * 删除一个标签
   * @param idx 标签绑定的原子
   */
  delete(idx: number[]): void;

  /**
   * 获取绑定指定原子id的标签
   * @param idx 标签绑定的原子
   * @param push 不存在的话是否添加，可选参数
   */
  get(idx: number[], push?: boolean): Label | undefined;

  /**
   * 获取所有标签
   */
  getAll(): Label[];
}

export class Label {
  mole: Mole;
  bind: number[];
  context: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;

  /**
   * 实例化Label对象
   * @param mole 分子对象
   * @param text 文本内容
   * @param bind 绑定原子
   */
  constructor(mole: Mole, text: string, bind: number[]);

  /**
   * 设置标签的文本内容
   * @param text 标签文本
   */
  set_text(text: string): void;

  /**
   * 设置标签的可见性
   * @param visible 标签是否可见
   */
  set_visible(visible: boolean): void;
}

export class Arrows {
  mole: Mole;
  constructor(mole: Mole);

  /**
   * 添加箭头
   * @param pos 位置
   * @param dir 方向
   * @param len 长度
   * @param bind 绑定的原子
   * @param radius 半径
   * @param material 箭头的材质
   */
  append(
    pos: number[], // 箭头位置
    dir: number[],
    len: number,
    bind: number,
    radius: number,
    material: string,
  ): Arrow;

  /**
   * 获取所有箭头
   */
  getAll(): Arrow[];

  set_color(color: string): void;
}

export class Arrow {
  /**
   * 设置箭头的长度
   * @param length 箭头长度
   */
  set_length(length: number): void;

  /**
   * 设置箭头的朝向
   * @param direction 箭头的方向
   */
  set_direction(direction: THREE.Vector3): void;
}
