# 玄数排盘 · 微信小程序版

由仓库根目录的 Next.js 版本迁移而来。**排盘算法层与 Web 端共用同一份源码**，小程序的 `lib/` 是它的编译产物，不手工维护。

## 当前完成度

| 模块 | 状态 |
| --- | --- |
| 首页（层叠卡牌滑动 + 自定义 tabBar） | ✅ 已完成 |
| 我的（默认口径 / 真太阳时 / AI 状态 / 关于） | ✅ 已完成 |
| 八字排盘（表单 + 结果 + 复制报告） | ✅ 已完成 |
| 六爻排盘（日期 / 自动 / 手动起卦） | ✅ 已完成 |
| 梅花易数（时间 / 随机 / 数字 / 单数 / 双数） | ✅ 已完成 |
| 大六壬（四课三传 + 十二宫天地盘） | ✅ 已完成 |
| 奇门遁甲（洛书九宫 + 值符值使） | ✅ 已完成 |
| 紫微斗数（十二宫 + 四化 + 大限） | ✅ 已完成 |
| 六大模块 AI 批注（云函数代理） | ✅ 代码完成，待部署云环境 |

## 交互设计

- **底部 tabBar**：`首页` / `我的`，自定义组件（`custom-tab-bar/`），图标用 CSS 绘制、跟随 `currentColor`，不依赖 PNG 资源。
- **首页卡片**：层叠卡牌，当前卡居中，前后卡缩小到 0.86 并向两侧偏移 78%，只露出一条边。左右拖动切换，位移超过卡宽 18% 判定翻页，否则回弹。
- **拖动性能**：位移由 `pages/index/index.js` 用 `setData` 驱动，每帧只更新当前卡及左右各一张（`modules[i].style` 路径赋值），松手后的回弹/吸附交给 CSS `transition`。**不要改回 WXS 渲染层直接改样式**——当前开发者工具 + 基础库下 `ownerInstance` 没有节点 API，详见下方注意事项。
- **拖动细节**：判定翻页的阈值是卡宽的 18%；首尾卡继续往外拖会被压到 0.35 倍位移，做出橡皮筋感；拖动结束后 350ms 内的 `tap` 直接丢弃，避免滑完误进模块。
- **交互原型**：`preview/interaction-prototype.html` 是浏览器里可拖动的三方案对比，改交互前可以先在这里试手感（该目录已在 `packOptions.ignore` 中排除，不进包）。

## 用微信开发者工具打开

1. 开发者工具 → 导入项目 → 目录选 **本 `miniprogram/` 文件夹**（不是仓库根目录）。
2. AppID 填自己的，或先选「测试号」跑通界面（云开发需要真实 AppID）。
3. 编译后进入首页，左右滑动卡片切换盘式，点当前卡片进入模块。

分包页面依赖 `lib/` 产物，首次拉代码后如果 `miniprogram/lib` 是空的，先在仓库根目录执行：

```bash
npm run mp:build
```

## 目录结构

```text
miniprogram/
├── app.js / app.json / app.wxss      # 入口、路由与全局样式变量
├── custom-tab-bar/                   # 自定义 tabBar（CSS 图标）
├── pages/index/                      # 首页：层叠卡牌滑动（setData 驱动位移）
├── pages/mine/                       # 我的：偏好设置与关于
├── packages/                         # 六个排盘分包，每包一个页面
│   ├── bazi/pages/bazi/              #   八字（表单 + 结果同页切换）
│   ├── liuyao/pages/liuyao/          #   六爻
│   ├── meihua/pages/meihua/          #   梅花易数
│   ├── daliuren/pages/daliuren/      #   大六壬
│   ├── qimen/pages/qimen/            #   奇门遁甲
│   └── ziwei/pages/ziwei/            #   紫微斗数
├── templates/
│   ├── birth-form.wxml               # 盘主信息表单（五页共用）
│   └── ai-panel.wxml                 # AI 批注面板（共用）
├── styles/chart.wxss                 # 排盘页通用样式（各页 @import）
├── components/paper-card/            # 纸质卡片容器
├── utils/
│   ├── format.js                     # 视图层格式化（join / range / 日期拼装）
│   ├── preferences.js                # 用户偏好读写（本地存储）
│   ├── chart-kit.js                  # 排盘页公共逻辑（表单 / 提交 / AI / 报告）
│   └── ai.js                         # AI 云函数调用封装
├── preview/                          # 本地交互原型（不进包）
├── lib/                              # ⚠️ 编译产物，由 npm run mp:build 生成
│   ├── bazi/ liuyao/ meihua/ ...     #   六大排盘算法（CommonJS）
│   └── vendor/lunar.js               #   lunar-javascript 运行时副本
└── cloudfunctions/ai-proxy/          # AI 批注云函数
```

