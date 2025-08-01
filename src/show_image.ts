import * as vscode from 'vscode';
import { spawn } from 'child_process';


function show_tiff_cmd(show_cmd: string, show_arg: string) {
    spawn(show_cmd, [show_arg], {
        detached: true,
        stdio: 'ignore'
    }).unref();
}


export function register_showImage(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('[extension] image-viewer:show is now active!');
    const disposable = vscode.commands.registerCommand('image-viewer.showImage', async (args) => {
        try {
            console.log('[extension] image-viewer start show image');
            
            const view_config = vscode.workspace.getConfiguration("image-viewer");
            const show_img_cmd = view_config.get<string>("ShowImgCmd", "");
            let show_img_args = view_config.get<string>("ShowImgArgs", "");
            if (show_img_args === "") {
                show_img_args = view_config.get<string>("TempImgPath", "");
            }

            show_tiff_cmd(show_img_cmd, show_img_args);

        } catch (err) {
            vscode.window.showErrorMessage(`Evaluate error: ${err}`);
        }
    });

    context.subscriptions.push(disposable);
}
