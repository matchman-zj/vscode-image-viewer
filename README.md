# image-viewer

## 功能说明

c++ dubug 插件，用于查看自定义的图像数据结构

插件分为两个部分，需要一起使用



### [image-viewer](https://github.com/matchman-zj/vscode-image-viewer.git) 

运行在 ui 端

主要功能：

1. 调用命令打开看图工具（图片地址需要本地能够访问）



### [image-viewer-core](https://github.com/matchman-zj/vscode-image-viewer-core.git)

 运行在 workspace 端，当进行远程开发时，需要在远程服务器安装

主要功能：

1. debug 时获取图像相关信息
2. 保存为 tiff 图像文件



### 使用限制

1. 目前只支持灰度图像



## 参数说明

考虑到自定义形式可能多样，当前开放了很多参数需要自行设置



```
"image-viewer.imageClassName": {
    "type": "string",
    "default": "",
    "description": "json格式的字典，用于识别自定义图像类型，以及访问成员时使用的访问符号"
},
"image-viewer.imageDataPtrName": {
    "type": "string",
    "default": "",
    "description": "自定义图像中表示图像数据的变量名"
},
"image-viewer.imageWidthName": {
    "type": "string",
    "default": "",
    "description": "自定义图像中表示宽度的变量名"
},
"image-viewer.defaultWidth": {
    "type": "number",
    "default": 0,
    "description": "如果未设置 自定义图像中表示宽度的变量名，则使用此处指定的宽度"
},
"image-viewer.imageHeightName": {
    "type": "string",
    "default": "",
    "description": "自定义图像中表示高度的变量名"
},
"image-viewer.defaultHeight": {
    "type": "number",
    "default": 0,
    "description": "如果未设置 自定义图像中表示高度的变量名，则使用此处指定的高度"
},
"image-viewer.BitsPerPixelName": {
    "type": "string",
    "default": "",
    "description": "自定义图像中表示图像位深的变量名，位深值必须为8的整数倍"
},
"image-viewer.defaultBitsPerPixel": {
    "type": "number",
    "default": 8,
    "description": "如果未设置 自定义图像中表示图像位深的变量名，则使用此处指定的位深，位深值必须为 8, 16, 24, 32"
},
"image-viewer.TempImgPath": {
    "type": "string",
    "default": "",
    "description": "保存临时图像的路径，保存的格式为tiff"
},
"image-viewer.ShowImgCmd": {
    "type": "string",
    "default": "",
    "description": "查看图像命令"
},
"image-viewer.ShowImgArgs": {
    "type": "string",
    "default": "",
    "description": "查看图像命令的参数，为空则默认为 保存临时图像的路径"
},
```



## 参数示例

参数需要写在工程目录下的 `.vscode\settings.json` 文件中

### 图像数据结构

自定义的图像数据结构如下

```
class MyImage
{
private:
    /* data */
    int w;
    int h;
    std::vector<unsigned short> data;

public:
    MyImage(/* args */);
    ~MyImage();
};
```



### 本地使用参数示例

在windows上使用时，参数示例如下

```
"image-viewer.imageClassName" : "{'MyImage': '.', 'MyImage &': '.', 'MyImage &&': '.', 'MyImage *': '->'}",
"image-viewer.imageDataPtrName": "&data[0]",
"image-viewer.imageWidthName": "w",
"image-viewer.defaultWidth": 0,
"image-viewer.imageHeightName": "h",
"image-viewer.defaultHeight": 0,
"image-viewer.BitsPerPixelName": "",
"image-viewer.defaultBitsPerPixel": 16,
"image-viewer.TempImgPath": "D:\\temp\\debug_image.tiff",
"image-viewer.ShowImgCmd": "D:\\Tools\\Fiji.app\\fiji-windows-x64.exe",
"image-viewer.ShowImgArgs": "",
```



### 远程使用参数示例

在远程linux服务器上使用时，如下修改以下参数

```
"image-viewer.TempImgPath": "/data/samba/debug_image.tiff",
"image-viewer.ShowImgCmd": "D:\\Tools\\Fiji.app\\fiji-windows-x64.exe",
"image-viewer.ShowImgArgs": "\\\\192.168.0.10\\samba\\debug_image.tiff",
```



## 安装

### 安装 .vsix 文件

1. 下载 .vsix 文件
2. 在 VS Code 中，打开命令面板（`Ctrl + Shift + P` 或 `Cmd + Shift + P`），输入并选择 `Extensions: Install from VSIX...`，然后选择 `.vsix` 文件进行安装



### 从源代码安装

1. 安装打包工具，`npm install -g vsce`
2. 在工程的根目录下，使用 `vsce package` 命令生成 `.vsix` 文件
3. 在 VS Code 中，打开命令面板（`Ctrl + Shift + P` 或 `Cmd + Shift + P`），输入并选择 `Extensions: Install from VSIX...`，然后选择刚才生成的 `.vsix` 文件进行安装



## 其他

第一次使用ts这种类型的语言，而且对 vscode 的 [debug-adapter-protocol](https://microsoft.github.io/debug-adapter-protocol/)完全不了解，实现的比较粗暴，使用上也不够简单，好在暂时是够用了。

