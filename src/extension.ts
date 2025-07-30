// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';

function getWebviewContent(base64Data: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
</head>
<body>
  <h3>Debug Image Viewer (10x10)</h3>
  <canvas id="canvas" width="10" height="10" style="image-rendering: pixelated; border: 1px solid #ccc;"></canvas>

  <script>
    const base64 = "${base64Data}";
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    console.log('解码后字节数组:', bytes);

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(10, 10);
    const data = imageData.data;

    for (let i = 0; i < 100; i++) {
      const v = bytes[i] * 25; // 你设置的是 0~9，所以放大对比度
      data[i * 4 + 0] = v; // R
      data[i * 4 + 1] = v; // G
      data[i * 4 + 2] = v; // B
      data[i * 4 + 3] = 255; // A
    }

    ctx.putImageData(imageData, 0, 0);
  </script>
</body>
</html>
`;
}

function createTIFF(
    width: number,
    height: number,
    data: Uint8Array,
    filePath: string
) {
    const numIFDEntries = 7;
    const header = Buffer.alloc(8);
    header.write('II', 0, 2, 'ascii'); // Little endian
    header.writeUInt16LE(42, 2);       // TIFF magic number
    header.writeUInt32LE(8, 4);        // Offset to IFD

    // Prepare IFD entries
    const ifd = Buffer.alloc(2 + numIFDEntries * 12 + 4); // 2 bytes for count, 4 bytes for nextIFD offset
    ifd.writeUInt16LE(numIFDEntries, 0); // number of IFD entries

    let offset = 2;
    function writeIFDEntry(tag: number, type: number, count: number, value: number) {
        ifd.writeUInt16LE(tag, offset);           // tag
        ifd.writeUInt16LE(type, offset + 2);      // type
        ifd.writeUInt32LE(count, offset + 4);     // count
        ifd.writeUInt32LE(value, offset + 8);     // value or offset
        offset += 12;
    }

    const imageDataOffset = header.length + ifd.length;

    writeIFDEntry(256, 4, 1, width);                    // ImageWidth
    writeIFDEntry(257, 4, 1, height);                   // ImageLength
    writeIFDEntry(258, 3, 1, 8);                        // BitsPerSample = 8
    writeIFDEntry(259, 3, 1, 1);                        // Compression = none
    writeIFDEntry(262, 3, 1, 1);                        // Photometric = BlackIsZero
    writeIFDEntry(273, 4, 1, imageDataOffset);          // StripOffsets = where image data starts
    writeIFDEntry(279, 4, 1, data.length);              // StripByteCounts = length of image data

    ifd.writeUInt32LE(0, offset); // next IFD offset = 0

    const file = Buffer.concat([header, ifd, data]);
    fs.writeFileSync(filePath, file);
    console.log(`✅ TIFF saved to: ${filePath}`);
}

function launchFijiWithTIFF(tiffPath: string, fijiPath: string) {
    spawn(fijiPath, [tiffPath], {
        detached: true,
        stdio: 'ignore'
    }).unref();
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "image-viewer" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    const disposable = vscode.commands.registerCommand('image-viewer.showImage', async () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Show Image');
        const session = vscode.debug.activeDebugSession;
        if (!session) {
            vscode.window.showWarningMessage('No active debug session');
            return;
        }

        // 从调试会话中获取变量
        try {
            // 确定当前活跃线程
            const threads = await session.customRequest('threads');
            const activeThreadId = threads.threads[0]?.id;// 你可能要更复杂地选当前活跃线程
            if (!activeThreadId) { throw new Error('No active thread'); }

            // 获取当前线程的栈帧
            const stackTrace = await session.customRequest('stackTrace', {
                threadId: activeThreadId
            });
            const frameId = stackTrace.stackFrames[0].id;

            // 读取图像 宽、高、数据
            const img_data_expression = 'myImageBuffer'; // C++ 中你要查看的变量名
            const img_w_expression = 'w'; // C++ 中你要查看的变量名
            const img_h_expression = 'h'; // C++ 中你要查看的变量名
            const data_res = await session.customRequest('evaluate', {
                expression: img_data_expression,
                frameId: frameId, // 可从栈帧动态获取
                context: 'watch'
            });

            const width_res = await session.customRequest('evaluate', {
                expression: img_w_expression,
                frameId: frameId, // 可从栈帧动态获取
                context: 'watch'
            });

            const height_res = await session.customRequest('evaluate', {
                expression: img_h_expression,
                frameId: frameId, // 可从栈帧动态获取
                context: 'watch'
            });

            const data_memory_ref = data_res.memoryReference;
            const img_width = width_res.result;
            const img_height = height_res.result;

            const data_memory = await session.customRequest('readMemory', {
                memoryReference: data_memory_ref, // 变量地址
                offset: 0,
                count: img_width * img_height // 你想读取多少字节
            });

            const base64_img_data = data_memory.data; // 你得到的是 base64 编码的数据
            const filename = path.join("F:\\temp", "debug_image.tiff");
            const img_data_u8_array = Uint8Array.from(Buffer.from(base64_img_data, 'base64')); // Uint8Array 类型
            createTIFF(img_width, img_height, img_data_u8_array, filename);
            launchFijiWithTIFF(filename, "D:\\Tools\\Fiji.app\\fiji-windows-x64.exe");

        } catch (err) {
            vscode.window.showErrorMessage(`Evaluate error: ${err}`);
        }

    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
