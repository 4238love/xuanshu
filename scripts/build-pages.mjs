#!/usr/bin/env node
/**
 * GitHub Pages 静态构建
 *
 * GitHub Pages 只能托管静态文件，而项目的 AI 批注依赖 `app/api/ai` 这个服务端代理，
 * 静态导出遇到带 POST 的 route handler 会直接构建失败。这里在构建期间把它挪到系统
 * 临时目录，构建结束（无论成功失败）再挪回来，仓库里不需要为演示站维护第二套代码。
 *
 * 用法：
 *   npm run build:pages                      # 根路径部署（username.github.io）
 *   NEXT_PUBLIC_BASE_PATH=/xuanshu npm run build:pages   # 项目页部署
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const API_DIR = path.join(ROOT, 'app', 'api');
const OUT_DIR = path.join(ROOT, 'out');
const BASE_PATH_RAW = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/+$/, '');

/**
 * 规范化 basePath。
 *
 * 除了去掉结尾斜杠，还要防一类常见的本地误伤：Git Bash（MSYS）会把
 * `NEXT_PUBLIC_BASE_PATH=/xuanshu` 当成路径转换成 `C:/.../xuanshu`，
 * 于是 Next 报 "Specified basePath has to start with a /"。
 * 这里把看起来像绝对路径的值还原成 `/最后一段`，并在控制台说明。
 */
function normalizeBasePath(raw) {
  if (!raw) return '';

  if (raw.startsWith('/')) return raw;

  const name = raw.split(/[\\/]/).filter(Boolean).pop() ?? '';
  if (!name) return '';

  console.warn(`[build-pages] basePath "${raw}" 不合法（缺少前导 /），已按 "/${name}" 处理`);
  return `/${name}`;
}

const BASE_PATH = normalizeBasePath(BASE_PATH_RAW);

function log(step) {
  console.log(`[build-pages] ${step}`);
}

function main() {
  let backupDir = null;

  if (fs.existsSync(API_DIR)) {
    backupDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xuanshu-api-'));
    fs.renameSync(API_DIR, path.join(backupDir, 'api'));
    log('临时移出 app/api（静态站没有服务端）');
  }

  try {
    log(`静态导出，basePath=${BASE_PATH || '(根路径)'}`);
    execFileSync(
      process.execPath,
      [path.join(ROOT, 'node_modules', 'next', 'dist', 'bin', 'next'), 'build'],
      {
        cwd: ROOT,
        stdio: 'inherit',
        env: {
          ...process.env,
          STATIC_EXPORT: '1',
          NEXT_PUBLIC_STATIC_DEMO: '1',
          NEXT_PUBLIC_BASE_PATH: BASE_PATH,
        },
      }
    );
  } finally {
    if (backupDir) {
      fs.renameSync(path.join(backupDir, 'api'), API_DIR);
      fs.rmSync(backupDir, { recursive: true, force: true });
      log('已还原 app/api');
    }
  }

  if (!fs.existsSync(OUT_DIR)) {
    console.error('[build-pages] 未生成 out/ 目录，构建可能未按静态导出执行');
    process.exit(1);
  }

  // 兜底：确保 404 页面存在（GitHub Pages 找不到文件时会用它）
  const notFound = path.join(OUT_DIR, '404.html');
  if (!fs.existsSync(notFound)) {
    log('未生成 404.html，跳过（GitHub Pages 会使用默认 404）');
  }

  log('完成，产物在 out/');
}

main();
