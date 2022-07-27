/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { window, commands, ExtensionContext, workspace } from 'vscode';
import {
	// pickDeploy, deployRelease, 
	release, build
} from './basic';
// import { multiStepInput } from './multiStepInput';
// import { quickOpen } from './quickOpen';
import { YmlNodeProvider, Yml } from './nodeYml';
import { createWebviewPanel } from './webview';

export function activate(context: ExtensionContext) {
	const rootPath = (workspace.workspaceFolders && (workspace.workspaceFolders.length > 0))
		? workspace.workspaceFolders[0].uri.fsPath : undefined;

	if (!rootPath) {
		createWebviewPanel(context);
	}

	const ymlNodeProvider = new YmlNodeProvider(rootPath);
	window.registerTreeDataProvider('sidebar_mamba', ymlNodeProvider);
	commands.registerCommand('sidebar_mamba.buildEntry', (node: Yml) => build(node.label, node.pathName));
	commands.registerCommand('sidebar_mamba.releaseEntry', (node: Yml) => release(node.label, node.pathName));
	commands.registerCommand('sidebar_mamba.refreshYml', () => {
		ymlNodeProvider.refresh();
		window.showInformationMessage(`Successfully called refreshYml entry.`);
		createWebviewPanel(context);
	});

	// context.subscriptions.push(commands.registerCommand('customFrontend', async () => {
	// 	const options: { [key: string]: (context: ExtensionContext) => Promise<void> } = {
	// 		pickDeploy,
	// 		deployRelease,
	// 		// multiStepInput,
	// 		// quickOpen,
	// 	};
	// 	const quickPick = window.createQuickPick();
	// 	quickPick.items = Object.keys(options).map(label => ({ label }));
	// 	quickPick.onDidChangeSelection(selection => {
	// 		if (selection[0]) {
	// 			options[selection[0].label](context)
	// 				.catch(console.error);
	// 		}
	// 	});
	// 	quickPick.onDidHide(() => quickPick.dispose());
	// 	quickPick.show();
	// }));
}
