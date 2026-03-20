'use client';

import { KeyboardEvent, useCallback, useEffect, useState } from 'react';
import {
  AIConfig,
  AIConfigMode,
  AIProvider,
  AI_PROVIDER_MAX_TOKENS,
  AIProviderBaseURLs,
  AIProviderDefaultModels,
  DEFAULT_AI_MAX_TOKENS,
  DEFAULT_AI_TEMPERATURE,
} from '@/types/ai';
import {
  addConfig,
  deleteConfig,
  getAIConfig,
  getAIConfigMode,
  getAllConfigs,
  setAIConfigMode,
  setActiveConfig,
  setDefaultConfig,
  testAPIConnection,
  updateConfig,
} from '@/lib/ai/config';

interface AISettingsPanelProps {
  onClose: () => void;
  onSave?: () => void;
}

interface OfficialMeta {
  baseURLHost: string | null;
  model: string | null;
  thirdPartyHost: boolean;
}

interface ProxyStatusResponse {
  officialConfigured?: boolean;
  officialMeta?: OfficialMeta | null;
  customModeAvailable?: boolean;
  sessionOnlySecrets?: boolean;
  rateLimit?: {
    windowMs?: number;
    maxRequests?: number;
  };
}

const providerLabels: Record<AIProvider, string> = {
  openai: 'OpenAI',
  claude: 'Anthropic Claude',
  qianfan: '百度文心一言',
  dashscope: '阿里通义千问',
  hunyuan: '腾讯混元',
  moonshot: 'Moonshot',
  zhipu: '智谱 AI',
  minimax: 'MiniMax',
  custom: '自定义 API',
};

const providerDescriptions: Record<AIProvider, string> = {
  openai: '适合接入 GPT 系列模型。',
  claude: '适合接入 Claude Sonnet 与 Claude Haiku。',
  qianfan: '适合接入 ERNIE 系列模型。',
  dashscope: '适合接入通义千问兼容接口。',
  hunyuan: '适合接入腾讯混元兼容接口。',
  moonshot: '适合接入 Moonshot / Kimi 模型。',
  zhipu: '适合接入 GLM 系列模型。',
  minimax: '适合接入 MiniMax 兼容接口。',
  custom: '兼容 OpenAI Chat Completions 格式的接口。',
};

const SERIF_STYLE = {
  fontFamily:
    '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Baskerville, "Songti SC", "STSong", serif',
};

const sectionClass =
  'rounded-[26px] border border-[rgba(114,76,37,0.12)] bg-[rgba(255,250,242,0.82)] p-4 shadow-[0_20px_38px_-30px_rgba(61,37,15,0.32)] sm:p-5';
const fieldClass =
  'w-full rounded-[18px] border border-[#d9c9b4] bg-[rgba(255,252,246,0.92)] px-4 py-3 text-sm text-[#2f2118] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] outline-none transition focus:border-[#8f5b2d] focus:ring-2 focus:ring-[#d0a26a]/30';
const subtleButtonClass =
  'inline-flex items-center justify-center rounded-full border border-[rgba(117,76,40,0.14)] bg-white/80 px-3 py-2 text-sm text-[#5b4430] transition hover:border-[#a27140] hover:bg-[#fff7ed] disabled:cursor-not-allowed disabled:opacity-50';
const primaryButtonClass =
  'inline-flex items-center justify-center rounded-full bg-gradient-to-r from-stone-900 via-stone-800 to-amber-700 px-4 py-2.5 text-sm font-medium text-white shadow-[0_18px_30px_-20px_rgba(74,45,25,0.72)] transition hover:-translate-y-0.5 hover:from-stone-950 hover:to-amber-800 disabled:cursor-not-allowed disabled:opacity-50';

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

function createDraftConfig(index: number): AIConfig {
  return {
    id: '',
    name: `自定义配置 ${index}`,
    provider: 'custom',
    baseURL: '',
    apiKey: '',
    model: '',
    temperature: DEFAULT_AI_TEMPERATURE,
    maxTokens: DEFAULT_AI_MAX_TOKENS,
    isDefault: false,
  };
}

