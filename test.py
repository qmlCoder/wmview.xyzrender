import subprocess
from xyzrender import render, load
import json
from pathlib import Path
# mole = load("test.xyz")
# render(mole, orient=False, output="test.png", no_hy=True,
#        config="default", fog=True, fog_strength=0.8)


input_data = Path("test.json").read_text()
try:
    output = subprocess.run(
        ["E:/code/wmview/plugins/wmview.xyzrender/python-3.10/python.exe",
            "E:/code/wmview/plugins/wmview.xyzrender/main.py"],
        input=input_data,
        check=True,
        capture_output=True,
        text=True,
    )
    print("STDOUT:", output.stdout)
    print("STDERR:", output.stderr)
except subprocess.CalledProcessError as e:
    print("返回码:", e.returncode)
    print("STDOUT:", e.stdout)
    print("STDERR:", e.stderr)
