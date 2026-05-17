export class Scene {
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
   */
  get_camera(): THREE.PerspectiveCamera | THREE.OrthographicCamera;
  set_camera(idx?: number, prop?: string): void;
  save_image(name: string): void;
  save_model(name: string, type: string): void;
  show_mole(uuid: string): void;
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
   * @param eles 电子信息 [nela, nelb, charge, multip]
   * @param bonds 可选的键连接数组
   */
  append(
    name: string,
    syms: string[],
    xyzs: number[][],
    eles: number[],
    bonds?: [number, number][],
  ): Mole;

  /**
   * 获取所有分子
   */
  getAll(): Mole[];

  /**
   * 获取当前分子或指定分子
   * @param name 分子名
   * @param uuid 分子uuid
   * @param notify 未找到时是否提示
   */
  get(name?: string, uuid?: string, notify?: boolean): Mole | undefined;

  /**
   * 显示指定uuid的分子，隐藏其他分子
   * @param uuid 分子uuid
   */
  show_mole(uuid: string): void;
}

export class Mole {
  declare scene: Scene;
  declare atoms: Atoms;
  declare bonds: Bonds;
  declare labels: Labels;
  declare arrows: Arrows;
  declare clouds: Clouds;
  declare angles: Angles;
  declare points: Points;
  declare surfs: Surfs;
  declare name: string;
  constructor(name: string, scene: Scene);

  /**
   * 设置当前分子是否可见
   */
  set_visible(visible: boolean): void;

  /**
   * 改变指定原子的类型
   */
  convert_atom(idx: number, symbol: string): void;

  /**
   * 从指定原子查找一个组的原子
   * @returns 搜索到的原子索引数组
   */
  search_group(idx: number, pass: number[]): number[];

  /**
   * 根据传入的原子数量，获取键长、键角、二面角等数据
   */
  get_value(atms: number[]): number[];

  /**
   * 隐藏指定类型的原子
   */
  set_atomVisibleByS(sym: string, vis: boolean): void;

  /**
   * 获取分子的空间边界
   * @param bord 边界扩展值
   */
  space_border(bord?: number): number[][];
}

export class Atoms {
  declare mole: Mole;
  declare selects: number[];
  constructor(mole: Mole);

  /**
   * 添加一个原子
   */
  append(sym: string, xyz: number[], idx: number): Atom;

  /**
   * 删除指定索引的原子
   */
  delete(idx: number): void;

  /**
   * 获取指定索引的原子
   */
  get(idx: number): Atom | undefined;

  /**
   * 获取所有原子
   */
  getAll(): Atom[];

  /**
   * 添加选择的原子
   */
  add_selects(atms: number[], delOld?: boolean): void;

  /**
   * 清空选择的原子
   */
  clear_select(): void;

  /**
   * 计算指定原子的重量
   */
  calc_weight(atms: number[]): number;

  /**
   * 恢复所有原子原本的颜色
   */
  reset_color(): void;

  /**
   * 重新为原子编号
   */
  re_number(atomLabelType?: string): { [key: number]: number };

  /**
   * 获取指定原子的中心坐标
   */
  get_center(atms: number[]): number[];
}

export class Atom {
  symbol: string;
  sym: string;
  idx: number;
  radius: number;
  constructor(mole: Mole, sym: string, xyz: number[], idx: number);

  /**
   * 获取该原子的相邻原子
   */
  neighbors(): number[];

  /**
   * 取消选中原子
   */
  un_select(): void;

  /**
   * 设置该原子的原子类型
   */
  set_type(symbol: string): void;

  /**
   * 设置原子坐标
   */
  set_coord(x: number, y: number, z: number): void;

  /**
   * 设置该原子半径
   */
  set_radius(radius: number): void;

  /**
   * 设置原子材质
   */
  set_material(name: string): void;

  /**
   * 设置该原子的可见性
   */
  set_visible(visible: boolean): void;

  /**
   * 获取该原子与周围原子排斥最小的方向
   */
  get_minRepDir(): THREE.Vector3 | undefined;

  /**
   * 设置原子的颜色
   */
  set_color(color: string): void;

  /**
   * 恢复原子原本的颜色
   */
  reset_color(): void;
}

export class Bonds {
  mole: Mole;
  constructor(mole: Mole);

  /**
   * 添加一个键
   */
  append(atm1: number, atm2: number, type?: string): Bond | undefined;