function toCreatableConfig(config: AIConfig): Omit<AIConfig, 'id' | 'createdAt'> {
  return {
    name: config.name,
    provider: config.provider,
    baseURL: config.baseURL,
    apiKey: config.apiKey,
    model: config.model,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
    isDefault: config.isDefault,
  };
}

export default function AISettingsPanel({ onClose, onSave }: AISettingsPanelProps) {
  const [configMode, setConfigModeState] = useState<AIConfigMode>('official');

  const [configs, setConfigs] = useState<AIConfig[]>([]);
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [editingConfig, setEditingConfig] = useState<AIConfig | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [officialConfigured, setOfficialConfigured] = useState<boolean | null>(null);
  const [officialMeta, setOfficialMeta] = useState<OfficialMeta | null>(null);
  const [officialStatusError, setOfficialStatusError] = useState<string | null>(null);
  const [officialStatusLoading, setOfficialStatusLoading] = useState(false);
  const [customModeAvailable, setCustomModeAvailable] = useState(true);
  const [sessionOnlySecrets, setSessionOnlySecrets] = useState(true);
  const [rateLimitHint, setRateLimitHint] = useState<{ windowMs: number; maxRequests: number } | null>(null);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const refreshCustomState = useCallback(() => {
    const allConfigs = getAllConfigs();
    const currentConfig = getAIConfig();
    const hasSavedConfigs = allConfigs.length > 0;

    setConfigs(allConfigs);
    setActiveConfigId(hasSavedConfigs ? currentConfig.id : null);
    setEditingConfig(hasSavedConfigs ? currentConfig : null);
  }, []);

  const loadOfficialStatus = useCallback(async () => {
    setOfficialStatusLoading(true);
    setOfficialStatusError(null);

    try {
      const response = await fetch('/api/ai', { method: 'GET' });
      if (!response.ok) {
        throw new Error(`读取官方接口状态失败：${response.status}`);
      }

      const data = (await response.json()) as ProxyStatusResponse;
      const isConfigured = Boolean(data.officialConfigured);
      setOfficialConfigured(isConfigured);
      setOfficialMeta(data.officialMeta ?? null);
      setCustomModeAvailable(data.customModeAvailable !== false);
      setSessionOnlySecrets(data.sessionOnlySecrets !== false);
      setRateLimitHint(
        data.rateLimit?.windowMs && data.rateLimit?.maxRequests
          ? {
              windowMs: data.rateLimit.windowMs,
              maxRequests: data.rateLimit.maxRequests,
            }
          : null
      );

      if (!isConfigured && getAIConfigMode() === 'official' && data.customModeAvailable !== false) {
        setAIConfigMode('custom');
        setConfigModeState('custom');
        onSave?.();
      }

      if (data.customModeAvailable === false && getAIConfigMode() === 'custom') {
        setAIConfigMode('official');
        setConfigModeState('official');
        onSave?.();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '读取官方接口状态失败';
      setOfficialConfigured(false);
      setOfficialStatusError(message);
    } finally {
      setOfficialStatusLoading(false);
    }
  }, [onSave]);

  useEffect(() => {
    setConfigModeState(getAIConfigMode());
    refreshCustomState();
    void loadOfficialStatus();
  }, [loadOfficialStatus, refreshCustomState]);

  const handleModeChange = (mode: AIConfigMode) => {
    if (mode === 'custom' && !customModeAvailable) {
      setTestResult({
        success: false,
        message: '当前环境已禁用自定义 API 代理，如需启用请在服务端配置 AI_ENABLE_CUSTOM_MODE=1。',
      });
      return;
    }

    setConfigModeState(mode);
    setAIConfigMode(mode);
    setTestResult(null);

    if (mode === 'custom' && !editingConfig) {
      const allConfigs = getAllConfigs();
      if (allConfigs.length === 0) {
        setEditingConfig(createDraftConfig(1));
        setIsAddingNew(true);
      } else {
        const currentConfig = getAIConfig();
        setEditingConfig(currentConfig);
        setActiveConfigId(currentConfig.id);
        setIsAddingNew(false);
      }
    }

    onSave?.();
  };

  const handleProviderChange = (provider: AIProvider) => {
    if (!editingConfig) return;

    setEditingConfig({
      ...editingConfig,
      provider,
      baseURL: AIProviderBaseURLs[provider],
      model: AIProviderDefaultModels[provider],
    });
    setTestResult(null);
  };

  const handleAddNew = () => {
    handleModeChange('custom');
    setEditingConfig(createDraftConfig(configs.length + 1));
    setActiveConfigId(null);
    setIsAddingNew(true);
    setTestResult(null);
  };

  const handleSwitchConfig = (id: string) => {
    setActiveConfigId(id);
    setActiveConfig(id);

    const nextConfig = configs.find((config) => config.id === id);
    if (nextConfig) {
      setEditingConfig(nextConfig);
    }
    setIsAddingNew(false);
    setTestResult(null);
  };

  const handleConfigKeyDown = (event: KeyboardEvent<HTMLDivElement>, id: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSwitchConfig(id);
    }
  };

  const handleDelete = (id: string) => {
    if (configs.length <= 1) {
      alert('至少需要保留一个自定义配置。');
      return;
    }

    if (!confirm('确定要删除这个配置吗？')) {
      return;
    }

    deleteConfig(id);
    const allConfigs = getAllConfigs();
    setConfigs(allConfigs);

    if (activeConfigId === id) {
      const nextConfig = allConfigs[0];
      if (nextConfig) {
        setActiveConfigId(nextConfig.id);
        setEditingConfig(nextConfig);
      } else {
        setActiveConfigId(null);
        setEditingConfig(createDraftConfig(1));
        setIsAddingNew(true);
      }
    }
  };

  const handleSetDefault = (id: string) => {
    setDefaultConfig(id);
    setConfigs(getAllConfigs());
  };

  const handleSave = async () => {
    if (!editingConfig || configMode !== 'custom') return;

    setSaving(true);
    try {
      if (isAddingNew || !editingConfig.id) {
        const created = addConfig(toCreatableConfig(editingConfig));
        setActiveConfig(created.id);
        setActiveConfigId(created.id);
        setIsAddingNew(false);
      } else {
        const updated = updateConfig(editingConfig.id, editingConfig);
        if (!updated) {
          const created = addConfig(toCreatableConfig(editingConfig));
          setActiveConfig(created.id);
          setActiveConfigId(created.id);
        }
      }

      refreshCustomState();
      setAIConfigMode('custom');
      setConfigModeState('custom');
      onSave?.();
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    const targetConfig = editingConfig ?? getAIConfig();

    if (configMode === 'custom' && !editingConfig) {
      setTestResult({ success: false, message: '请先创建或选择一个自定义配置。' });
      return;
    }

    if (configMode === 'custom' && !customModeAvailable) {
      setTestResult({
        success: false,
        message: '当前环境已禁用自定义 API 代理。',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);
    try {
      const result = await testAPIConnection(targetConfig, configMode);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : '测试失败',
      });
    } finally {
      setTesting(false);
    }
  };

  const canSaveCustom = Boolean(
    configMode === 'custom' &&
      customModeAvailable &&
      editingConfig &&
      editingConfig.apiKey.trim() &&
      editingConfig.baseURL.trim() &&
      editingConfig.model.trim()
  );

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
        <section className={sectionClass}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.36em] text-[#8a6239]">接口接入</p>
              <h3 className="mt-2 text-[1.35rem] font-semibold tracking-[0.08em] text-[#2f2118]" style={SERIF_STYLE}>
                接口与模型
              </h3>
              <p className="mt-2 text-sm leading-7 text-[#6f5e51]">
                官方模式走服务端托管，自定义模式用于接入你自己的模型接口。
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handleModeChange('official')}
              className={cx(
                'rounded-[24px] border p-4 text-left transition-all',
                configMode === 'official'
                  ? 'border-[#4a2d19]/20 bg-[linear-gradient(135deg,#2c1b12,#573520_58%,#94602d)] text-white shadow-[0_20px_36px_-24px_rgba(74,45,25,0.72)]'
                  : 'border-[rgba(117,76,40,0.14)] bg-white/78 text-[#5b4430] hover:border-[#a27140] hover:bg-[#fff7ed]'
              )}
            >
              <div className="text-[10px] uppercase tracking-[0.28em] opacity-80">托管模式</div>
              <div className="mt-2 text-base font-semibold">官方接口</div>
              <div className={cx('mt-2 text-sm leading-6', configMode === 'official' ? 'text-stone-200' : 'text-[#7b6b5f]')}>
                由服务端统一保管密钥和模型参数。
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange('custom')}
              disabled={!customModeAvailable}
              className={cx(
                'rounded-[24px] border p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60',
                configMode === 'custom'
                  ? 'border-[#4a2d19]/16 bg-[linear-gradient(180deg,rgba(255,251,243,0.96),rgba(249,240,227,0.92))] text-[#2f2118] shadow-[0_20px_36px_-24px_rgba(74,45,25,0.32)]'
                  : 'border-[rgba(117,76,40,0.14)] bg-white/78 text-[#5b4430] hover:border-[#a27140] hover:bg-[#fff7ed]'
              )}
            >
              <div className="text-[10px] uppercase tracking-[0.28em] text-[#8a6239]">自定义</div>
              <div className="mt-2 text-base font-semibold">自定义接口</div>
              <div className="mt-2 text-sm leading-6 text-[#7b6b5f]">
                手动填写 baseURL、API Key 与模型名。
              </div>
            </button>
          </div>

          {!customModeAvailable ? (
            <div className="mt-4 rounded-[22px] border border-amber-300 bg-amber-50/80 p-4 text-sm leading-7 text-amber-900">
              当前环境已禁用自定义 API 代理。如需在生产环境继续使用，请在服务端显式配置
              `AI_ENABLE_CUSTOM_MODE=1`，并配合 `AI_ALLOWED_UPSTREAM_HOSTS` 限定可访问的上游主机。
            </div>
          ) : null}

          {sessionOnlySecrets ? (
            <div className="mt-4 rounded-[22px] border border-emerald-200 bg-emerald-50/80 p-4 text-sm leading-7 text-emerald-900">
              自定义模式下的 `API Key` 只保存在当前浏览器会话，不再写入 `localStorage`。
              关闭浏览器标签页后，如当前会话没有恢复密钥，需要重新输入一次。
            </div>
          ) : null}

          {rateLimitHint ? (
            <div className="mt-4 rounded-[22px] border border-[rgba(117,76,40,0.14)] bg-white/78 p-4 text-sm leading-7 text-[#5b4430]">
              AI 代理当前速率限制：{rateLimitHint.windowMs / 1000} 秒内最多 {rateLimitHint.maxRequests} 次请求。
            </div>
          ) : null}
        </section>

        {configMode === 'official' ? (
          <section className={sectionClass}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-[#8a6239]">状态检测</div>
                <div className="mt-1 text-sm font-semibold text-[#2f2118]">官方接口状态</div>
              </div>
              <button type="button" onClick={() => void loadOfficialStatus()} className={subtleButtonClass}>
                刷新状态
              </button>
            </div>

            <div className="mt-4 rounded-[22px] border border-[rgba(117,76,40,0.14)] bg-white/78 p-4">
              <div className="flex items-center gap-3">
                <span
                  className={cx(
                    'h-3 w-3 rounded-full',
                    officialStatusLoading
                      ? 'bg-amber-300'
                      : officialConfigured
                        ? 'bg-emerald-400'
                        : 'bg-red-400'
                  )}
                  aria-hidden="true"
                />
                <div className="text-sm font-medium text-[#2f2118]">
                  {officialStatusLoading && '正在检测官方接口'}
                  {!officialStatusLoading && officialConfigured === true && '官方接口已配置'}
                  {!officialStatusLoading && officialConfigured === false && '官方接口尚未配置'}
                  {!officialStatusLoading && officialConfigured === null && '尚未检测接口状态'}
                </div>
              </div>
              <p className="mt-2 text-sm leading-7 text-[#6f5e51]">
                {officialStatusLoading && '正在从服务端读取 AI_OFFICIAL_* 配置。'}
                {!officialStatusLoading && officialConfigured === true && '可以直接回到对话面板开始批注。'}
                {!officialStatusLoading && officialConfigured === false && '请先在服务端环境变量中配置官方接口。'}
                {!officialStatusLoading && officialConfigured === null && '请点击上方按钮重新检查。'}
              </p>
            </div>

            {officialStatusError ? (
              <div className="mt-4 rounded-[20px] border border-red-200 bg-[#fff6f2] p-4 text-sm text-red-700">
                {officialStatusError}
              </div>
            ) : null}

            {officialMeta ? (
              <div className="mt-4 rounded-[22px] border border-[rgba(117,76,40,0.14)] bg-white/78 p-4">
                <div className="text-[10px] uppercase tracking-[0.28em] text-[#8a6239]">服务端指向</div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[18px] border border-[rgba(117,76,40,0.12)] bg-[rgba(255,250,242,0.72)] px-3 py-3">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-[#8a6239]">Host</div>
                    <div className="mt-1 text-sm font-medium text-[#2f2118]">
                      {officialMeta.baseURLHost ?? '未识别'}
                    </div>
                  </div>
                  <div className="rounded-[18px] border border-[rgba(117,76,40,0.12)] bg-[rgba(255,250,242,0.72)] px-3 py-3">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-[#8a6239]">Model</div>
                    <div className="mt-1 text-sm font-medium text-[#2f2118]">
                      {officialMeta.model ?? '未识别'}
                    </div>
                  </div>
                </div>

                {officialMeta.thirdPartyHost ? (
                  <div className="mt-3 rounded-[18px] border border-amber-300 bg-amber-50/90 px-3.5 py-3 text-sm leading-6 text-amber-900">
                    当前“官方模式”实际指向第三方兼容网关，而不是模型厂商官方域名。若返回内容异常、跑偏或拒答，优先检查服务端环境变量中的 `AI_OFFICIAL_BASE_URL` 与 `AI_OFFICIAL_MODEL`。
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="mt-4 rounded-[22px] border border-emerald-200 bg-emerald-50/80 p-4 text-sm leading-7 text-emerald-800">
              官方模式下，`baseURL`、`API Key` 与 `model` 都由服务端读取，不会出现在浏览器请求体里。
            </div>
          </section>
        ) : (
          <>
            <section className={sectionClass}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.28em] text-[#8a6239]">配置列表</div>
                  <div className="mt-1 text-sm font-semibold text-[#2f2118]">已保存配置</div>
                </div>
                <button type="button" onClick={handleAddNew} className={subtleButtonClass}>
                  新增配置
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {configs.map((config) => (
                  <div
                    key={config.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSwitchConfig(config.id)}
                    onKeyDown={(event) => handleConfigKeyDown(event, config.id)}
                    className={cx(
                      'rounded-[22px] border p-3 transition-all',
                      activeConfigId === config.id
                        ? 'border-[#4a2d19]/20 bg-[linear-gradient(180deg,rgba(255,251,243,0.96),rgba(249,240,227,0.92))] shadow-[0_18px_28px_-24px_rgba(74,45,25,0.28)]'
                        : 'border-[rgba(117,76,40,0.14)] bg-white/78 hover:border-[#a27140] hover:bg-[#fff7ed]'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {config.isDefault ? (
                            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] text-amber-800">
                              默认
                            </span>
                          ) : null}
                          {activeConfigId === config.id ? (
                            <span className="rounded-full border border-stone-200 bg-stone-100 px-2 py-0.5 text-[11px] text-stone-700">
                              当前
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-2 text-sm font-semibold text-[#2f2118]">{config.name}</div>
                        <div className="mt-1 text-xs text-[#7b6b5f]">{providerLabels[config.provider]}</div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        {!config.isDefault ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleSetDefault(config.id);
                            }}
                            className="text-xs text-[#8a6239] transition hover:text-[#5b4430]"
                          >
                            设为默认
                          </button>
                        ) : null}

                        {configs.length > 1 ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDelete(config.id);
                            }}
                            className="text-xs text-red-500 transition hover:text-red-700"
                          >
                            删除
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}

                {configs.length === 0 && !isAddingNew ? (
                  <div className="rounded-[20px] border border-dashed border-[rgba(117,76,40,0.2)] bg-white/60 px-4 py-6 text-center text-sm text-[#7b6b5f]">
                    还没有自定义配置，先新增一个再填写接口参数。
                  </div>
                ) : null}
              </div>
            </section>

            {editingConfig ? (
              <section className={sectionClass}>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.28em] text-[#8a6239]">配置编辑</div>
                  <div className="mt-1 text-sm font-semibold text-[#2f2118]">配置详情</div>
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-[#8a6239]">配置名称</label>
                    <input
                      type="text"
                      value={editingConfig.name}
                      onChange={(event) => setEditingConfig({ ...editingConfig, name: event.target.value })}
                      placeholder="例如：我的工作模型"
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-[#8a6239]">Provider</label>
                    <select
                      value={editingConfig.provider}
                      onChange={(event) => handleProviderChange(event.target.value as AIProvider)}
                      className={fieldClass}
                    >
                      {Object.entries(providerLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-xs leading-6 text-[#7b6b5f]">{providerDescriptions[editingConfig.provider]}</p>
                  </div>

                  <div className="grid gap-4">
                    <div>
                      <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-[#8a6239]">
                        API Key <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={editingConfig.apiKey}
                        onChange={(event) => {
                          setEditingConfig({ ...editingConfig, apiKey: event.target.value });
                          setTestResult(null);
                        }}
                        placeholder="请输入 API Key"
                        className={fieldClass}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-[#8a6239]">
                        API 地址 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingConfig.baseURL}
                        onChange={(event) => {
                          setEditingConfig({ ...editingConfig, baseURL: event.target.value });
                          setTestResult(null);
                        }}
                        placeholder="https://api.example.com/v1"
                        className={fieldClass}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-[#8a6239]">
                        模型名称 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingConfig.model}
                        onChange={(event) => {
                          setEditingConfig({ ...editingConfig, model: event.target.value });
                          setTestResult(null);
                        }}
                        placeholder="例如：gpt-4o"
                        className={fieldClass}
                      />
                    </div>
                  </div>

                  <details className="group rounded-[22px] border border-[rgba(117,76,40,0.14)] bg-white/72 p-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.24em] text-[#8a6239]">Advanced</div>
                        <div className="mt-1 text-sm font-semibold text-[#2f2118]">高级设置</div>
                      </div>
                      <svg
                        className="h-4 w-4 text-[#8a6239] transition-transform group-open:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-[#8a6239]">Temperature</label>
                        <input
                          type="number"
                          min="0"
                          max="2"
                          step="0.1"
                          value={editingConfig.temperature ?? DEFAULT_AI_TEMPERATURE}
                          onChange={(event) =>
                            setEditingConfig({
                              ...editingConfig,
                              temperature: Number.parseFloat(event.target.value),
                            })
                          }
                          className={fieldClass}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-[#8a6239]">Max Tokens</label>
                        <input
                          type="number"
                          min="100"
                          max={String(AI_PROVIDER_MAX_TOKENS[editingConfig.provider])}
                          step="100"
                          value={editingConfig.maxTokens ?? DEFAULT_AI_MAX_TOKENS}
                          onChange={(event) =>
                            setEditingConfig({
                              ...editingConfig,
                              maxTokens: Number.parseInt(event.target.value, 10),
                            })
                          }
                          className={fieldClass}
                        />
                      </div>
                    </div>
                  </details>

                  <div className="rounded-[22px] border border-amber-200 bg-amber-50/70 p-4 text-sm leading-7 text-amber-900">
                    自定义模式会使用你填写的接口信息直接发起请求。若你更看重密钥安全，优先使用官方托管模式。
                  </div>
                </div>
              </section>
            ) : null}
          </>
        )}

        {testResult ? (
          <div
            className={cx(
              'rounded-[22px] border p-4 text-sm',
              testResult.success
                ? 'border-emerald-200 bg-emerald-50/80 text-emerald-800'
                : 'border-red-200 bg-[#fff6f2] text-red-700'
            )}
          >
            {testResult.message}
          </div>
        ) : null}
      </div>

      <div className="border-t border-[rgba(117,76,40,0.14)] bg-[linear-gradient(180deg,rgba(255,250,245,0.92),rgba(246,239,229,0.96))] px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={onClose} className={subtleButtonClass}>
              返回对话
            </button>
            <button
              type="button"
              onClick={handleTest}
              disabled={testing || (configMode === 'custom' && !editingConfig)}
              className={subtleButtonClass}
            >
              {testing ? '测试中…' : '测试连接'}
            </button>
          </div>

          {configMode === 'custom' ? (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !canSaveCustom}
              className={primaryButtonClass}
            >
              {saving ? '保存中…' : '保存配置'}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
