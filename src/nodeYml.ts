import * as vscode from 'vscode';
import * as path from 'path';
import { getAllFiles } from './basic';

export class YmlNodeProvider implements vscode.TreeDataProvider<Yml> {

	private _onDidChangeTreeData: vscode.EventEmitter<Yml | undefined | void> = new vscode.EventEmitter<Yml | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<Yml | undefined | void> = this._onDidChangeTreeData.event;

	constructor(private workspaceRoot: string | undefined) {
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: Yml): vscode.TreeItem {
		return element;
	}

	getChildren(element?: Yml): Thenable<Yml[]> {
		if (!this.workspaceRoot) {
			vscode.window.showInformationMessage('No yml in empty workspace');
			return Promise.resolve([]);
		}

		const ymlFileNames = getAllFiles();
		return Promise.resolve(this.getYmlFile(ymlFileNames));
	}

	/**
	 * 获取yml文件，生成节点
	 */
	private getYmlFile(ymlFileNames: string[]): Yml[] {
		if (Array.isArray(ymlFileNames)) {
			return ymlFileNames.map(name => new Yml(name, vscode.TreeItemCollapsibleState.None));
		} else {
			return [];
		}
	}
}

export class Yml extends vscode.TreeItem {

	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);

		this.tooltip = `${this.label}`;
		// this.description = this.label;
	}

	iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'light', 'yml.svg'),
		dark: path.join(__filename, '..', '..', 'resources', 'dark', 'yml.svg')
	};

	contextValue = 'yml';
}
