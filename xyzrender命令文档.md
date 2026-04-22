# xyzrender 命令行完整使用文档

## 概述

xyzrender 是一个用于从命令行生成出版级分子图形的工具。

## 基本用法

```
xyzrender [输入文件] [选项]
```

支持的输入文件格式：
- `.xyz` - XYZ文件
- `.mol` - MOL文件
- `.sdf` - SDF文件
- `.mol2` - MOL2文件
- `.pdb` - PDB文件
- `.smi` - SMILES字符串（需要安装rdkit）
- `.cif` - CIF文件
- `.cube` - Cube文件
- QM输出文件

支持的输出格式：
- `.svg` - SVG矢量图形
- `.png` - PNG位图
- `.pdf` - PDF文档

---

## 输入/输出选项

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `-h, --help` | 显示帮助信息 | - |
| `-o OUTPUT, --output OUTPUT` | 输出文件路径 | 同输入文件名 |
| `-c CHARGE, --charge CHARGE` | 分子电荷 | 从文件读取 |
| `-m MULTIPLICITY, --multiplicity MULTIPLICITY` | 自旋多重度 | 从文件读取 |
| `-d, --debug` | 调试输出 | - |
| `--smi SMILES` | 直接解析SMILES字符串 | - |
| `--mol-frame N` | 读取多分子SDF文件的记录索引（从0开始） | 0 |
| `--rebuild` | 忽略文件连接信息，使用xyzgraph重新检测键 | - |

---

## 样式设置

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `--config CONFIG` | 配置预设名称或JSON配置文件路径 | default |
| `-S CANVAS_SIZE, --canvas-size CANVAS_SIZE` | 画布大小（像素） | 800 |
| `-a ATOM_SCALE, --atom-scale ATOM_SCALE` | 原子缩放比例 | 1.0 |
| `-b BOND_WIDTH, --bond-width BOND_WIDTH` | 键宽（像素） | 5.0 |
| `-s ATOM_STROKE_WIDTH, --atom-stroke-width ATOM_STROKE_WIDTH` | 原子描边宽度 | 1.5 |
| `--bond-color BOND_COLOR` | 键颜色（十六进制或命名颜色） | #333333 |
| `-B BACKGROUND, --background BACKGROUND` | 背景颜色 | #ffffff |
| `-t, --transparent` | 透明背景 | - |
| `-Hls HUE_SHIFT_FACTOR, --hue-shift-factor HUE_SHIFT_FACTOR` | 色调渐变对比度 | 0.2 |
| `-hLs LIGHT_SHIFT_FACTOR, --light-shift-factor LIGHT_SHIFT_FACTOR` | 亮度渐变对比度 | 0.2 |
| `-hlS SATURATION_SHIFT_FACTOR, --saturation-shift-factor SATURATION_SHIFT_FACTOR` | 饱和度渐变对比度 | 0.2 |
| `--grad, --no-grad` | 径向渐变 | - |
| `-F FOG_STRENGTH, --fog-strength FOG_STRENGTH` | 雾效强度 | 0.8 |

---

## 显示选项

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `--hy [ATOMS]` | 显示氢原子（无参数显示所有，或"1-5,8"表示索引） | - |
| `--no-hy` | 隐藏所有氢原子 | - |
| `--no-bonds` | 隐藏所有键（如空间填充样式） | - |
| `--bo, --no-bo` | 显示键级 | - |
| `-k, --kekule` | 使用凯库勒键级（无芳香1.5） | - |
| `--fog, --no-fog` | 深度雾 | - |
| `--skeletal-label-color SKELETAL_LABEL_COLOR` | 骨架模式下覆盖所有元素标签颜色 | - |
| `--vdw [VDW]` | 疏水体积（VDW）球（无参数显示所有，或"1-20,25"） | - |

---

## 表面渲染

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `--mo` | 从.cube文件渲染分子轨道波瓣 | - |
| `--mo-colors POS NEG` | 轨道颜色（正值/负值），十六进制或命名颜色 | steelblue maroon |
| `--dens` | 从.cube文件渲染密度等值面 | - |
| `--dens-color DENS_COLOR` | 密度面颜色，十六进制或命名颜色 | steelblue |
| `--esp CUBE` | ESP势能彩色立方体文件（隐含--dens） | - |
| `--nci-surf CUBE` | NCI梯度立方体文件（寻找RDG低值区域） | - |
| `--nci-color NCI_COLOR` | NCI区域统一颜色，十六进制或命名颜色 | forestgreen |
| `--nci-coloring {avg,pixel,uniform}` | NCI表面着色模式：avg=平均、pixel=像素、uniform=统一 | avg |
| `--iso ISO` | 等值面阈值（MO默认0.05、密度/ESP默认0.001、NCI/RDG默认0.3） | - |
| `--flat-mo` | 禁用MO深度分类（所有波瓣渲染为前表面） | - |
| `--mo-blur MO_BLUR` | MO高斯模糊sigma | 0.8 |
| `--mo-upsample MO_UPSAMPLE` | MO上采样因子 | 3 |
| `--opacity OPACITY` | 表面透明度（1.0以下为透明，>1增强） | 1.0 |

