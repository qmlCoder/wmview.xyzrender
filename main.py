
from pathlib import Path
import sys
import re
import json
from typing import TypedDict

SCRIPT_DIR = str(Path(__file__).parent.as_posix())
sys.path.insert(0, SCRIPT_DIR)
import deps

def read_atomXyzs():
    text=Path(f"{SCRIPT_DIR}/atom_xyzs.txt").read_text()
    print("原子坐标数据：")
    print(text)
    xyzs=[]
    syms=[]
    for line in text.splitlines():
        if caps:=re.match(r" *([A-Za-z]+) +(-?\d+.\d+) +(-?\d+.\d+) +(-?\d+.\d+)",line):
            sym=caps[1]
            x=float(caps[2])
            y=float(caps[3])
            z=float(caps[4])
            xyzs.append([x,y,z])
            syms.append(sym)
    return syms,np.array(xyzs)

def read_cameraMatrix():
    text=Path(f"{SCRIPT_DIR}/cameraMatrix.txt").read_text()
    nums=re.findall(r"-?\d+.\d+",text)
    nums=[float(e) for e in nums]
    return np.array(nums).reshape(3,3).T

def gen_img(input_data: "Stdin"):
    syms,xyzs=read_atomXyzs() # 坐标是提前导出的
    natm=len(syms)
    tmat=read_cameraMatrix()
    xyzs_fix=xyzs@tmat
    texts=[f"{len(xyzs_fix)}","wmview_xyzrender"]
    for i in range(natm):
        x,y,z=xyzs_fix[i]
        sym=syms[i]
        texts.append(f"{sym:>3}           {x:>14.8f}{y:>14.8f}{z:>14.8f}")
    Path(f"{SCRIPT_DIR}/test.xyz").write_text("\n".join(texts))
    mole=load(f"{SCRIPT_DIR}/test.xyz")
    render(mole,orient=False,output=f"{SCRIPT_DIR}/test.svg",hy=input_data["showHatom"])

class Stdin(TypedDict):
    showHatom: bool

if __name__=="__main__":
    depsok=deps.check_dependencies() # 检查并安装依赖
    if not depsok:
        print("依赖安装失败，无法继续执行脚本!",file=sys.stderr)
        sys.exit(1)
    from xyzrender import load,render
    import numpy as np
    stdin=sys.stdin.read()
    input_data: Stdin = json.loads(stdin)
    gen_img(input_data)
