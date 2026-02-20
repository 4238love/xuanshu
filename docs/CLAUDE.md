# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Next.js 16 构建的现代化易学排盘系统，包含六大传统中国玄学排盘工具：八字、六爻、梅花易数、大六壬、奇门遁甲、紫微斗数。

## 开发命令

### 启动开发服务器
```bash
npm run dev
```
访问 http://localhost:3000

### 生产构建
```bash
npm run build
npm start
```

### 代码检查
```bash
npm run lint
```

## 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript 5
- **样式**: Tailwind CSS 4
- **农历库**: lunar-javascript 1.7.7
- **构建工具**: Turbopack

## 项目架构

### 目录结构

```
new/
├── app/                    # Next.js App Router 页面
│   ├── page.tsx           # 首页（六大排盘系统入口）
│   ├── layout.tsx         # 全局布局
│   ├── bazi/              # 八字排盘页面
│   ├── liuyao/            # 六爻排盘页面
│   ├── meihua/            # 梅花易数页面
│   ├── daliuren/          # 大六壬页面
│   ├── qimen/             # 奇门遁甲页面
│   └── ziwei/             # 紫微斗数页面
├── lib/                   # 核心业务逻辑
│   ├── bazi/              # 八字排盘算法
│   ├── liuyao/            # 六爻排盘算法
│   ├── meihua/            # 梅花易数算法
│   ├── daliuren/          # 大六壬算法
│   ├── qimen/             # 奇门遁甲算法
│   ├── ziwei/             # 紫微斗数算法
│   ├── utils/             # 通用工具函数
│   │   ├── common.ts      # 干支、五行、纳音等基础计算
│   │   └── trueSolarTime.ts  # 真太阳时计算
│   └── constants.ts       # 全局常量（天干、地支、神煞等）
├── types/                 # TypeScript 类型定义
│   ├── index.ts           # 主要类型定义
│   └── lunar-javascript.d.ts  # lunar-javascript 库类型声明
└── test-*.js/ts           # 测试文件（用于验证算法）
```

### 核心模块说明

#### 1. lib/constants.ts
包含所有易学相关的常量数据：
- 天干地支、五行、生肖
- 纳音、神煞（60+ 种）
- 六十四卦、八卦符号
- 十二神将、九星、八门
- 各种映射表和查询表

#### 2. lib/utils/common.ts
通用工具函数：
- `getGanZhiIndex()` - 获取干支索引
- `getGanZhi()` - 根据索引获取干支
- `getWuXing()` - 获取五行属性
- `getNaYin()` - 获取纳音
- `parseDate()` - 日期解析
- `generateYaoShu()` - 生成爻数（用于起卦）

#### 3. lib/utils/trueSolarTime.ts
真太阳时计算，用于精确的时辰定位（八字排盘需要）

#### 4. 各排盘模块 (lib/*/index.ts)
每个排盘系统都有独立的核心算法文件：
- 导出主函数（如 `calculateBaZi()`, `calculateLiuYao()`）
- 接收 Settings 类型参数
- 返回 Result 类型结果
- 所有计算逻辑封装在 lib 目录，与 UI 完全分离

### 类型系统

所有排盘系统遵循统一的类型模式：

```typescript
// 基础设置
interface BaseSettings {
  name?: string;      // 姓名
  occupy?: string;    // 占事
  sex: 0 | 1;        // 性别 (0:女, 1:男)
  date: string;      // 日期时间 (yyyy-MM-dd HH:mm:ss)
  dateType: 0 | 1;   // 日期类型 (0:公历, 1:农历)
}

// 各系统扩展 BaseSettings
interface BaZiSettings extends BaseSettings { ... }
interface LiuYaoSettings extends BaseSettings { ... }
// ...

// 结果类型
interface BaZiResult { ... }
interface LiuYaoResult { ... }
```

### 页面组件模式

所有排盘页面 (app/*/page.tsx) 遵循相同的结构：
1. 使用 `'use client'` 客户端组件
2. 表单输入区域（姓名、性别、日期等）
3. 调用 lib 中的计算函数
4. 结果展示区域（卡片式布局）
5. 每个系统有独特的渐变配色主题

### 配色方案

- **八字排盘**: `from-purple-500 to-pink-500`
- **六爻排盘**: `from-blue-500 to-cyan-500`
- **梅花易数**: `from-indigo-500 to-purple-500`
- **大六壬**: `from-green-500 to-emerald-500`
- **奇门遁甲**: `from-orange-500 to-red-500`
- **紫微斗数**: `from-pink-500 to-rose-500`

## 开发注意事项

### 1. 日期格式
所有日期输入统一使用格式：`yyyy-MM-dd HH:mm:ss`
例如：`2024-01-01 08:30:00`

### 2. lunar-javascript 库
- 用于农历转换和八字计算
- 主要类：`Solar`, `Lunar`, `EightChar`
- 类型声明在 `types/lunar-javascript.d.ts`

### 3. 算法准确性
- 所有算法基于传统易学理论
- 神煞计算参考多个流派
- 测试文件 (test-*.js/ts) 用于验证算法正确性

### 4. 代码风格
- 使用 TypeScript 严格模式
- 函数和变量使用驼峰命名
- 常量使用大写下划线命名
- 中文注释说明复杂逻辑

### 5. 性能考虑
- 大量常量数据预先定义在 constants.ts
- 避免重复计算，使用查表法
- 复杂计算封装在独立函数中

### 6. 扩展新功能
添加新的排盘系统时：
1. 在 `lib/` 创建新目录和 index.ts
2. 在 `types/index.ts` 添加 Settings 和 Result 类型
3. 在 `app/` 创建新页面目录
4. 在首页 `app/page.tsx` 添加入口卡片
5. 在 `lib/constants.ts` 添加所需常量数据

## 路径别名

使用 `@/` 作为项目根目录别名：
```typescript
import { BaZiSettings } from '@/types';
import { calculateBaZi } from '@/lib/bazi';
```

## 测试

项目包含多个测试文件用于验证算法：
- `test-bazi.js` - 八字排盘测试
- `test-liuyao-*.ts` - 六爻排盘各功能测试
- `test-jiuxing-*.js` - 九星算法测试
- 使用 Node.js 直接运行：`node test-*.js`
