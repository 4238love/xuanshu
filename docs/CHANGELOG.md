# 更新日志

## 版本历史

### v1.0.0 (2024-02-10)

#### 🎉 首次发布

基于原 Java 版本 xuan-utils-pro 项目,使用 Next.js + TypeScript 完全重构。

#### ✨ 新功能

**六大排盘系统**:
- ✅ 八字排盘 - 完整的四柱八字分析系统
- ✅ 六爻排盘 - 支持三种起卦方式
- ✅ 梅花易数 - 时间起卦和卦象分析
- ✅ 大六壬 - 三盘四课三传系统
- ✅ 奇门遁甲 - 转盘奇门实现
- ✅ 紫微斗数 - 命盘十二宫位排布

**八字排盘功能**:
- 完整的干支计算(年月日时)
- 五行统计和分析
- 纳音、空亡计算
- 喜用神推算
- 60种神煞系统
- 十神系统(天干+地支藏干)
- 大运流年系统
- 地支藏干系统
- 五行生克关系(天干五合、地支三合/六合/相冲等)
- 格局判断系统
- 胎元、胎息、命宫、身宫
- 小运、流月、流日、流时
- 干支留意系统(18种关系)
- 九星系统(5种体系)
- 骨重(称骨算命)
- 身强身弱判断
- 真太阳时支持

**六爻排盘功能**:
- 三种起卦方式(自动/日期/手动)
- 本卦、变卦、互卦、错卦、综卦、伏卦
- 世应定位
- 六亲系统
- 六神系统
- 神煞系统
- 空亡、月将计算
- 伏神标记

**梅花易数功能**:
- 时间起卦
- 卦象变化分析
- 动爻识别
- 多重卦象展示

**大六壬功能**:
- 地盘、天盘、神盘
- 四课三传计算
- 十二神将排布
- 课式类型判断

**奇门遁甲功能**:
- 转盘奇门实现
- 九宫格局展示
- 天地人神四盘
- 阴阳遁局计算
- 时家/日家/月家/年家奇门
- 值符值使计算

**紫微斗数功能**:
- 命宫身宫定位
- 十二宫位排布
- 四化星计算
- 五行局判断

#### 🎨 界面设计

- 现代化渐变色彩设计
- 响应式布局,完美适配移动端
- 每个排盘系统独特的配色方案
- 卡片式信息展示
- 流畅的动画效果

#### 🔧 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript 5
- **样式**: Tailwind CSS 4
- **农历库**: lunar-javascript 1.7.7
- **构建工具**: Turbopack

#### 📦 项目结构

- 清晰的模块化架构
- 核心逻辑与UI完全分离
- 完整的TypeScript类型定义
- 统一的API接口设计

---

## 从 Java 版本迁移说明

### 主要变化

#### 1. 技术栈变更

| 项目 | Java版本 | TypeScript版本 |
|------|---------|---------------|
| 语言 | Java | TypeScript |
| 框架 | Spring Boot | Next.js 16 |
| 前端 | Vue.js | React 19 |
| 样式 | Element UI | Tailwind CSS 4 |

#### 2. 架构变更

**Java版本**:
```
后端(Spring Boot) <-> 前端(Vue.js)
```

**TypeScript版本**:
```
全栈应用(Next.js)
- 前端: React组件
- 后端: API Routes(可选)
- 核心逻辑: lib目录
```

#### 3. 功能对比

| 功能 | Java版本 | TypeScript版本 | 说明 |
|------|---------|---------------|------|
| 八字排盘 | ✅ | ✅ | 功能完全对等 |
| 六爻排盘 | ✅ | ✅ | 新增手动起卦 |
| 梅花易数 | ✅ | ✅ | 功能对等 |
| 大六壬 | ✅ | ✅ | 功能对等 |
| 奇门遁甲 | ✅ | ✅ | 仅实现转盘 |
| 紫微斗数 | ✅ | ✅ | 功能对等 |
| 神煞系统 | 40+ | 60+ | 新增20种神煞 |
| 九星系统 | ❌ | ✅ | 新增5种体系 |
| 干支留意 | ❌ | ✅ | 新增18种关系 |
| 真太阳时 | ✅ | ✅ | 功能对等 |

#### 4. API变更

