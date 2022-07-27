## Description

my first vscode extension for deploy and release.

## Demo

- 使用效果图

![效果图](https://raw.githubusercontent.com/mamba-1024/vscode-extension/master/media/desc2.png)

- 不存在yml效果图

![错误效果图](https://raw.githubusercontent.com/mamba-1024/vscode-extension/master/media/89D04044-7AD5-4644-960E-0F22C7898671.png)

## why

目前有多个环境需要进行打包和发布，每次都要手动更改的 `deploy.js` 和 `deploy/deployIndex.js` 的执行文件。

同事支持单个 package 的打包和发布，eg: `packages/user` 等等

## what

使用的是 `vscode` 的  `vscode.workspace.workspaceFolders` 的 API 获取项目文件路径，所以保证当前 `vscode` 窗口只打开了一个项目目录

## how

> #### npm 版本要求
>由于要使用 `npm workspace`，请确保 `npm` 的版本号 大于 **7.0**，请安装 `node` 大于 `15.0`

- 使用 `vscode.workspace.workspaceFolders` 项目的地址，
- 扫描 **根目录** 和 **packages/\*** 中 `.dice/pipelines` 下的 `.yml` 文件，使用 `vscode.TreeDataProvider` 生成 `ymlNodeProvider`
- 使用 `window.registerTreeDataProvider` 注册 `ymlNodeProvider`
- 为每个 `yml` 文件添加 `buildEntry` 和 `releaseEntry` 命令：`commands.registerCommand`


> 1. 替换文件中 `yml` 名称后，会自动将文件恢复，所以不用担心每次都会更新文件，只有专注于选择对应的 `yml` 文件。
> 2. `package` 下的模块 `build（打包）`的时候使用各自 `package` 下的`deploy.js`。
> 3. `build（打包）` **全部组件**的时候，使用根目录下的 `deploy.js`
> 4. `发布（release）` 统一使用根目录下的 `deployIndex.js`


## 安装方式

- 通过 `vsce package` 打包了本地 `.vsix` 文件，从 `VSIX` 安装。
- 插件搜索mamba安装即可