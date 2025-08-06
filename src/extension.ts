import * as vscode from 'vscode';
import { register_showImage, viewerLog } from './show_image';

export function activate(context: vscode.ExtensionContext) {
    const isRemote = vscode.env.remoteName !== undefined;
    viewerLog(`image-viewer activated in ${isRemote ? 'remote' : 'local'} mode`);

    register_showImage(context);
}

// This method is called when your extension is deactivated
export function deactivate() { }