'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createLiuYaoPaiPan } from '@/lib/liuyao';
import { LiuYaoSettings, LiuYaoResult } from '@/types';
import { Card, InfoCard, Input, RadioGroup, Button, Badge } from '@/components/ui';
import { AIAssistant } from '@/components/ai';

// 神煞配置类型
interface ShenShaConfig {
  [key: string]: boolean;
}

// 所有神煞列表
const ALL_SHEN_SHA = {
  吉神: ['天乙贵人', '太极贵人', '文昌贵人', '福星贵人', '天厨贵人', '月德贵人', '天德贵人', '天元禄', '将星', '天喜', '天医', '谋星', '皇恩', '唐符国印', '天马'],
  凶神: ['劫煞', '灾煞', '阳刃', '飞刃'],
  半吉半凶: ['华盖', '咸池'],
  动星: ['驿马']
};

export default function LiuYaoPage() {
  const [settings, setSettings] = useState<LiuYaoSettings>({
    name: '',
    occupy: '',
    sex: 1,
    date: '2024-01-01 00:00:00',
    dateType: 0,
    paiPanType: 1, // 默认自动起卦
    manualYaoShu: [0, 0, 0, 0, 0, 0], // 默认全部少阳
  });

  const [result, setResult] = useState<LiuYaoResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedYao, setExpandedYao] = useState<number | null>(null);
  const [showShenShaConfig, setShowShenShaConfig] = useState(false);
  const [shenShaConfig, setShenShaConfig] = useState<ShenShaConfig>(() => {
    // 从localStorage加载配置
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('liuyao_shensha_config');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    // 默认所有神煞都显示
    const defaultConfig: ShenShaConfig = {};
    Object.values(ALL_SHEN_SHA).flat().forEach(sha => {
      defaultConfig[sha] = true;
    });
    return defaultConfig;
  });

  // 保存配置到localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('liuyao_shensha_config', JSON.stringify(shenShaConfig));
    }
  }, [shenShaConfig]);

  // 过滤神煞
  const filterShenSha = (shenShaList: string[]) => {
    return shenShaList.filter(sha => shenShaConfig[sha] !== false);
  };

  // 切换单个神煞
  const toggleShenSha = (sha: string) => {
    setShenShaConfig(prev => ({
      ...prev,
      [sha]: !prev[sha]
    }));
  };

  // 批量切换某类神煞
  const toggleCategory = (category: keyof typeof ALL_SHEN_SHA, enabled: boolean) => {
    setShenShaConfig(prev => {
      const newConfig = { ...prev };
      ALL_SHEN_SHA[category].forEach(sha => {
        newConfig[sha] = enabled;
      });
      return newConfig;
    });
  };

  // 重置配置
  const resetConfig = () => {
    const defaultConfig: ShenShaConfig = {};
    Object.values(ALL_SHEN_SHA).flat().forEach(sha => {
      defaultConfig[sha] = true;
    });
    setShenShaConfig(defaultConfig);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const paiPanResult = createLiuYaoPaiPan(settings);
      setResult(paiPanResult);
    } catch (error) {
      console.error('排盘失败:', error);
      alert('排盘失败，请检查输入信息');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* 头部 */}
      <header className="border-b border-blue-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="text-3xl">☷</div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  六爻排盘
                </h1>
                <p className="text-xs text-gray-500">六爻占卜 · 预测吉凶</p>
              </div>
            </Link>
            <Link
              href="/"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg transition-all"
            >
              返回首页
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 输入表单 */}
          <Card title="输入信息" icon="📝" className="mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 姓名 */}
                <Input
                  label="姓名（可选）"
                  type="text"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  placeholder="请输入姓名"
                  fullWidth
                />

                {/* 占事 */}
                <Input
                  label="占事（必填）"
                  type="text"
                  value={settings.occupy}
                  onChange={(e) => setSettings({ ...settings, occupy: e.target.value })}
                  placeholder="请输入占事内容"
                  required
                  fullWidth
                />

                {/* 性别 */}
                <RadioGroup
                  label="性别"
                  name="sex"
                  options={[
                    { label: '男', value: 1 },
                    { label: '女', value: 0 }
                  ]}
                  value={settings.sex}
                  onChange={(value) => setSettings({ ...settings, sex: value })}
                />

                {/* 日期类型 */}
                <RadioGroup
                  label="日期类型"
                  name="dateType"
                  options={[
                    { label: '公历', value: 0 },
                    { label: '农历', value: 1 }
                  ]}
                  value={settings.dateType}
                  onChange={(value) => setSettings({ ...settings, dateType: value })}
                />
              </div>

              {/* 起卦模式 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  起卦模式
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: 1, label: '自动起卦', desc: '随机生成' },
                    { value: 0, label: '日期起卦', desc: '根据时间' },
                    { value: 2, label: '手动起卦', desc: '自定义爻数' }
                  ].map((mode) => (
                    <label
                      key={mode.value}
                      className={`flex items-center gap-2 cursor-pointer p-4 border-2 rounded-lg transition-all hover:border-blue-300 ${
                        settings.paiPanType === mode.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        value={mode.value}
                        checked={settings.paiPanType === mode.value}
                        onChange={() => setSettings({ ...settings, paiPanType: mode.value as 0 | 1 | 2 })}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <div className="font-medium">{mode.label}</div>
                        <div className="text-xs text-gray-500">{mode.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* 手动起卦输入 */}
              {settings.paiPanType === 2 && (
                <div className="p-6 bg-blue-50 rounded-xl">
                  <h3 className="text-sm font-medium text-gray-700 mb-4">手动输入六爻</h3>
                  <div className="grid grid-cols-6 gap-3">
                    {['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'].map((yaoName, index) => (
                      <div key={index}>
                        <label className="block text-xs text-gray-600 mb-2 text-center">{yaoName}</label>
                        <select
                          value={settings.manualYaoShu?.[index] ?? 0}
                          onChange={(e) => {
                            const newManualYaoShu = [...(settings.manualYaoShu || [0, 0, 0, 0, 0, 0])];
                            newManualYaoShu[index] = parseInt(e.target.value);
                            setSettings({ ...settings, manualYaoShu: newManualYaoShu });
                          }}
                          className="w-full px-2 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value={0}>少阳 —</option>
                          <option value={1}>少阴 - -</option>
                          <option value={2}>老阳 ○</option>
                          <option value={3}>老阴 ×</option>
                        </select>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-gray-500">
                    💡 提示：少阳/少阴为不动爻，老阳/老阴为动爻（会变化）
                  </p>
                </div>
              )}

              {/* 日期时间 */}
              <Input
                label="起卦日期时间"
                type="text"
                value={settings.date}
                onChange={(e) => setSettings({ ...settings, date: e.target.value })}
                placeholder="格式：2024-01-01 00:00:00"
                helperText="格式：年-月-日 时:分:秒（例如：2024-01-01 08:30:00）"
                fullWidth
              />

              {/* 提交按钮 */}
              <Button
                type="submit"
                loading={loading}
                fullWidth
                size="lg"
                gradient="from-blue-500 to-cyan-500"
              >
                {loading ? '起卦中...' : '开始起卦'}
              </Button>
            </form>
          </Card>

          {/* 排盘结果 */}
          {result && (
            <div className="space-y-8">
              {/* 基础信息 */}
              <Card title="卦象结果" icon="☯">
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">基础信息</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    {result.name && (
                      <div>
                        <span className="text-gray-600">姓名：</span>
                        <span className="font-medium">{result.name}</span>
                      </div>
                    )}
                    {result.occupy && (
                      <div>
                        <span className="text-gray-600">占事：</span>
                        <span className="font-medium">{result.occupy}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">公历：</span>
                      <span className="font-medium">{result.solar}</span>
                    </div>
                    <div className="col-span-2 md:col-span-3">
                      <span className="text-gray-600">农历：</span>
                      <span className="font-medium">{result.lunar}</span>
                    </div>
                  </div>
                </div>

                {/* 卦象展示 - 传统纳甲风格 */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">卦象</h3>

                  {/* 本卦与变卦并排 - 传统卦盘样式 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* 本卦 */}
                    <div className="relative">
                      {/* 传统八卦边框装饰 */}
                      <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 rounded-2xl opacity-30"></div>
                      <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 p-6">
                        <div className="text-center mb-4">
                          <span className="inline-block px-4 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-bold rounded-full shadow-md">
                            本卦
                          </span>
                        </div>

                        {/* 卦名与卦象 */}
                        <div className="text-center mb-6">
                          <div className="text-5xl mb-2 text-blue-600">{result.benGuaAs}</div>
                          <div className="text-2xl font-bold text-gray-800">{result.benGua}</div>
                          <div className="text-sm text-gray-500 mt-1">{result.benGuaType} · 卦身{result.benGuaShen}</div>
                        </div>

                        {/* 六爻从下往上展示 - 传统竖排样式 */}
                        <div className="space-y-2">
                          {[5, 4, 3, 2, 1, 0].map((index) => (
                            <div
                              key={`ben-${index}`}
                              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                                result.liuYao.benGua.shiYing[index]
                                  ? result.liuYao.benGua.shiYing[index] === '世'
                                    ? 'bg-amber-50 border-amber-400 shadow-sm'
                                    : 'bg-green-50 border-green-400 shadow-sm'
                                  : 'bg-white border-gray-200'
                              }`}
                            >
                              {/* 左侧：爻位和符号 */}
                              <div className="flex items-center gap-3">
                                <div className="text-xs text-gray-500 w-8">
                                  {index === 5 ? '上九' : index === 4 ? '九五' : index === 3 ? '九四' : index === 2 ? '九三' : index === 1 ? '九二' : '初九'}
                                </div>
                                <div className={`text-2xl font-bold tracking-widest ${
                                  result.liuYao.benGua.yaoAs[index] === '—' ? 'text-blue-600' : 'text-red-500'
                                }`}>
                                  {result.liuYao.benGua.yaoAs[index]}
                                  {result.liuYao.benGua.yaoAsMark[index] && (
                                    <span className="text-red-600 ml-1">{result.liuYao.benGua.yaoAsMark[index]}</span>
                                  )}
                                </div>
                              </div>

                              {/* 中间：纳甲干支和六亲 */}
                              <div className="flex-1 text-center">
                                <div className="text-sm font-bold text-gray-700">
                                  {result.liuYao.benGua.ganZhi[index]}
                                </div>
                                <div className={`text-xs mt-0.5 px-2 py-0.5 rounded-full inline-block ${
                                  result.liuYao.benGua.liuQin[index] === '父母' ? 'bg-blue-100 text-blue-700' :
                                  result.liuYao.benGua.liuQin[index] === '兄弟' ? 'bg-gray-100 text-gray-700' :
                                  result.liuYao.benGua.liuQin[index] === '子孙' ? 'bg-green-100 text-green-700' :
                                  result.liuYao.benGua.liuQin[index] === '妻财' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {result.liuYao.benGua.liuQin[index]}
                                </div>
                              </div>

                              {/* 右侧：六神和世应 */}
                              <div className="flex items-center gap-2">
                                <div className={`text-xs px-2 py-1 rounded ${
                                  result.liuYao.benGua.liuShen[index] === '青龙' ? 'bg-green-100 text-green-700' :
                                  result.liuYao.benGua.liuShen[index] === '朱雀' ? 'bg-red-100 text-red-700' :
                                  result.liuYao.benGua.liuShen[index] === '勾陈' ? 'bg-amber-100 text-amber-700' :
                                  result.liuYao.benGua.liuShen[index] === '螣蛇' ? 'bg-purple-100 text-purple-700' :
                                  result.liuYao.benGua.liuShen[index] === '白虎' ? 'bg-white text-gray-700 border border-gray-300' :
                                  'bg-cyan-100 text-cyan-700'
                                }`}>
                                  {result.liuYao.benGua.liuShen[index]}
                                </div>
                                {result.liuYao.benGua.shiYing[index] && (
                                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                                    result.liuYao.benGua.shiYing[index] === '世'
                                      ? 'bg-amber-500 text-white'
                                      : 'bg-green-500 text-white'
                                  }`}>
                                    {result.liuYao.benGua.shiYing[index]}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 变卦 */}
                    <div className="relative">
                      <div className="absolute -inset-2 bg-gradient-to-r from-orange-600 via-red-500 to-pink-500 rounded-2xl opacity-30"></div>
                      <div className="relative bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border-2 border-orange-200 p-6">
                        <div className="text-center mb-4">
                          <span className="inline-block px-4 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold rounded-full shadow-md">
                            变卦
                          </span>
                        </div>

                        {/* 卦名与卦象 */}
                        <div className="text-center mb-6">
                          <div className="text-5xl mb-2 text-orange-600">{result.bianGuaAs}</div>
                          <div className="text-2xl font-bold text-gray-800">{result.bianGua}</div>
                          <div className="text-sm text-gray-500 mt-1">{result.bianGuaType} · 卦身{result.bianGuaShen}</div>
                        </div>

                        {/* 六爻从下往上展示 */}
                        <div className="space-y-2">
                          {[5, 4, 3, 2, 1, 0].map((index) => (
                            <div
                              key={`bian-${index}`}
                              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                                result.liuYao.bianGua.shiYing[index]
                                  ? result.liuYao.bianGua.shiYing[index] === '世'
                                    ? 'bg-amber-50 border-amber-400 shadow-sm'
                                    : 'bg-green-50 border-green-400 shadow-sm'
                                  : 'bg-white border-gray-200'
                              }`}
                            >
                              {/* 左侧：爻位和符号 */}
                              <div className="flex items-center gap-3">
                                <div className="text-xs text-gray-500 w-8">
                                  {index === 5 ? '上九' : index === 4 ? '九五' : index === 3 ? '九四' : index === 2 ? '九三' : index === 1 ? '九二' : '初九'}
                                </div>
                                <div className={`text-2xl font-bold tracking-widest ${
                                  result.liuYao.bianGua.yaoAs[index] === '—' ? 'text-orange-600' : 'text-red-500'
                                }`}>
                                  {result.liuYao.bianGua.yaoAs[index]}
                                </div>
                              </div>

                              {/* 中间：纳甲干支和六亲 */}
                              <div className="flex-1 text-center">
                                <div className="text-sm font-bold text-gray-700">
                                  {result.liuYao.bianGua.ganZhi[index]}
                                </div>
                                <div className={`text-xs mt-0.5 px-2 py-0.5 rounded-full inline-block ${
                                  result.liuYao.bianGua.liuQin[index] === '父母' ? 'bg-blue-100 text-blue-700' :
                                  result.liuYao.bianGua.liuQin[index] === '兄弟' ? 'bg-gray-100 text-gray-700' :
                                  result.liuYao.bianGua.liuQin[index] === '子孙' ? 'bg-green-100 text-green-700' :
                                  result.liuYao.bianGua.liuQin[index] === '妻财' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {result.liuYao.bianGua.liuQin[index]}
                                </div>
                              </div>

                              {/* 右侧：六神和世应 */}
                              <div className="flex items-center gap-2">
                                <div className={`text-xs px-2 py-1 rounded ${
                                  result.liuYao.bianGua.liuShen[index] === '青龙' ? 'bg-green-100 text-green-700' :
                                  result.liuYao.bianGua.liuShen[index] === '朱雀' ? 'bg-red-100 text-red-700' :
                                  result.liuYao.bianGua.liuShen[index] === '勾陈' ? 'bg-amber-100 text-amber-700' :
                                  result.liuYao.bianGua.liuShen[index] === '螣蛇' ? 'bg-purple-100 text-purple-700' :
                                  result.liuYao.bianGua.liuShen[index] === '白虎' ? 'bg-white text-gray-700 border border-gray-300' :
                                  'bg-cyan-100 text-cyan-700'
                                }`}>
                                  {result.liuYao.bianGua.liuShen[index]}
                                </div>
                                {result.liuYao.bianGua.shiYing[index] && (
                                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                                    result.liuYao.bianGua.shiYing[index] === '世'
                                      ? 'bg-amber-500 text-white'
                                      : 'bg-green-500 text-white'
                                  }`}>
                                    {result.liuYao.bianGua.shiYing[index]}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 变化卦象 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { name: '互卦', value: result.huGua, as: result.huGuaAs, color: 'from-green-500 to-emerald-500' },
                    { name: '错卦', value: result.cuoGua, as: result.cuoGuaAs, color: 'from-indigo-500 to-purple-500' },
                    { name: '综卦', value: result.zongGua, as: result.zongGuaAs, color: 'from-pink-500 to-rose-500' },
                    { name: '伏卦', value: result.fuGua, as: result.fuGuaAs, color: 'from-amber-500 to-yellow-500', shen: result.fuGua }
                  ].map((item) => (
                    <div key={item.name} className={`p-4 bg-gradient-to-br ${item.color} rounded-xl text-white text-center shadow-lg transform hover:scale-105 transition-transform`}>
                      <div className="text-sm mb-1 opacity-90">{item.name}</div>
                      <div className="text-3xl mb-1">{item.as}</div>
                      <div className="text-base font-bold">{item.value}</div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* 四柱干支信息 */}
              <Card title="四柱干支" icon="📅">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: '年柱', value: result.ganZhi.year, color: 'from-red-500 to-pink-500', shensha: filterShenSha(result.shenSha?.year || []) },
                    { name: '月柱', value: result.ganZhi.month, color: 'from-blue-500 to-cyan-500', shensha: filterShenSha(result.shenSha?.month || []) },
                    { name: '日柱', value: result.ganZhi.day, color: 'from-green-500 to-emerald-500', shensha: filterShenSha(result.shenSha?.day || []) },
                    { name: '时柱', value: result.ganZhi.hour, color: 'from-purple-500 to-indigo-500', shensha: filterShenSha(result.shenSha?.hour || []) }
                  ].map((item) => (
                    <div key={item.name} className={`p-6 bg-gradient-to-br ${item.color} rounded-xl text-white shadow-lg transform hover:scale-105 transition-transform`}>
                      <div className="text-sm mb-2 opacity-90">{item.name}</div>
                      <div className="text-3xl font-bold mb-3">{item.value}</div>
                      {item.shensha.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/30">
                          <div className="text-xs opacity-80 mb-2">神煞</div>
                          <div className="flex flex-wrap gap-1 justify-center">
                            {item.shensha.map((sha, idx) => (
                              <Badge key={idx} size="sm" className="bg-white/20 backdrop-blur-sm text-white border-0">
                                {sha}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* 节气和辅助信息 */}
              <Card title="节气与辅助信息" icon="🌸">
                {/* 节气信息 */}
                {result.jieQi && (
                  <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="text-xl">🌿</span>
                      节气信息
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <InfoCard label="上一节" value={result.jieQi.prevJie} color="from-green-50 to-emerald-50" className="border-green-200" />
                      <InfoCard label="下一节" value={result.jieQi.nextJie} color="from-green-50 to-emerald-50" className="border-green-200" />
                      <InfoCard label="上一气" value={result.jieQi.prevQi} color="from-green-50 to-emerald-50" className="border-green-200" />
                      <InfoCard label="下一气" value={result.jieQi.nextQi} color="from-green-50 to-emerald-50" className="border-green-200" />
                    </div>
                  </div>
                )}

                {/* 重要辅助信息 */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 空亡信息 */}
                  {result.kongWang && result.kongWang.length > 0 && (
                    <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-300 shadow-md">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">⚠️</span>
                        <h4 className="text-lg font-bold text-amber-800">空亡</h4>
                      </div>
                      <div className="flex gap-3 justify-center">
                        {result.kongWang.map((zhi, index) => (
                          <Badge key={index} variant="warning" size="lg" className="shadow-sm">
                            {zhi}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-amber-700 mt-3 text-center">日柱空亡地支</p>
                    </div>
                  )}

                  {/* 月将信息 */}
                  {result.yueJiang && (
                    <div className="p-5 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border-2 border-indigo-300 shadow-md">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">🌙</span>
                        <h4 className="text-lg font-bold text-indigo-800">月将</h4>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-700 mb-1">{result.yueJiang}</div>
                        {result.yueJiangShen && (
                          <div className="text-sm text-indigo-600">({result.yueJiangShen})</div>
                        )}
                      </div>
                      <p className="text-xs text-indigo-700 mt-3 text-center">月将神煞</p>
                    </div>
                  )}

                  {/* 五不遇时 */}
                  <div className={`p-5 rounded-xl border-2 shadow-md ${
                    result.wuBuYuShi
                      ? 'bg-gradient-to-br from-red-50 to-pink-50 border-red-300'
                      : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                  }`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{result.wuBuYuShi ? '❌' : '✅'}</span>
                      <h4 className={`text-lg font-bold ${result.wuBuYuShi ? 'text-red-800' : 'text-green-800'}`}>
                        五不遇时
                      </h4>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${result.wuBuYuShi ? 'text-red-700' : 'text-green-700'}`}>
                        {result.wuBuYuShi ? '是' : '否'}
                      </div>
                    </div>
                    <p className={`text-xs mt-3 text-center ${result.wuBuYuShi ? 'text-red-700' : 'text-green-700'}`}>
                      {result.wuBuYuShi ? '不利占卜' : '可以占卜'}
                    </p>
                  </div>
                </div>

                {/* 基本辅助信息 */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {result.zao && <InfoCard label="造" value={result.zao} color="from-purple-50 to-pink-50" className="border-purple-200" />}
                  {result.age && <InfoCard label="年龄" value={`${result.age}岁`} color="from-cyan-50 to-blue-50" className="border-cyan-200" />}
                  {result.xingQi && <InfoCard label="星期" value={result.xingQi} color="from-blue-50 to-indigo-50" className="border-blue-200" />}
                  {result.jiJie && <InfoCard label="季节" value={result.jiJie} color="from-green-50 to-teal-50" className="border-green-200" />}
                  {result.shengXiao && <InfoCard label="生肖" value={result.shengXiao} color="from-red-50 to-orange-50" className="border-red-200" />}
                  {result.xingZuo && <InfoCard label="星座" value={result.xingZuo} color="from-purple-50 to-violet-50" className="border-purple-200" />}
                  {result.yueXiang && <InfoCard label="月相" value={result.yueXiang} color="from-yellow-50 to-amber-50" className="border-yellow-200" />}
                </div>
              </Card>

              {/* 六爻详细信息 - 传统纳甲风格 */}
              <Card title="六爻详细信息" icon="☯">
                {/* 六亲缺失提示 */}
                {result.liuQinQueShi && result.liuQinQueShi.length > 0 && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-2 text-red-700">
                      <span className="text-xl">⚠️</span>
                      <span className="font-semibold">六亲缺失：</span>
                      <span>{result.liuQinQueShi.join('、')}</span>
                    </div>
                  </div>
                )}

                {/* 本卦六爻 - 传统卡片式展示 */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg text-sm">本</span>
                    本卦六爻详析
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[5, 4, 3, 2, 1, 0].map((index) => (
                      <div
                        key={`ben-card-${index}`}
                        className={`relative p-4 rounded-xl border-2 transition-all hover:shadow-lg ${
                          result.liuYao.benGua.shiYing[index]
                            ? result.liuYao.benGua.shiYing[index] === '世'
                              ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-400'
                              : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-400'
                            : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'
                        }`}
                      >
                        {/* 爻位标识 */}
                        <div className="absolute -top-3 left-4">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                            result.liuYao.benGua.shiYing[index]
                              ? result.liuYao.benGua.shiYing[index] === '世'
                                ? 'bg-amber-500 text-white'
                                : 'bg-green-500 text-white'
                              : 'bg-blue-500 text-white'
                          }`}>
                            {index === 5 ? '上爻' : index === 4 ? '五爻' : index === 3 ? '四爻' : index === 2 ? '三爻' : index === 1 ? '二爻' : '初爻'}
                            {result.liuYao.benGua.shiYing[index] && ` · ${result.liuYao.benGua.shiYing[index]}`}
                          </span>
                        </div>

                        <div className="mt-2 grid grid-cols-3 gap-3">
                          {/* 左侧：卦爻 */}
                          <div className="text-center">
                            <div className={`text-3xl font-bold mb-1 ${
                              result.liuYao.benGua.yaoAs[index] === '—' ? 'text-blue-600' : 'text-red-500'
                            }`}>
                              {result.liuYao.benGua.yaoAs[index]}
                            </div>
                            {result.liuYao.benGua.yaoAsMark[index] && (
                              <div className="text-sm font-bold text-red-600">
                                {result.liuYao.benGua.yaoAsMark[index]} {result.liuYao.benGua.yaoAsMarkName[index]}
                              </div>
                            )}
                            <div className="text-xs text-gray-500 mt-1">{result.liuYao.benGua.yaoMing[index]}</div>
                          </div>

                          {/* 中间：纳甲信息 */}
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-800">{result.liuYao.benGua.ganZhi[index]}</div>
                            <div className="text-xs text-gray-500">{result.liuYao.benGua.naYin[index]}</div>
                            <div className={`mt-2 text-xs px-2 py-1 rounded-full inline-block ${
                              result.liuYao.benGua.liuQin[index] === '父母' ? 'bg-blue-500 text-white' :
                              result.liuYao.benGua.liuQin[index] === '兄弟' ? 'bg-gray-500 text-white' :
                              result.liuYao.benGua.liuQin[index] === '子孙' ? 'bg-green-500 text-white' :
                              result.liuYao.benGua.liuQin[index] === '妻财' ? 'bg-yellow-500 text-white' :
                              'bg-red-500 text-white'
                            }`}>
                              {result.liuYao.benGua.liuQin[index]}
                            </div>
                          </div>

                          {/* 右侧：六神 */}
                          <div className="text-center">
                            <div className={`text-sm px-3 py-2 rounded-lg border-2 ${
                              result.liuYao.benGua.liuShen[index] === '青龙' ? 'bg-green-100 border-green-300 text-green-700' :
                              result.liuYao.benGua.liuShen[index] === '朱雀' ? 'bg-red-100 border-red-300 text-red-700' :
                              result.liuYao.benGua.liuShen[index] === '勾陈' ? 'bg-amber-100 border-amber-300 text-amber-700' :
                              result.liuYao.benGua.liuShen[index] === '螣蛇' ? 'bg-purple-100 border-purple-300 text-purple-700' :
                              result.liuYao.benGua.liuShen[index] === '白虎' ? 'bg-gray-100 border-gray-300 text-gray-700' :
                              'bg-cyan-100 border-cyan-300 text-cyan-700'
                            }`}>
                              {result.liuYao.benGua.liuShen[index]}
                            </div>
                            {result.liuYao.benGua.fuShen[index] && (
                              <div className="mt-2 text-xs text-orange-600 font-medium">
                                伏 {result.liuYao.benGua.fuShen[index]}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 爻辞按钮 */}
                        {result.liuYao.benGua.yaoCi[index] && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setExpandedYao(expandedYao === index ? null : index)}
                              className="w-full"
                            >
                              {expandedYao === index ? '收起爻辞' : '查看爻辞'}
                            </Button>
                            {expandedYao === index && result.liuYao.benGua.yaoCi[index] && (
                              <div className="mt-3 p-3 bg-white/50 rounded-lg">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {result.liuYao.benGua.yaoCi[index]}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 变卦六爻 - 传统卡片式展示 */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm">变</span>
                    变卦六爻详析
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[5, 4, 3, 2, 1, 0].map((index) => (
                      <div
                        key={`bian-card-${index}`}
                        className={`relative p-4 rounded-xl border-2 transition-all hover:shadow-lg ${
                          result.liuYao.bianGua.shiYing[index]
                            ? result.liuYao.bianGua.shiYing[index] === '世'
                              ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-400'
                              : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-400'
                            : 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200'
                        }`}
                      >
                        {/* 爻位标识 */}
                        <div className="absolute -top-3 left-4">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                            result.liuYao.bianGua.shiYing[index]
                              ? result.liuYao.bianGua.shiYing[index] === '世'
                                ? 'bg-amber-500 text-white'
                                : 'bg-green-500 text-white'
                              : 'bg-orange-500 text-white'
                          }`}>
                            {index === 5 ? '上爻' : index === 4 ? '五爻' : index === 3 ? '四爻' : index === 2 ? '三爻' : index === 1 ? '二爻' : '初爻'}
                            {result.liuYao.bianGua.shiYing[index] && ` · ${result.liuYao.bianGua.shiYing[index]}`}
                          </span>
                        </div>

                        <div className="mt-2 grid grid-cols-3 gap-3">
                          {/* 左侧：卦爻 */}
                          <div className="text-center">
                            <div className={`text-3xl font-bold mb-1 ${
                              result.liuYao.bianGua.yaoAs[index] === '—' ? 'text-orange-600' : 'text-red-500'
                            }`}>
                              {result.liuYao.bianGua.yaoAs[index]}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{result.liuYao.bianGua.yaoMing[index]}</div>
                          </div>

                          {/* 中间：纳甲信息 */}
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-800">{result.liuYao.bianGua.ganZhi[index]}</div>
                            <div className="text-xs text-gray-500">{result.liuYao.bianGua.naYin[index]}</div>
                            <div className={`mt-2 text-xs px-2 py-1 rounded-full inline-block ${
                              result.liuYao.bianGua.liuQin[index] === '父母' ? 'bg-blue-500 text-white' :
                              result.liuYao.bianGua.liuQin[index] === '兄弟' ? 'bg-gray-500 text-white' :
                              result.liuYao.bianGua.liuQin[index] === '子孙' ? 'bg-green-500 text-white' :
                              result.liuYao.bianGua.liuQin[index] === '妻财' ? 'bg-yellow-500 text-white' :
                              'bg-red-500 text-white'
                            }`}>
                              {result.liuYao.bianGua.liuQin[index]}
                            </div>
                          </div>

                          {/* 右侧：六神 */}
                          <div className="text-center">
                            <div className={`text-sm px-3 py-2 rounded-lg border-2 ${
                              result.liuYao.bianGua.liuShen[index] === '青龙' ? 'bg-green-100 border-green-300 text-green-700' :
                              result.liuYao.bianGua.liuShen[index] === '朱雀' ? 'bg-red-100 border-red-300 text-red-700' :
                              result.liuYao.bianGua.liuShen[index] === '勾陈' ? 'bg-amber-100 border-amber-300 text-amber-700' :
                              result.liuYao.bianGua.liuShen[index] === '螣蛇' ? 'bg-purple-100 border-purple-300 text-purple-700' :
                              result.liuYao.bianGua.liuShen[index] === '白虎' ? 'bg-gray-100 border-gray-300 text-gray-700' :
                              'bg-cyan-100 border-cyan-300 text-cyan-700'
                            }`}>
                              {result.liuYao.bianGua.liuShen[index]}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* ShenSha Summary Panel */}
              {result.shenSha && (
                <Card title="神煞汇总" icon="✨">
                  <div className="flex items-center justify-end mb-6">
                    <Button
                      size="sm"
                      gradient="from-purple-500 to-pink-500"
                      onClick={() => setShowShenShaConfig(!showShenShaConfig)}
                    >
                      <span className="flex items-center gap-2">
                        <span>⚙️</span>
                        <span>配置神煞</span>
                      </span>
                    </Button>
                  </div>

                  {/* 神煞配置面板 */}
                  {showShenShaConfig && (
                    <div className="mb-6 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-300 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold text-purple-800 flex items-center gap-2">
                          <span>⚙️</span>
                          神煞显示配置
                        </h4>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={resetConfig}
                        >
                          重置全部
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {/* 吉神配置 */}
                        <div className="p-4 bg-white rounded-lg border border-green-200">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-bold text-green-800 flex items-center gap-2">
                              <span>🌟</span>
                              吉神 ({ALL_SHEN_SHA.吉神.length}种)
                            </h5>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => toggleCategory('吉神', true)}
                              >
                                全选
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => toggleCategory('吉神', false)}
                              >
                                全不选
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                            {ALL_SHEN_SHA.吉神.map(sha => (
                              <label key={sha} className="flex items-center gap-2 cursor-pointer hover:bg-green-50 p-2 rounded transition-colors">
                                <input
                                  type="checkbox"
                                  checked={shenShaConfig[sha] !== false}
                                  onChange={() => toggleShenSha(sha)}
                                  className="w-4 h-4 text-green-600 rounded"
                                />
                                <span className="text-sm text-gray-700">{sha}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* 凶神配置 */}
                        <div className="p-4 bg-white rounded-lg border border-red-200">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-bold text-red-800 flex items-center gap-2">
                              <span>⚠️</span>
                              凶神 ({ALL_SHEN_SHA.凶神.length}种)
                            </h5>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => toggleCategory('凶神', true)}
                              >
                                全选
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => toggleCategory('凶神', false)}
                              >
                                全不选
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {ALL_SHEN_SHA.凶神.map(sha => (
                              <label key={sha} className="flex items-center gap-2 cursor-pointer hover:bg-red-50 p-2 rounded transition-colors">
                                <input
                                  type="checkbox"
                                  checked={shenShaConfig[sha] !== false}
                                  onChange={() => toggleShenSha(sha)}
                                  className="w-4 h-4 text-red-600 rounded"
                                />
                                <span className="text-sm text-gray-700">{sha}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* 半吉半凶配置 */}
                        <div className="p-4 bg-white rounded-lg border border-yellow-200">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-bold text-yellow-800 flex items-center gap-2">
                              <span>⚖️</span>
                              半吉半凶 ({ALL_SHEN_SHA.半吉半凶.length}种)
                            </h5>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                gradient="from-yellow-500 to-amber-500"
                                onClick={() => toggleCategory('半吉半凶', true)}
                              >
                                全选
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => toggleCategory('半吉半凶', false)}
                              >
                                全不选
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {ALL_SHEN_SHA.半吉半凶.map(sha => (
                              <label key={sha} className="flex items-center gap-2 cursor-pointer hover:bg-yellow-50 p-2 rounded transition-colors">
                                <input
                                  type="checkbox"
                                  checked={shenShaConfig[sha] !== false}
                                  onChange={() => toggleShenSha(sha)}
                                  className="w-4 h-4 text-yellow-600 rounded"
                                />
                                <span className="text-sm text-gray-700">{sha}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* 动星配置 */}
                        <div className="p-4 bg-white rounded-lg border border-blue-200">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-bold text-blue-800 flex items-center gap-2">
                              <span>🏃</span>
                              动星 ({ALL_SHEN_SHA.动星.length}种)
                            </h5>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                gradient="from-blue-500 to-cyan-500"
                                onClick={() => toggleCategory('动星', true)}
                              >
                                全选
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => toggleCategory('动星', false)}
                              >
                                全不选
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {ALL_SHEN_SHA.动星.map(sha => (
                              <label key={sha} className="flex items-center gap-2 cursor-pointer hover:bg-blue-50 p-2 rounded transition-colors">
                                <input
                                  type="checkbox"
                                  checked={shenShaConfig[sha] !== false}
                                  onChange={() => toggleShenSha(sha)}
                                  className="w-4 h-4 text-blue-600 rounded"
                                />
                                <span className="text-sm text-gray-700">{sha}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          💡 <span className="font-semibold">提示：</span>
                          配置会自动保存到浏览器，下次访问时会保持您的选择。取消勾选的神煞将不会在四柱和汇总中显示。
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 神煞统计 */}
                  <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-3xl font-bold text-purple-700">
                          {[...new Set([...filterShenSha(result.shenSha.year), ...filterShenSha(result.shenSha.month), ...filterShenSha(result.shenSha.day), ...filterShenSha(result.shenSha.hour)])].length}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">神煞总数</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-green-700">
                          {filterShenSha(result.shenSha.year).length}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">年柱神煞</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-blue-700">
                          {filterShenSha(result.shenSha.month).length}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">月柱神煞</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-orange-700">
                          {filterShenSha(result.shenSha.day).length + filterShenSha(result.shenSha.hour).length}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">日时神煞</div>
                      </div>
                    </div>
                  </div>

                  {/* 按类型分类展示神煞 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 吉神 */}
                    {(() => {
                      const allShenSha = [...new Set([...filterShenSha(result.shenSha.year), ...filterShenSha(result.shenSha.month), ...filterShenSha(result.shenSha.day), ...filterShenSha(result.shenSha.hour)])];
                      const jiShen = allShenSha.filter(sha => {
                        const shenShaInfo = {
                          '天乙贵人': '吉神', '太极贵人': '吉神', '文昌贵人': '吉神', '福星贵人': '吉神',
                          '天厨贵人': '吉神', '月德贵人': '吉神', '天德贵人': '吉神', '天元禄': '吉神',
                          '将星': '吉神', '天喜': '吉神', '天医': '吉神', '谋星': '吉神',
                          '皇恩': '吉神', '唐符国印': '吉神', '天马': '吉神'
                        };
                        return shenShaInfo[sha as keyof typeof shenShaInfo] === '吉神';
                      });
                      return jiShen.length > 0 && (
                        <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                          <h4 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                            <span className="text-xl">🌟</span>
                            吉神 ({jiShen.length})
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {jiShen.map((sha, idx) => (
                              <span key={idx} className="px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-green-600 transition-colors cursor-default">
                                {sha}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* 凶神 */}
                    {(() => {
                      const allShenSha = [...new Set([...filterShenSha(result.shenSha.year), ...filterShenSha(result.shenSha.month), ...filterShenSha(result.shenSha.day), ...filterShenSha(result.shenSha.hour)])];
                      const xiongShen = allShenSha.filter(sha => {
                        const shenShaInfo = {
                          '劫煞': '凶神', '灾煞': '凶神', '阳刃': '凶神', '飞刃': '凶神'
                        };
                        return shenShaInfo[sha as keyof typeof shenShaInfo] === '凶神';
                      });
                      return xiongShen.length > 0 && (
                        <div className="p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200">
                          <h4 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
                            <span className="text-xl">⚠️</span>
                            凶神 ({xiongShen.length})
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {xiongShen.map((sha, idx) => (
                              <span key={idx} className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-red-600 transition-colors cursor-default">
                                {sha}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* 半吉半凶 */}
                    {(() => {
                      const allShenSha = [...new Set([...filterShenSha(result.shenSha.year), ...filterShenSha(result.shenSha.month), ...filterShenSha(result.shenSha.day), ...filterShenSha(result.shenSha.hour)])];
                      const banJiBanXiong = allShenSha.filter(sha => {
                        const shenShaInfo = {
                          '华盖': '半吉半凶', '咸池': '半吉半凶'
                        };
                        return shenShaInfo[sha as keyof typeof shenShaInfo] === '半吉半凶';
                      });
                      return banJiBanXiong.length > 0 && (
                        <div className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
                          <h4 className="text-lg font-bold text-yellow-800 mb-4 flex items-center gap-2">
                            <span className="text-xl">⚖️</span>
                            半吉半凶 ({banJiBanXiong.length})
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {banJiBanXiong.map((sha, idx) => (
                              <span key={idx} className="px-3 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-yellow-600 transition-colors cursor-default">
                                {sha}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* 动星 */}
                    {(() => {
                      const allShenSha = [...new Set([...filterShenSha(result.shenSha.year), ...filterShenSha(result.shenSha.month), ...filterShenSha(result.shenSha.day), ...filterShenSha(result.shenSha.hour)])];
                      const dongXing = allShenSha.filter(sha => {
                        const shenShaInfo = {
                          '驿马': '动星'
                        };
                        return shenShaInfo[sha as keyof typeof shenShaInfo] === '动星';
                      });
                      return dongXing.length > 0 && (
                        <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                          <h4 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                            <span className="text-xl">🏃</span>
                            动星 ({dongXing.length})
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {dongXing.map((sha, idx) => (
                              <span key={idx} className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-blue-600 transition-colors cursor-default">
                                {sha}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* 神煞说明 */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      💡 <span className="font-semibold">神煞说明：</span>
                      神煞是命理学中的重要概念，代表不同的吉凶征兆。
                      <span className="text-green-700 font-medium">吉神</span>主吉利、顺遂；
                      <span className="text-red-700 font-medium">凶神</span>主凶险、阻碍；
                      <span className="text-yellow-700 font-medium">半吉半凶</span>需看具体情况；
                      <span className="text-blue-700 font-medium">动星</span>主变动、迁移。
                    </p>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>

      {/* AI助手 */}
      {result && <AIAssistant system="liuyao" chartData={result} />}
    </div>
  );
}
