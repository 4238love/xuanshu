# 神煞细粒度配置系统使用指南

## 概述

神煞细粒度配置系统允许用户为八字和六爻排盘系统独立控制每个神煞的显示与隐藏。

## 功能特性

- ✅ **八字排盘**: 支持 60 种神煞的独立开关
- ✅ **六爻排盘**: 支持 23 种神煞的独立开关
- ✅ **默认全部启用**: 不配置时显示所有神煞
- ✅ **灵活过滤**: 可以选择性启用或禁用任意神煞

## 八字神煞配置

### 神煞分类（共60种）

#### 1. 贵人类（10种）
- `taiJiGuiRen` - 太极贵人
- `tianYiGuiRen` - 天乙贵人
- `fuXingGuiRen` - 福星贵人
- `wenChangGuiRen` - 文昌贵人
- `tianChuGuiRen` - 天厨贵人
- `yueDeGuiRen` - 月德贵人
- `deXiuGuiRen` - 德秀贵人
- `tianDeGuiRen` - 天德贵人
- `tianGuanGuiRen` - 天官贵人
- `sanQiGuiRen` - 三奇贵人

#### 2. 凶煞类（13种）
- `shiEDaBai` - 十恶大败
- `yinZhuYangShou` - 阴注阳受
- `yinChaYangCuo` - 阴差阳错
- `guLuanSha` - 孤鸾煞
- `hongYanSha` - 红艳煞
- `gouJiaoSha` - 勾绞煞
- `chongTianSha` - 冲天煞
- `tongZiSha` - 童子煞
- `jieSha` - 劫煞
- `zaiSha` - 灾煞
- `guChen` - 孤辰
- `guaXiu` - 寡宿
- `yuanChen` - 元辰

#### 3. 吉神类（8种）
- `tianDeHe` - 天德合
- `yueDeHe` - 月德合
- `huaGai` - 华盖
- `guoYin` - 国印
- `jinYu` - 金舆
- `ciGuan` - 词馆
- `xueTang` - 学堂
- `tianShe` - 天赦

#### 4. 特殊日类（7种）
- `siFeiRi` - 四废日
- `liuXiuRi` - 六秀日
- `shiLingRi` - 十灵日
- `kuiGangRi` - 魁罡日
- `baZhuanRi` - 八专日
- `jiuChouRi` - 九丑日
- `tianZhuan` - 天转

#### 5. 刃煞类（5种）
- `yangRen` - 羊刃
- `feiRen` - 飞刃
- `xueRen` - 血刃
- `liuXia` - 流霞
- `diZhuan` - 地转

#### 6. 禄马类（3种）
- `luShen` - 禄神
- `yiMa` - 驿马
- `gongLu` - 拱禄

#### 7. 空亡类（3种）
- `tianLuoDiWang` - 天罗地网
- `kongWang` - 空亡
- `jieKong` - 截空

#### 8. 星神类（4种）
- `jiangXing` - 将星
- `taoHua` - 桃花
- `tianYi` - 天医
- `jinShen` - 金神

#### 9. 丧吊类（5种）
- `wangShen` - 亡神
- `diaoKe` - 吊客
- `piMa` - 披麻
- `sangMen` - 丧门
- `liuE` - 六厄

#### 10. 喜庆类（2种）
- `tianXi` - 天喜
- `hongLuan` - 红鸾

### 使用示例

```typescript
import { BaZiSettings } from '@/types';
import { BaZiPaiPan } from '@/lib/bazi';

// 示例1: 只显示贵人类神煞
const settings: BaZiSettings = {
  name: '张三',
  sex: 1,
  date: '1990-01-01 08:00:00',
  dateType: 0,
  showShenSha: true,
  shenShaConfig: {
    // 贵人类（启用）
    taiJiGuiRen: true,
    tianYiGuiRen: true,
    fuXingGuiRen: true,
    wenChangGuiRen: true,
    tianChuGuiRen: true,
    yueDeGuiRen: true,
    deXiuGuiRen: true,
    tianDeGuiRen: true,
    tianGuanGuiRen: true,
    sanQiGuiRen: true,

    // 其他类（禁用）
    shiEDaBai: false,
    yinZhuYangShou: false,
    // ... 其他神煞设为 false
  }
};

const bazi = new BaZiPaiPan(settings);
const result = bazi.getPaiPan();
console.log(result.shenSha); // 只显示贵人类神煞
```

```typescript
// 示例2: 隐藏凶煞，只显示吉神
const settings2: BaZiSettings = {
  name: '李四',
  sex: 0,
  date: '1985-06-15 14:30:00',
  dateType: 0,
  showShenSha: true,
  shenShaConfig: {
    // 吉神（启用）
    taiJiGuiRen: true,
    tianYiGuiRen: true,
    tianDeHe: true,
    yueDeHe: true,
    huaGai: true,

    // 凶煞（禁用）
    shiEDaBai: false,
    guLuanSha: false,
    hongYanSha: false,
    tongZiSha: false,
    // ... 其他凶煞设为 false
  }
};
```

## 六爻神煞配置

### 神煞分类（共23种）

#### 1. 贵人类（7种）
- `taiJiGuiRen` - 太极贵人
- `tianYiGuiRen` - 天乙贵人
- `fuXingGuiRen` - 福星贵人
- `wenChangGuiRen` - 文昌贵人
- `tianChuGuiRen` - 天厨贵人
- `yueDeGuiRen` - 月德贵人
- `tianDeGuiRen` - 天德贵人