**Java版本**:
```java
@PostMapping("/bazi/paipan")
public BaZiResult paipan(@RequestBody BaZiSettings settings) {
    return baziService.calculate(settings);
}
```

**TypeScript版本**:
```typescript
import { createBaZiPaiPan } from '@/lib/bazi';

const result = createBaZiPaiPan(settings);
```

#### 5. 配置项变更

大部分配置项保持一致,新增:
- `showJiuXing`: 是否显示九星系统
- `showGanZhiLiuYi`: 是否显示干支留意
- `shenShaConfig`: 神煞细粒度配置
- `ganZhiLiuYiConfig`: 干支留意细粒度配置

### 迁移步骤

#### 1. 数据迁移

如果有保存的排盘数据:

```typescript
// Java版本数据格式
{
  "name": "张三",
  "sex": 1,
  "date": "1990-01-01 08:30:00",
  "dateType": 0
}

// TypeScript版本(格式相同,无需转换)
{
  "name": "张三",
  "sex": 1,
  "date": "1990-01-01 08:30:00",
  "dateType": 0
}
```

#### 2. API调用迁移

**Java版本**:
```java
// 后端调用
BaZiResult result = baziService.calculate(settings);

// 前端调用
axios.post('/api/bazi/paipan', settings)
  .then(res => console.log(res.data));
```

**TypeScript版本**:
```typescript
// 直接调用(客户端)
import { createBaZiPaiPan } from '@/lib/bazi';
const result = createBaZiPaiPan(settings);

// 或通过API Routes(服务端)
const response = await fetch('/api/bazi', {
  method: 'POST',
  body: JSON.stringify(settings)
});
const result = await response.json();
```

#### 3. 配置迁移

大部分配置保持不变,新增配置可选:

```typescript
// 基础配置(与Java版本相同)
const settings = {
  name: '张三',
  sex: 1,
  date: '1990-01-01 08:30:00',
  dateType: 0
};

// 新增配置(可选)
const advancedSettings = {
  ...settings,
  showJiuXing: true,        // 新增
  showGanZhiLiuYi: true,    // 新增
  shenShaConfig: {          // 新增
    '天乙贵人': true,
    '文昌贵人': true
  }
};
```

### 优势对比

#### TypeScript版本优势

1. **性能更好**
   - 无需后端API调用
   - 客户端直接计算
   - 响应速度更快

2. **部署更简单**
   - 单一应用部署
   - 无需数据库
   - 支持静态导出

3. **开发效率高**
   - TypeScript类型安全
   - 热更新开发体验
   - 组件化开发

4. **维护成本低**
   - 代码量更少
   - 依赖更少
   - 更新更容易

#### Java版本优势

1. **企业级特性**
   - 成熟的后端框架
   - 完善的权限管理
   - 数据持久化

2. **性能优化**
   - 服务端缓存
   - 数据库查询优化
   - 负载均衡

### 兼容性说明

- 核心算法完全兼容
- 输入输出格式兼容
- 配置项向下兼容
- 可平滑迁移

---

## 未来计划

### v1.1.0 (计划中)

- [ ] 添加用户系统
- [ ] 排盘历史记录
- [ ] 导出PDF功能
- [ ] 分享功能
- [ ] 更多神煞类型

### v1.2.0 (计划中)

- [ ] 飞盘奇门实现
- [ ] 金口诀排盘
- [ ] 太乙神数排盘
- [ ] 批量排盘功能

### v2.0.0 (远期规划)

- [ ] 移动端APP
- [ ] AI智能解盘
- [ ] 社区功能
- [ ] 付费高级功能

---

## 贡献指南

欢迎提交Issue和Pull Request!

### 提交Issue

- Bug报告: 详细描述问题和复现步骤
- 功能建议: 说明需求和使用场景
- 文档改进: 指出不清楚或错误的地方

### 提交PR

1. Fork项目
2. 创建特性分支
3. 提交代码
4. 发起Pull Request

---

## 致谢

- 原项目: [xuan-utils-pro](https://gitee.com/shan-dai/xuan-utils-pro)
- 农历库: lunar-javascript
- 框架: Next.js, React, Tailwind CSS
- 所有贡献者和使用者

---

© 2024 易学排盘系统 · 更新日志
