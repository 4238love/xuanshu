// AI Provider 类型定义
export type AIProvider =
  | 'openai'        // OpenAI API
  | 'claude'        // Anthropic Claude API
  | 'qianfan'       // 百度文心一言
  | 'dashscope'     // 阿里通义千问
  | 'hunyuan'       // 腾讯混元
  | 'moonshot'      // 月之暗面
  | 'zhipu'         // 智谱AI
  | 'minimax'       // MiniMax
  | 'custom';       // 用户自定义API

// AI配置模式
export type AIConfigMode = 'official' | 'custom';

// AI配置接口
export interface AIConfig {
  id: string;            // 配置唯一ID
  name: string;          // 配置名称（如"我的OpenAI"、"工作用GPT"）
  provider: AIProvider;
  baseURL: string;       // API基础地址
  apiKey: string;        // API密钥
  model: string;         // 模型名称
  temperature?: number;  // 温度参数 (0-2)
  maxTokens?: number;    // 最大token数
  isDefault?: boolean;   // 是否为默认配置
  createdAt?: number;    // 创建时间
}

// AI配置存储结构
export interface AIConfigStorage {
  configs: AIConfig[];    // 所有配置列表
  activeConfigId: string | null; // 当前激活的配置ID
  mode: AIConfigMode; // 当前使用的配置模式
}

// API配置存储键名
export const AI_CONFIG_STORAGE_KEY = 'suanming_ai_config';
export const AI_SESSION_SECRET_STORAGE_KEY = 'suanming_ai_config_session_secrets';

// 默认AI配置模式
export const DEFAULT_AI_CONFIG_MODE: AIConfigMode = 'official';
export const DEFAULT_AI_TEMPERATURE = 0.7;
export const DEFAULT_AI_MAX_TOKENS = 2000;
export const AI_PROVIDER_MAX_TOKENS: Record<AIProvider, number> = {
  openai: 16384,
  claude: 8192,
  qianfan: 8192,
  dashscope: 8192,
  hunyuan: 8192,
  moonshot: 16384,
  zhipu: 8192,
  minimax: 8192,
  custom: 8192,
};

// 默认AI配置（用于兼容旧版本）
export const defaultAIConfig: AIConfig = {
  id: '',
  name: '默认配置',
  provider: 'custom',
  baseURL: '',
  apiKey: '',
  model: '',
  temperature: DEFAULT_AI_TEMPERATURE,
  maxTokens: DEFAULT_AI_MAX_TOKENS,
  isDefault: true,
};

// 默认API地址映射
export const AIProviderBaseURLs: Record<AIProvider, string> = {
  openai: 'https://api.openai.com/v1',
  claude: 'https://api.anthropic.com/v1',
  // 百度文心一言：需要通过AK/SK获取access_token后调用
  // 获取token: https://aip.baidubce.com/oauth/2.0/token
  // 调用API: https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie-4.0-8k
  qianfan: 'https://aip.baidubce.com',
  // 阿里通义千问
  dashscope: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  // 腾讯混元：兼容OpenAI格式
  hunyuan: 'https://api.hunyuan.cloud.tencent.com',
  // 月之暗面Kimi
  moonshot: 'https://api.moonshot.cn/v1',
  // 智谱AI GLM
  zhipu: 'https://open.bigmodel.cn/api/paas/v4',
  // MiniMax: 通过阿里云百炼平台调用
  minimax: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  custom: '',
};

// 默认模型映射
export const AIProviderDefaultModels: Record<AIProvider, string> = {
  openai: 'gpt-4o',
  claude: 'claude-sonnet-4-20250514',
  // 百度文心一言模型
  qianfan: 'ernie-4.0-8k',
  // 阿里通义千问模型
  dashscope: 'qwen-turbo',
  // 腾讯混元模型
  hunyuan: 'hunyuan-turbos-latest',
  // 月之暗面Kimi模型
  moonshot: 'moonshot-v1-8k',
  // 智谱AI GLM模型
  zhipu: 'glm-4',
  // MiniMax模型（通过阿里云百炼）
  minimax: 'abab6.5s-chat',
  custom: '',
};

// AI消息角色
export type AIMessageRole = 'system' | 'user' | 'assistant';

// AI对话消息
export interface AIMessage {
  id: string;
  role: AIMessageRole;
  content: string;
  timestamp: number;
}

// AI分析类型
export type AnalysisType =
  | 'comprehensive'  // 综合分析
  | 'fortune'        // 运势预测
  | 'career'         // 事业财运
  | 'love'           // 婚姻感情
  | 'health'         // 健康提醒
  | 'custom';        // 自定义问题

// 排盘系统类型
export type PaiPanSystem = 'bazi' | 'liuyao' | 'meihua' | 'daliuren' | 'qimen' | 'ziwei';