## 算法层同步机制

`miniprogram/lib/` 里的 `.js` **不要手改**，改动会在下次构建时被覆盖。

- 要改算法 → 改仓库根目录的 `lib/*.ts`，然后 `npm run mp:build`
- 构建脚本做了三件事：
  1. 把 `@/` 路径别名改写成小程序可解析的相对路径（小程序不支持 tsconfig `paths`）
  2. 把 `require('lunar-javascript')` 指向 `lib/vendor/lunar.js`，避免小程序 npm 构建
  3. 用 tsc 输出 CommonJS，`target: ES2018`

`lib/ai/config.js` 是 Web 端的浏览器实现（依赖 `sessionStorage`/`fetch`），小程序不引用它，只用 `lib/ai/analysisPrompts.js` 拼提示词。

## 云函数部署（AI 批注）

AI 能力走云开发，模型 Key 只存在云函数环境变量里，不下发到客户端。

1. `miniprogram/app.js` 顶部填入云开发环境 ID：

   ```js
   const CLOUD_ENV = 'your-env-id';
   ```

2. 开发者工具里右键 `cloudfunctions/ai-proxy` → 「上传并部署：云端安装依赖」。
3. 云开发控制台 → 云函数 → `ai-proxy` → 配置环境变量：

   | 变量 | 说明 |
   | --- | --- |
   | `AI_BASE_URL` | OpenAI 兼容地址，如 `https://api.openai.com/v1`（**不要**带 `/chat/completions`） |
   | `AI_API_KEY` | 服务端 Key |
   | `AI_MODEL` | 如 `gpt-4o-mini`、`deepseek-chat`、`hunyuan-turbo` |
   | `AI_MAX_TOKENS` | 可选，默认 2000 |

4. 云函数超时已设为 60s（`cloudfunctions/ai-proxy/config.json`）。

未配置云环境时，排盘功能完全不受影响，AI 面板会给出明确的未启用提示。

## 排盘页的共用骨架

五个新模块（六爻 / 梅花 / 大六壬 / 奇门 / 紫微）没有各抄一遍，而是共用同一套骨架，新增模块只需补「本模块特有的选项 + 结果展示」：

| 位置 | 作用 |
| --- | --- |
| `templates/birth-form.wxml` | 只负责盘主信息：姓名 / 占事 / 性别 / 日期类型 / 日期 / 时间。页面用 `<template is="birth-form" data="{{settings: settings, ...}}" />` 引入。**不含提交按钮** |
| `templates/ai-panel.wxml` | AI 批注面板，内部绑定 `onAskAI` / `onCopyAI` / `onCloseAI` |
| `styles/chart.wxss` | 表单控件、键值行、tag、九宫格、宫位卡、AI 面板等通用样式，页面 wxss 首行 `@import` |
| `utils/chart-kit.js` | `formHandlers`（表单全部交互）、`submit()`（排盘执行 + 错误兜底 + 震动）、`askAI()`、`report()`（报告文本） |

页面 js 形状固定：

```js
Page(Object.assign({}, kit.formHandlers, {
  aiType: 'liuyao',                     // 决定用哪套 AI 提示词
  data: { mode: 'form', settings, vm, ai },
  onLoad() { kit.initPage(this, { paiPanType: 0 }); },
  onSubmit() {
    kit.submit(this, { create: createLiuYaoPaiPan, buildVm });
  },
}));
```

**提交按钮必须由页面自己写在表单块末尾**，不能放进共享模板。模板只能紧跟「盘主信息」卡，按钮会浮在「起卦方式」「排盘类型」「五行局取法」这些模块专属选项之前——用户看到的就是「开始排盘」卡在页面中间。`mp:check` 里 `checkSubmitButton()` 会拦这个：模板出现 `primary-btn` 直接判错，分包页面缺按钮也判错。

