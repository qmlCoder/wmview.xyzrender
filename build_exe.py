"""
把 main.py + xyzrender 打包成单文件 xyzrender.exe（免安装 python / 免首次 pip 装依赖）。

用法（在装了 xyzrender 与 pyinstaller 的 python 环境里执行）：
    python build_exe.py

产物：项目根目录 xyzrender.exe（发行时随 index.js + assets 一起分发）。
本脚本优先使用 build/venv 的 python（推荐独立打包环境，避免嵌入式 3.10.0 的
dis bug 与 TLS 限制）：
    python build/venv/Scripts/python.exe -m pip install xyzrender==0.2.6 pyinstaller
    python build_exe.py
"""
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).parent
# 优先用独立打包环境；没有则退回当前解释器
PYTHON = ROOT / "build" / "venv" / "Scripts" / "python.exe"
interp = PYTHON if PYTHON.exists() else sys.executable

# conda 版 python 的扩展 .pyd 依赖 conda Library/bin 下的 DLL(非 conda 的 python.org
# 版把这些静态编进去了, 不需要)。名字列表由 build/find_dlls.py 分析产物得出。
CONDA_DLLS = [
    "cairo.dll", "ffi-8.dll", "fontconfig-1.dll", "freetype.dll",
    "libbz2.dll", "libcrypto-3-x64.dll", "libexpat.dll", "liblzma.dll",
    "libpng16.dll", "libssl-3-x64.dll", "pixman-1-0.dll", "sqlite3.dll", "zlib1.dll",
]

# xyzrender 渲染链路涉及的第三方包：子模块/数据文件多且常被动态 import，
# 全部按实际安装情况 --collect-all(存在才收集，避免 PyInstaller 报包不存在)
COLLECT_PKGS = [
    "xyzrender", "xyzgraph", "graphrc", "cclib", "cairosvg", "cairocffi", "resvg",
]


def collect_all_args() -> list[str]:
    args: list[str] = []
    # 询问打包解释器它的 site-packages 目录
    purelib = subprocess.run(
        [str(interp), "-c", "import sysconfig; print(sysconfig.get_paths()['purelib'])"],
        capture_output=True, text=True, check=True,
    ).stdout.strip()
    sp = pathlib.Path(purelib)
    for pkg in COLLECT_PKGS:
        if (sp / pkg).exists() or (sp / f"{pkg}.py").exists():
            args += ["--collect-all", pkg]
    return args

def conda_bin() -> pathlib.Path:
    """conda 环境的 Library/bin；非 conda 安装时返回不存在路径"""
    return pathlib.Path(sys.base_prefix) / "Library" / "bin"


def add_binary_args() -> list[str]:
    """把 conda 依赖 DLL 拷到产物根目录(与 pyd/exe 同级, 便于运行期 dlopen)"""
    args: list[str] = []
    libbin = conda_bin()
    if not libbin.exists():
        return args
    for name in CONDA_DLLS:
        src = libbin / name
        if src.exists():
            args += ["--add-binary", f"{src};."]
    return args


def main() -> None:
    onefile_mode = "--onedir" not in sys.argv  # --onedir 用于快速调试产物，默认单文件
    distpath = ROOT if onefile_mode else ROOT / "build" / "onedir-dist"
    cmd = [
        str(interp), "-m", "PyInstaller",
        "--noconfirm",
        "--clean",
        ("--onefile" if onefile_mode else "--onedir"),
        "--console",           # 保留 stdout/stderr（主程序 run_exe 会以管道/隐藏窗口方式拉起）
        "--name", "xyzrender",
        "--distpath", str(distpath),                    # xyzrender.exe 输出到项目根目录
        "--workpath", str(ROOT / "build" / "pyi"),  # 中间文件
        "--specpath", str(ROOT / "build"),
        "--exclude-module", "tkinter",  # 界面不需要 tk，避免连带 tcl/tk 的 DLL
        "--collect-all", "xyzrender",  # presets/*.json 等包数据随 exe 携带
    ] + add_binary_args() + collect_all_args() + [
        str(ROOT / "main.py"),
    ]
    print("运行:", " ".join(cmd))
    subprocess.run(cmd, check=True)
    if onefile_mode:
        exe = ROOT / "xyzrender.exe"
        print(f"完成: {exe} ({exe.stat().st_size / 1024 / 1024:.1f} MB)")
    else:
        print(f"完成: {distpath / 'xyzrender'}")


if __name__ == "__main__":
    main()
