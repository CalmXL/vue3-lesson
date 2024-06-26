// 打包 packages 下的模块，最终打包出 js 文件
// node dev.js <包名> -f <打包格式>
import minimist from 'minimist';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import esbuild from 'esbuild';

// node中的命令行参数，通过 process 来获取 process.argv
const args = minimist(process.argv.slice(2));
const __filename = fileURLToPath(import.meta.url); // 获取文件的绝对路径 file:
console.log(__filename); // => E:\i\vue3-lesson\scripts\dev.js

// node 中 esm 模块没有 __dirname
const __dirname = dirname(__filename);
console.log(__dirname); // => E:\i\vue3-lesson\scripts

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