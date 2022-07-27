import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { getPipelinePath } from './basic';

/**
 * 判断目录是否存在
 * @returns boolean
 */
function isExist(path: string) {
  return fs.existsSync(path);
}

export function createWebviewPanel(context: vscode.ExtensionContext) {

  if (isExist(getPipelinePath('/'))) {
    return;
  }

  // Create and show panel
  const panel = vscode.window.createWebviewPanel(
    'emptyWarning',
    'empty warning',
    vscode.ViewColumn.One,
    {
      // enableScripts: true,
      // retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media'))]
    }
  );
  const onDiskPath = vscode.Uri.file(
    path.join(context.extensionPath, 'media', 'empty-2.png')
  );
  const emptyPngSrc = panel.webview.asWebviewUri(onDiskPath);
  panel.webview.html = getWebviewContent(emptyPngSrc);
}

function getWebviewContent(emptyPngSrc: vscode.Uri) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>empty warning</title>
    <style>
        body {
            margin: 0 auto;
            text-align: center;
        }
        h4 {
            font-size: 1.5em;
            color: #666;
            margin-top: 5em;
            margin-bottom: 3em;
        }
    </style>
</head>
<body >
    <h4>根目录下面不存在 .dice/pipelines </h4>
    <img src="${emptyPngSrc}" width="250" />
</body>
</html>`;
}