---

## 凸包选项

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `--hull [INDICES ...]` | 凸包（无参数=所有重原子、"rings"=每个芳香环、或1基索引子集如"1-6"或"1-6 7-12"） | - |
| `--hull-color HULL_COLOR [HULL_COLOR ...]` | 凸包填充颜色（一个或多个子集） | - |
| `--hull-opacity HULL_OPACITY` | 凸包填充透明度（0-1） | - |
| `--hull-edge, --no-hull-edge` | 绘制/隐藏非键凸包边 | - |
| `--hull-edge-width-ratio HULL_EDGE_WIDTH_RATIO` | 凸包边宽度比例（相对于键宽） | 0.4 |

---

## 覆盖/集束选项

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `--overlay FILE` | 覆盖分子文件（对齐到主输入并以洋红色绘制） | - |
| `--overlay-color OVERLAY_COLOR` | 覆盖分子颜色，十六进制或命名颜色 | darkmagenta |
| `--ensemble` | 多帧XYZ轨迹的集束覆盖（对齐到第一帧） | - |
| `--align-atoms ALIGN_ATOMS` | 对齐子集的1基索引原子（最少3个），如"1,2,3"或"1-6" | - |
| `--ensemble-color ENSEMBLE_COLOR` | 调色板（viridis、spectral、coolwarm）、单一颜色或逗号分隔颜色 | - |

---

## 方向选项

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `--orient, --no-orient` | 自动方向 | - |
| `-I, --interactive` | 在v查看器中打开交互式旋转 | - |

---

## 过渡态/NCI选项

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `--ts` | 通过graphRC自动检测TS键 | - |
| `--ts-frame TS_FRAME` | graphRC的TS参考帧索引（0基） | 0 |
| `--ts-bond TS_BOND` | 手动TS键对（1基）：如"1-6,3-4" | - |
| `--nci` | 通过xyzgraph自动检测NCI相互作用 | - |
| `--nci-bond NCI_BOND` | 手动NCI键对（1基）：如"1-5,2-8" | - |

---

## GIF动画选项

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `--gif-ts` | 通过graphRC的TS振动GIF | - |
| `--gif-trj` | 轨迹/优化GIF（多帧输入） | - |
| `--gif-rot [GIF_ROT]` | 旋转GIF（默认轴：y）。可与--gif-ts组合 | - |
| `--gif-diffuse` | 扩散/组装GIF（原子散开并重组） | - |
| `-go GIF_OUTPUT, --gif-output GIF_OUTPUT` | GIF输出路径 | <输入文件名>.gif |
| `--gif-fps GIF_FPS` | 每秒帧数 | 10 |
| `--rot-frames ROT_FRAMES` | 旋转帧数 | 120 |
| `--diffuse-frames DIFFUSE_FRAMES` | 扩散帧数 | 60 |
| `--diffuse-noise DIFFUSE_NOISE` | 每帧随机游走噪声 | 0.3 |
| `--diffuse-bonds {fade,show,hide}` | 扩散期间的键可见性：fade(默认)、show或hide | fade |
| `--diffuse-rot [DEG]` | 扩散期间的旋转（默认180°） | - |
| `--diffuse-forward` | 正向播放（分子→噪声）而非组装 | - |
| `--anchor ATOMS` | 固定原子："1-5,8"（1基） | - |

---

## 高亮选项

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `--mol-color COLOR` | 所有原子和键的平面颜色（覆盖CPK） | - |
| `--hl ATOMS [COLOR ...]` | 高亮原子组：--hl "1-5,8" [color]。可重复。无颜色时自动上色 | - |

---

## 风格区域选项

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `--region ATOMS CONFIG` | 使用不同风格渲染原子子集：--region "1-5" flat。可重复 | - |

---

## 键着色选项

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `--bond-by-element, --no-bond-by-element` | 按端点原子颜色着色键（tube预设中默认开启） | - |
| `--bond-gradient, --no-bond-gradient` | 键柱状着色（3D管状外观）。tube预设中默认开启 | - |

---

## 景深选项

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `--dof` | 景深模糊（前清晰、后模糊） | - |
| `--dof-strength FLOAT` | DoF最大模糊强度 | 3.0 |

---

