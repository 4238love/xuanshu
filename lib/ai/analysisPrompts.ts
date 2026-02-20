// 各排盘系统的分析提示词模板
import { BaZiResult, LiuYaoResult, MeiHuaResult, DaLiuRenResult, QiMenResult, ZiWeiResult } from '@/types';

// 系统角色定义
export const SYSTEM_ROLE = `你是一位专业的中国传统文化命理师，精通八字、六爻、梅花易数、大六壬、奇门遁甲、紫微斗数等多种易学体系。你的职责是根据用户提供的排盘数据进行专业、易懂的解读。

重要限制：
1. 只回答与命理、风水、传统文化相关的问题
2. 如果用户询问与命理无关的问题（如编程、数学、娱乐等），请礼貌拒绝并引导用户提问命理相关话题
3. 不要进行文学创作、写代码、回答百科知识等与命理无关的内容
4. 不要过度延伸或发散到无关话题
5. 回答结束后不要添加任何固定格式的结束语，如"以上内容由XX生成"、"仅供娱乐参考"、"愿您洞悉天时"等语句，只输出纯粹的命理分析内容

分析原则：
1. 客观分析：根据排盘数据给出专业判断，避免过度夸大或虚假承诺
2. 通俗易懂：用通俗的语言解释专业术语，让用户容易理解
3. 积极正向：在给出建议时，尽量积极正面，帮助用户趋吉避凶
4. 逻辑清晰：分析要有条理，从基础信息到深入分析，层次分明
5. 实用指导：除了分析，还要给出具体的建议和指导`;

