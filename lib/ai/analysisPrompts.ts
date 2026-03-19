import {
  BaZiResult,
  DaLiuRenResult,
  LiuYaoResult,
  MeiHuaResult,
  QiMenResult,
  ZiWeiResult,
} from '@/types';

const MAX_ARRAY_ITEMS = 12;
const MAX_STRING_LENGTH = 240;
const MAX_PROMPT_LENGTH = 18000;
const MAX_OBJECT_DEPTH = 4;

const SYSTEM_LABELS = {
  bazi: '八字',
  liuyao: '六爻',
  meihua: '梅花易数',
  daliuren: '大六壬',
  qimen: '奇门遁甲',
  ziwei: '紫微斗数',
} as const;

const SYSTEM_FOCUS: Record<keyof typeof SYSTEM_LABELS, string[]> = {
  bazi: [
    '先看日主强弱、格局、用神忌神，再谈事业、财运、婚恋与健康。',
    '涉及大运、流年时，要指出当前阶段与未来 3 到 5 年的重点变化。',
    '结论尽量落到可执行建议，不要只堆砌术语。',
  ],
  liuyao: [
    '重点分析用神、世应、动爻、变卦与事情的吉凶走势。',
    '要说明事情当前卡点、转机出现的位置以及时间感。',
    '如果结论不确定，要明确不确定来自哪一爻或哪一层关系。',
  ],
  meihua: [
    '重点分析体用、生克、互卦、变卦与事情发展趋势。',
    '要说明事情主因、外因与结果走向，不要只复述卦名。',
    '结论要偏实用，指出宜守、宜动或宜缓的节奏。',
  ],
  daliuren: [
    '重点分析四课、三传、天地盘、十二神将与事情原委。',
    '要交代事情起因、过程、结果，以及对方状态或外部阻力。',
    '如能判断时间节点或先后顺序，要明确写出。',
  ],
  qimen: [
    '重点分析值符、值使、九星、八门、八神与宫位关系。',
    '如果涉及决策，要给出方位、时机、策略上的优先建议。',
    '对于风险判断，要说明是人事风险、时机风险还是方向风险。',
  ],
  ziwei: [
    '重点分析命宫、身宫、主星结构、四化与大限流年。',
    '要把性格底色、事业财运、关系状态和阶段运势拆开讲清楚。',
    '不要泛泛而谈，要结合宫位与主星组合落结论。',
  ],
};

export const SYSTEM_ROLE = [
  '你是一位专业的中国传统命理分析师，熟悉八字、六爻、梅花易数、大六壬、奇门遁甲、紫微斗数。',
  '你只能围绕用户提供的排盘数据和命理问题作答，不讨论编程、产品、客服、模型身份或平台规则。',
  '你的目标是给出结构清晰、依据明确、语言通俗的专业解读。',
  '如果信息不足，可以指出判断边界，但不要编造排盘中不存在的数据。',
].join('\n');

function trimString(value: string): string {
  if (value.length <= MAX_STRING_LENGTH) {
    return value;
  }
  return `${value.slice(0, MAX_STRING_LENGTH)}…`;
}

function sanitizeForPrompt(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (depth >= MAX_OBJECT_DEPTH) {
    return '[已截断]';
  }

  if (typeof value === 'string') {
    return trimString(value);
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (Array.isArray(value)) {
    const sliced = value.slice(0, MAX_ARRAY_ITEMS).map((item) => sanitizeForPrompt(item, depth + 1));
    if (value.length > MAX_ARRAY_ITEMS) {
      sliced.push(`[其余 ${value.length - MAX_ARRAY_ITEMS} 项已省略]`);
    }
    return sliced;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .map(([key, item]) => [key, sanitizeForPrompt(item, depth + 1)]);

    return Object.fromEntries(entries);
  }

  return String(value);
}

function formatChartData(data: unknown): string {
  const normalized = sanitizeForPrompt(data);
  const serialized = JSON.stringify(normalized, null, 2) ?? '';
  if (serialized.length <= MAX_PROMPT_LENGTH) {
    return serialized;
  }
  return `${serialized.slice(0, MAX_PROMPT_LENGTH)}\n... [后续数据已截断]`;
}

function buildStructuredPrompt(
  system: keyof typeof SYSTEM_LABELS,
  data: unknown,
  extraRequirements: string[] = []
): string {
  const label = SYSTEM_LABELS[system];
  const focus = SYSTEM_FOCUS[system];
  const requirements = [
    '先给结论，再展开依据。',
    '尽量分成“核心判断 / 依据 / 建议”三个层次。',
    '术语出现时要顺手解释，不要只输出术语名单。',
    '避免空泛安慰或模板化套话。',
    '如使用 Markdown，请只使用标准语法：标题用 #，列表用 -，不要输出残缺的 * 或 **。',
    ...extraRequirements,
  ];

  return [
    SYSTEM_ROLE,
    '',
    `当前任务：请基于以下${label}排盘数据进行命理分析。`,
    '',
    '分析重点：',
    ...focus.map((item, index) => `${index + 1}. ${item}`),
    '',
    '输出要求：',
    ...requirements.map((item, index) => `${index + 1}. ${item}`),
    '',
    '排盘数据（JSON，已按长度做截断处理）：',
    '```json',
    formatChartData(data),
    '```',
  ].join('\n');
}

export function buildBaZiSystemPrompt(data: BaZiResult): string {
  return buildStructuredPrompt('bazi', data, [
    '如果盘中已有“身强身弱 / 格局 / 用神 / 当前大运流年”等字段，要优先引用这些字段。',
    '涉及事业、财运、婚恋、健康时，要分别指出利点和风险点。',
  ]);
}

export function buildLiuYaoSystemPrompt(data: LiuYaoResult): string {
  return buildStructuredPrompt('liuyao', data, [
    '如果存在动爻、世应、用神、空亡、六亲缺失等字段，要优先结合这些字段下判断。',
    '结果要体现“事情是否可成、为何如此、何时转折”。',
  ]);
}

export function buildMeiHuaSystemPrompt(data: MeiHuaResult): string {
  return buildStructuredPrompt('meihua', data, [
    '如果存在体卦、用卦、体用关系、互卦、变卦等字段，要作为主要依据。',
    '说明主因、助因、阻因以及结果走势。',
  ]);
}

export function buildDaLiuRenSystemPrompt(data: DaLiuRenResult): string {
  return buildStructuredPrompt('daliuren', data, [
    '如果存在四课、三传、天地盘、神盘等字段，要围绕其关系展开。',
    '回答要尽量体现事情的原委、过程、结果与时间顺序。',
  ]);
}

export function buildQiMenSystemPrompt(data: QiMenResult): string {
  return buildStructuredPrompt('qimen', data, [
    '如果存在值符、值使、九宫、九星、八门、八神等字段，要优先使用这些字段。',
    '若涉及行动建议，要明确“宜做什么 / 忌做什么 / 先做什么”。',
  ]);
}

export function buildZiWeiSystemPrompt(data: ZiWeiResult): string {
  return buildStructuredPrompt('ziwei', data, [
    '如果存在命宫、身宫、主星、四化、大限等字段，要围绕这些核心信息展开。',
    '要区分底层命格和当前阶段运势，不要混在一起说。',
  ]);
}

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
