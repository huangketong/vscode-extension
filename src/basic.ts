/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { window, workspace } from 'vscode';
import { Properties } from './abstract-syntax-code';
const fs = require('fs');
const ast = require('./abstract-syntax-code');


let terminalTml: any = null;
// 目标环境
let targetEnv: string = '';

// 获取项目地址
function getObjectPath() {
	const workspaceFolders = workspace.workspaceFolders;
	if (workspaceFolders) {
		return workspaceFolders[0].uri.path;
	}
	// const objectPath = workspaceFolders.map(item => item.uri.path);
	// window.showInformationMessage(`path: ${objectPath.length}`);
	// return objectPath[0];
}

/**
 * 获取pipeline文件目录
 * @returns string
 */
export function getPipelinePath(path: string) {
	return getObjectPath() + path + '.dice/pipelines';
}

/**
 * 获取文件
 */
export function getAllFiles(path: string): string[] {
	const filepath = getPipelinePath(path);
	const files = fs.readdirSync(filepath);
	return files;
}

// 生成copy名称
function getCopyName(name: string) {
	return name.replace('.js', 'Copy.js');
}

/**
 * 读取文件
 * 拷贝留存一份
 */
async function readFile(name: string, path: string) {
	const filepath = getObjectPath() + path + name;
	const file = fs.readFileSync(filepath, 'utf8');

	// 拷贝文件
	try {
		fs.copyFileSync(filepath, getObjectPath() + path + getCopyName(name));
		// console.log(name + ' was copied to ' + getCopyName(name));
	} catch (error) {
		console.error('copy error');
	}

	return file;
}

/**
 * 恢复deploy.js文件
 */
async function restoreFile(name: string, path: string) {
	const filepath = getObjectPath() + path + getCopyName(name);
	// 拷贝文件
	try {
		setTimeout(() => {
			fs.copyFileSync(filepath, getObjectPath() + path + name);
			// console.log(name + ' was restored from ' + getCopyName(name));
			// 删除备份文件
			fs.unlinkSync(filepath);
		}, 2000);
	} catch (error) {
		console.error('restored error');
	}
}

/**
 * 修改打包文件的变量
 * @param {any} content 文件内容
 * @param {Properties} properties 属性
 */
async function updateFile(content: any, properties: Properties) {
	const res = await ast.parser(content, properties);
	return res;
}

/**
 * 重新写入文件
 */
async function writeFile(path: string, content: any) {
	const filepath = getObjectPath() + path;
	fs.writeFileSync(filepath, content, 'utf8');
}

/**
 * 新建终端执行命令行
 */
async function createTerminal(cmd: string) {
	// 执行终端命令
	if (!terminalTml) {
		terminalTml = window.createTerminal('deploy');
	}
	terminalTml.show(true);
	try {
		terminalTml.sendText(cmd);
		// console.log('开始执行: ' + cmd);
	} catch (error) {
		window.showInformationMessage('执行: ' + cmd + '失败');
	}
}

/**
 * 选择 build 的环境
 */
// export async function pickDeploy() {
// 	const files = getAllFiles();
// 	const result: any = await window.showQuickPick(files, {
// 		title: 'yml文件选择',
// 		placeHolder: '请选择yml文件',
// 		// onDidSelectItem: item => window.showInformationMessage(`当前选中的是: ${item}`)
// 	});
// 	if (!result) {
// 		window.showInformationMessage('请选择需要deploy的yml文件');
// 		return;
// 	}

// 	await build(result);
// }

/**
 * 选择release的环境
 */
// export async function deployRelease() {
// 	const files = getAllFiles();
// 	const result: any = await window.showQuickPick(files, {
// 		placeHolder: '请选择yml文件',
// 		// onDidSelectItem: item => window.showInformationMessage(`当前选中的是: ${item}`)
// 	});
// 	if (!result) {
// 		window.showInformationMessage('请选择需要deploy的yml文件');
// 		return;
// 	}

// 	await release(result);
// }


/**
 * build 文件打包
 * @param name 文件名 eg: mix-prod.yml
 * @param pathName 文件路径 eg: /packages/notice/
 */
export async function build(result: string, pathName: string) {
	window.showInformationMessage(`pathName: ${pathName}`);
	window.showInformationMessage(`选择执行: ${pathName}.dice/pipelines/${result}`);
	// 读取文件内容
	const fileContent = await readFile('deploy.js', pathName);
	// 记录执行环境
	targetEnv = result;
	// 更新文件
	const res = await updateFile(fileContent, { yml: result });
	// 写入更新后的内容
	await writeFile(`${pathName}deploy.js`, res);
	/**
	 * 执行终端命令，打包文件，对应 packages/** 目录下的文件
	 * 两种方式，此处直接选择第二种，去掉 pathName 最后的 / 号即可直接使用
	 	* 1. npm run <script-name> -w a
		* 2. npm run <script-name> -w ./packages/a
	 */
	const cmd = pathName === '/' ? 'npm run deployTest' : `npm run deployTest -w .${pathName.substring(0, pathName.length - 1)}`;

	await createTerminal(cmd);
	// 恢复文件
	await restoreFile('deploy.js', pathName);
}


/**
 * release
 */
export async function release(result: string, pathName: string) {
	window.showInformationMessage(`pathName: ${pathName}`);
	window.showInformationMessage(`选择执行: ${pathName}.dice/pipelines/${result}`);

	const fileContent = await readFile('deploy/deployIndex.js', '/');
	const res = await updateFile(fileContent, { yml: result, ymlPath: pathName });
	await writeFile('/deploy/deployIndex.js', res);

	await createTerminal('node deploy/deployIndex.js');

	await restoreFile('deploy/deployIndex.js', '/');
}

/**
 * 获取 package 文件夹下的所有文件夹名称
 */
export function getPackagesDirNames() {
	const filepath = getObjectPath() + '/packages';
	const files = fs.readdirSync(filepath);
	return files;
}