// 构建八字分析的系统提示词
export function buildBaZiSystemPrompt(data: BaZiResult): string {
  let prompt = `${SYSTEM_ROLE}

你现在要分析的是一个八字命盘。以下是排盘数据：

## 基础信息
- 出生时间：${data.solar} (公历) / ${data.lunar} (农历)
- 性别：${data.sex}
- 年龄：${data.age}岁
- 生肖：${data.shengXiao}
- 星座：${data.xingZuo}

## 八字
年柱：${data.baZi[0]} (${data.baZiWuXing[0]}, ${data.baZiNaYin[0]})
月柱：${data.baZi[1]} (${data.baZiWuXing[1]}, ${data.baZiNaYin[1]})
日柱：${data.baZi[2]} (${data.baZiWuXing[2]}, ${data.baZiNaYin[2]})
时柱：${data.baZi[3]} (${data.baZiWuXing[3]}, ${data.baZiNaYin[3]})

## 五行统计
木：${data.muCount}个 | 火：${data.huoCount}个 | 土：${data.tuCount}个 | 金：${data.jinCount}个 | 水：${data.shuiCount}个`;

  // 身强身弱
  if (data.shenQiangShenRuo) {
    prompt += `

## 身强身弱
- 判断结果：${data.shenQiangShenRuo.result}
- 综合评分：${data.shenQiangShenRuo.score}分
- 分析：${data.shenQiangShenRuo.analysis}`;
  }

  // 格局
  if (data.geJu) {
    prompt += `

## 格局
- 格局类型：${data.geJu.geJuType}
- 格局名称：${data.geJu.geJuName}
- 格局含义：${data.geJu.geJuMeaning}
- 格局成败：${data.geJu.geJuChengBai}
- 用神：${data.geJu.yongShen}
- 喜神：${data.geJu.xiShen}
- 忌神：${data.geJu.jiShen}`;
  }

  // 十神
  if (data.shiShen) {
    prompt += `

## 十神
- 年柱十神：${data.shiShen.year}
- 月柱十神：${data.shiShen.month}
- 日主：${data.shiShen.day}
- 时柱十神：${data.shiShen.hour}`;
  }

  // 大运
  if (data.daYun && data.daYun.length > 0) {
    prompt += `

## 大运
`;
    data.daYun.forEach((dy, idx) => {
      prompt += `- 大运${idx + 1}：${dy.ganZhi} (${dy.startAge}-${dy.endAge}岁, ${dy.shiShen})\n`;
    });
  }

  // 当前大运和流年
  if (data.currentDaYun) {
    prompt += `

## 当前大运
- 干支：${data.currentDaYun.ganZhi}
- 年龄：${data.currentDaYun.startAge}-${data.currentDaYun.endAge}岁
- 十神：${data.currentDaYun.shiShen}`;
  }

  if (data.currentLiuNian) {
    prompt += `

## 当前流年
- 年份：${data.currentLiuNian.year}年
- 干支：${data.currentLiuNian.ganZhi}
- 年龄：${data.currentLiuNian.age}岁
- 十神：${data.currentLiuNian.shiShen}`;
  }

  // 神煞
  if (data.shenSha) {
    prompt += `

## 神煞
`;
    data.shenSha.forEach((ss, idx) => {
      const positions = ['年柱', '月柱', '日柱', '时柱'];
      if (ss.length > 0) {
        prompt += `- ${positions[idx]}：${ss.join('、')}\n`;
      }
    });
  }

  // 胎元命宫身宫
  if (data.taiYuan || data.mingGong || data.shenGong) {
    prompt += `
`;
    if (data.taiYuan) prompt += `- 胎元：${data.taiYuan}\n`;
    if (data.mingGong) prompt += `- 命宫：${data.mingGong}\n`;
    if (data.shenGong) prompt += `- 身宫：${data.shenGong}\n`;
  }

  // 空亡
  if (data.baZiKongWang && data.baZiKongWang.length > 0) {
    prompt += `

## 空亡
- ${data.baZiKongWang.join('、')}`;
  }

  // 小运
  if (data.xiaoYun && data.xiaoYun.length > 0) {
    prompt += `

## 小运
`;
    data.xiaoYun.forEach((xy, idx) => {
      prompt += `- 小运${idx + 1}：${xy.ganZhi} (${xy.age}岁)\n`;
    });
  }

  // 流月
  if (data.liuYue && data.liuYue.length > 0) {
    prompt += `

## 流月（当前年份）
`;
    data.liuYue.forEach((ly) => {
      const currentMark = ly.isCurrent ? ' (当前月)' : '';
      prompt += `- ${ly.monthName}：${ly.ganZhi}${currentMark}\n`;
    });
  }

  // 流日
  if (data.liuRi && data.liuRi.length > 0) {
    prompt += `

## 流日（当月）
`;
    const displayDays = data.liuRi.slice(0, 15); // 只显示前15天，避免过长
    data.liuRi.forEach((lr, idx) => {
      if (idx < 15) {
        const currentMark = lr.isCurrent ? ' (今天)' : '';
        prompt += `- ${lr.day}日：${lr.ganZhi}${currentMark}\n`;
      }
    });
    if (data.liuRi.length > 15) {
      prompt += `- ...（共${data.liuRi.length}天，仅显示前15天）\n`;
    }
  }

  // 干支留意系统
  if (data.ganZhiLiuYi) {
    prompt += `

## 干支留意
`;
    if (data.ganZhiLiuYi.tianGanSheng && data.ganZhiLiuYi.tianGanSheng.length > 0) {
      prompt += `### 天干相生\n`;
      data.ganZhiLiuYi.tianGanSheng.forEach(item => {
        prompt += `- ${item.gan1}生${item.gan2}（${item.position1} → ${item.position2}）\n`;
      });
    }
    if (data.ganZhiLiuYi.tianGanKe && data.ganZhiLiuYi.tianGanKe.length > 0) {
      prompt += `### 天干相克\n`;
      data.ganZhiLiuYi.tianGanKe.forEach(item => {
        prompt += `- ${item.gan1}克${item.gan2}（${item.position1} → ${item.position2}）\n`;
      });
    }
    if (data.ganZhiLiuYi.tianGanChong && data.ganZhiLiuYi.tianGanChong.length > 0) {
      prompt += `### 天干相冲\n`;
      data.ganZhiLiuYi.tianGanChong.forEach(item => {
        prompt += `- ${item.gan1}冲${item.gan2}（${item.position1} ↔ ${item.position2}）\n`;
      });
    }
  }

  return prompt;
}