## 测量和标注选项

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `--label-size PT` | 标签字体大小（覆盖预设） | - |
| `--stereo [CLASSES]` | 从3D几何添加立体化学标签。可选逗号分隔类过滤：point、ez、axis、plane、helix。省略显示全部 | - |
| `--stereo-style STYLE` | R/S标签位置：atom（居中）或label（偏移）。默认：atom | atom |
| `--measure [TYPE ...]` | 将键测量打印到stdout：d（距离）、a（角度）、t（二面角）。组合：--measure d a。省略显示全部 | - |
| `--idx [FMT]` | 在SVG中用索引标记所有原子：sn（C1，默认）、s（仅元素）、n（仅数字） | sn |
| `-l TOKEN [TOKEN ...]` | 标注SVG（可重复）："1 2 d"（键距离）、"2 a"（原子2的所有角度）、"1 2 3 4 t"（二面角折线）、"1 +0.5"（自定义原子标签）、"1 2 NBO"（自定义键标签）。索引为1基 | - |
| `--label FILE` | 标注文件（每行同-l语法，#注释、逗号或空格分隔） | - |
| `--cmap FILE` | 原子属性颜色映射文件：两列（1基索引、值）。跳过标题行 | - |
| `--cmap-range VMIN VMAX` | 显式颜色映射范围（默认从文件值自动） | - |
| `--cmap-palette NAME` | 颜色映射调色板名称 | viridis |
| `--cbar` | 添加垂直色条显示数据范围 | - |
| `--cmap-symm` | 关于零的对称颜色映射范围：[-max(|v|), +max(|v|)] | - |
| `--vector FILE` | 定义箭头叠加的JSON文件。每个条目：{"origin": "com"|"原子索引"|[x,y,z], "vector": [vx,vy,vz], "color": "#rrggbb", "label": "文本", "scale": 1.0} | - |
| `--vector-scale FACTOR` | 应用于所有箭头的全局长度缩放因子 | 1.0 |

---

## 晶体/周期结构选项

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `--crystal [{vasp,qe}]` | 通过phonopy加载为周期晶体结构（需要xyzrender[crystal]）。启用晶胞框、晶格轴（a/b/c）和图像原子。可选指定phonopy接口：vasp、qe（从文件名自动检测）。示例：--crystal、--crystal vasp、--crystal qe | - |
| `--cell` | 从extXYZ Lattice=头绘制晶胞框。无晶格轴或图像原子，仅框。不需要phonopy | - |
| `--no-cell` | 隐藏晶胞框（--crystal） | - |
| `--ghosts, --no-ghosts` | 显示/隐藏图像原子（--cell/--crystal时默认开启，否则关闭） | - |
| `--axes, --no-axes` | 显示/隐藏晶格轴箭头a/b/c（--crystal） | - |
| `--cell-color CELL_COLOR` | 晶胞框颜色，十六进制或命名颜色 | #333333 |
| `--cell-width CELL_WIDTH` | 晶胞框线宽 | 1.5 |
| `--ghost-opacity GHOST_OPACITY` | 图像原子/键透明度 | 0.5 |
| `--axis HKL` | 沿晶格方向取向（如--axis 111）。每位为Miller索引（0-9）。需要--crystal或--cell | - |
| `--supercell M N L` | 沿a、b、c重复晶胞M N L次（需要--crystal）。默认：1 1 1 | - |

---

## 完整示例

### 1. 基本渲染
```bash
xyzrender molecule.xyz
```

### 2. 指定输出文件
```bash
xyzrender molecule.xyz -o output.png
```

### 3. 渲染MO轨道
```bash
xyzrender molecule.cube --mo --mo-colors steelblue maroon --iso 0.05
```

### 4. 渲染密度等值面
```bash
xyzrender density.cube --dens --dens-color steelblue --iso 0.001
```

### 5. 渲染NCI图
```bash
xyzrender nci.cube --nci-surf --nci-color forestgreen --iso 0.3
```

### 6. 空间填充样式
```bash
xyzrender molecule.xyz --no-bonds
```

### 7. 凸包渲染
```bash
xyzrender molecule.xyz --hull --hull-color lightblue --hull-opacity 0.5
```

### 8. 交互式旋转
```bash
xyzrender molecule.xyz -I
```

### 9. GIF旋转动画
```bash
xyzrender molecule.xyz --gif-rot --gif-fps 15 --rot-frames 180
```

### 10. 晶体结构渲染
```bash
xyzrender crystal.cif --crystal --cell --supercell 2 2 2 --axis 111
```

### 11. 标注测量
```bash
xyzrender molecule.xyz -l 1 2 d -l 2 a -l 1 2 3 4 t
```

### 12. 透明背景
```bash
xyzrender molecule.xyz -t -B transparent
```

### 13. 集束覆盖
```bash
xyzrender molecule1.xyz --overlay molecule2.xyz --overlay-color magenta
```

### 14. MO和NCI组合
```bash
xyzrender molecule.cube --mo --dens --nci-surf --iso 0.05
```

---

## 注意事项

1. **索引系统**：所有原子和键的索引为1基（从1开始）
2. **分子格式**：确保输入文件格式正确且包含完整的分子信息
3. **依赖项**：某些功能需要额外安装依赖（如rdit、phonopy等）
4. **性能**：复杂分子或高分辨率渲染可能需要较长时间
5. **颜色格式**：支持十六进制颜色（#RRGGBB）和命名颜色（如red、blue）

---

## 更多信息

- 官方文档：https://github.com/xyzrender/xyzrender
- 问题反馈：https://github.com/xyzrender/xyzrender/issues