#### 2. 吉神类（4种）
- `tangFuGuoYin` - 唐符国印
- `tianYuanLu` - 天元禄
- `huaGai` - 华盖
- `tianYi` - 天医

#### 3. 马星类（3种）
- `yiMa` - 驿马
- `tianMa` - 天马
- `luMa` - 禄马

#### 4. 凶煞类（5种）
- `jieSha` - 劫煞
- `xianChi` - 咸池
- `zaiSha` - 灾煞
- `mouXing` - 谋星
- `huangEn` - 皇恩

#### 5. 星神类（2种）
- `jiangXing` - 将星
- `tianXi` - 天喜

#### 6. 刃煞类（2种）
- `yangRen` - 阳刃
- `feiRen` - 飞刃

### 使用示例

```typescript
import { LiuYaoSettings } from '@/types';
import { LiuYaoPaiPan } from '@/lib/liuyao';

// 示例1: 只显示贵人类和吉神类
const settings: LiuYaoSettings = {
  name: '王五',
  sex: 1,
  date: '1992-03-20 10:00:00',
  dateType: 0,
  paiPanType: 0,
  shenShaConfig: {
    // 贵人类（启用）
    taiJiGuiRen: true,
    tianYiGuiRen: true,
    fuXingGuiRen: true,
    wenChangGuiRen: true,
    tianChuGuiRen: true,
    yueDeGuiRen: true,
    tianDeGuiRen: true,

    // 吉神类（启用）
    tangFuGuoYin: true,
    tianYuanLu: true,
    huaGai: true,
    tianYi: true,

    // 其他类（禁用）
    yiMa: false,
    tianMa: false,
    luMa: false,
    jieSha: false,
    xianChi: false,
    zaiSha: false,
    mouXing: false,
    huangEn: false,
    jiangXing: false,
    tianXi: false,
    yangRen: false,
    feiRen: false,
  }
};

const liuyao = new LiuYaoPaiPan(settings);
const result = liuyao.getPaiPan();
console.log(result.shenSha); // 只显示贵人类和吉神类
```

## 默认配置

如果不提供 `shenShaConfig`，系统将使用默认配置（全部启用）：

```typescript
// 不配置 shenShaConfig，显示所有神煞
const settings: BaZiSettings = {
  name: '赵六',
  sex: 1,
  date: '1988-12-01 06:00:00',
  dateType: 0,
  showShenSha: true,
  // 不设置 shenShaConfig
};

const bazi = new BaZiPaiPan(settings);
const result = bazi.getPaiPan();
// result.shenSha 包含所有神煞
```

## 配置导入

可以使用预定义的默认配置：

```typescript
import { DEFAULT_BAZI_SHENSHA_CONFIG, DEFAULT_LIUYAO_SHENSHA_CONFIG } from '@/lib/config/shenShaConfig';

// 使用默认配置
const settings: BaZiSettings = {
  name: '测试',
  sex: 1,
  date: '2000-01-01 12:00:00',
  dateType: 0,
  showShenSha: true,
  shenShaConfig: DEFAULT_BAZI_SHENSHA_CONFIG, // 全部启用
};

// 或者基于默认配置修改
const customConfig = {
  ...DEFAULT_BAZI_SHENSHA_CONFIG,
  shiEDaBai: false,  // 禁用十恶大败
  tongZiSha: false,  // 禁用童子煞
};
```

## 注意事项

1. **配置优先级**: `shenShaConfig` 中明确设置为 `false` 的神煞会被过滤，未设置或设置为 `true` 的会显示
2. **未知神煞**: 如果神煞名称不在映射表中，默认会保留显示
3. **性能**: 神煞过滤在排盘计算完成后进行，不影响计算性能
4. **兼容性**: 旧代码不使用 `shenShaConfig` 时，行为保持不变（显示所有神煞）

## 技术实现

### 核心文件

- `types/index.ts` - 类型定义
  - `BaZiShenShaConfig` - 八字神煞配置接口
  - `LiuYaoShenShaConfig` - 六爻神煞配置接口

- `lib/config/shenShaConfig.ts` - 配置和过滤逻辑
  - `DEFAULT_BAZI_SHENSHA_CONFIG` - 八字默认配置
  - `DEFAULT_LIUYAO_SHENSHA_CONFIG` - 六爻默认配置
  - `BAZI_SHENSHA_NAME_MAP` - 八字神煞名称映射
  - `LIUYAO_SHENSHA_NAME_MAP` - 六爻神煞名称映射
  - `filterShenSha()` - 神煞过滤函数

- `lib/bazi/index.ts` - 八字排盘实现
  - `filterShenSha()` - 应用神煞配置过滤

- `lib/liuyao/index.ts` - 六爻排盘实现
  - `calculateShenSha()` - 计算并过滤神煞

## 测试

运行测试验证功能：

```bash
# 结构验证测试
npx tsx test-shensha-structure.ts

# 完整功能测试（需要安装依赖）
npm install
npx tsx test-shensha-config.ts
```

## 更新日志

### v1.0.0 (2026-02-10)
- ✅ 实现八字神煞细粒度配置（60种）
- ✅ 实现六爻神煞细粒度配置（23种）
- ✅ 添加默认配置和名称映射
- ✅ 实现神煞过滤函数
- ✅ 更新类型定义
- ✅ 添加测试用例
