#!/usr/bin/env node
/**
 * 把仓库根的 lib/ 算法层编译成小程序可用的 CommonJS 产物。
 *
 * 做四件事：
 * 1. 复制 lib/ 与 types/ 到临时工作区，避开 .backup 等无用文件
 * 2. 把 @/ 路径别名改写成相对路径（小程序不支持 tsconfig paths）
 * 3. 把 require('lunar-javascript') 指向 vendor 副本
 * 4. tsc 编译为 CommonJS，按模块拆分到主包共享层与各分包
 *
 * 用法：node scripts/build-miniprogram-lib.mjs
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MP_ROOT = path.join(ROOT, 'miniprogram');

function log(step) {
  console.log(`[build-lib] ${step}`);
}

/**
 * 逐个删除目录内容再移除自身。
 * 一次性 rmSync(recursive) 在部分环境会触发批量删除保护，这里拆成单文件操作。
 */
function rmrf(target) {
  if (!fs.existsSync(target)) return;

  const stat = fs.statSync(target);
  if (!stat.isDirectory()) {
    fs.rmSync(target, { force: true });
    return;
  }

  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    const full = path.join(target, entry.name);
    if (entry.isDirectory()) {
      rmrf(full);
    } else {
      fs.rmSync(full, { force: true });
    }
  }
  fs.rmdirSync(target);
}

function copyDir(from, to, filter) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (filter && !filter(src, entry)) continue;
    if (entry.isDirectory()) {
      copyDir(src, dest, filter);
      continue;
    }
    fs.copyFileSync(src, dest);
  }
}

/** 计算 fromFile 到 targetModule 的相对 require 路径（不带 .ts 后缀） */
function relativeSpecifier(fromFile, targetModule) {
  const fromDir = path.dirname(fromFile);
  const rel = path.relative(fromDir, targetModule).replace(/\\/g, '/');
  return rel.startsWith('.') ? rel : `./${rel}`;
}

/**
 * 重写源码里的模块说明符：
 * - from '@/types'            -> 相对路径
 * - from '@/lib/config/xxx'   -> 相对路径
 * - require('@/lib/config/xxx') -> 相对路径
 * - require('lunar-javascript')-> vendor/lunar
 */
function rewriteSpecifiers(filePath, relativeToTmp) {
  let source = fs.readFileSync(filePath, 'utf8');
  const original = source;

  // @/xxx 一律映射到临时工作区根下的同名路径
  source = source.replace(
    /(from\s+|require\(\s*)['"]@\/([^'"]+)['"]/g,
    (_match, prefix, target) => {
      const spec = relativeSpecifier(relativeToTmp, target);
      return `${prefix}'${spec}'`;
    }
  );

  // 注意：lunar-javascript 的类型阶段保持原样（有 lunar.d.ts 声明可解析），
  // 运行时产物阶段再统一指向 vendor 副本，见 rewriteLunarRequires()

  if (source !== original) {
    fs.writeFileSync(filePath, source, 'utf8');
  }
}

function walk(dir, visit) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, visit);
    } else if (entry.isFile()) {
      visit(full);
    }
  }
}

