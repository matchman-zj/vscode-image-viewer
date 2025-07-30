// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

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
        const variableName = 'myImageBuffer'; // C++ 中你要查看的变量名
        const expression = variableName;

        try {
            const threads = await session.customRequest('threads');
            const activeThreadId = threads.threads[0]?.id;// 你可能要更复杂地选当前活跃线程
            if (!activeThreadId) throw new Error('No active thread');

            const stackTrace = await session.customRequest('stackTrace', {
                threadId: activeThreadId
            });
            const frameId = stackTrace.stackFrames[0].id;

            const result = await session.customRequest('evaluate', {
                expression: expression,
                frameId: frameId, // 可从栈帧动态获取
                context: 'watch'
            });

            const memoryReference = result.memoryReference || result.result;

            const memory = await session.customRequest('readMemory', {
                memoryReference: memoryReference, // 变量地址
                offset: 0,
                count: 10 * 10 // 你想读取多少字节
            });

            const base64Data = memory.data; // 你得到的是 base64 编码的数据

            // 显示 WebView
            const panel = vscode.window.createWebviewPanel(
                'debugImageViewer',
                'Debug Image',
                vscode.ViewColumn.Two,
                {
                    enableScripts: true
                }
            );
            panel.webview.html = getWebviewContent(base64Data);

        } catch (err) {
            vscode.window.showErrorMessage(`Evaluate error: ${err}`);
        }

    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
