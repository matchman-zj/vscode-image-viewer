import * as vscode from 'vscode';
import * as fs from 'fs';
import { spawn } from 'child_process';


const outputChannel = vscode.window.createOutputChannel('image-viewer');

export function viewerLog(message: string) {
    const timestamp = new Date().toISOString();
    outputChannel.appendLine(`[${timestamp}] ${message}`);
}

function show_tiff_cmd(show_cmd: string, show_arg: string) {
    spawn(show_cmd, [show_arg], {
        detached: true,
        stdio: 'ignore'
    }).unref();
}

export function register_showImage(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (viewerLog) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    viewerLog('[extension] image-viewer is now registed!');
    const disposable = vscode.commands.registerCommand('image-viewer.showImage', async (data: string, path: string) => {
        try {
            viewerLog(`start save image to ${path}`);
            const tiff_data = Buffer.from(data, 'base64');
            fs.writeFileSync(path, tiff_data);

            viewerLog('start show image');
            const view_config = vscode.workspace.getConfiguration("image-viewer");
            const show_img_cmd = view_config.get<string>("ShowImgCmd", "");
            let show_img_args = view_config.get<string>("ShowImgArgs", "");
            if (show_img_args === "") {
                show_img_args = view_config.get<string>("TempImgPath", "");
            }

            viewerLog(`show_img_cmd: ${show_img_cmd}`);
            viewerLog(`show_img_args: ${show_img_args}`);
            show_tiff_cmd(show_img_cmd, show_img_args);

        } catch (err) {
            vscode.window.showErrorMessage(`Evaluate error: ${err}`);
        }
    });

    context.subscriptions.push(disposable);
}
