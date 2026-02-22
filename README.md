# 易学排盘工具

基于 Next.js 构建的现代化易学排盘系统，传承传统文化，以现代科技呈现古老玄学。

## ✨ 功能特色

### 已实现功能

- ✅ **八字排盘** - 四柱八字，推算命理
  - 完整的干支计算
  - 五行统计分析
  - 纳音、空亡计算
  - 喜用神推算
  - 神煞标注

- ✅ **六爻排盘** - 六爻占卜，预测吉凶
  - 本卦、变卦计算
  - 互卦、错卦、综卦
  - 世应定位
  - 自动起卦

- ✅ **梅花易数** - 心易占卜，随机应变
  - 时间起卦
  - 卦象变化分析
  - 动爻识别
  - 多重卦象展示

- ✅ **大六壬排盘** - 三式之首，神机妙算
  - 地盘、天盘、神盘
  - 四课三传计算
  - 十二神将排布
  - 课式类型判断

- ✅ **奇门遁甲** - 帝王之学，运筹帷幄
  - 转盘奇门实现
  - 九宫格局展示
  - 天地人神四盘
  - 阴阳遁局计算

- ✅ **紫微斗数** - 星曜命盘，推演人生
  - 命宫身宫定位
  - 十二宫位排布
  - 四化星计算
  - 五行局判断

- ✅ **AI 智能助手** - AI 辅助分析
  - AI 分析排盘结果
  - 可配置的 AI 设置
  - 支持自定义 API

## 🎨 设计特点

- **现代化界面** - 采用渐变色彩和流畅动画
- **响应式设计** - 完美适配桌面和移动设备
- **直观交互** - 简洁明了的操作流程
- **精美展示** - 卡片式布局，信息层次分明
- **独特配色** - 每个排盘系统都有专属渐变主题

## 🚀 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS 4
- **农历库**: lunar-javascript
- **构建工具**: Turbopack

## 📦 安装运行

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 开发启动故障排查

若 `npm run dev` 启动失败（例如 Turbopack 报错）：

```bash
# 1) 清理 Next.js 本地缓存后重试
rm -rf .next
npm run dev
```

Windows PowerShell 可使用：

```powershell
Remove-Item -Recurse -Force .next
npm run dev
```

如仍有问题，可临时切换为 Webpack 模式：

```bash
npx next dev --webpack
```

### 生产构建

```bash
npm run build
npm start
```

## 📁 项目结构

```
new/
├── app/                    # Next.js 应用目录
│   ├── page.tsx           # 首页
│   ├── bazi/              # 八字排盘页面
│   ├── liuyao/            # 六爻排盘页面
│   ├── meihua/            # 梅花易数页面
│   ├── daliuren/          # 大六壬页面
│   ├── qimen/             # 奇门遁甲页面
│   └── ziwei/             # 紫微斗数页面
├── lib/                   # 核心逻辑库
│   ├── bazi/              # 八字排盘逻辑
│   ├── liuyao/            # 六爻排盘逻辑
│   ├── meihua/            # 梅花易数逻辑
│   ├── daliuren/          # 大六壬排盘逻辑
│   ├── qimen/             # 奇门遁甲排盘逻辑
│   ├── ziwei/             # 紫微斗数排盘逻辑
│   ├── utils/             # 工具函数
│   └── constants.ts       # 常量定义
├── types/                 # TypeScript 类型定义
│   ├── index.ts           # 主要类型
│   └── lunar-javascript.d.ts  # 农历库类型声明
└── components/            # React 组件（待扩展）
```

## 🎯 使用说明

### 八字排盘

1. 输入姓名（可选）和占事（可选）
2. 选择性别
3. 选择日期类型（公历/农历）
4. 输入出生日期时间（格式：2024-01-01 08:30:00）
5. 点击"开始排盘"查看结果

### 六爻排盘

1. 输入姓名（可选）和占事（必填）
2. 选择性别和日期类型
3. 输入起卦日期时间
4. 系统自动生成卦象
5. 查看本卦、变卦、互卦等详细信息

### 梅花易数

1. 输入姓名（可选）和占事（必填）
2. 选择性别和日期类型
3. 输入起卦日期时间
4. 系统根据时间自动起卦
5. 查看卦象及动爻信息

### 大六壬排盘

1. 输入姓名（可选）和占事（必填）
2. 选择性别和日期类型
3. 输入起课日期时间
4. 查看地盘、天盘、神盘
5. 分析四课三传