// 构建六爻分析的系统提示词
export function buildLiuYaoSystemPrompt(data: LiuYaoResult): string {
  let prompt = `${SYSTEM_ROLE}

你现在要分析的是一个六爻卦象。以下是排盘数据：

## 基础信息
- 起卦时间：${data.solar} (公历) / ${data.lunar} (农历)
- 星期：${data.xingQi || '未知'}
- 年龄：${data.age || '未知'}岁

## 卦象
- 本卦：${data.benGua} (${data.benGuaAs})
- 变卦：${data.bianGua} (${data.bianGuaAs})
- 互卦：${data.huGua} (${data.huGuaAs})
- 错卦：${data.cuoGua} (${data.cuoGuaAs})
- 综卦：${data.zongGua} (${data.zongGuaAs})

## 卦类型
- 本卦类型：${data.benGuaType}
- 本卦卦身：${data.benGuaShen}
- 变卦类型：${data.bianGuaType}
- 变卦卦身：${data.bianGuaShen}`;

  // 卦辞
  if (data.benGuaCi) {
    prompt += `

## 卦辞
- 本卦卦辞：${data.benGuaCi}`;
  }
  if (data.bianGuaCi) {
    prompt += `- 变卦卦辞：${data.bianGuaCi}`;
  }

  // 六亲
  prompt += `

## 六亲关系（从下到上）
`;
  data.liuYao.benGua.yaoMing.forEach((ym, idx) => {
    prompt += `- ${ym}：${data.liuYao.benGua.liuQin[idx]} | ${data.liuYao.benGua.ganZhi[idx]} (${data.liuYao.benGua.wuXing[idx]}) | ${data.liuYao.benGua.liuShen[idx]}\n`;
  });

  // 动爻
  const dongYaoIndices = data.liuYao.benGua.yaoAsMarkName
    .map((mark, idx) => mark.includes('老') ? idx : -1)
    .filter(idx => idx !== -1);

  if (dongYaoIndices.length > 0) {
    prompt += `

## 动爻
`;
    dongYaoIndices.forEach(idx => {
      prompt += `- ${data.liuYao.benGua.yaoMing[idx]}：${data.liuYao.benGua.yaoAsMarkName[idx]} → 变为${data.liuYao.bianGua.liuQin[idx]}\n`;
    });
  }

  // 世应
  const shiIdx = data.liuYao.benGua.shiYing.findIndex(s => s === '世');
  const yingIdx = data.liuYao.benGua.shiYing.findIndex(s => s === '应');
  if (shiIdx !== -1) {
    prompt += `

## 世应
- 世爻：${data.liuYao.benGua.yaoMing[shiIdx]} (${data.liuYao.benGua.liuQin[shiIdx]})
- 应爻：${yingIdx !== -1 ? data.liuYao.benGua.yaoMing[yingIdx] + ' (' + data.liuYao.benGua.liuQin[yingIdx] + ')' : '未知'}`;
  }

  // 六亲缺失
  if (data.liuQinQueShi && data.liuQinQueShi.length > 0) {
    prompt += `

## 六亲缺失
- ${data.liuQinQueShi.join('、')}`;
  }

  // 空亡
  if (data.kongWang && data.kongWang.length > 0) {
    prompt += `

## 空亡
- ${data.kongWang.join('、')}`;
  }

  // 四柱
  prompt += `

## 四柱
- 年柱：${data.ganZhi.year}
- 月柱：${data.ganZhi.month}
- 日柱：${data.ganZhi.day}
- 时柱：${data.ganZhi.hour}`;

  // 神煞
  if (data.shenSha) {
    prompt += `

## 神煞
`;
    Object.entries(data.shenSha).forEach(([key, value]) => {
      if (value.length > 0) {
        prompt += `- ${key}：${value.join('、')}\n`;
      }
    });
  }

  return prompt;
}

// 构建梅花易数分析的系统提示词
export function buildMeiHuaSystemPrompt(data: MeiHuaResult): string {
  let prompt = `${SYSTEM_ROLE}

你现在要分析的是一个梅花易数卦象。以下是排盘数据：

## 基础信息
- 起卦时间：${data.solar} (公历) / ${data.lunar} (农历)
- 生肖：${data.shengXiao || '未知'}
- 星座：${data.xingZuo || '未知'}

## 卦象
- 卦码：${data.guaMa}
- 上卦：${data.shangGua}
- 下卦：${data.xiaGua}
- 动爻：${data.dongYao}爻
- 本卦：${data.benGua}
- 变卦：${data.bianGua}
- 互卦：${data.huGua}
- 错卦：${data.cuoGua}
- 综卦：${data.zongGua}`;

  // 体用关系
  prompt += `

## 体用关系
- 体卦：${data.tiGua} (${data.tiGuaWuXing})
- 用卦：${data.yongGua} (${data.yongGuaWuXing})
- 体用关系：${data.tiYongGuanXi}`;

  // 卦辞
  if (data.benGuaGuaCi) {
    prompt += `

## 卦辞
- 本卦：${data.benGuaGuaCi}`;
  }
  if (data.bianGuaGuaCi) {
    prompt += `- 变卦：${data.bianGuaGuaCi}`;
  }

  // 干支
  if (data.yearGanZhi) {
    prompt += `

## 干支
- 年柱：${data.yearGanZhi}
- 月柱：${data.monthGanZhi}
- 日柱：${data.dayGanZhi}
- 时柱：${data.hourGanZhi}`;
  }

  // 空亡
  if (data.dayKongWang) {
    prompt += `

## 日柱空亡
- ${data.dayKongWang}`;
  }

  return prompt;
}

// 构建大六壬分析的系统提示词
export function buildDaLiuRenSystemPrompt(data: DaLiuRenResult): string {
  let prompt = `${SYSTEM_ROLE}

你现在要分析的是一个大六壬盘。以下是排盘数据：

## 基础信息
- 起盘时间：${data.solar} (公历) / ${data.lunar} (农历)

## 盘式
- 天地盘类型：${data.tianDiPanType}
- 月将：${data.yueJiang}
- 月将神：${data.yueJiangShen}`;

  // 地盘
  prompt += `

## 地盘（从亥到戌顺时针）
${data.diPan.join(' → ')}`;

  // 天盘
  prompt += `

## 天盘
${data.tianPan.join(' → ')}`;

  // 神盘
  prompt += `

## 神盘（十二神将）
${data.shenPan.join(' → ')}`;

  // 四课
  prompt += `

## 四课
`;
  const keNames = ['第一课', '第二课', '第三课', '第四课'];
  data.siKe.forEach((ke, idx) => {
    prompt += `- ${keNames[idx]}：${ke[0]} → ${ke[1]}\n`;
  });

  // 三传
  prompt += `

## 三传
- 初传：${data.sanChuan[0]}
- 中传：${data.sanChuan[1]}
- 末传：${data.sanChuan[2]}`;

  return prompt;
}

