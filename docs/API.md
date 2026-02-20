# API 文档

## 概述

本文档详细说明了易学排盘系统的所有API接口、参数配置和返回值结构。

## 目录

- [八字排盘 API](#八字排盘-api)
- [六爻排盘 API](#六爻排盘-api)
- [梅花易数 API](#梅花易数-api)
- [大六壬 API](#大六壬-api)
- [奇门遁甲 API](#奇门遁甲-api)
- [紫微斗数 API](#紫微斗数-api)

---

## 八字排盘 API

### 函数签名

```typescript
import { createBaZiPaiPan } from '@/lib/bazi';
import { BaZiSettings, BaZiResult } from '@/types';

const result: BaZiResult = createBaZiPaiPan(settings: BaZiSettings);
```

### 输入参数 (BaZiSettings)

#### 基础参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| name | string | 否 | - | 姓名 |
| occupy | string | 否 | - | 占事 |
| sex | 0 \| 1 | 是 | - | 性别 (0:女, 1:男) |
| date | string | 是 | - | 日期时间 (格式: yyyy-MM-dd HH:mm:ss) |
| dateType | 0 \| 1 | 是 | - | 日期类型 (0:公历, 1:农历) |

#### 高级配置参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| leapMonthType | 0 \| 1 | 否 | 0 | 闰月类型 (0:不使用闰月, 1:使用闰月) |
| xuShiSuiType | 0 \| 1 | 否 | 0 | 年龄类型 (0:虚岁, 1:实岁) |
| jieQiType | 0 \| 1 | 否 | 1 | 节气类型 (0:按天计算, 1:按分钟计算) |
| qiYunLiuPaiType | 0 \| 1 | 否 | 1 | 起运流派类型 |
| renYuanType | 0-5 | 否 | 0 | 人元司令分野类型 |
| daYunLunShu | number | 否 | 10 | 大运轮数 (10-16) |
| yearGanZhiType | 0-2 | 否 | 2 | 年干支类型 (0:正月初一, 1:立春当天, 2:立春交接时刻) |
| monthGanZhiType | 0 \| 1 | 否 | 1 | 月干支类型 (0:节交接当天, 1:节交接时刻) |
| dayGanZhiType | 0 \| 1 | 否 | 0 | 日干支类型 (0:晚子时按当天, 1:晚子时按明天) |

#### 真太阳时配置

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| useTrueSolarTime | boolean | 否 | false | 是否使用真太阳时 |
| longitude | number | 否 | - | 经度 (与city二选一) |
| city | string | 否 | - | 城市名称 (与longitude二选一) |

#### 显示配置

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| showXiaoYun | boolean | 否 | true | 是否显示小运 |
| showLiuYue | boolean | 否 | true | 是否显示流月 |
| showLiuRi | boolean | 否 | false | 是否显示流日 |
| showLiuShi | boolean | 否 | true | 是否显示流时 |
| showJiuXing | boolean | 否 | true | 是否显示九星 |
| showGanZhiLiuYi | boolean | 否 | true | 是否显示干支留意 |
| showShenSha | boolean | 否 | true | 是否显示神煞 |
| showGeJu | boolean | 否 | true | 是否显示格局 |
| showDaYunShenSha | boolean | 否 | false | 是否显示大运神煞 |
| showLiuNianShenSha | boolean | 否 | false | 是否显示流年神煞 |

#### 神煞单独开关配置

```typescript
shenShaConfig?: {
  [key: string]: boolean; // key为神煞名称，value为是否启用
}
```

支持的神煞名称(60种):
- 贵人类: 天乙贵人、文昌贵人、天德贵人、月德贵人、福星贵人、天官贵人、太极贵人、三奇贵人、德秀贵人等
- 吉神类: 禄神、天马、红鸾、天喜、天医、天厨、国印、学堂、词馆等
- 凶煞类: 羊刃、飞刃、劫煞、灾煞、孤辰、寡宿、元辰、亡神、勾绞等
- 特殊类: 桃花、华盖、将星、驿马、金舆、红艳、童子煞、铁扫帚等

#### 干支留意单独开关配置

```typescript
ganZhiLiuYiConfig?: {
  [key: string]: boolean; // key为关系名称，value为是否启用
}
```

支持的关系名称(18种):
- 天干相生、天干相克、天干相冲
- 地支三合、地支三会、地支六合、地支半合、地支拱合、地支暗合
- 地支相冲、地支相刑、地支相害、地支相破

### 使用示例

```typescript
// 基础用法
const settings: BaZiSettings = {
  name: '张三',
  sex: 1,
  date: '1990-01-01 08:30:00',
  dateType: 0
};

const result = createBaZiPaiPan(settings);
```


```typescript
// 高级用法 - 启用真太阳时
const advancedSettings: BaZiSettings = {
  name: '李四',
  sex: 0,
  date: '1995-06-15 14:30:00',
  dateType: 0,
  useTrueSolarTime: true,
  city: '北京',
  showShenSha: true,
  showGeJu: true,
  showJiuXing: true
};

const advancedResult = createBaZiPaiPan(advancedSettings);
```

### 返回值 (BaZiResult)

返回值包含完整的八字排盘信息,主要字段如下:

#### 基础信息
- `solar`: 公历日期
- `lunar`: 农历日期
- `name`: 姓名
- `sex`: 性别
- `age`: 年龄(实岁)
- `xuSui`: 虚岁
- `shengXiao`: 生肖
- `xingZuo`: 星座
- `xingQi`: 星期
- `jiJie`: 季节

#### 八字信息
- `baZi`: 四柱八字数组 `[年柱, 月柱, 日柱, 时柱]`
- `baZiWuXing`: 八字五行数组
- `baZiNaYin`: 八字纳音数组
- `baZiKongWang`: 空亡地支数组

#### 五行统计
- `muCount`: 木的数量
- `huoCount`: 火的数量
- `tuCount`: 土的数量
- `jinCount`: 金的数量
- `shuiCount`: 水的数量
- `wuXingWangShuai`: 五行旺衰
- `wuXingQueShi`: 五行缺失数组
- `xiYongShen`: 喜用神

#### 十神系统
- `shiShen`: 天干十神 `{year, month, day, hour}`
- `shiShenZhi`: 地支藏干十神
- `shiShenAnalysis`: 十神格局分析文本

#### 大运流年
- `qiYunSui`: 起运岁数
- `daYun`: 大运数组
- `liuNian`: 流年数组
- `currentDaYun`: 当前大运
- `currentLiuNian`: 当前流年

#### 其他系统
- `shenSha`: 神煞数组 `[年柱神煞, 月柱神煞, 日柱神煞, 时柱神煞]`
- `diZhiCangGan`: 地支藏干信息
- `wuXingShengKe`: 五行生克关系
- `geJu`: 格局判断信息
- `taiYuan`: 胎元
- `taiXi`: 胎息
- `mingGong`: 命宫
- `shenGong`: 身宫
- `jiuXing`: 九星系统(5种体系)
- `guZhong`: 骨重(称骨算命)
- `shenQiangShenRuo`: 身强身弱判断

---

## 六爻排盘 API

### 函数签名

```typescript
import { createLiuYaoPaiPan } from '@/lib/liuyao';
import { LiuYaoSettings, LiuYaoResult } from '@/types';

const result: LiuYaoResult = createLiuYaoPaiPan(settings: LiuYaoSettings);
```

### 输入参数 (LiuYaoSettings)

#### 基础参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| name | string | 否 | - | 姓名 |
| occupy | string | 是 | - | 占事(必填) |
| sex | 0 \| 1 | 是 | - | 性别 (0:女, 1:男) |
| date | string | 是 | - | 起卦日期时间 |
| dateType | 0 \| 1 | 是 | - | 日期类型 (0:公历, 1:农历) |

#### 起卦配置

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| paiPanType | 0-2 | 否 | 1 | 排盘类型 (0:日期起卦, 1:自动起卦, 2:手动起卦) |
| yaoShu | number[] | 否 | - | 爻数数组(6个数字: 6/7/8/9),自动起卦时使用 |
| manualYaoShu | number[] | 否 | - | 手动爻数数组(6个数字: 0/1/2/3),手动起卦时使用 |

爻数说明:
- 自动起卦: 6=老阴(变), 7=少阳, 8=少阴, 9=老阳(变)
- 手动起卦: 0=少阳, 1=少阴, 2=老阳(变), 3=老阴(变)

### 使用示例

```typescript
// 自动起卦(随机)
const autoSettings: LiuYaoSettings = {
  name: '王五',
  occupy: '求财',
  sex: 1,
  date: '2024-01-15 10:30:00',
  dateType: 0,
  paiPanType: 1
};

const autoResult = createLiuYaoPaiPan(autoSettings);

// 日期起卦
const dateSettings: LiuYaoSettings = {
  occupy: '问事业',
  sex: 0,
  date: '2024-01-15 10:30:00',
  dateType: 0,
  paiPanType: 0
};

const dateResult = createLiuYaoPaiPan(dateSettings);

// 手动起卦
const manualSettings: LiuYaoSettings = {
  occupy: '测婚姻',
  sex: 1,
  date: '2024-01-15 10:30:00',
  dateType: 0,
  paiPanType: 2,
  manualYaoShu: [0, 1, 2, 0, 1, 3] // 从初爻到上爻
};

const manualResult = createLiuYaoPaiPan(manualSettings);
```

### 返回值 (LiuYaoResult)

#### 卦象信息
- `shangGua`: 上卦名称和符号
- `xiaGua`: 下卦名称和符号
- `benGua`: 本卦名称
- `benGuaAs`: 本卦卦象符号
- `bianGua`: 变卦名称
- `bianGuaAs`: 变卦卦象符号
- `huGua`: 互卦名称
- `cuoGua`: 错卦名称
- `zongGua`: 综卦名称
- `fuGua`: 伏卦名称

#### 六爻详细信息
- `liuYao.benGua`: 本卦六爻信息
  - `yaoMing`: 爻名数组(初九、九二等)
  - `yaoAs`: 爻象数组(—、--)
  - `yaoAsMark`: 爻象标识(○、×)
  - `shiYing`: 世应标记
  - `liuQin`: 六亲(子孙、妻财等)
  - `ganZhi`: 干支
  - `wuXing`: 五行
  - `naYin`: 纳音
  - `liuShen`: 六神(青龙、朱雀等)
  - `yaoCi`: 爻辞
  - `fuShen`: 伏神标记

- `liuYao.bianGua`: 变卦六爻信息

#### 辅助信息
- `ganZhi`: 四柱干支 `{year, month, day, hour}`
- `jieQi`: 节气信息
- `kongWang`: 空亡地支
- `yueJiang`: 月将
- `shenSha`: 神煞系统

---

## 梅花易数 API

### 函数签名

```typescript
import { createMeiHuaPaiPan } from '@/lib/meihua';
import { MeiHuaSettings, MeiHuaResult } from '@/types';

const result: MeiHuaResult = createMeiHuaPaiPan(settings: MeiHuaSettings);
```

### 输入参数 (MeiHuaSettings)

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| name | string | 否 | - | 姓名 |
| occupy | string | 是 | - | 占事 |
| sex | 0 \| 1 | 是 | - | 性别 |
| date | string | 是 | - | 起卦日期时间 |
| dateType | 0 \| 1 | 是 | - | 日期类型 |
| guaMa | number | 否 | - | 卦码(可选,用于指定起卦) |

### 返回值 (MeiHuaResult)

- `guaMa`: 卦码
- `shangGua`: 上卦
- `xiaGua`: 下卦
- `dongYao`: 动爻位置
- `benGua`: 本卦
- `bianGua`: 变卦
- `huGua`: 互卦
- `cuoGua`: 错卦
- `zongGua`: 综卦

---

## 大六壬 API

### 函数签名

```typescript
import { createDaLiuRenPaiPan } from '@/lib/daliuren';
import { DaLiuRenSettings, DaLiuRenResult } from '@/types';

const result: DaLiuRenResult = createDaLiuRenPaiPan(settings: DaLiuRenSettings);
```

### 输入参数 (DaLiuRenSettings)

基础参数与其他排盘系统相同。

### 返回值 (DaLiuRenResult)

- `diPan`: 地盘(12个地支)
- `tianPan`: 天盘(12个地支)
- `shenPan`: 神盘(12个神将)
- `siKe`: 四课(二维数组)
- `sanChuan`: 三传(3个地支)
- `tianDiPanType`: 天地盘类型

---

## 奇门遁甲 API

### 函数签名

```typescript
import { createQiMenPaiPan } from '@/lib/qimen';
import { QiMenSettings, QiMenResult } from '@/types';

const result: QiMenResult = createQiMenPaiPan(settings: QiMenSettings);
```

### 输入参数 (QiMenSettings)

#### 基础参数

继承 BaseSettings 的所有参数。

#### 奇门配置

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| panType | 'zhuan' \| 'fei' | 否 | 'zhuan' | 盘类型(转盘/飞盘) |
| paiPanType | 0-3 | 否 | 3 | 排盘类型(0:年家, 1:月家, 2:日家, 3:时家) |
| zhiShiType | 0-2 | 否 | 1 | 值使类型 |
| yueJiaQiJuType | 0 \| 1 | 否 | 0 | 月家奇门起局类型 |
| jieQiType | 0 \| 1 | 否 | 1 | 节气类型 |
| yearGanZhiType | 0-2 | 否 | 2 | 年干支类型 |
| monthGanZhiType | 0 \| 1 | 否 | 1 | 月干支类型 |
| dayGanZhiType | 0 \| 1 | 否 | 0 | 日干支类型 |
| leapMonthType | 0 \| 1 | 否 | 0 | 闰月类型 |

### 返回值 (QiMenResult)

#### 基础信息
- `fuTou`: 符头
- `jieQi`: 节气
- `sanYuan`: 三元
- `yinYangDun`: 阴阳遁
- `juShu`: 局数
- `xunShou`: 旬首
- `zhiFu`: 值符
- `zhiShi`: 值使

#### 九宫信息
- `diPan`: 地盘(奇仪) - 9个元素
- `tianPan`: 天盘(九星) - 9个元素
- `renPan`: 人盘(八门) - 9个元素
- `shenPan`: 神盘(八神) - 9个元素

---

## 紫微斗数 API

### 函数签名

```typescript
import { createZiWeiPaiPan } from '@/lib/ziwei';
import { ZiWeiSettings, ZiWeiResult } from '@/types';

const result: ZiWeiResult = createZiWeiPaiPan(settings: ZiWeiSettings);
```

### 输入参数 (ZiWeiSettings)

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| birthHour | number | 否 | - | 出生时辰(0-23) |

其他参数继承 BaseSettings。

### 返回值 (ZiWeiResult)

- `wuXingJu`: 五行局
- `mingGong`: 命宫
- `shenGong`: 身宫
- `gongWei`: 十二宫位信息
  - 每个宫位包含: name(宫位名), zhuXing(主星数组), siHua(四化数组)
- `huaLu`: 化禄星
- `huaQuan`: 化权星
- `huaKe`: 化科星
- `huaJi`: 化忌星

---

## 通用说明

### 日期格式

所有API统一使用日期格式: `yyyy-MM-dd HH:mm:ss`

示例:
- `2024-01-01 08:30:00`
- `1990-12-25 14:15:30`

### 错误处理

所有API函数在参数错误时会抛出异常,建议使用 try-catch 包裹:

```typescript
try {
  const result = createBaZiPaiPan(settings);
  console.log(result);
} catch (error) {
  console.error('排盘失败:', error);
}
```

### 性能优化建议

1. 避免频繁调用排盘函数,建议缓存结果
2. 大运流年数据量较大,按需显示
3. 神煞系统可通过配置关闭不需要的项

### TypeScript 类型支持

所有类型定义位于 `@/types/index.ts`,可直接导入使用:

```typescript
import type {
  BaZiSettings,
  BaZiResult,
  LiuYaoSettings,
  LiuYaoResult,
  // ... 其他类型
} from '@/types';
```

