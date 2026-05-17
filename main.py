import io
import json
import logging
import sys
from pathlib import Path
from typing import TypedDict

import numpy as np
from xyzrender import load, render

# 🔥 设置 stdin 为 UTF-8 编码，解决中文乱码问题
if sys.platform == "win32":
    sys.stdin = io.TextIOWrapper(sys.stdin.buffer, encoding="utf-8")


SCRIPT_DIR = str(Path(__file__).parent.as_posix())
sys.path.insert(0, SCRIPT_DIR)

# 🔥 核心配置：日志保存到文件
logging.basicConfig(
    level=logging.INFO,  # 日志级别：INFO及以上都会保存
    format="%(asctime)s - %(levelname)s - %(message)s",  # 日志格式
    filename=f"{SCRIPT_DIR}/log.txt",  # 日志文件名
    filemode="a",  # a=追加写入（推荐），w=覆盖写入
    encoding="utf-8",  # 解决中文乱码
)


class Paras(TypedDict):
    moleSyms: list[str]
    moleXyzs: list[list[float]]
    cameraMatrix: list[list[float]]
    molePath: str
    showHatom: bool
    imgType: str
    style: str


def main(paras: "Paras"):
    logging.info(paras)
    # 生成角度参考文件
    syms = paras["moleSyms"]
    xyzs = np.array(paras["moleXyzs"])
    natm = len(syms)
    tmat = np.array(paras["cameraMatrix"]).T
    xyzs_fix = xyzs @ tmat
    texts = [f"{len(xyzs_fix)}", "wmview_xyzrender"]
    for i in range(natm):
        x, y, z = xyzs_fix[i]
        sym = syms[i]
        texts.append(f"{sym:>3}           {x:>14.8f}{y:>14.8f}{z:>14.8f}")
    Path(f"{SCRIPT_DIR}/ref.xyz").write_text("\n".join(texts))
    # 绘制图像
    ref = f"{SCRIPT_DIR}/ref.xyz"
    mole = load(paras["molePath"])
    imgType = paras["imgType"]
    output = f"{SCRIPT_DIR}/main.{imgType}"
    showH = paras["showHatom"]
    hy = True if showH else None
    no_hy = False if showH else True
    config = paras["style"]
    render(
        mole, orient=False, output=output, hy=hy, no_hy=no_hy, config=config, ref=ref
    )


if __name__ == "__main__":
    stdin = sys.stdin.read()
    paras: Paras = json.loads(stdin)
    main(paras)
