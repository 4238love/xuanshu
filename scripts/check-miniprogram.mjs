#!/usr/bin/env node
/**
 * 小程序静态自检
 *
 * 微信开发者工具之外没法真机运行，这里把能静态发现的问题先兜住：
 * 页面文件完整性、组件路径、require 解析、事件处理函数是否存在、JSON 合法性。
 *
 * 用法：node scripts/check-miniprogram.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MP = path.join(ROOT, 'miniprogram');
const REQUIRED_EXT = ['.js', '.json', '.wxml', '.wxss'];

const problems = [];
const notes = [];

function fail(message) {
  problems.push(message);
}

function ok(message) {
  notes.push(message);
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    fail(`${path.relative(MP, file)} JSON 解析失败：${error.message}`);
    return null;
  }
}

/** 收集 app.json 声明的全部页面（主包 + 分包） */
function collectPages(appJson) {
  const pages = [...(appJson.pages || [])];
  for (const pkg of appJson.subpackages || appJson.subPackages || []) {
    for (const page of pkg.pages || []) {
      pages.push(`${pkg.root}/${page}`);
    }
  }
  return pages;
}

/**
 * 检查 require 目标是否真实存在。
 *
 * 关键规则：分包内的 require 若以 "/" 开头，微信会相对「分包根目录」解析
 * （不是小程序根目录），必然找不到模块。这类写法直接判错，要求改相对路径。
 */
function checkRequires(file, subpackageRoots) {
  const source = fs.readFileSync(file, 'utf8');
  const regex = /require\(\s*['"]([^'"]+)['"]\s*\)/g;
  const relToMp = path.relative(MP, file).replace(/\\/g, '/');
  const inSubpackage = subpackageRoots.some((root) => relToMp.startsWith(`${root}/`));
  let matched;

  while ((matched = regex.exec(source)) !== null) {
    const spec = matched[1];
    if (!spec.startsWith('/') && !spec.startsWith('.')) {
      fail(`${relToMp} 使用了非绝对/相对路径 require：${spec}`);
      continue;
    }

    if (spec.startsWith('/') && inSubpackage) {
      fail(
        `${relToMp} 在分包内使用了绝对路径 require：${spec} —— 分包中 "/" 相对分包根解析，请改用相对路径`
      );
      continue;
    }

    const base = spec.startsWith('/')
      ? path.join(MP, spec)
      : path.resolve(path.dirname(file), spec);

    const candidates = [base, `${base}.js`, path.join(base, 'index.js')];
    if (!candidates.some((candidate) => fs.existsSync(candidate))) {
      fail(`${relToMp} require 目标不存在：${spec}`);
    }
  }
}

/**
 * 收集处理函数的「可用来源」：
 * 页面自身 js + 它直接 require 的本地模块。
 *
 * 排盘页的处理函数大多来自 utils/chart-kit.js 的 formHandlers（Object.assign 混入），
 * 只看页面 js 会全部误报成「未定义」。
 */
function collectHandlerSources(jsFile) {
  const sources = [fs.readFileSync(jsFile, 'utf8')];
  const dir = path.dirname(jsFile);

  for (const source of [...sources]) {
    const regex = /require\(\s*['"](\.[^'"]+)['"]\s*\)/g;
    let matched;
    while ((matched = regex.exec(source)) !== null) {
      const base = path.resolve(dir, matched[1]);
      const target = [`${base}.js`, base, path.join(base, 'index.js')].find(
        (candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile() && candidate.endsWith('.js')
      );
      if (!target) continue;
      const text = fs.readFileSync(target, 'utf8');
      if (!sources.includes(text)) sources.push(text);
    }
  }

  return sources.join('\n');
}

/** 读取 wxml 与它 import 的模板，模板里的 bind 事件同样落在页面实例上 */
function collectWxmlSources(wxmlFile) {
  const own = fs.readFileSync(wxmlFile, 'utf8');
  const sources = [own];
  const regex = /<import\s+src="([^"]+)"\s*\/?>/g;
  let matched;

  while ((matched = regex.exec(own)) !== null) {
    const target = path.resolve(path.dirname(wxmlFile), matched[1]);
    if (!fs.existsSync(target)) {
      fail(`${path.relative(MP, wxmlFile)} 引用的模板不存在：${matched[1]}`);
      continue;
    }
    sources.push(fs.readFileSync(target, 'utf8'));
  }

  return sources.join('\n');
}