`buildVm(result)` 是每个页面唯一要认真写的东西：把算法结果拍平成 WXML 能直接渲染的数组与字符串。**不要在 WXML 里做计算**——WXML 表达式不支持 `join()` 这类数组方法，`{{item.siHua.join('')}}` 会渲染成空。同理，`<template>` 的 `data` 必须把模板里用到的 key 全部显式传进去，模板作用域是隔离的。

## 自检脚本

在仓库根目录执行：

```bash
npm run mp:build     # 重新编译算法层到 miniprogram/lib
npm run mp:check     # 静态自检：页面文件完整性 / 组件路径 / require 解析 / 事件绑定 / JSON
npm run mp:smoke     # 冒烟测试：打桩跑通「表单 → 排盘 → 视图模型 → AI 调用」
npm run mp:verify    # 以上三步串起来跑
```

`mp:smoke` 会在 Node 里 mock `Page`/`wx`/`getApp`，真实执行页面生命周期。它能抓出小程序运行时才会暴露的一类错误，但**不能替代真机验证**——WXML 布局与手势仍需在开发者工具里看。

## 与 Web 版的对应关系

| Web 端 | 小程序 |
| --- | --- |
| `lib/*/index.ts`（`XxxPaiPan` class） | `lib/*/index.js`（同一份编译产物） |
| `app/*/page.tsx` + 组件 | `packages/*/pages/*/*.wxml` + `.js` |
| `hooks/useAIAnalysis.ts` | `utils/ai.js` + 云函数 `ai-proxy` |
| `app/api/ai/route.ts` | `cloudfunctions/ai-proxy/index.js` |
| Tailwind arbitrary values | `app.wxss` 里的 CSS 变量 + rpx |
| localStorage / sessionStorage | `wx.setStorageSync`（后续接入设置持久化时使用） |

## 开发注意事项

### WXS 里拿不到节点 API，别想着「渲染层改样式」

网上很多卡牌拖动的方案是「WXS 事件回调里用 `ownerInstance.selectAll('.card')` 拿节点，再 `setStyle` 改写」。**在这套环境里走不通**：Windows 开发者工具 2.02 + 基础库 3.18 下，`instance.selectAll(...)` 会被编译成 `nv_instance.nv_selectAll(...)`，运行时直接抛

```
TypeError: nv_instance.nv_selectAll is not a function
```

首页第一版就是这条路，编译能过，一碰屏幕就红屏。所以拖动位移现在由 `pages/index/index.js` 用 `setData` 驱动。

`setData` 每帧全量重排 6 张卡确实会掉帧，但**只更新变的那几张**就没问题：拖动时重心只移动当前卡与相邻一张，用 `modules[0].style` 这种路径写法一次只推 1-3 个小字符串。松手后的吸附动画不占 `setData`，交给 WXSS 的 `transition`。

### 如果确实要写 WXS

语法子集比 ES5 还窄，开发者工具只报「第几行第几列 Unexpected token」，定位很费劲。实测会**直接编译失败**的写法：

