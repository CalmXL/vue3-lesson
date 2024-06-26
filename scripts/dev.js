// 打包 packages 下的模块，最终打包出 js 文件
// node dev.js <包名> -f <打包格式>
import minimist from 'minimist';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import esbuild from 'esbuild';

// node中的命令行参数，通过 process 来获取 process.argv
/**
 * process.argv 获取命令行参数的属性。返回一个数组
 * [
 *   'C:\\Program Files\\nodejs\\node.exe', // node.js 可执行文件的路径。
 *   'E:\\i\\vue3-lesson\\scripts\\dev.js', // 运行的 js 文件的路径。
 *   'reactivity', // 后续元素
 *   '-f',
 *   'esm'
 * ]
 */
// console.log(process.argv);
const args = minimist(process.argv.slice(2)); // 去除前两项
/**
 * node dev.js reactivity -f esm
 * 运行脚本       位置参数    短参数
 * {
 *    _: [ 'reactivity' ],
 *    f: 'esm'
 * }
 */
console.log(args);

// console.log(import.meta.url); // => file:///E:/i/vue3-lesson/scripts/dev.js
const __filename = fileURLToPath(import.meta.url); // 将文件URL 转换成文件路径
// console.log(__filename); // => E:\i\vue3-lesson\scripts\dev.js

// node 中 esm 模块没有 __dirname
const __dirname = dirname(__filename);
// console.log(__dirname); // => E:\i\vue3-lesson\scripts


// Nodejs 提供的一个用于在 ES6 模块中创建 commonJS 风格的 require 函数。
const require = createRequire(import.meta.url); // es6 中不存在 require
// console.log(require);

const target = args._[0] || "reactivity"; // 打包哪个项目
const format = args.f || 'iife'; // 打包后的模块规范

// 入口文件 根据命令行提供的路径来进行解析
const entry = resolve(__dirname, `../packages/${target}/src/index.ts`);
const pkg = require(`../packages/${target}/package.json`);

// 根据需要进行打包
esbuild.context({
  entryPoints: [entry], // 入口
  outfile: resolve(__dirname, `../packages/${target}/dist/${target}.js`), // 出口
  bundle: true, // reactivity -> shared 会打包到一起
  platform: 'browser', // 打包后给浏览器使用
  sourcemap: true, // 调试源代码
  format, // 格式
  globalName: pkg.buildOptions?.name, // iife 需要的全局名字
}).then((ctx) => {
  console.log('start dev');

  return ctx.watch(); // 监控入口文件持续进行打包处理
})