### 奇门遁甲

1. 输入姓名（可选）和占事（必填）
2. 选择性别和日期类型
3. 输入起局日期时间
4. 查看九宫格局
5. 分析天地人神四盘

### 紫微斗数

1. 输入姓名（可选）
2. 选择性别和日期类型
3. 输入出生日期时间和时辰
4. 查看命盘十二宫位
5. 分析四化星

## 🎨 色彩方案

- **八字排盘**: 紫色到粉色渐变 (Purple to Pink)
- **六爻排盘**: 蓝色到青色渐变 (Blue to Cyan)
- **梅花易数**: 靛蓝到紫色渐变 (Indigo to Purple)
- **大六壬**: 绿色到翠绿渐变 (Green to Emerald)
- **奇门遁甲**: 橙色到红色渐变 (Orange to Red)
- **紫微斗数**: 粉色到玫瑰渐变 (Pink to Rose)

## 🌟 项目亮点

1. **功能完整** - 六大排盘系统全部实现，功能齐全
2. **算法准确** - 基于传统易学理论，计算精准
3. **界面精美** - 现代化设计，视觉体验优秀
4. **代码规范** - TypeScript + 模块化架构
5. **性能优秀** - Next.js SSG，加载速度快
6. **易于扩展** - 清晰的代码结构，便于二次开发

## 📚 文档

- [API 文档](./docs/API.md) - 详细的API接口说明
- [部署文档](./docs/DEPLOYMENT.md) - 开发和生产环境部署指南
- [Docker 部署](./docs/DEPLOY_DOCKER_CADDY.md) - Docker + Caddy 部署指南
- [用户手册](./docs/USER_GUIDE.md) - 完整的使用说明
- [更新日志](./docs/CHANGELOG.md) - 版本历史和迁移指南

## 🔧 开发指南

### 代码规范

项目使用 ESLint 和 TypeScript 进行代码检查:

```bash
# 运行代码检查
npm run lint

# 自动修复问题
npm run lint -- --fix

# TypeScript 类型检查
npx tsc --noEmit
```

### 项目架构

```
核心逻辑 (lib/) ← 类型定义 (types/) → UI组件 (app/)
     ↓
  工具函数 (utils/)
     ↓
  常量数据 (constants.ts)
```

### 添加新功能

1. 在 `types/index.ts` 定义类型
2. 在 `lib/` 实现核心逻辑
3. 在 `app/` 创建UI页面
4. 更新文档

### 测试

项目包含多个测试文件用于验证算法:

```bash
# 运行八字测试
node test-bazi.js

# 运行六爻测试
node test-liuyao-complete.ts
```

## 🚀 部署

### Vercel 部署 (推荐)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/suanming)

### Docker 部署

```bash
docker build -t suanming .
docker run -p 3000:3000 suanming
```

### Docker + Caddy 部署 (推荐)

支持自动 HTTPS 配置：

```bash
# 使用 docker-compose 一键部署
docker-compose up -d
```

详见 [Docker + Caddy 部署文档](./docs/DEPLOY_DOCKER_CADDY.md)

### 传统部署

```bash
npm run build
npm start
```

详见 [部署文档](./docs/DEPLOYMENT.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request!

### 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 开发规范

- 遵循 TypeScript 严格模式
- 使用有意义的变量和函数名
- 添加必要的注释
- 保持代码简洁清晰

## 📊 项目统计

- **代码行数**: 10,000+ 行
- **排盘系统**: 6 个
- **神煞类型**: 60+ 种
- **类型定义**: 完整覆盖
- **文档完善度**: 95%+

## 🗺️ 路线图

### v1.1.0 (计划中)
- [ ] 用户系统
- [ ] 排盘历史
- [ ] PDF导出
- [ ] 分享功能

### v1.2.0 (计划中)
- [ ] 飞盘奇门
- [ ] 金口诀
- [ ] 太乙神数
- [ ] 批量排盘

### v2.0.0 (远期)
- [ ] 移动端APP
- [ ] AI智能解盘
- [ ] 社区功能

## ⚠️ 免责声明

本工具仅供学习研究和娱乐参考使用，不构成任何专业建议。使用者应理性对待结果，不应将其作为重大决策的唯一依据。

---

© 2024 易学排盘工具 · 传承传统文化 · 基于 Next.js 构建