| 写法 | 结果 |
| --- | --- |
| `const` / `let` | 不支持，只能用 `var` |
| 箭头函数 `=>` | 不支持 |
| `===` / `!==` | 用 `==` / `!=` |
| 模板字符串 `` ` `` | 不支持 |
| `Number(x)` | 编译失败，改用 `x * 1` |
| `component.getDataset()` | 编译失败，改用数组下标或 `event.currentTarget.dataset` |
| `ownerInstance.selectAll()` / `selectComponent()` | 编译能过，运行时 `nv_selectAll is not a function` |
| `?.` / `??` | 不支持 |
| 对象字面量尾逗号 | 避免 |

`npm run mp:check` 已把上面这些做成硬性规则（含 `selectAll` 这类运行时才炸的写法），并且用 `new Function` 做语法解析，写错会在自检阶段就报出来，不用等开发者工具。

### 按钮：只有提交按钮用 <button>，其它一律用 <view>

小程序的 `<button>` 是框架组件，文本行高由基础库控制（约 92rpx），**改 `height` 不会让行盒跟着收缩**。所以：

- **非提交按钮**（我的页的诊断/重置/清缓存、结果页的重新排盘/复制报告、AI 面板按钮）全部用 `<view class="..." bindtap>` + `display:flex; align-items:center; justify-content:center`。用 `<button>` 时若 height 不是 92rpx，文字会被压在下沿、底部显示不全。
- **提交按钮**（`class="primary-btn"`，需要 `loading` 转圈）保留 `<button>`，并且 `.primary-btn` 的 `height` 与 `line-height` **必须同为 92rpx**，内容**必须单行**。

`mp:check` 有两条对应校验：`checkButtonUsage()`（非 `primary-btn` 的 `<button>` 直接判错）、`checkPrimaryButtonBox()`（`.primary-btn` 的 height / line-height 不一致判错）。

### 自定义 tabBar 必须每页同步选中态

`tabBar.custom: true` 之后，微信不会帮你维护选中态。每个 tab 页都要在 `onShow` 里自己设：

```js
onShow() {
  if (typeof this.getTabBar === 'function') {
    const tabBar = this.getTabBar();
    if (tabBar) tabBar.setData({ selected: 0 }); // 「我的」页是 1
  }
}
```

漏掉这一步的典型症状：从「我的」切回「首页」后，底部高亮还停在「我的」。

另外 **tab 页必须放主包**，不能放进 `packages/*` 分包，`npm run mp:check` 会拦这个。

### 分包里的 require 必须用相对路径

小程序中，**分包内以 `/` 开头的 require 是相对「分包根目录」解析的，不是小程序根目录**。

```js
// ❌ 在 packages/bazi/pages/bazi/bazi.js 里这样写会被解析成
//    packages/bazi/lib/bazi/index.js，直接报 module not defined
const { createBaZiPaiPan } = require('/lib/bazi/index.js');

// ✅ 用相对路径
const { createBaZiPaiPan } = require('../../../../lib/bazi/index.js');
```

`npm run mp:check` 已经把这条规则固化成硬性检查，分包内出现绝对路径 require 会直接报错。

注意导航路径不受影响：`wx.navigateTo({ url: '/packages/bazi/pages/bazi/bazi' })` 里的 `/` 仍然是小程序根目录。组件引用 `usingComponents` 同理，`/components/paper-card/paper-card` 是合法的。

### 新增排盘模块的步骤

以已有的六爻为例，一个模块就是 4 个文件 + 1 条路由：

1. `app.json` 的 `subpackages` 加一项，`root` 指向 `packages/<模块名>`，并在 `pages/index/index.js` 的 `MODULES` 里补 `ready: true` 与 `route`
2. 新建 `packages/<模块名>/pages/<模块名>/{js,json,wxml,wxss}`
3. js 用 `Page(Object.assign({}, kit.formHandlers, {...}))`，`onLoad` 调 `kit.initPage`，`onSubmit` 调 `kit.submit`，再写本模块的 `buildVm`
4. wxml 顶部 `<import>` 两个模板，wxss 首行 `@import "../../../../styles/chart.wxss"`；表单块的最后一项是本页的提交按钮（`class="primary-btn"`，放在模块专属选项卡片之后）
5. `require` 算法层按相对深度写，例如 `require('../../../../lib/liuyao/index.js')`
6. 跑 `npm run mp:check && npm run mp:smoke` 确认没有路径、绑定与视图模型错误

`app.json` 里加了分包后，记得同步 `scripts/smoke-charts.mjs` 的 `CHART_PAGES`，否则新页面不在冒烟覆盖范围内。

## 已知限制

- 结果页暂未做「导出图片」与「打印」，Web 端靠 `html2canvas`，小程序需改用 `canvas` 绘制或 `wxml-to-canvas`。
- 神煞细粒度开关暂未暴露 UI：八字 60 种、六爻 23 种都只有总开关，算法层已支持 `shenShaConfig` 细粒度传参。
- 奇门只接了转盘（`panType: 'zhuan'`），飞盘在算法层尚未完成；大六壬的「三传取法」字段目前为空，页面会自动隐藏该行。
- 农历输入复用同一个日期选择器，语义由「日期类型」切换决定，选的是农历年月日。
- AI 批注为一次性返回，未做流式（`wx.cloud.callFunction` 不支持 SSE）。
