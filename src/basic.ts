/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { window, workspace } from 'vscode';
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
export function getPipelinePath() {
	return getObjectPath() + '/' + '.dice/pipelines';
}

/**
 * 获取文件
 */
export function getAllFiles(): string[] {
	const filepath = getPipelinePath();
	const files = fs.readdirSync(filepath);
	return files;
	// window.showInformationMessage(`path: ${filepath} -- ${files}`);
}

// 生成copy名称
function getCopyName(name: string) {
	return name.replace('.js', 'Copy.js');
}

/**
 * 读取文件
 * 拷贝留存一份
 */
async function readFile(name: string) {
	const filepath = getObjectPath() + '/' + name;
	const file = fs.readFileSync(filepath, 'utf8');

	// 拷贝文件
	try {
		fs.copyFileSync(filepath, getObjectPath() + '/' + getCopyName(name));
		// console.log(name + ' was copied to ' + getCopyName(name));
	} catch (error) {
		console.error('copy error');
	}

	return file;
}

/**
 * 恢复deploy.js文件
 */
async function restoreFile(name: string) {
	const filepath = getObjectPath() + '/' + getCopyName(name);
	// 拷贝文件
	try {
		setTimeout(() => {
			fs.copyFileSync(filepath, getObjectPath() + '/' + name);
			// console.log(name + ' was restored from ' + getCopyName(name));
			// 删除备份文件
			fs.unlinkSync(filepath);
		}, 2000);
	} catch (error) {
		console.error('restored error');
	}
}

/**
 * 修改deploy.js文件
 */
async function updateFile(content: any, properties: any) {
	const res = await ast.parser(content, properties);
	return res;
}

/**
 * 重新写入文件
 */
async function writeFile(path: string, content: any) {
	const filepath = getObjectPath() + '/' + path;
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
 * 选择deploy的环境
 */
export async function pickDeploy() {
	const files = getAllFiles();
	const result: any = await window.showQuickPick(files, {
		title: 'yml文件选择',
		placeHolder: '请选择yml文件',
		// onDidSelectItem: item => window.showInformationMessage(`当前选中的是: ${item}`)
	});
	if (!result) {
		window.showInformationMessage('请选择需要deploy的yml文件');
		return;
	}

	await deploy(result);
}

/**
 * 选择release的环境
 */
export async function deployRelease() {
	const files = getAllFiles();
	const result: any = await window.showQuickPick(files, {
		placeHolder: '请选择yml文件',
		// onDidSelectItem: item => window.showInformationMessage(`当前选中的是: ${item}`)
	});
	if (!result) {
		window.showInformationMessage('请选择需要deploy的yml文件');
		return;
	}

	await release(result);
}


/**
 * deploy
 */
export async function deploy(result: string) {
	window.showInformationMessage(`选择执行: ${result}`);

	const fileContent = await readFile('deploy.js');
	targetEnv = result;
	const res = await updateFile(fileContent, result);
	await writeFile('deploy.js', res);

	await createTerminal('npm run deployTest');

	await restoreFile('deploy.js');
}


/**
 * release
 */
export async function release(result: string) {
	window.showInformationMessage(`选择执行: ${result}`);

	const fileContent = await readFile('deploy/deployIndex.js');
	const res = await updateFile(fileContent, result);
	await writeFile('deploy/deployIndex.js', res);

	await createTerminal('node deploy/deployIndex.js');

	await restoreFile('deploy/deployIndex.js');
}
