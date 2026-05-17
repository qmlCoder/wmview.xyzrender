# wmview.xyzrender

这是一个wmview程序的插件项目，需要结合wmview使用

该插件会调用xyzrender绘制分子图像

- xyzrender: https://github.com/aligfellow/xyzrender
- wmview: http://www.wmview.xyz/

## 使用方式

将`release`中打包的压缩包解压到wmview程序根目录下的plugs目录，重新启动wmview程序即可

插件内包含了一个嵌入式python，第一次使用的时候会自动安装依赖，需要等待一会

一个python脚本对应一个功能

- main.py 绘图功能
- deps.py 安装依赖
