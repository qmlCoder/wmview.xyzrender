import subprocess
import sys
import importlib.util


# ====================== 配置区：填写你的依赖 ======================
REQUIRED_PACKAGES: list[str] = [
    "xyzrender==0.2.6",  # 主库
]


def install_package(package: str) -> bool:
    """安装单个依赖包，返回是否成功"""
    try:
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", package,
                "-i", "https://pypi.tuna.tsinghua.edu.cn/simple/"],
            stdout=sys.stdout,
            stderr=sys.stderr
        )
        return True
    except subprocess.CalledProcessError:
        print(f"[ERROR] install {package} failed! try: pip install {package}")
        return False


def check_dependencies() -> bool:
    """检查所有依赖，缺失则自动安装"""
    missing = []
    for pkg in REQUIRED_PACKAGES:
        mod_name = pkg.split("==")[0].split(">=")[0]
        if not importlib.util.find_spec(mod_name):
            missing.append(pkg)

    if not missing:
        print("[OK] all deps ready\n")
        return True

    # 安装缺失依赖
    print(f"[WARN] found {len(missing)} missing deps, installing...")
    for pkg in missing:
        print(f"  installing {pkg}")
        if not install_package(pkg):
            return False

    print("[OK] deps installed!\n")
    return True


if __name__ == "__main__":
    check_dependencies()
