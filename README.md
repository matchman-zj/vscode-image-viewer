# image-viewer

## 功能说明

c++插件，支持查看自定义的图像数据结构



## 配置说明

考虑到自定义形式可能多样，当前开放了很多参数需要自行设置

待补充

。。。



## 安装

1. 安装打包工具，`npm install -g vsce`
2. 在工程的根目录下，使用 `vsce package` 命令生成 `.vsix` 文件
3. 在 VS Code 中，打开命令面板（`Ctrl + Shift + P` 或 `Cmd + Shift + P`），输入并选择 `Extensions: Install from VSIX...`，然后选择刚才生成的 `.vsix` 文件进行安装



## 其他

第一次使用ts这种类型的语言，而且对 vscode 的 [debug-adapter-protocol](https://microsoft.github.io/debug-adapter-protocol/)完全不了解，实现的比较粗暴，使用上也不够简单，好在暂时是够用了。

