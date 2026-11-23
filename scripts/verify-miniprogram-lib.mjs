/**
 * 校验 miniprogram/lib 编译产物与原版 TS 实现输出一致。
 * 用法：node scripts/verify-miniprogram-lib.mjs
 * 前置：先跑 tests/zz-verify-mp.tmp.test.ts 生成 .mp-build/orig.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const CASES = [
  { name: '张三', sex: 1, date: '1990-01-01 08:30:00', dateType: 0 },
  { name: '李四', sex: 0, date: '1985-06-15 14:20:00', dateType: 0 },
  { name: '王五', sex: 1, date: '1992-12-08 10:00:00', dateType: 1 },
  {
    name: '真太阳时用例',
    sex: 1,
    date: '2000-08-20 06:15:00',
    dateType: 0,
    useTrueSolarTime: true,
    longitude: 116.4,
    city: '北京',
  },
];

const { createBaZiPaiPan } = require(path.join(ROOT, 'miniprogram', 'lib', 'bazi', 'index.js'));

const actual = CASES.map((settings) => JSON.parse(JSON.stringify(createBaZiPaiPan(settings))));
const expectedPath = path.join(ROOT, '.mp-build', 'orig.json');

if (!fs.existsSync(expectedPath)) {
  console.error('缺少 .mp-build/orig.json，请先运行 npx jest tests/zz-verify-mp.tmp.test.ts');
  process.exit(1);
}

const expected = JSON.parse(fs.readFileSync(expectedPath, 'utf8'));

function diff(a, b, trail = '') {
  const issues = [];
  if (a === b) return issues;
  if (typeof a !== typeof b || a === null || b === null) {
    issues.push(`${trail}: ${JSON.stringify(a)} !== ${JSON.stringify(b)}`);
    return issues;
  }
  if (typeof a !== 'object') {
    issues.push(`${trail}: ${JSON.stringify(a)} !== ${JSON.stringify(b)}`);
    return issues;
  }
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    issues.push(...diff(a[key], b[key], trail ? `${trail}.${key}` : key));
  }
  return issues;
}

let total = 0;
expected.forEach((exp, index) => {
  const issues = diff(exp, actual[index], `[${CASES[index].name}]`);
  total += issues.length;
  if (issues.length === 0) {
    console.log(`✅ ${CASES[index].name}：${exp.baZi.join(' ')} 完全一致`);
  } else {
    console.log(`❌ ${CASES[index].name}：${issues.length} 处不一致`);
    issues.slice(0, 10).forEach((line) => console.log(`   ${line}`));
  }
});

console.log(total === 0 ? '\n全部用例字段级一致。' : `\n共 ${total} 处差异。`);
process.exit(total === 0 ? 0 : 1);
