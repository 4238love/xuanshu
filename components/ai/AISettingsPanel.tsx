'use client';

import { useState, useEffect } from 'react';
import {
  AIProvider,
  AIConfig,
  AIProviderBaseURLs,
  AIProviderDefaultModels,
} from '@/types/ai';
import {
  getAIConfig,
  getAllConfigs,
  addConfig,
  updateConfig,
  deleteConfig,
  setActiveConfig,
  setDefaultConfig,
  testAPIConnection,
} from '@/lib/ai/config';

interface AISettingsPanelProps {
  onClose: () => void;
  onSave?: () => void; // 保存成功后的回调
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

export default function AISettingsPanel({ onClose, onSave }: AISettingsPanelProps) {
  const [configs, setConfigs] = useState<AIConfig[]>([]);
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [editingConfig, setEditingConfig] = useState<AIConfig | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // 加载配置列表
  useEffect(() => {
    const allConfigs = getAllConfigs();
    const currentConfig = getAIConfig();
    setConfigs(allConfigs);
    setActiveConfigId(currentConfig.id);
    setEditingConfig(currentConfig);
  }, []);

  // 当provider变化时，自动更新baseURL和model
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

  // 保存当前编辑的配置
  const handleSave = async () => {
    if (!editingConfig) return;
    setSaving(true);

    try {
      if (isAddingNew) {
        addConfig(editingConfig);
        setIsAddingNew(false);
      } else {
        updateConfig(editingConfig.id, editingConfig);
      }
      // 刷新列表
      const allConfigs = getAllConfigs();
      setConfigs(allConfigs);
      // 调用保存成功回调
      if (onSave) {
        onSave();
      }
    } finally {
      setSaving(false);
    }
  };

  // 测试连接
  const handleTest = async () => {
    if (!editingConfig) return;
    setTesting(true);
    setTestResult(null);

    try {
      const result = await testAPIConnection(editingConfig);
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

  // 切换激活的配置
  const handleSwitchConfig = (id: string) => {
    setActiveConfigId(id);
    setActiveConfig(id);
    const config = configs.find(c => c.id === id);
    if (config) {
      setEditingConfig(config);
    }
    setIsAddingNew(false);
    setTestResult(null);
  };

  // 删除配置
  const handleDelete = (id: string) => {
    if (configs.length <= 1) {
      alert('至少需要保留一个配置');
      return;
    }
    if (confirm('确定要删除这个配置吗？')) {
      deleteConfig(id);
      const allConfigs = getAllConfigs();
      setConfigs(allConfigs);
      if (activeConfigId === id) {
        const newActive = allConfigs[0];
        setActiveConfigId(newActive.id);
        setEditingConfig(newActive);
      }
    }
  };

  // 设置默认配置
  const handleSetDefault = (id: string) => {
    setDefaultConfig(id);
    const allConfigs = getAllConfigs();
    setConfigs(allConfigs);
  };

  // 新增配置
  const handleAddNew = () => {
    setEditingConfig({
      id: '',
      name: `配置 ${configs.length + 1}`,
      provider: 'custom',
      baseURL: '',
      apiKey: '',
      model: '',
      temperature: 0.7,
      maxTokens: 2000,
    });
    setIsAddingNew(true);
    setTestResult(null);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 配置列表 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">API配置</label>
            <button
              onClick={handleAddNew}
              className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              添加配置
            </button>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {configs.map((config) => (
              <div
                key={config.id}
                className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                  activeConfigId === config.id
                    ? 'border-purple-300 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleSwitchConfig(config.id)}
              >
                <div className="flex items-center gap-2">
                  {config.isDefault && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">默认</span>
                  )}
                  <span className="text-sm font-medium text-gray-800">{config.name}</span>
                  <span className="text-xs text-gray-500">({providerLabels[config.provider]})</span>
                </div>
                <div className="flex items-center gap-1">
                  {!config.isDefault && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetDefault(config.id);
                      }}
                      className="text-xs text-gray-400 hover:text-gray-600 px-1"
                      title="设为默认"
                    >
                      默认
                    </button>
                  )}
                  {configs.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(config.id);
                      }}
                      className="text-xs text-red-400 hover:text-red-600 px-1"
                      title="删除"
                    >
                      删除
                    </button>
                  )}
                </div>
              </div>
            ))}
            {configs.length === 0 && !isAddingNew && (
              <div className="text-center text-gray-400 py-4 text-sm">
                暂无配置，请添加
              </div>
            )}
          </div>
        </div>

        {editingConfig && (
          <>
            {/* 配置名称 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                配置名称
              </label>
              <input
                type="text"
                value={editingConfig.name}
                onChange={(e) => setEditingConfig({ ...editingConfig, name: e.target.value })}
                placeholder="例如：我的OpenAI"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              />
            </div>

            {/* Provider选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Provider
              </label>
              <select
                value={editingConfig.provider}
                onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              >
                {Object.entries(providerLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {providerDescriptions[editingConfig.provider]}
              </p>
            </div>

            {/* API Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={editingConfig.apiKey}
                onChange={(e) => {
                  setEditingConfig({ ...editingConfig, apiKey: e.target.value });
                  setTestResult(null);
                }}
                placeholder="请输入API Key"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              />
            </div>

            {/* Base URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              />
            </div>

            {/* Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                模型名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editingConfig.model}
                onChange={(e) => {
                  setEditingConfig({ ...editingConfig, model: e.target.value });
                  setTestResult(null);
                }}
                placeholder="例如: gpt-4o"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              />
            </div>

            {/* 高级设置 */}
            <details className="group">
              <summary className="text-sm font-medium text-gray-700 cursor-pointer list-none flex items-center gap-1">
                <svg
                  className="w-4 h-4 transition-transform group-open:rotate-90"
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
                  <label className="block text-xs text-gray-500 mb-1">Temperature (0-2)</label>
                  <input
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={editingConfig.temperature ?? 0.7}
                    onChange={(e) => setEditingConfig({ ...editingConfig, temperature: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Max Tokens</label>
                  <input
                    type="number"
                    min="100"
                    max="32000"
                    step="100"
                    value={editingConfig.maxTokens ?? 2000}
                    onChange={(e) => setEditingConfig({ ...editingConfig, maxTokens: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>
            </details>

            {/* 测试结果 */}
            {testResult && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  testResult.success
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {testResult.success ? (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {testResult.message}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {testResult.message}
                  </div>
                )}
              </div>
            )}

            {/* 说明 */}
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>提示：</strong> 您需要自行注册对应AI服务商账号并获取API Key。
                所有API请求都在您的浏览器中直接发送到AI服务商，不经过我们的服务器。
              </p>
            </div>
          </>
        )}
      </div>

      {/* 底部按钮 */}
      {editingConfig && (
        <div className="border-t border-gray-100 p-3 bg-gray-50 flex gap-2">
          <button
            onClick={() => {
              if (isAddingNew) {
                setIsAddingNew(false);
                const current = getAIConfig();
                setEditingConfig(current);
              } else {
                // 重置为当前保存的配置
                const config = configs.find(c => c.id === activeConfigId);
                if (config) setEditingConfig(config);
              }
            }}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            取消
          </button>
          <button
            onClick={handleTest}
            disabled={testing || !editingConfig.apiKey || !editingConfig.model}
            className="px-3 py-2 text-sm text-purple-600 hover:text-purple-700 disabled:opacity-50"
          >
            {testing ? '测试中...' : '测试连接'}
          </button>
          <div className="flex-1" />
          <button
            onClick={handleSave}
            disabled={saving || !editingConfig.apiKey || !editingConfig.model}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      )}
    </div>
  );
}