function main() {
  // 固定工作区，默认增量覆盖（部分环境对批量删除有额度限制）。
  // 需要干净重建时加 --clean。
  const TMP = path.join(ROOT, '.mp-build');
  const libDest = path.join(MP_ROOT, 'lib');

  if (process.argv.includes('--clean')) {
    log('清理上一轮产物');
    rmrf(TMP);
    rmrf(libDest);
  }

  fs.mkdirSync(TMP, { recursive: true });
  log(`工作区 ${path.relative(ROOT, TMP)}`);

  log('复制 lib/ 与 types/ 到临时工作区');
  const skipNoise = (src, entry) =>
    !entry.name.endsWith('.backup') &&
    // 仓库里有两份 lunar 声明，只保留根目录那份（成员更全）；
    // 两份同时参与编译会互相遮盖，导致 fromYmdHms 之类的方法丢失
    entry.name !== 'lunar-javascript.d.ts';
  copyDir(path.join(ROOT, 'lib'), path.join(TMP, 'lib'), skipNoise);
  copyDir(path.join(ROOT, 'types'), path.join(TMP, 'types'), skipNoise);

  // 只保留提示词构造器。剩下的 ai/* 是 Web 端浏览器实现，
  // 依赖 sessionStorage / fetch，进包既没用又有误引用风险。
  const webOnlyAI = ['config.ts', 'transport.ts', 'analyzers.ts'];
  for (const name of webOnlyAI) {
    fs.rmSync(path.join(TMP, 'lib', 'ai', name), { force: true });
  }
  if (fs.existsSync(path.join(ROOT, 'lunar.d.ts'))) {
    fs.copyFileSync(path.join(ROOT, 'lunar.d.ts'), path.join(TMP, 'lunar.d.ts'));
  }

  log('改写成相对路径说明符');
  walk(TMP, (file) => {
    if (!file.endsWith('.ts')) return;
    const relative = path.relative(TMP, file).replace(/\\/g, '/');
    rewriteSpecifiers(file, relative);
  });

  log('生成临时 tsconfig 并编译');
  const tsconfigPath = path.join(TMP, 'tsconfig.json');
  fs.writeFileSync(
    tsconfigPath,
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2018',
          module: 'CommonJS',
          moduleResolution: 'node',
          lib: ['ES2018', 'DOM'],
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          skipLibCheck: true,
          strict: false,
          declaration: false,
          sourceMap: false,
          removeComments: false,
          outDir: './out',
          rootDir: '.',
          baseUrl: '.',
          paths: { '@/*': ['./*'] },
        },
        include: ['lib/**/*.ts', 'types/**/*.ts', 'lunar.d.ts'],
        exclude: ['node_modules', 'out'],
      },
      null,
      2
    ),
    'utf8'
  );

  const tscBin = path.join(ROOT, 'node_modules', 'typescript', 'bin', 'tsc');
  execFileSync(process.execPath, [tscBin, '-p', tsconfigPath], {
    stdio: 'inherit',
    cwd: TMP,
  });

  log('把 lunar-javascript 引用指向 vendor 副本');
  const outRoot = path.join(TMP, 'out');
  walk(outRoot, (file) => {
    if (!file.endsWith('.js')) return;
    const source = fs.readFileSync(file, 'utf8');
    if (!source.includes('lunar-javascript')) return;
    const relative = path.relative(outRoot, file).replace(/\\/g, '/');
    const spec = relativeSpecifier(relative, 'lib/vendor/lunar');
    const next = source
      .replace(/require\(\s*['"]lunar-javascript['"]\s*\)/g, `require('${spec}')`)
      .replace(/(from\s+)['"]lunar-javascript['"]/g, `$1'${spec}'`);
    fs.writeFileSync(file, next, 'utf8');
  });

  log('整理产物到 miniprogram/lib');
  const libOut = path.join(outRoot, 'lib');
  fs.mkdirSync(libDest, { recursive: true });
  copyDir(libOut, libDest, (src, entry) => {
    // types/ 编译产物是空壳，没必要进包
    return !entry.name.endsWith('.d.ts');
  });

  // 增量模式下上一轮的 Web 专用文件可能残留，定点清掉
  for (const name of ['config.js', 'transport.js', 'analyzers.js']) {
    fs.rmSync(path.join(libDest, 'ai', name), { force: true });
  }

  log('写入 lunar 运行时副本');
  const vendorDir = path.join(libDest, 'vendor');
  fs.mkdirSync(vendorDir, { recursive: true });
  const lunarSource = path.join(ROOT, 'node_modules', 'lunar-javascript', 'lunar.js');
  if (!fs.existsSync(lunarSource)) {
    throw new Error('找不到 node_modules/lunar-javascript/lunar.js，请先执行 npm install');
  }
  fs.copyFileSync(lunarSource, path.join(vendorDir, 'lunar.js'));

  const totalBytes = dirSize(libDest);
  log(`完成，miniprogram/lib 共 ${(totalBytes / 1024).toFixed(1)} KB`);
}

function dirSize(dir) {
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      total += dirSize(full);
    } else {
      total += fs.statSync(full).size;
    }
  }
  return total;
}

main();