  /**
   * 删除指定的键
   */
  delete(atm1: number, atm2: number): void;

  /**
   * 根据传入的原子构造键
   */
  build(atms?: number[], delOld?: boolean, bonds?: [number, number][]): void;

  /**
   * 根据索引获得键
   */
  get(atm1: number, atm2: number): Bond | undefined;

  /**
   * 获取所有的键
   */
  getAll(): Bond[];

  /**
   * 设置键的类型
   */
  set_bondType(atm1: number, atm2: number, type: string, add?: boolean): void;
}

export class Bond {
  mole: Mole;
  atm1: number;
  atm2: number;

  /**
   * 设置键的类型
   */
  set_type(type: string): void;

  /**
   * 设置键的颜色
   */
  set_color(color: string): void;
}

export class Labels {
  mole: Mole;

  /**
   * 添加一个标签
   * @param text 标签文本
   * @param cent 标签中心坐标
   * @param dist 与中心距离
   * @param bind 绑定的原子索引
   */
  append(text: string, cent: number[], dist: number, bind: number[]): Label;

  /**
   * 删除一个标签
   * @param name 标签名称
   */
  delete(name: string): void;

  /**
   * 根据名称获取标签
   */
  get(name: string): Label;

  /**
   * 获取所有标签
   */
  getAll(): Label[];
}

export class Label {
  mole: Mole;
  text: string;
  bind: number[];
  cent: number[];
  dist: number;
  context: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;

  /**
   * 实例化Label对象
   */
  constructor(
    mole: Mole,
    text: string,
    cent: number[],
    dist: number,
    bind: number[],
  );

  /**
   * 设置标签的文本内容
   */
  set_text(text: string): void;

  /**
   * 设置标签的可见性
   */
  set_visible(visible: boolean): void;
}

export class Arrows {
  mol: Mole;
  constructor(mol: Mole);

  /**
   * 添加箭头
   * @param pos 位置
   * @param dir 方向
   * @param len 长度
   * @param bind 绑定的原子索引
   * @param radius 半径
   * @param material 箭头的材质
   */
  append(
    pos: number[],
    dir: number[],
    len: number,
    bind: number[],
    radius: number,
    material?: string,
  ): Arrow;

  /**
   * 获取所有箭头
   */
  getAll(): Arrow[];
}

export class Arrow {
  mol: Mole;
  bind: number[];
  length: number;
  radius: number;
  direction: THREE.Vector3;

  /**
   * 设置箭头的长度
   */
  set_length(length: number): void;

  /**
   * 设置箭头的朝向
   * @param direction 方向向量
   */
  set_direction(direction: number[]): void;

  /**
   * 设置箭头颜色
   */
  set_color(color: THREE.Color): void;
}

export class Angles {
  mole: Mole;
  constructor(mole: Mole);
  append(atmA: number, atmB: number, atmC: number, acute?: boolean): void;
  getAll(): THREE.Object3D[];
}

export class Angle {
  mole: Mole;
  type: string;
  constructor(
    mole: Mole,
    atmA: number,
    atmB: number,
    atmC: number,
    acute: boolean,
  );
}

export class Clouds {
  mol: Mole;
  isov: number;
  building: boolean;
  append(
    start: number[],
    range: number[],
    resol: number[],
    name: string,
    values: Float32Array,
  ): void;
  getAll(): Cloud[];
  get(name: string): Cloud | undefined;
  set_isov(isov: number): void;
  show_cloud(name: string): void;
}

export class Cloud {
  mol: Mole;
  name: string;
  cloudP: CloudP | undefined;
  cloudN: CloudN | undefined;
  build(isov: number): void;
  reverse(): void;
}

export class CloudP {
  type: string;
}

export class CloudN {
  type: string;
}

export class Surfs {
  mol: Mole;
  append(
    verts: number[],
    types: number[],
    name: string,
    wireframe: boolean,
  ): Surf;
  getAll(): Surf[];
  get(name: string): Surf;
  hideAll(): void;
}

export class Surf {
  type: string;
}

export class Field {
  mole: Mole;
  constructor(mole: Mole);
  build(data: number[][]): void;
}

export class Points {
  mole: Mole;
  constructor(mole: Mole);
  append(pos: number[], color: string, radius: number): Point;
}

export class Point {
  mole: Mole;
  constructor(mole: Mole, pos: number[], color: string, radius: number);
}
