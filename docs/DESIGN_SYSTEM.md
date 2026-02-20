# 易学排盘系统 - 设计系统文档

## 📋 目录
1. [设计分析](#设计分析)
2. [设计问题](#设计问题)
3. [设计系统方案](#设计系统方案)
4. [实施建议](#实施建议)

---

## 🔍 设计分析

### 当前页面概览

项目包含7个页面，每个页面都有独特的配色方案：

| 页面 | 主色调 | 图标 | 描述 |
|------|--------|------|------|
| 首页 | `purple-pink` | ☯ | 六大系统入口 |
| 八字排盘 | `purple-pink` | ☯ | 四柱八字推算 |
| 六爻排盘 | `blue-cyan` | ☷ | 六爻占卜 |
| 梅花易数 | `indigo-purple` | ☲ | 心易占卜 |
| 大六壬 | `green-emerald` | ⚌ | 三式之首 |
| 奇门遁甲 | `orange-red` | ⚍ | 帝王之学 |
| 紫微斗数 | `pink-rose` | ★ | 星曜命盘 |

### 共同设计模式

所有页面遵循相似的结构：

1. **头部导航**
   - 左侧：图标 + 标题 + 副标题
   - 右侧：返回首页按钮
   - 样式：`bg-white/80 backdrop-blur-sm sticky top-0`

2. **表单区域**
   - 白色卡片：`bg-white rounded-2xl shadow-xl p-8`
   - 标题：emoji + 文字
   - 输入字段：统一的圆角、边框、focus状态

3. **结果展示**
   - 多层级信息卡片
   - 渐变色背景
   - 网格布局（grid）

---

## ⚠️ 设计问题

### 1. 视觉一致性问题

#### 问题描述
- **配色不统一**：每个页面使用不同的渐变色，虽然有主题区分，但缺乏统一的色彩体系
- **间距不一致**：padding、margin、gap值随意使用（p-4, p-6, p-8, gap-2, gap-4, gap-6）
- **圆角不统一**：混用 `rounded-lg`, `rounded-xl`, `rounded-2xl`
- **阴影不统一**：`shadow-sm`, `shadow-lg`, `shadow-xl` 使用混乱

#### 具体案例
```tsx
// 八字页面
<div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">

// 六爻页面
<div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">

// 梅花页面
<div className="p-4 bg-white rounded-lg shadow-sm border border-cyan-200">
```

### 2. 信息层次问题

#### 问题描述
- **标题层级混乱**：h2, h3, h4 的字体大小不统一
- **信息密度过高**：结果展示区域信息过于密集，缺乏呼吸感
- **视觉权重不明确**：重要信息和次要信息的视觉区分不够

#### 具体案例
```tsx
// 标题大小不一致
<h2 className="text-2xl font-bold">  // 有的页面
<h3 className="text-lg font-semibold"> // 有的页面
<h3 className="text-xl font-semibold"> // 有的页面
```

### 3. 交互体验问题

#### 问题描述
- **按钮状态不完整**：缺少 hover、active、disabled 的统一处理
- **表单反馈不足**：输入验证、错误提示不够明显
- **加载状态简陋**：只有简单的文字变化，缺少视觉反馈
- **移动端适配不足**：虽然使用了响应式，但某些表格在小屏幕上体验差

#### 具体案例
```tsx
// 六爻页面的表格在移动端需要横向滚动
<div className="overflow-x-auto -mx-4 md:mx-0">
  <table className="w-full border-collapse min-w-[800px]">
```

### 4. 响应式设计问题

#### 问题描述
- **断点使用不统一**：`md:`, `lg:` 使用随意
- **移动端字体过小**：某些信息在小屏幕上难以阅读
- **触摸目标过小**：按钮、链接在移动端点击区域不够大

### 5. 可读性问题

#### 问题描述
- **对比度不足**：某些浅色背景上的文字对比度低
- **行高不统一**：文本行高设置不一致，影响阅读体验
- **字体大小跳跃**：从 `text-xs` 到 `text-4xl` 缺少中间层级

---

## 🎨 设计系统方案

### 1. 色彩系统

#### 主色调（Primary Colors）
保留每个系统的特色色彩，但统一饱和度和亮度：

```css
/* 八字排盘 */
--bazi-primary: #9333EA;      /* purple-600 */
--bazi-secondary: #EC4899;    /* pink-600 */
--bazi-light: #FAF5FF;        /* purple-50 */
--bazi-gradient: linear-gradient(135deg, #9333EA 0%, #EC4899 100%);

/* 六爻排盘 */
--liuyao-primary: #2563EB;    /* blue-600 */
--liuyao-secondary: #06B6D4;  /* cyan-600 */
--liuyao-light: #EFF6FF;      /* blue-50 */
--liuyao-gradient: linear-gradient(135deg, #2563EB 0%, #06B6D4 100%);

/* 梅花易数 */
--meihua-primary: #4F46E5;    /* indigo-600 */
--meihua-secondary: #9333EA;  /* purple-600 */
--meihua-light: #EEF2FF;      /* indigo-50 */
--meihua-gradient: linear-gradient(135deg, #4F46E5 0%, #9333EA 100%);

/* 大六壬 */
--daliuren-primary: #059669;  /* emerald-600 */
--daliuren-secondary: #10B981; /* green-500 */
--daliuren-light: #ECFDF5;    /* green-50 */
--daliuren-gradient: linear-gradient(135deg, #059669 0%, #10B981 100%);

/* 奇门遁甲 */
--qimen-primary: #EA580C;     /* orange-600 */
--qimen-secondary: #DC2626;   /* red-600 */
--qimen-light: #FFF7ED;       /* orange-50 */
--qimen-gradient: linear-gradient(135deg, #EA580C 0%, #DC2626 100%);

/* 紫微斗数 */
--ziwei-primary: #DB2777;     /* pink-600 */
--ziwei-secondary: #E11D48;   /* rose-600 */
--ziwei-light: #FDF2F8;       /* pink-50 */
--ziwei-gradient: linear-gradient(135deg, #DB2777 0%, #E11D48 100%);
```

#### 中性色（Neutral Colors）
统一的灰度色阶：

```css
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;
```

#### 语义色（Semantic Colors）
用于状态提示：

```css
--success: #10B981;    /* green-500 */
--warning: #F59E0B;    /* amber-500 */
--error: #EF4444;      /* red-500 */
--info: #3B82F6;       /* blue-500 */

--success-light: #D1FAE5;  /* green-100 */
--warning-light: #FEF3C7;  /* amber-100 */
--error-light: #FEE2E2;    /* red-100 */
--info-light: #DBEAFE;     /* blue-100 */
```

### 2. 排版规范

#### 字体大小（Font Sizes）
建立清晰的字体层级：

```css
/* 标题 */
--text-h1: 2.25rem;    /* 36px - 页面主标题 */
--text-h2: 1.875rem;   /* 30px - 区块标题 */
--text-h3: 1.5rem;     /* 24px - 子区块标题 */
--text-h4: 1.25rem;    /* 20px - 小标题 */

/* 正文 */
--text-lg: 1.125rem;   /* 18px - 大正文 */
--text-base: 1rem;     /* 16px - 标准正文 */
--text-sm: 0.875rem;   /* 14px - 小正文 */
--text-xs: 0.75rem;    /* 12px - 辅助文字 */

/* 特殊 */
--text-display: 3rem;  /* 48px - 展示用超大字体 */
```

#### 行高（Line Heights）
```css
--leading-tight: 1.25;    /* 紧凑 - 用于标题 */
--leading-normal: 1.5;    /* 标准 - 用于正文 */
--leading-relaxed: 1.75;  /* 宽松 - 用于长文本 */
```

#### 字重（Font Weights）
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### 3. 间距系统

#### 统一间距尺度（Spacing Scale）
基于 4px 基准单位：

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

#### 使用规则
- **组件内间距**：使用 space-4 (16px) 作为基准
- **组件间间距**：使用 space-6 (24px) 或 space-8 (32px)
- **区块间间距**：使用 space-8 (32px) 或 space-12 (48px)
- **页面边距**：使用 space-4 (16px) 移动端，space-8 (32px) 桌面端

### 4. 圆角系统

#### 统一圆角尺度（Border Radius）
```css
--radius-sm: 0.375rem;   /* 6px - 小元素（标签、徽章）*/
--radius-md: 0.5rem;     /* 8px - 标准元素（按钮、输入框）*/
--radius-lg: 0.75rem;    /* 12px - 大元素（卡片内部）*/
--radius-xl: 1rem;       /* 16px - 主要卡片 */
--radius-2xl: 1.5rem;    /* 24px - 大型容器 */
--radius-full: 9999px;   /* 完全圆角（圆形按钮）*/
```

#### 使用规则
- **按钮、输入框**：radius-md (8px)
- **小卡片、标签**：radius-lg (12px)
- **主要卡片**：radius-xl (16px)
- **页面级容器**：radius-2xl (24px)

### 5. 阴影系统

#### 统一阴影层级（Box Shadows）
```css
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

#### 使用规则
- **悬浮元素**：shadow-sm
- **卡片**：shadow-md
- **弹出层**：shadow-lg
- **模态框**：shadow-xl
- **hover 状态**：提升一级（sm → md, md → lg）

### 6. 组件设计原则

#### 按钮组件（Button）

**尺寸规范**：
```tsx
// 小按钮
<button className="px-3 py-1.5 text-sm">

// 标准按钮
<button className="px-4 py-2 text-base">

// 大按钮
<button className="px-6 py-3 text-lg">

// 超大按钮（主要操作）
<button className="px-8 py-4 text-xl">
```

**状态规范**：
```tsx
// 基础状态
className="bg-primary text-white rounded-md shadow-sm"

// Hover 状态
hover:bg-primary-dark hover:shadow-md

// Active 状态
active:scale-95

// Disabled 状态
disabled:opacity-50 disabled:cursor-not-allowed

// Focus 状态
focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
```

#### 输入框组件（Input）

**统一样式**：
```tsx
<input className="
  w-full
  px-4 py-3
  text-base
  border border-gray-300
  rounded-md
  bg-white
  placeholder:text-gray-400
  focus:outline-none
  focus:ring-2
  focus:ring-primary
  focus:border-transparent
  disabled:bg-gray-100
  disabled:cursor-not-allowed
  transition-all duration-200
" />
```

#### 卡片组件（Card）

**层级规范**：
```tsx
// 一级卡片（页面主容器）
<div className="bg-white rounded-2xl shadow-lg p-8">

// 二级卡片（区块容器）
<div className="bg-gray-50 rounded-xl p-6">

// 三级卡片（信息展示）
<div className="bg-white rounded-lg shadow-sm p-4">
```

#### 标签组件（Badge）

**统一样式**：
```tsx
<span className="
  inline-flex items-center
  px-2.5 py-0.5
  text-xs font-medium
  rounded-full
  bg-primary-light text-primary-dark
">
  标签文字
</span>
```

### 7. 动画和过渡效果

#### 过渡时长（Transition Duration）
```css
--duration-fast: 150ms;      /* 快速交互 */
--duration-normal: 200ms;    /* 标准过渡 */
--duration-slow: 300ms;      /* 慢速动画 */
```

#### 缓动函数（Easing Functions）
```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

#### 常用动画
```tsx
// 淡入淡出
transition-opacity duration-200

// 缩放
transition-transform duration-200 hover:scale-105

// 滑动
transition-all duration-200 hover:translate-y-[-4px]

// 颜色变化
transition-colors duration-200
```

### 8. 响应式断点

#### 断点定义
```css
/* 移动端优先 */
--breakpoint-sm: 640px;   /* 小屏手机 */
--breakpoint-md: 768px;   /* 平板 */
--breakpoint-lg: 1024px;  /* 小笔记本 */
--breakpoint-xl: 1280px;  /* 桌面 */
--breakpoint-2xl: 1536px; /* 大屏 */
```

#### 使用规则
```tsx
// 移动端优先设计
<div className="
  px-4 py-6           // 移动端
  md:px-6 md:py-8     // 平板
  lg:px-8 lg:py-12    // 桌面
">

// 网格布局
<div className="
  grid
  grid-cols-1         // 移动端：1列
  md:grid-cols-2      // 平板：2列
  lg:grid-cols-3      // 桌面：3列
  gap-4 md:gap-6      // 响应式间距
">
```

---

## 🚀 实施建议

### 阶段一：建立设计系统基础（1-2天）

1. **创建设计令牌文件**
   - 创建 `styles/tokens.css` 定义所有设计变量
   - 创建 `tailwind.config.js` 扩展配置

2. **创建基础组件库**
   - `components/ui/Button.tsx` - 按钮组件
   - `components/ui/Input.tsx` - 输入框组件
   - `components/ui/Card.tsx` - 卡片组件
   - `components/ui/Badge.tsx` - 标签组件
   - `components/ui/Loading.tsx` - 加载组件

### 阶段二：重构现有页面（3-5天）

1. **首页重构**
   - 统一卡片样式
   - 优化响应式布局
   - 添加过渡动画

2. **排盘页面重构**（按优先级）
   - 八字排盘（最复杂，先做）
   - 六爻排盘（表格优化）
   - 其他页面（依次进行）

### 阶段三：优化和测试（2-3天）

1. **可访问性优化**
   - 添加 ARIA 标签
   - 键盘导航支持
   - 屏幕阅读器优化

2. **性能优化**
   - 代码分割
   - 懒加载
   - 图片优化

3. **跨浏览器测试**
   - Chrome, Firefox, Safari
   - 移动端测试

### 关键改进点

#### 1. 统一表单设计
```tsx
// 之前：样式分散
<input className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500" />

// 之后：使用统一组件
<Input
  placeholder="请输入姓名"
  variant="default"
  size="md"
/>
```

#### 2. 统一结果展示
```tsx
// 之前：每个页面不同
<div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">

// 之后：使用主题变量
<Card variant="result" theme="bazi">
  <CardHeader>基础信息</CardHeader>
  <CardContent>...</CardContent>
</Card>
```

#### 3. 改进移动端体验
```tsx
// 表格响应式处理
<div className="overflow-x-auto">
  <table className="min-w-full">
    {/* 移动端：卡片式展示 */}
    {/* 桌面端：表格展示 */}
  </table>
</div>
```

### 设计系统文档

建议创建在线文档（使用 Storybook 或类似工具）：
- 色彩示例
- 组件示例
- 使用指南
- 代码片段

---

## 📊 设计对比

### 改进前后对比

| 方面 | 改进前 | 改进后 |
|------|--------|--------|
| 色彩一致性 | ❌ 随意使用 | ✅ 统一色彩系统 |
| 间距规范 | ❌ 不统一 | ✅ 4px 基准系统 |
| 组件复用 | ❌ 重复代码 | ✅ 组件库 |
| 响应式 | ⚠️ 部分支持 | ✅ 完整支持 |
| 可访问性 | ❌ 缺失 | ✅ WCAG 2.1 AA |
| 动画效果 | ⚠️ 简单 | ✅ 流畅自然 |
| 维护性 | ❌ 困难 | ✅ 易于维护 |

---

## 🎯 总结

### 核心改进

1. **建立统一的设计语言**：通过设计令牌和组件库确保一致性
2. **提升用户体验**：优化交互、动画和响应式设计
3. **提高可维护性**：组件化、模块化、文档化
4. **增强可访问性**：符合 WCAG 标准，支持辅助技术

### 预期效果

- **视觉一致性**：所有页面风格统一，品牌识别度提升
- **开发效率**：组件复用，减少重复代码 60%+
- **用户满意度**：流畅的交互体验，清晰的信息层次
- **维护成本**：降低 50%，易于扩展新功能

---

**文档版本**：v1.0
**创建日期**：2024-01-01
**最后更新**：2024-01-01
**维护者**：UI设计分析师