/** 检查 WXML（含 import 的模板）中绑定的事件处理函数在页面 js 里是否有定义 */
function checkHandlers(wxmlFile, jsFile) {
  if (!fs.existsSync(jsFile)) return;

  const wxml = collectWxmlSources(wxmlFile);
  const js = collectHandlerSources(jsFile);
  const regex = /\b(?:bind|catch)(?::)?([a-zA-Z]+)\s*=\s*"([^"{}]+)"/g;
  const checked = new Set();
  let matched;

  while ((matched = regex.exec(wxml)) !== null) {
    const handler = matched[2].trim();
    if (!handler || checked.has(handler)) continue;
    checked.add(handler);

    const defined =
      new RegExp(`\\b${handler}\\s*\\(`).test(js) ||
      new RegExp(`\\b${handler}\\s*[:=]`).test(js);
    if (!defined) {
      fail(`${path.relative(MP, wxmlFile)} 绑定了未定义的处理函数：${handler}`);
    }
  }
}

/** 检查 WXML 标签是否基本闭合（自闭合与块标签） */
function checkWxmlTags(file) {
  const source = fs.readFileSync(file, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const stack = [];
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
  let matched;

  while ((matched = tagRegex.exec(source)) !== null) {
    const raw = matched[0];
    const tag = matched[1];
    const selfClosing = raw.endsWith('/>');

    if (raw.startsWith('</')) {
      const top = stack.pop();
      if (top !== tag) {
        fail(`${path.relative(MP, file)} 标签不匹配：期望 </${top || '空'}>，实际 </${tag}>`);
        return;
      }
      continue;
    }

    if (!selfClosing) stack.push(tag);
  }

  if (stack.length > 0) {
    fail(`${path.relative(MP, file)} 存在未闭合标签：${stack.join(' > ')}`);
  }
}

/**
 * WXS 语法检查。
 *
 * WXS 不是标准 JS，语法子集比 ES5 还窄。开发者工具报错只给行列号，
 * 定位成本高，这里把常见不支持写法提前拦下来。
 *
 * 另外一条实测结论：**WXS 事件回调里的 ownerInstance 不提供节点查询/样式写入能力**。
 * 在 Windows 开发者工具 2.02 + 基础库 3.18 下，`instance.selectAll(...)` 会被编译成
 * `nv_instance.nv_selectAll(...)`，运行时抛 `nv_selectAll is not a function`。
 * 所以「渲染层直接改样式」这条路过不去，位移统一走 JS 的 setData。
 */
function checkWxs(file) {
  const rel = path.relative(MP, file).replace(/\\/g, '/');
  const source = fs.readFileSync(file, 'utf8');
  // 去掉注释再做子集检查，避免注释里的示例代码误报
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');

  try {
    // Function 构造器只解析不执行，用来抓语法错误
    new Function(code);
  } catch (error) {
    fail(`${rel} 存在语法错误：${error.message}`);
    return;
  }

  const forbidden = [
    { pattern: /\bconst\s+\w/, message: '不支持 const，请改用 var' },
    { pattern: /\blet\s+\w/, message: '不支持 let，请改用 var' },
    { pattern: /=>/, message: '不支持箭头函数' },
    { pattern: /===|!==/, message: '不支持 === / !==，请改用 == / !=' },
    { pattern: /`/, message: '不支持模板字符串' },
    { pattern: /\bNumber\s*\(/, message: '不支持 Number() 构造调用，请改用 x * 1' },
    { pattern: /\.getDataset\s*\(/, message: 'getDataset() 会编译失败，请改用数组下标或从 event.currentTarget.dataset 取值' },
    { pattern: /\.getBoundingClientRect\s*\(/, message: 'getBoundingClientRect() 在部分基础库不可用，请改用页面传入尺寸' },
    { pattern: /\?\./, message: '不支持可选链' },
    { pattern: /\?\?/, message: '不支持空值合并' },
    {
      pattern: /\.selectAll\s*\(/,
      message: 'ownerInstance.selectAll 不可用（被编译成 nv_selectAll 后运行时不存在），请改到页面 js 里用 setData 驱动样式',
    },
    {
      pattern: /\.selectComponent\s*\(/,
      message: 'ownerInstance.selectComponent 不可用，请改到页面 js 里用 setData 驱动样式',
    },
    { pattern: /\.setStyle\s*\(/, message: 'setStyle 依赖 selectAll / selectComponent，同样不可用' },
  ];

  for (const rule of forbidden) {
    if (rule.pattern.test(code)) {
      fail(`${rel} ${rule.message}`);
    }
  }
}

/**
 * 检查 <button> 的文本是否跨行书写。
 *
 * 小程序的 button 默认带 `line-height: 2.55`，内容是纯文本时若换行书写，
 * 开头那段缩进会额外生成一个空行盒，配合固定 height 就会把文字挤到下半部分，
 * 表现为「文字错位」。按钮里嵌了 <view> 等多行的子节点则不受影响，跳过。
 */
function checkButtonText(file) {
  const rel = path.relative(MP, file).replace(/\\/g, '/');
  const source = fs.readFileSync(file, 'utf8');
  const regex = /<button\b[^>]*>([\s\S]*?)<\/button>/g;
  let matched;

  while ((matched = regex.exec(source)) !== null) {
    const content = matched[1];
    if (content.includes('<')) continue;
    if (!content.includes('\n')) continue;
    fail(`${rel} 的 <button> 文本跨行书写会多出一个空行盒，导致文字偏移，请把内容压成一行`);
  }
}

/**
 * 提交按钮的位置约定。
 *
 * 共享表单模板 `templates/birth-form.wxml` 只负责盘主信息，
 * **不能包含提交按钮**——否则按钮会紧跟基础信息卡，落在
 * 「起卦方式 / 排盘类型 / 五行局取法」这些模块专属选项之前，用户看到的
 * 就是「开始排盘」浮在页面中间。
 *
 * 按钮必须由每个页面自己写在表单块末尾。
 */
function checkSubmitButton(subpackageRoots) {
  const templateFile = path.join(MP, 'templates', 'birth-form.wxml');
  if (fs.existsSync(templateFile)) {
    const template = fs.readFileSync(templateFile, 'utf8');
    if (template.includes('primary-btn')) {
      fail('templates/birth-form.wxml 不应包含提交按钮：它会让按钮落在模块专属选项之前，请移到各页表单块末尾');
    }
  }

  const subpackageFiles = [];
  for (const root of subpackageRoots) {
    // 分包结构固定为 <root>/pages/<页名>/<页名>.wxml
    const pagesDir = path.join(MP, root, 'pages');
    if (!fs.existsSync(pagesDir)) continue;
    for (const page of fs.readdirSync(pagesDir)) {
      const wxml = path.join(pagesDir, page, `${page}.wxml`);
      if (fs.existsSync(wxml)) subpackageFiles.push(wxml);
    }
  }

  for (const file of subpackageFiles) {
    const source = fs.readFileSync(file, 'utf8');
    const count = (source.match(/class="primary-btn/g) || []).length;
    if (count === 0) {
      fail(`${path.relative(MP, file).replace(/\\/g, '/')} 缺少提交按钮（class="primary-btn"）`);
    }
  }

  ok(`排盘页提交按钮 ${subpackageFiles.length} 个页面已就位`);
}

/**
 * 按钮用法约定：只有提交按钮允许用 <button>，其它一律用 <view>。
 *
 * 小程序的 <button> 是框架组件，内部有自己的渲染结构和 line-height
 * （基础库给的约 92rpx 行高），改 height 时行盒不会跟着收缩——实测
 * 84rpx 高的 button 里文字会被压到下沿，底部还显示不全（我的页三个
 * 功能按钮就是这么错位的）。view 没有这些问题，样式完全可预测。
 */
function checkButtonUsage(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'lib' || entry.name === 'preview' || entry.name === 'cloudfunctions') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      checkButtonUsage(full);
      continue;
    }
    if (!entry.name.endsWith('.wxml')) continue;

    const rel = path.relative(MP, full).replace(/\\/g, '/');
    const source = fs.readFileSync(full, 'utf8');
    const regex = /<button\b([^>]*)>/g;
    let matched;

    while ((matched = regex.exec(source)) !== null) {
      const attrs = matched[1];
      const classMatched = /class="([^"]*)"/.exec(attrs);
      if (!classMatched || !classMatched[1].includes('primary-btn')) {
        fail(`${rel} 的非提交按钮用了 <button>，请改用 <view> —— button 的行高由基础库控制，会造成文字垂直错位`);
      }
    }
  }
}

/**
 * 提交按钮的盒高校验。
 *
 * <button> 的文本行高由基础库决定（约 92rpx），改 height 不会让行盒跟着收缩。
 * 所以 `.primary-btn` 必须保持 height 与 line-height 同为 92rpx，
 * 否则文字会偏上或偏下、底部被裁。
 */
function checkPrimaryButtonBox(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'lib' || entry.name === 'preview' || entry.name === 'cloudfunctions') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      checkPrimaryButtonBox(full);
      continue;
    }
    if (!entry.name.endsWith('.wxss')) continue;

    const source = fs.readFileSync(full, 'utf8');
    const blockMatched = /\.primary-btn\s*\{([^}]*)\}/.exec(source);
    if (!blockMatched) continue;

    const block = blockMatched[1];
    const height = /(?:^|[\s;])height:\s*([^;]+);/.exec(block);
    const lineHeight = /(?:^|[\s;])line-height:\s*([^;]+);/.exec(block);
    if (!height || !lineHeight) continue;

    if (height[1].trim() !== lineHeight[1].trim()) {
      fail(
        `${path.relative(MP, full).replace(/\\/g, '/')} 的 .primary-btn height(${height[1].trim()}) 与 line-height(${lineHeight[1].trim()}) 不一致，button 文本会垂直偏移`
      );
    }
  }
}

function main() {
  const appJsonPath = path.join(MP, 'app.json');
  if (!fs.existsSync(appJsonPath)) {
    fail('缺少 miniprogram/app.json');
    return;
  }

  const appJson = readJson(appJsonPath);
  if (!appJson) return;

  // 1. 页面文件完整性
  const pages = collectPages(appJson);
  const subpackageRoots = (appJson.subpackages || appJson.subPackages || [])
    .map((pkg) => pkg.root)
    .filter(Boolean);
  for (const page of pages) {
    for (const ext of REQUIRED_EXT) {
      const target = path.join(MP, `${page}${ext}`);
      if (!fs.existsSync(target)) {
        fail(`页面 ${page} 缺少 ${ext} 文件`);
      }
    }
  }
  ok(`共 ${pages.length} 个页面`);

  // 2. 组件引用
  const componentRefs = new Set();
  for (const page of pages) {
    const pageJson = path.join(MP, `${page}.json`);
    if (!fs.existsSync(pageJson)) continue;
    const config = readJson(pageJson);
    if (!config) continue;
    for (const [name, ref] of Object.entries(config.usingComponents || {})) {
      const base = ref.startsWith('/') ? path.join(MP, ref) : path.resolve(path.dirname(pageJson), ref);
      for (const ext of REQUIRED_EXT) {
        if (!fs.existsSync(`${base}${ext}`)) {
          fail(`页面 ${page} 引用的组件 ${name} 缺少 ${path.relative(MP, base)}${ext}`);
        }
      }
      componentRefs.add(base);
    }
  }
  for (const [name, ref] of Object.entries(appJson.usingComponents || {})) {
    const base = ref.startsWith('/') ? path.join(MP, ref) : path.join(MP, ref);
    for (const ext of REQUIRED_EXT) {
      if (!fs.existsSync(`${base}${ext}`)) {
        fail(`app.json 全局组件 ${name} 缺少 ${path.relative(MP, base)}${ext}`);
      }
    }
    componentRefs.add(base);
  }
  ok(`共 ${componentRefs.size} 个组件`);

  // 3. tabBar 校验（tab 页必须在主包，自定义 tabBar 必须有对应组件目录）
  const tabBar = appJson.tabBar;
  if (tabBar) {
    if (!Array.isArray(tabBar.list) || tabBar.list.length < 2) {
      fail('tabBar.list 至少需要 2 项');
    } else {
      for (const item of tabBar.list) {
        if (!pages.includes(item.pagePath)) {
          fail(`tabBar 页面 ${item.pagePath} 不在 pages 声明中`);
        }
        if (subpackageRoots.some((root) => item.pagePath.startsWith(`${root}/`))) {
          fail(`tabBar 页面 ${item.pagePath} 位于分包内，微信不允许 tab 页放在分包`);
        }
      }
    }

    if (tabBar.custom) {
      for (const ext of REQUIRED_EXT) {
        if (!fs.existsSync(path.join(MP, `custom-tab-bar/index${ext}`))) {
          fail(`tabBar.custom 为 true，但缺少 custom-tab-bar/index${ext}`);
        }
      }
      ok('自定义 tabBar 已就绪');
    }
  }

  // 4. require / 事件 / 标签
  const pageJsFiles = pages.map((page) => path.join(MP, `${page}.js`)).filter(fs.existsSync);
  const componentJsFiles = [...componentRefs].map((base) => `${base}.js`).filter(fs.existsSync);

  for (const file of [...pageJsFiles, ...componentJsFiles]) {
    checkRequires(file, subpackageRoots);
  }

  for (const page of pages) {
    const wxml = path.join(MP, `${page}.wxml`);
    if (!fs.existsSync(wxml)) continue;
    checkHandlers(wxml, path.join(MP, `${page}.js`));
    checkWxmlTags(wxml);
    checkButtonText(wxml);
  }

  for (const base of componentRefs) {
    const wxml = `${base}.wxml`;
    if (fs.existsSync(wxml)) {
      checkHandlers(wxml, `${base}.js`);
      checkWxmlTags(wxml);
    }
  }

  // 4.5 共享模板：标签闭合与按钮文本（模板会被内联进页面，同样要检查）
  const templateDir = path.join(MP, 'templates');
  const templateFiles = fs.existsSync(templateDir)
    ? fs
        .readdirSync(templateDir)
        .filter((name) => name.endsWith('.wxml'))
        .map((name) => path.join(templateDir, name))
    : [];
  for (const file of templateFiles) {
    checkWxmlTags(file);
    checkButtonText(file);
  }
  ok(`共享模板 ${templateFiles.length} 个`);

  // 4.6 提交按钮位置：必须在页面里，不能在共享模板里
  checkSubmitButton(subpackageRoots);

  // 4.7 按钮用法：非提交按钮一律用 view；提交按钮盒高必须成对
  checkButtonUsage(MP);
  checkPrimaryButtonBox(MP);

  // 5. WXS 语法与子集检查
  const wxsFiles = [];
  (function collectWxs(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'lib' || entry.name === 'preview' || entry.name === 'cloudfunctions') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        collectWxs(full);
      } else if (entry.name.endsWith('.wxs')) {
        wxsFiles.push(full);
      }
    }
  })(MP);

  for (const file of wxsFiles) {
    checkWxs(file);
  }
  ok(`WXS 文件 ${wxsFiles.length} 个`);

  // 6. 分包体积估算（preview 是本地原型，不进包）
  let totalBytes = 0;
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'preview' || entry.name === 'cloudfunctions') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else totalBytes += fs.statSync(full).size;
    }
  };
  walk(MP);
  ok(`小程序目录总计 ${(totalBytes / 1024 / 1024).toFixed(2)} MB（主包上限 2MB，总量上限 20MB）`);
}

main();

console.log('\n=== 自检结果 ===');
for (const note of notes) console.log(`  · ${note}`);

if (problems.length === 0) {
  console.log('  ✅ 未发现问题');
  process.exit(0);
}

console.log(`\n发现 ${problems.length} 个问题：`);
for (const problem of problems) console.log(`  ❌ ${problem}`);
process.exit(1);
