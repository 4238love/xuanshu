'use client';

import { useEffect, useState } from 'react';
import {
  AIConfig,
  AIConfigMode,
  AIProvider,
  AIProviderBaseURLs,
  AIProviderDefaultModels,
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

const providerLabels: Record<AIProvider, string> = {
  openai: 'OpenAI',
  claude: 'Anthropic Claude',
  qianfan: '百度文心一言',
  dashscope: '阿里通义千问',
  hunyuan: '腾讯混元',
  moonshot: '月之暗面 (Moonshot)',
  zhipu: '智谱AI',
  minimax: 'MiniMax',
  custom: '自定义 API',
};

const providerDescriptions: Record<AIProvider, string> = {
  openai: 'GPT-4o, GPT-4 Turbo 等',
  claude: 'Claude Sonnet, Claude Haiku 等',
  qianfan: 'ERNIE-4.0, ERNIE-3.5 等',
  dashscope: 'Qwen-Turbo, Qwen-Max 等',
  hunyuan: 'Hunyuan-Pro, Hunyuan 等',
  moonshot: 'Moonshot-V1 系列',
  zhipu: 'GLM-4, GLM-3-Turbo 等',
  minimax: 'Abab6 系列',
  custom: '兼容 OpenAI 格式的 API',
};

function createDraftConfig(index: number): AIConfig {
  return {
    id: '',
    name: `配置 ${index}`,
    provider: 'custom',
    baseURL: '',
    apiKey: '',
    model: '',
    temperature: 0.7,
    maxTokens: 2000,
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
  const [officialStatusError, setOfficialStatusError] = useState<string | null>(null);
  const [officialStatusLoading, setOfficialStatusLoading] = useState(false);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const refreshCustomState = () => {
    const allConfigs = getAllConfigs();
    const currentConfig = getAIConfig();

    setConfigs(allConfigs);
    setActiveConfigId(currentConfig.id);
    setEditingConfig(currentConfig);
  };

  const loadOfficialStatus = async () => {
    setOfficialStatusLoading(true);
    setOfficialStatusError(null);

    try {
      const response = await fetch('/api/ai', { method: 'GET' });
      if (!response.ok) {
        throw new Error(`读取官方 API 状态失败: ${response.status}`);
      }
      const data = (await response.json()) as { officialConfigured?: boolean };
      const isConfigured = Boolean(data.officialConfigured);
      setOfficialConfigured(isConfigured);

      // 兼容场景：若官方未配置，自动降级到自定义模式
      if (!isConfigured && getAIConfigMode() === 'official') {
        setAIConfigMode('custom');
        setConfigModeState('custom');
        onSave?.();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '读取官方 API 状态失败';
      setOfficialConfigured(false);
      setOfficialStatusError(message);
    } finally {
      setOfficialStatusLoading(false);
    }
  };

  useEffect(() => {
    setConfigModeState(getAIConfigMode());
    refreshCustomState();
    void loadOfficialStatus();
  }, []);

  const handleModeChange = (mode: AIConfigMode) => {
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

  const handleDelete = (id: string) => {
    if (configs.length <= 1) {
      alert('至少需要保留一个自定义配置');
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
        addConfig(toCreatableConfig(editingConfig));
        setIsAddingNew(false);
      } else {
        const updated = updateConfig(editingConfig.id, editingConfig);
        if (!updated) {
          addConfig(toCreatableConfig(editingConfig));
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
      setTestResult({ success: false, message: '请先创建或选择一个自定义配置' });
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
      editingConfig &&
      editingConfig.apiKey.trim() &&
      editingConfig.baseURL.trim() &&
      editingConfig.model.trim()
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">API 使用模式</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleModeChange('official')}
              className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                configMode === 'official'
                  ? 'border-green-300 bg-green-50 text-green-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium">官方 API</div>
              <div className="text-xs opacity-80">后台托管，无需前端填写密钥</div>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('custom')}
              className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                configMode === 'custom'
                  ? 'border-purple-300 bg-purple-50 text-purple-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium">自定义 API</div>
              <div className="text-xs opacity-80">自填 baseURL / key / model</div>
            </button>
          </div>
        </div>

        {configMode === 'official' ? (
          <div className="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-green-800">官方 API 状态</div>
              <button
                type="button"
                onClick={() => void loadOfficialStatus()}
                className="text-xs text-green-700 underline underline-offset-2 hover:text-green-800"
              >
                刷新状态
              </button>
            </div>

            <div className="text-sm text-green-700">
              {officialStatusLoading && '正在读取后台配置状态...'}
              {!officialStatusLoading && officialConfigured === true && '已配置，可直接使用。'}
              {!officialStatusLoading && officialConfigured === false && '未配置，请在服务端环境变量中设置官方 API。'}
              {!officialStatusLoading && officialConfigured === null && '状态未知，请点击“刷新状态”。'}
            </div>

            {officialStatusError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                {officialStatusError}
              </div>
            )}

            <div className="rounded-lg border border-green-200 bg-white p-3 text-xs text-green-800">
              官方模式下，`baseURL`、`apiKey`、`model` 均由后端读取，不会展示在前端界面，也不会出现在浏览器请求体中。
            </div>
          </div>
        ) : (
          <>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">自定义配置列表</label>
                <button
                  type="button"
                  onClick={handleAddNew}
                  className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  添加配置
                </button>
              </div>
              <div className="max-h-32 space-y-2 overflow-y-auto">
                {configs.map((config) => (
                  <div
                    key={config.id}
                    className={`flex cursor-pointer items-center justify-between rounded-lg border p-2 transition-colors ${
                      activeConfigId === config.id
                        ? 'border-purple-300 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSwitchConfig(config.id)}
                  >
                    <div className="flex items-center gap-2">
                      {config.isDefault && (
                        <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-xs text-yellow-700">默认</span>
                      )}
                      <span className="text-sm font-medium text-gray-800">{config.name}</span>
                      <span className="text-xs text-gray-500">({providerLabels[config.provider]})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {!config.isDefault && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetDefault(config.id);
                          }}
                          className="px-1 text-xs text-gray-400 hover:text-gray-600"
                          title="设为默认"
                        >
                          默认
                        </button>
                      )}
                      {configs.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(config.id);
                          }}
                          className="px-1 text-xs text-red-400 hover:text-red-600"
                          title="删除"
                        >
                          删除
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {configs.length === 0 && !isAddingNew && (
                  <div className="py-4 text-center text-sm text-gray-400">暂无自定义配置，请先添加</div>
                )}
              </div>
            </div>

            {editingConfig && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">配置名称</label>
                  <input
                    type="text"
                    value={editingConfig.name}
                    onChange={(e) => setEditingConfig({ ...editingConfig, name: e.target.value })}
                    placeholder="例如：我的自定义 API"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Provider</label>
                  <select
                    value={editingConfig.provider}
                    onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  >
                    {Object.entries(providerLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">{providerDescriptions[editingConfig.provider]}</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    API Key <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={editingConfig.apiKey}
                    onChange={(e) => {
                      setEditingConfig({ ...editingConfig, apiKey: e.target.value });
                      setTestResult(null);
                    }}
                    placeholder="请输入 API Key"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    API 地址 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingConfig.baseURL}
                    onChange={(e) => {
                      setEditingConfig({ ...editingConfig, baseURL: e.target.value });
                      setTestResult(null);
                    }}
                    placeholder="https://api.example.com/v1"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    模型名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingConfig.model}
                    onChange={(e) => {
                      setEditingConfig({ ...editingConfig, model: e.target.value });
                      setTestResult(null);
                    }}
                    placeholder="例如：gpt-4o"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center gap-1 text-sm font-medium text-gray-700">
                    <svg
                      className="h-4 w-4 transition-transform group-open:rotate-90"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    高级设置
                  </summary>
                  <div className="mt-3 space-y-3 pl-2">
                    <div>
                      <label className="mb-1 block text-xs text-gray-500">Temperature (0-2)</label>
                      <input
                        type="number"
                        min="0"
                        max="2"
                        step="0.1"
                        value={editingConfig.temperature ?? 0.7}
                        onChange={(e) =>
                          setEditingConfig({
                            ...editingConfig,
                            temperature: Number.parseFloat(e.target.value),
                          })
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-gray-500">Max Tokens</label>
                      <input
                        type="number"
                        min="100"
                        max="32000"
                        step="100"
                        value={editingConfig.maxTokens ?? 2000}
                        onChange={(e) =>
                          setEditingConfig({
                            ...editingConfig,
                            maxTokens: Number.parseInt(e.target.value, 10),
                          })
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </details>

                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="text-xs text-blue-700">
                    <strong>提示：</strong> 自定义模式会使用你填写的 API 信息发起请求。官方模式则完全走后端托管配置。
                  </p>
                </div>
              </>
            )}
          </>
        )}

        {testResult && (
          <div
            className={`rounded-lg border p-3 text-sm ${
              testResult.success
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {testResult.message}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 border-t border-gray-100 bg-gray-50 p-3">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          返回聊天
        </button>
        <button
          type="button"
          onClick={handleTest}
          disabled={testing || (configMode === 'custom' && !editingConfig)}
          className="px-3 py-2 text-sm text-purple-600 hover:text-purple-700 disabled:opacity-50"
        >
          {testing ? '测试中...' : '测试连接'}
        </button>
        <div className="flex-1" />
        {configMode === 'custom' && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !canSaveCustom}
            className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存自定义配置'}
          </button>
        )}
      </div>
    </div>
  );
}
