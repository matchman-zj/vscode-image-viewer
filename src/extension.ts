import * as vscode from 'vscode';
import { register_showImage } from './show_image';

export function activate(context: vscode.ExtensionContext) {
    const isRemote = vscode.env.remoteName !== undefined;
    console.log(`Plugin activated in ${isRemote ? 'remote' : 'local'} mode`);

    register_showImage(context);
}

// This method is called when your extension is deactivated
export function deactivate() { }