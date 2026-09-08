from zipfile import ZipFile, ZIP_DEFLATED
import os

def compress_specified_items(output_zip: str, items: list, compress_level: int = 6):
    """
    自定义压缩指定的 文件/文件夹 列表
    :param output_zip: 输出的压缩包路径（如 "my_files.zip"）
    :param items: 要压缩的路径列表（可混合文件、文件夹）
    :param compress_level: 压缩等级 0-9，越大压缩越小
    """
    with ZipFile(output_zip, "w", ZIP_DEFLATED, compresslevel=compress_level) as zipf:
        # 遍历所有要压缩的项
        for item in items:
            # 如果路径不存在，跳过
            if not os.path.exists(item):
                print(f"警告：{item} 不存在，已跳过")
                continue

            # 如果是【文件】，直接添加
            if os.path.isfile(item):
                # arcname 控制压缩包内的文件名，避免绝对路径
                zipf.write(item, arcname=os.path.basename(item))

            # 如果是【文件夹】，递归添加所有内容
            elif os.path.isdir(item):
                for root, dirs, files in os.walk(item):
                    for file in files:
                        file_path = os.path.join(root, file)
                        # 保留文件夹内部结构，不包含上级绝对路径
                        arcname = os.path.relpath(file_path, os.path.dirname(item))
                        zipf.write(file_path, arcname=arcname)

# ====================== 【只需修改这里】 ======================
# 自定义你要压缩的 文件 和 文件夹（混合写就行）
# 按开发指南：压缩包内直接是插件文件（index.js + assets/ + xyzrender.exe），不带顶层目录
# xyzrender.exe 由 build_exe.py 打包（已内置 python 运行时 + xyzrender 依赖）
TO_COMPRESS = [
    "dist/index.js",        # MF 入口（固定文件名）
    "dist/assets",          # 依赖 chunk 目录
    "xyzrender.exe",        # 渲染引擎（免安装 python / 免首次 pip 装依赖）
]

# 开始压缩
compress_specified_items(
    output_zip="wmview.xyzrender.zip",
    items=TO_COMPRESS,
    compress_level=6
)
print("压缩完成！")