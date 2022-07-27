import * as vscode from 'vscode';
import * as path from 'path';
import { getAllFiles, getPackagesDirNames } from './basic';

const rootDirName = [
	{
		path: '/',
		name: '根目录',
	},
];
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

		if (element) {
			// 获取目录小的 yml 文件 
			return Promise.resolve(this.getYmlFile(element.pathName));
		} else {
			// 获取根目录下的 yml 文件
			return Promise.resolve(this.getDirNode());
		}
	}

	/**
	 * 生成文件夹目录节点
	*/
	private getDirNode(): Yml[] {
		const rootDirNode = rootDirName.map(node => new Yml(node.name, node.path, vscode.TreeItemCollapsibleState.Collapsed));
		// packages 节点
		const packageDirNodes = getPackagesDirNames().map((name: string) => new Yml(`packages/${name}`, `/packages/${name}/`, vscode.TreeItemCollapsibleState.Collapsed));

		return [...rootDirNode, ...packageDirNodes];
	}


	/**
	 * 根据目录
	 * 获取yml文件，生成节点
	 */
	private getYmlFile(pathName: string): Yml[] {
		const ymlFileNames = getAllFiles(pathName);
		if (Array.isArray(ymlFileNames)) {
			return ymlFileNames.map(name => new Yml(name, pathName, vscode.TreeItemCollapsibleState.None));
		} else {
			return [];
		}
	}
}

export class Yml extends vscode.TreeItem {

	constructor(
		public readonly label: string,
		public readonly pathName: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command,
	) {
		super(label, collapsibleState);

		this.tooltip = `${this.label}`;
		// 根据 collapsibleState 设置 description
		this.description = this.collapsibleState === 1 ? `执行目录` : '可执行文件';
	}
	// 根据 collapsibleState 设置 icon，可展开的是 folder，不可展开的是 yml
	iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'light', this.collapsibleState === 1 ? 'folder.svg' : 'yml.svg'),
		dark: path.join(__filename, '..', '..', 'resources', 'dark', this.collapsibleState === 1 ? 'folder.svg' : 'yml.svg')
	};

	// 设置对应的 contextValue，用于标识是文件夹还是文件，以便在渲染时区分 view/item/context —— when 属性
	contextValue = this.collapsibleState === 1 ? 'folder' : 'yml';
}