// 快捷分析选项
export interface QuickAnalysisOption {
  id: AnalysisType;
  label: string;
  icon: string;
  prompt: string;
}

// 各系统快捷分析选项配置
export const QuickAnalysisOptions: Record<PaiPanSystem, QuickAnalysisOption[]> = {
  bazi: [
    { id: 'comprehensive', label: '综合分析', icon: '🔮', prompt: '请对这个八字进行综合分析，包括格局、用神、五行平衡、性格特点、事业发展、财运、感情婚姻、健康提示和大运走势。' },
    { id: 'fortune', label: '运势预测', icon: '📈', prompt: '请分析这个八字的大运流年走势，预测未来10年的运势变化。' },
    { id: 'career', label: '事业财运', icon: '💼', prompt: '请分析这个八字的事业发展和财运状况，有哪些优势和需要注意的地方。' },
    { id: 'love', label: '婚姻感情', icon: '💕', prompt: '请分析这个八字的婚姻感情状况，适合的对象类型，以及需要注意的年份。' },
    { id: 'health', label: '健康提醒', icon: '🏥', prompt: '请分析这个八字需要注意的健康问题，哪些身体部位需要重点保养。' },
  ],
  liuyao: [
    { id: 'comprehensive', label: '综合分析', icon: '🔮', prompt: '请对这个六爻卦象进行综合分析，包括卦象解读、用神旺衰、世应关系、吉凶判断和事情发展趋势。' },
    { id: 'fortune', label: '吉凶判断', icon: '⚡', prompt: '请分析这个卦象的吉凶结果，用神旺衰，以及判断事情的成功概率。' },
    { id: 'career', label: '事业财运', icon: '💼', prompt: '请用这个卦象分析事业发展方向和财运状况。' },
    { id: 'love', label: '婚姻感情', icon: '💕', prompt: '请用这个卦象分析婚姻感情状况，对方情况如何。' },
    { id: 'custom', label: '自定义问题', icon: '❓', prompt: '' },
  ],
  meihua: [
    { id: 'comprehensive', label: '综合分析', icon: '🔮', prompt: '请对这个梅花易数卦象进行综合分析，包括体用生克、事情性质、互卦变卦分析和发展走势。' },
    { id: 'fortune', label: '发展走势', icon: '📈', prompt: '请分析这个卦象显示的事情发展趋势，结果如何。' },
    { id: 'custom', label: '自定义问题', icon: '❓', prompt: '' },
  ],
  daliuren: [
    { id: 'comprehensive', label: '综合分析', icon: '🔮', prompt: '请对这个大六壬盘进行综合分析，包括四课分析、三传解读、十二神将含义和事情吉凶判断。' },
    { id: 'fortune', label: '事情吉凶', icon: '⚡', prompt: '请分析这个大六壬盘显示的事情吉凶，原委如何。' },
    { id: 'custom', label: '自定义问题', icon: '❓', prompt: '' },
  ],
  qimen: [
    { id: 'comprehensive', label: '综合分析', icon: '🔮', prompt: '请对这个奇门遁甲盘进行综合分析，包括格局分析、九星八门八神含义、值符值使和时空方位吉凶。' },
    { id: 'fortune', label: '方位选择', icon: '🧭', prompt: '请分析这个奇门盘哪个方位最有利，做事应该选择什么时机。' },
    { id: 'career', label: '事业策略', icon: '💼', prompt: '请用这个奇门盘分析事业发展策略和注意事项。' },
    { id: 'custom', label: '自定义问题', icon: '❓', prompt: '' },
  ],
  ziwei: [
    { id: 'comprehensive', label: '综合分析', icon: '🔮', prompt: '请对这个紫微斗数命盘进行综合分析，包括命宫分析、事业宫解读、财帛宫分析、感情婚姻和大限走势。' },
    { id: 'fortune', label: '大限走势', icon: '📈', prompt: '请分析这个紫微斗数命盘的大限走势，现在走什么大限，未来如何。' },
    { id: 'career', label: '事业财运', icon: '💼', prompt: '请分析这个命盘的事业发展和财运状况。' },
    { id: 'love', label: '婚姻感情', icon: '💕', prompt: '请分析这个命盘的婚姻感情状况。' },
    { id: 'custom', label: '自定义问题', icon: '❓', prompt: '' },
  ],
};

// AI分析状态
export type AIAnalysisStatus = 'idle' | 'analyzing' | 'completed' | 'error';

// AI分析Hook返回类型
export interface UseAIAnalysisReturn {
  messages: AIMessage[];
  status: AIAnalysisStatus;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  sendQuickAnalysis: (type: AnalysisType, system: PaiPanSystem, data: unknown) => Promise<void>;
  clearMessages: () => void;
}