// 构建奇门遁甲分析的系统提示词
export function buildQiMenSystemPrompt(data: QiMenResult): string {
  let prompt = `${SYSTEM_ROLE}

你现在要分析的是一个奇门遁甲盘。以下是排盘数据：

## 基础信息
- 起盘时间：${data.solar} (公历) / ${data.lunar} (农历)

## 基础信息
- 符头：${data.fuTou}
- 节气：${data.jieQi}
- 三元：${data.sanYuan || '未知'}
- 阴阳遁：${data.yinYangDun}
- 局数：${data.juShu}
- 旬首：${data.xunShou}
- 值符：${data.zhiFu}
- 值使：${data.zhiShi}`;

  // 九宫盘
  const gongNames = ['坎一宫', '坤二宫', '震三宫', '巽四宫', '中五宫', '乾六宫', '兑七宫', '艮八宫', '离九宫'];

  prompt += `

## 九宫格局
`;
  for (let i = 0; i < 9; i++) {
    prompt += `- ${gongNames[i]}：地盘${data.diPan[i]} | 天盘${data.tianPan[i]} | 人盘${data.renPan[i]} | 神盘${data.shenPan[i]}\n`;
  }

  // 特殊标记
  if (data.jiXing && data.jiXing.length > 0) {
    prompt += `

## 吉星
${data.jiXing.join('、')}`;
  }

  if (data.xiongXing && data.xiongXing.length > 0) {
    prompt += `

## 凶星
${data.xiongXing.join('、')}`;
  }

  if (data.qiYiRuMu && data.qiYiRuMu.length > 0) {
    prompt += `

## 奇仪入墓
${data.qiYiRuMu.join('、')}`;
  }

  return prompt;
}

// 构建紫微斗数分析的系统提示词
export function buildZiWeiSystemPrompt(data: ZiWeiResult): string {
  let prompt = `${SYSTEM_ROLE}

你现在要分析的是一个紫微斗数命盘。以下是排盘数据：

## 基础信息
- 出生时间：${data.solar} (公历) / ${data.lunar} (农历)
- 性别：${data.sex}

## 命盘信息
- 五行局：${data.wuXingJu}
- 命宫：${data.mingGong}
- 身宫：${data.shenGong}
- 命主：${data.mingZhu}
- 身主：${data.shenZhu}

## 四化
- 化禄：${data.huaLu}
- 化权：${data.huaQuan}
- 化科：${data.huaKe}
- 化忌：${data.huaJi}`;

  // 十二宫
  const gongNames = ['命宫', '兄弟宫', '夫妻宫', '子女宫', '财帛宫', '疾厄宫', '迁移宫', '仆役宫', '官禄宫', '田宅宫', '福德宫', '父母宫'];

  prompt += `

## 十二宫
`;
  Object.entries(data.gongWei).forEach(([key, value]) => {
    prompt += `- ${value.name}：主星${value.zhuXing.join('、')}`;
    if (value.auxStars && value.auxStars.length > 0) {
      prompt += ` | 辅星${value.auxStars.join('、')}`;
    }
    if (value.siHua && value.siHua.length > 0) {
      prompt += ` | 四化${value.siHua.join('、')}`;
    }
    prompt += '\n';
  });

  // 大限
  if (data.daXian) {
    prompt += `

## 大限
`;
    data.daXian.forEach((dx, idx) => {
      prompt += `- ${gongNames[idx]}：${dx}\n`;
    });
  }

  return prompt;
}

// 根据排盘系统类型构建提示词
export function buildSystemPrompt(system: string, data: unknown): string {
  switch (system) {
    case 'bazi':
      return buildBaZiSystemPrompt(data as BaZiResult);
    case 'liuyao':
      return buildLiuYaoSystemPrompt(data as LiuYaoResult);
    case 'meihua':
      return buildMeiHuaSystemPrompt(data as MeiHuaResult);
    case 'daliuren':
      return buildDaLiuRenSystemPrompt(data as DaLiuRenResult);
    case 'qimen':
      return buildQiMenSystemPrompt(data as QiMenResult);
    case 'ziwei':
      return buildZiWeiSystemPrompt(data as ZiWeiResult);
    default:
      return SYSTEM_ROLE;
  }
}
