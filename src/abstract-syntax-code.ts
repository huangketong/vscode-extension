/*
 * @Author: Ketong
 * @Date: 2021-06-18 10:44:08
 * @LastEditTime: 2021-06-18 14:44:23
 * @LastEditors: Ketong
 * @Description: 通过 ast 语法分析，替换 props
 */

// const fs = require('fs');
const parser = require('@babel/parser');
const generator = require('@babel/generator');
const traverse = require('@babel/traverse');

function formatter(code: any) {
  return typeof code === 'string' ? code.replace(/\["/g, '[\n  "').replace(/",\s"/g, '",\n  "').replace(/"\];/g, '"\n];').replace(/\{\s\.\.\./g, '{\n  ...').replace(/;/g, ';\n').replace(/"/g, '\'') : '';
}

/**
 * @description: 代码转化
 * @param {string} code
 * @param {string} properties
 * @return {string}
 */
function compiler(code: any, properties?: string) {
  // 1. parse 将代码解析为抽象语法树（AST）
  // allowImportExportEverywhere 默认情况下，import 和export 声明只能出现在程序的顶层。如果将此选项设置为true，则允许在任何允许使用语句的地方使用它们。
  const ast = parser.parse(code, {
    allowImportExportEverywhere: true,
  });

  // 2. traverse 转换代码
  const visitor = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    VariableDeclarator(path: any) {
      if (path.node.id.name === 'yml') {
        path.node.init.value = properties;
      }
    },
  };

  traverse.default(ast, visitor);

  // 3. generator 将 AST 转回成代码
  return generator.default(ast, {}, code).code;
}

module.exports = {
  parser: compiler,
};
