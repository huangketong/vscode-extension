## Description

my first vscode extension for deploy and release.

## why

目前有多个环境需要进行上报和发布，每次都要手动更改的 `deploy.js` 和 `node` 的执行文件。

## what

使用的是 `vscode` 的  `vscode.workspace.workspaceFolders` 的 API 获取项目文件路径，所以保证当前 `vscode` 窗口只打开了一个项目目录

## how

- 使用 `vscode.workspace.workspaceFolders` 找到 `pipelines` 中的文件地址，
- 使用 `window.showQuickPick` 选择对应的 `.yml` 文件
- 通过 ast 语法分析，替换 `deploy.js` 和 `node` 执行文件中的 `yml` 文件名
- 使用 `window.createTerminal` 的创建终端窗口，执行对应的上报命令和发布命令

> 替换文件中 `yml` 名称后，会自动将文件恢复，所以不用担心每次都会更新文件，只有专注于选择对应的 `yml` 文件。


## 安装方式

目前通过 `vsce package` 打包了本地 `.vsix` 文件，从 `VSIX` 安装。