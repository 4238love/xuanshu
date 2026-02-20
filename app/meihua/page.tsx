'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createMeiHuaPaiPan } from '@/lib/meihua';
import { MeiHuaSettings, MeiHuaResult } from '@/types';
import { Card, InfoCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input, RadioGroup } from '@/components/ui/Input';
import { DateTimePicker } from '@/components/ui/FormControls';
import { Loading } from '@/components/ui/Loading';
import { AIAssistant } from '@/components/ai';

export default function MeiHuaPage() {
  const [settings, setSettings] = useState<MeiHuaSettings>({
    name: '',
    occupy: '',
    sex: 1,
    date: '2024-01-01 00:00:00',
    dateType: 0
  });

  const [result, setResult] = useState<MeiHuaResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const paiPanResult = createMeiHuaPaiPan(settings);
      setResult(paiPanResult);
    } catch (error) {
      console.error('排盘失败:', error);
      alert('排盘失败，请检查输入信息');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* 头部 */}
      <header className="border-b border-indigo-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="text-3xl">☲</div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  梅花易数
                </h1>
                <p className="text-xs text-gray-500">心易占卜 · 随机应变</p>
              </div>
            </Link>
            <Link
              href="/"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg transition-all"
            >
              返回首页
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 输入表单 */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-3xl">📝</span>
              输入信息
            </h2>

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
                  value={settings.sex}
                  onChange={(value) => setSettings({ ...settings, sex: Number(value) as 0 | 1 })}
                  options={[
                    { label: '男', value: 1 },
                    { label: '女', value: 0 }
                  ]}
                />

                {/* 日期类型 */}
                <RadioGroup
                  label="日期类型"
                  name="dateType"
                  value={settings.dateType}
                  onChange={(value) => setSettings({ ...settings, dateType: Number(value) as 0 | 1 })}
                  options={[
                    { label: '公历', value: 0 },
                    { label: '农历', value: 1 }
                  ]}
                />
              </div>

              {/* 日期时间 */}
              <DateTimePicker
                label="起卦日期时间"
                value={settings.date}
                onChange={(value) => setSettings({ ...settings, date: value })}
                dateType={settings.dateType}
                helperText="格式：年-月-日 时:分:秒（例如：2024-01-01 08:30:00）"
              />

              {/* 提交按钮 */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '起卦中...' : '开始起卦'}
              </button>
            </form>
          </div>

          {/* 排盘结果 */}
          {loading && <Loading size="lg" text="正在起卦..." />}

          {result && !loading && (
            <div className="space-y-8">
              {/* 基础信息卡片 */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex flex-wrap gap-3">
                  {result.name && (
                    <span className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full text-indigo-700 font-medium">
                      {result.name}
                    </span>
                  )}
                  {result.occupy && (
                    <span className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-purple-700 font-medium">
                      {result.occupy}
                    </span>
                  )}
                  <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full text-blue-700 font-medium">
                    卦码: {result.guaMa}
                  </span>
                  <span className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full text-green-700 font-medium">
                    {result.solar}
                  </span>
                  <span className="px-4 py-2 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-full text-amber-700 font-medium">
                    {result.lunar}
                  </span>
                </div>
              </div>

              {/* 核心卦象展示 - 先天八卦风格 */}
              <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                {/* 背景装饰 */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 left-4 text-8xl text-white">☰</div>
                  <div className="absolute bottom-4 right-4 text-8xl text-white">☷</div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl text-white opacity-20">☯</div>
                </div>

                <div className="relative z-10">
                  {/* 标题 */}
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-wider">
                      先天八卦象数
                    </h2>
                    <p className="text-indigo-300 text-sm">天地定位 · 山泽通气 · 雷风相薄 · 水火不相射</p>
                  </div>

                  {/* 主卦象展示 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* 上卦 */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <div className="text-center">
                        <div className="text-indigo-300 text-sm mb-3">上卦</div>
                        <div className="text-6xl mb-3">{result.shangGua.match(/[(（](.+?)[)）]/)?.[1] || result.shangGua.split('(')[0]}</div>
                        <div className="text-2xl font-bold text-white mb-2">{result.shangGua.split('(')[0]}</div>
                        <div className="inline-flex items-center gap-2 bg-indigo-500/30 rounded-full px-3 py-1">
                          <span className="text-indigo-200 text-sm">先天数</span>
                          <span className="text-white font-bold">{result.shangGua.split('(')[0] === '乾' ? '1' : result.shangGua.split('(')[0] === '兑' ? '2' : result.shangGua.split('(')[0] === '离' ? '3' : result.shangGua.split('(')[0] === '震' ? '4' : result.shangGua.split('(')[0] === '巽' ? '5' : result.shangGua.split('(')[0] === '坎' ? '6' : result.shangGua.split('(')[0] === '艮' ? '7' : '8'}</span>
                        </div>
                      </div>
                    </div>

                    {/* 本卦核心展示 */}
                    <div className="bg-gradient-to-b from-amber-500/20 to-purple-500/20 rounded-2xl p-6 border-2 border-amber-400/50 relative">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                        本卦
                      </div>
                      <div className="text-center pt-2">
                        <div className="text-4xl font-bold text-white mb-3">{result.benGua}</div>
                        <div className="text-8xl text-white/90 mb-3">
                          {result.shangGua.match(/[(（](.+?)[)）]/)?.[1] || result.shangGua.split('(')[0]}
                          {result.xiaGua.match(/[(（](.+?)[)）]/)?.[1] || result.xiaGua.split('(')[0]}
                        </div>
                        <div className="inline-flex items-center gap-2 bg-red-500/30 rounded-full px-4 py-2">
                          <span className="text-red-200">动爻</span>
                          <span className="text-white font-bold text-lg">第{result.dongYao}爻 ☯</span>
                        </div>
                      </div>
                    </div>

                    {/* 下卦 */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <div className="text-center">
                        <div className="text-indigo-300 text-sm mb-3">下卦</div>
                        <div className="text-6xl mb-3">{result.xiaGua.match(/[(（](.+?)[)）]/)?.[1] || result.xiaGua.split('(')[0]}</div>
                        <div className="text-2xl font-bold text-white mb-2">{result.xiaGua.split('(')[0]}</div>
                        <div className="inline-flex items-center gap-2 bg-indigo-500/30 rounded-full px-3 py-1">
                          <span className="text-indigo-200 text-sm">先天数</span>
                          <span className="text-white font-bold">{result.xiaGua.split('(')[0] === '乾' ? '1' : result.xiaGua.split('(')[0] === '兑' ? '2' : result.xiaGua.split('(')[0] === '离' ? '3' : result.xiaGua.split('(')[0] === '震' ? '4' : result.xiaGua.split('(')[0] === '巽' ? '5' : result.xiaGua.split('(')[0] === '坎' ? '6' : result.xiaGua.split('(')[0] === '艮' ? '7' : '8'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 先天八卦数对照表 */}
                  <div className="bg-white/5 rounded-xl p-4 mb-6">
                    <div className="text-center text-indigo-300 text-sm mb-3">先天八卦数</div>
                    <div className="flex justify-center flex-wrap gap-2">
                      {['乾☗1', '兑☱2', '离☲3', '震☳4', '巽☴5', '坎☵6', '艮☶7', '坤☷8'].map((item, idx) => (
                        <span
                          key={idx}
                          className={`px-3 py-1 rounded-lg text-sm ${
                            result.shangGua.split('(')[0] === item[0] || result.xiaGua.split('(')[0] === item[0]
                              ? 'bg-amber-500/50 text-white'
                              : 'bg-white/10 text-indigo-200'
                          }`}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 变卦展示 */}
                  <div className="bg-gradient-to-r from-pink-600/30 to-rose-600/30 rounded-2xl p-6 border border-pink-400/30">
                    <div className="flex items-center justify-center gap-4">
                      <div className="text-pink-300">变卦</div>
                      <div className="text-4xl font-bold text-white">{result.bianGua}</div>
                      <div className="text-pink-300 text-sm">(动爻变化)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 互卦、错卦、综卦展示 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl p-6 border border-emerald-400/30 text-center">
                  <div className="text-emerald-300 text-sm mb-2">互卦</div>
                  <div className="text-2xl font-bold text-white mb-1">{result.huGua}</div>
                  <div className="text-emerald-200/60 text-xs">2,3,4爻 + 3,4,5爻</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl p-6 border border-orange-400/30 text-center">
                  <div className="text-orange-300 text-sm mb-2">错卦</div>
                  <div className="text-2xl font-bold text-white mb-1">{result.cuoGua}</div>
                  <div className="text-orange-200/60 text-xs">阴阳全反</div>
                </div>
                <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl p-6 border border-cyan-400/30 text-center">
                  <div className="text-cyan-300 text-sm mb-2">综卦</div>
                  <div className="text-2xl font-bold text-white mb-1">{result.zongGua}</div>
                  <div className="text-cyan-200/60 text-xs">上下颠倒</div>
                </div>
              </div>

              {/* 体用关系 */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-3">
                  <span className="text-3xl">⚖️</span>
                  体用分析
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* 体卦 */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                    <div className="text-center mb-4">
                      <div className="inline-block px-4 py-1 bg-blue-500 text-white rounded-full text-sm font-medium mb-3">
                        体卦
                      </div>
                      <div className="text-3xl font-bold text-blue-600">{result.tiGua}</div>
                      <div className="text-blue-500 mt-2">{result.tiGuaWuXing}</div>
                    </div>
                    <div className="text-center text-sm text-gray-600">
                      {result.dongYao > 3 ? '动爻在上卦，故下卦为体' : '动爻在下卦，故上卦为体'}
                    </div>
                  </div>

                  {/* 用卦 */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                    <div className="text-center mb-4">
                      <div className="inline-block px-4 py-1 bg-green-500 text-white rounded-full text-sm font-medium mb-3">
                        用卦
                      </div>
                      <div className="text-3xl font-bold text-green-600">{result.yongGua}</div>
                      <div className="text-green-500 mt-2">{result.yongGuaWuXing}</div>
                    </div>
                    <div className="text-center text-sm text-gray-600">
                      {result.dongYao > 3 ? '动爻在上卦，故上卦为用' : '动爻在下卦，故下卦为用'}
                    </div>
                  </div>
                </div>

                {/* 生克关系 */}
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 border-2 border-amber-300">
                  <div className="text-center">
                    <div className="text-amber-600 text-sm mb-2">体用生克关系</div>
                    <div className="text-xl font-bold text-amber-800">{result.tiYongGuanXi}</div>
                  </div>
                  {result.benGuaWuXing && (
                    <div className="mt-4 pt-4 border-t border-amber-200 flex flex-wrap justify-center gap-4">
                      <span className="text-gray-600">本卦五行：<span className="font-medium text-amber-700">{result.benGuaWuXing}</span></span>
                      {result.benGuaFangWei && (
                        <span className="text-gray-600">本卦方位：<span className="font-medium text-indigo-700">{result.benGuaFangWei}</span></span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 1. 干支信息区域 */}
              {(result.yearGanZhi || result.monthGanZhi || result.dayGanZhi || result.hourGanZhi) && (
                <details className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200" open>
                  <summary className="cursor-pointer p-6 font-semibold text-gray-800 text-lg flex items-center gap-2 hover:bg-blue-100 rounded-xl transition-colors">
                    <span className="text-2xl">🌟</span>
                    干支信息
                  </summary>
                  <div className="px-6 pb-6 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: '年柱', ganZhi: result.yearGanZhi, gan: result.yearGan, zhi: result.yearZhi, ganWuXing: result.yearGanWuXing, zhiWuXing: result.yearZhiWuXing, naYin: result.yearNaYin, kongWang: result.yearKongWang },
                        { label: '月柱', ganZhi: result.monthGanZhi, gan: result.monthGan, zhi: result.monthZhi, ganWuXing: result.monthGanWuXing, zhiWuXing: result.monthZhiWuXing, naYin: result.monthNaYin, kongWang: result.monthKongWang },
                        { label: '日柱', ganZhi: result.dayGanZhi, gan: result.dayGan, zhi: result.dayZhi, ganWuXing: result.dayGanWuXing, zhiWuXing: result.dayZhiWuXing, naYin: result.dayNaYin, kongWang: result.dayKongWang },
                        { label: '时柱', ganZhi: result.hourGanZhi, gan: result.hourGan, zhi: result.hourZhi, ganWuXing: result.hourGanWuXing, zhiWuXing: result.hourZhiWuXing, naYin: result.hourNaYin, kongWang: result.hourKongWang }
                      ].map((item) => item.ganZhi && (
                        <div key={item.label} className="p-4 bg-white rounded-lg shadow-sm border border-blue-200">
                          <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                          <div className="text-2xl font-bold text-indigo-600 mb-2">{item.ganZhi}</div>
                          <div className="text-xs space-y-1">
                            {item.ganWuXing && (
                              <div className="flex items-center gap-1">
                                <span className="text-gray-600">天干五行:</span>
                                <Badge variant="info" size="sm">{item.ganWuXing}</Badge>
                              </div>
                            )}
                            {item.zhiWuXing && (
                              <div className="flex items-center gap-1">
                                <span className="text-gray-600">地支五行:</span>
                                <Badge variant="info" size="sm">{item.zhiWuXing}</Badge>
                              </div>
                            )}
                            {item.naYin && (
                              <div className="flex items-center gap-1">
                                <span className="text-gray-600">纳音:</span>
                                <Badge variant="default" size="sm">{item.naYin}</Badge>
                              </div>
                            )}
                            {item.kongWang && (
                              <div className="flex items-center gap-1">
                                <span className="text-gray-600">空亡:</span>
                                <Badge variant="danger" size="sm">{item.kongWang}</Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </details>
              )}

              {/* 2. 节气信息区域 */}
              {(result.prevJie || result.nextJie || result.prevQi || result.nextQi) && (
                <details className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                  <summary className="cursor-pointer p-6 font-semibold text-gray-800 text-lg flex items-center gap-2 hover:bg-green-100 rounded-xl transition-colors">
                    <span className="text-2xl">🌱</span>
                    节气信息
                  </summary>
                  <div className="px-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.prevJie && (
                        <div className="p-4 bg-white rounded-lg shadow-sm border border-green-200">
                          <div className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                            上一节
                            <Badge variant="success" size="sm">{result.prevJie}</Badge>
                          </div>
                          {result.prevJieDate && <div className="text-xs text-gray-600 mt-1">{result.prevJieDate}</div>}
                          {result.prevJieDay !== undefined && <div className="text-xs text-gray-500">已过 {result.prevJieDay} 天</div>}
                        </div>
                      )}
                      {result.nextJie && (
                        <div className="p-4 bg-white rounded-lg shadow-sm border border-green-200">
                          <div className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                            下一节
                            <Badge variant="success" size="sm">{result.nextJie}</Badge>
                          </div>
                          {result.nextJieDate && <div className="text-xs text-gray-600 mt-1">{result.nextJieDate}</div>}
                          {result.nextJieDay !== undefined && <div className="text-xs text-gray-500">还有 {result.nextJieDay} 天</div>}
                        </div>
                      )}
                      {result.prevQi && (
                        <div className="p-4 bg-white rounded-lg shadow-sm border border-green-200">
                          <div className="text-sm font-semibold text-emerald-700 mb-2 flex items-center gap-2">
                            上一气
                            <Badge variant="success" size="sm">{result.prevQi}</Badge>
                          </div>
                          {result.prevQiDate && <div className="text-xs text-gray-600 mt-1">{result.prevQiDate}</div>}
                          {result.prevQiDay !== undefined && <div className="text-xs text-gray-500">已过 {result.prevQiDay} 天</div>}
                        </div>
                      )}
                      {result.nextQi && (
                        <div className="p-4 bg-white rounded-lg shadow-sm border border-green-200">
                          <div className="text-sm font-semibold text-emerald-700 mb-2 flex items-center gap-2">
                            下一气
                            <Badge variant="success" size="sm">{result.nextQi}</Badge>
                          </div>
                          {result.nextQiDate && <div className="text-xs text-gray-600 mt-1">{result.nextQiDate}</div>}
                          {result.nextQiDay !== undefined && <div className="text-xs text-gray-500">还有 {result.nextQiDay} 天</div>}
                        </div>
                      )}
                    </div>
                  </div>
                </details>
              )}

              {/* 3. 卦辞区域 */}
              {(result.benGuaGuaCi || result.bianGuaGuaCi || result.huGuaGuaCi || result.cuoGuaGuaCi || result.zongGuaGuaCi) && (
                <details className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                  <summary className="cursor-pointer p-6 font-semibold text-gray-800 text-lg flex items-center gap-2 hover:bg-purple-100 rounded-xl transition-colors">
                    <span className="text-2xl">📜</span>
                    卦辞详解
                  </summary>
                  <div className="px-6 pb-6 space-y-3">
                    {result.benGuaGuaCi && (
                      <div className="p-4 bg-white rounded-lg shadow-sm border-l-4 border-purple-500">
                        <div className="text-sm font-semibold text-purple-700 mb-2">本卦 · {result.benGua}</div>
                        <div className="text-sm text-gray-700 leading-relaxed">{result.benGuaGuaCi}</div>
                      </div>
                    )}
                    {result.bianGuaGuaCi && (
                      <div className="p-4 bg-white rounded-lg shadow-sm border-l-4 border-pink-500">
                        <div className="text-sm font-semibold text-pink-700 mb-2">变卦 · {result.bianGua}</div>
                        <div className="text-sm text-gray-700 leading-relaxed">{result.bianGuaGuaCi}</div>
                      </div>
                    )}
                    {result.huGuaGuaCi && (
                      <div className="p-4 bg-white rounded-lg shadow-sm border-l-4 border-green-500">
                        <div className="text-sm font-semibold text-green-700 mb-2">互卦 · {result.huGua}</div>
                        <div className="text-sm text-gray-700 leading-relaxed">{result.huGuaGuaCi}</div>
                      </div>
                    )}
                    {result.cuoGuaGuaCi && (
                      <div className="p-4 bg-white rounded-lg shadow-sm border-l-4 border-orange-500">
                        <div className="text-sm font-semibold text-orange-700 mb-2">错卦 · {result.cuoGua}</div>
                        <div className="text-sm text-gray-700 leading-relaxed">{result.cuoGuaGuaCi}</div>
                      </div>
                    )}
                    {result.zongGuaGuaCi && (
                      <div className="p-4 bg-white rounded-lg shadow-sm border-l-4 border-blue-500">
                        <div className="text-sm font-semibold text-blue-700 mb-2">综卦 · {result.zongGua}</div>
                        <div className="text-sm text-gray-700 leading-relaxed">{result.zongGuaGuaCi}</div>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* 4. 六爻详细区域 */}
              {(result.benGuaLiuYao || result.bianGuaLiuYao) && (
                <details className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border-2 border-amber-200">
                  <summary className="cursor-pointer p-6 font-semibold text-gray-800 text-lg flex items-center gap-2 hover:bg-amber-100 rounded-xl transition-colors">
                    <span className="text-2xl">☰</span>
                    六爻详细
                  </summary>
                  <div className="px-6 pb-6 space-y-4">
                    {result.benGuaLiuYao && (
                      <div>
                        <div className="text-sm font-semibold text-amber-700 mb-3">本卦六爻 · {result.benGua}</div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="bg-amber-100">
                                <th className="border border-amber-300 px-3 py-2">爻位</th>
                                <th className="border border-amber-300 px-3 py-2">爻名</th>
                                <th className="border border-amber-300 px-3 py-2">爻象</th>
                                <th className="border border-amber-300 px-3 py-2">爻辞</th>
                              </tr>
                            </thead>
                            <tbody>
                              {result.benGuaLiuYao.yaoMing.map((yaoMing, index) => (
                                <tr key={index} className="hover:bg-amber-50">
                                  <td className="border border-amber-200 px-3 py-2 text-center">{6 - index}</td>
                                  <td className="border border-amber-200 px-3 py-2 text-center font-medium">{yaoMing}</td>
                                  <td className="border border-amber-200 px-3 py-2 text-center">{result.benGuaLiuYao?.yaoXiang[index]}</td>
                                  <td className="border border-amber-200 px-3 py-2 text-gray-700">{result.benGuaLiuYao?.yaoCi[index]}</td>
                                </tr>
                              )).reverse()}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    {result.bianGuaLiuYao && (
                      <div>
                        <div className="text-sm font-semibold text-pink-700 mb-3">变卦六爻 · {result.bianGua}</div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="bg-pink-100">
                                <th className="border border-pink-300 px-3 py-2">爻位</th>
                                <th className="border border-pink-300 px-3 py-2">爻名</th>
                                <th className="border border-pink-300 px-3 py-2">爻象</th>
                                <th className="border border-pink-300 px-3 py-2">爻辞</th>
                              </tr>
                            </thead>
                            <tbody>
                              {result.bianGuaLiuYao.yaoMing.map((yaoMing, index) => (
                                <tr key={index} className="hover:bg-pink-50">
                                  <td className="border border-pink-200 px-3 py-2 text-center">{6 - index}</td>
                                  <td className="border border-pink-200 px-3 py-2 text-center font-medium">{yaoMing}</td>
                                  <td className="border border-pink-200 px-3 py-2 text-center">{result.bianGuaLiuYao?.yaoXiang[index]}</td>
                                  <td className="border border-pink-200 px-3 py-2 text-gray-700">{result.bianGuaLiuYao?.yaoCi[index]}</td>
                                </tr>
                              )).reverse()}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    {result.huGuaLiuYao && (
                      <div>
                        <div className="text-sm font-semibold text-green-700 mb-3">互卦六爻 · {result.huGua}</div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="bg-green-100">
                                <th className="border border-green-300 px-3 py-2">爻位</th>
                                <th className="border border-green-300 px-3 py-2">爻名</th>
                                <th className="border border-green-300 px-3 py-2">爻象</th>
                                <th className="border border-green-300 px-3 py-2">爻辞</th>
                              </tr>
                            </thead>
                            <tbody>
                              {result.huGuaLiuYao.yaoMing.map((yaoMing, index) => (
                                <tr key={index} className="hover:bg-green-50">
                                  <td className="border border-green-200 px-3 py-2 text-center">{6 - index}</td>
                                  <td className="border border-green-200 px-3 py-2 text-center font-medium">{yaoMing}</td>
                                  <td className="border border-green-200 px-3 py-2 text-center">{result.huGuaLiuYao?.yaoXiang[index]}</td>
                                  <td className="border border-green-200 px-3 py-2 text-gray-700">{result.huGuaLiuYao?.yaoCi[index]}</td>
                                </tr>
                              )).reverse()}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    {result.cuoGuaLiuYao && (
                      <div>
                        <div className="text-sm font-semibold text-orange-700 mb-3">错卦六爻 · {result.cuoGua}</div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="bg-orange-100">
                                <th className="border border-orange-300 px-3 py-2">爻位</th>
                                <th className="border border-orange-300 px-3 py-2">爻名</th>
                                <th className="border border-orange-300 px-3 py-2">爻象</th>
                                <th className="border border-orange-300 px-3 py-2">爻辞</th>
                              </tr>
                            </thead>
                            <tbody>
                              {result.cuoGuaLiuYao.yaoMing.map((yaoMing, index) => (
                                <tr key={index} className="hover:bg-orange-50">
                                  <td className="border border-orange-200 px-3 py-2 text-center">{6 - index}</td>
                                  <td className="border border-orange-200 px-3 py-2 text-center font-medium">{yaoMing}</td>
                                  <td className="border border-orange-200 px-3 py-2 text-center">{result.cuoGuaLiuYao?.yaoXiang[index]}</td>
                                  <td className="border border-orange-200 px-3 py-2 text-gray-700">{result.cuoGuaLiuYao?.yaoCi[index]}</td>
                                </tr>
                              )).reverse()}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    {result.zongGuaLiuYao && (
                      <div>
                        <div className="text-sm font-semibold text-blue-700 mb-3">综卦六爻 · {result.zongGua}</div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="bg-blue-100">
                                <th className="border border-blue-300 px-3 py-2">爻位</th>
                                <th className="border border-blue-300 px-3 py-2">爻名</th>
                                <th className="border border-blue-300 px-3 py-2">爻象</th>
                                <th className="border border-blue-300 px-3 py-2">爻辞</th>
                              </tr>
                            </thead>
                            <tbody>
                              {result.zongGuaLiuYao.yaoMing.map((yaoMing, index) => (
                                <tr key={index} className="hover:bg-blue-50">
                                  <td className="border border-blue-200 px-3 py-2 text-center">{6 - index}</td>
                                  <td className="border border-blue-200 px-3 py-2 text-center font-medium">{yaoMing}</td>
                                  <td className="border border-blue-200 px-3 py-2 text-center">{result.zongGuaLiuYao?.yaoXiang[index]}</td>
                                  <td className="border border-blue-200 px-3 py-2 text-gray-700">{result.zongGuaLiuYao?.yaoCi[index]}</td>
                                </tr>
                              )).reverse()}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* 5. 卦象分解区域 */}
              {(result.benGuaShangGuaName || result.bianGuaShangGuaName) && (
                <details className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-200">
                  <summary className="cursor-pointer p-6 font-semibold text-gray-800 text-lg flex items-center gap-2 hover:bg-cyan-100 rounded-xl transition-colors">
                    <span className="text-2xl">🔷</span>
                    卦象分解
                  </summary>
                  <div className="px-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {result.benGuaShangGuaName && (
                        <div className="p-4 bg-white rounded-lg shadow-sm border border-cyan-200">
                          <div className="text-sm font-semibold text-cyan-700 mb-3">本卦 · {result.benGua}</div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">上卦</span>
                              <span className="font-medium text-cyan-600">{result.benGuaShangGuaAs} {result.benGuaShangGuaName}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">下卦</span>
                              <span className="font-medium text-cyan-600">{result.benGuaXiaGuaAs} {result.benGuaXiaGuaName}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      {result.bianGuaShangGuaName && (
                        <div className="p-4 bg-white rounded-lg shadow-sm border border-pink-200">
                          <div className="text-sm font-semibold text-pink-700 mb-3">变卦 · {result.bianGua}</div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">上卦</span>
                              <span className="font-medium text-pink-600">{result.bianGuaShangGuaAs} {result.bianGuaShangGuaName}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">下卦</span>
                              <span className="font-medium text-pink-600">{result.bianGuaXiaGuaAs} {result.bianGuaXiaGuaName}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      {result.huGuaShangGuaName && (
                        <div className="p-4 bg-white rounded-lg shadow-sm border border-green-200">
                          <div className="text-sm font-semibold text-green-700 mb-3">互卦 · {result.huGua}</div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">上卦</span>
                              <span className="font-medium text-green-600">{result.huGuaShangGuaAs} {result.huGuaShangGuaName}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">下卦</span>
                              <span className="font-medium text-green-600">{result.huGuaXiaGuaAs} {result.huGuaXiaGuaName}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      {result.cuoGuaShangGuaName && (
                        <div className="p-4 bg-white rounded-lg shadow-sm border border-orange-200">
                          <div className="text-sm font-semibold text-orange-700 mb-3">错卦 · {result.cuoGua}</div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">上卦</span>
                              <span className="font-medium text-orange-600">{result.cuoGuaShangGuaAs} {result.cuoGuaShangGuaName}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">下卦</span>
                              <span className="font-medium text-orange-600">{result.cuoGuaXiaGuaAs} {result.cuoGuaXiaGuaName}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      {result.zongGuaShangGuaName && (
                        <div className="p-4 bg-white rounded-lg shadow-sm border border-blue-200">
                          <div className="text-sm font-semibold text-blue-700 mb-3">综卦 · {result.zongGua}</div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">上卦</span>
                              <span className="font-medium text-blue-600">{result.zongGuaShangGuaAs} {result.zongGuaShangGuaName}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">下卦</span>
                              <span className="font-medium text-blue-600">{result.zongGuaXiaGuaAs} {result.zongGuaXiaGuaName}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </details>
              )}

              {/* 6. 辅助信息区域 */}
              {(result.shengXiao || result.xingZuo || result.yueXiang || result.yueJiang) && (
                <details className="bg-gradient-to-r from-rose-50 to-red-50 rounded-xl border-2 border-rose-200">
                  <summary className="cursor-pointer p-6 font-semibold text-gray-800 text-lg flex items-center gap-2 hover:bg-rose-100 rounded-xl transition-colors">
                    <span className="text-2xl">✨</span>
                    辅助信息
                  </summary>
                  <div className="px-6 pb-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {result.shengXiao && (
                        <InfoCard label="生肖" value={result.shengXiao} color="from-rose-50 to-red-50" className="border border-rose-200" />
                      )}
                      {result.xingZuo && (
                        <InfoCard label="星座" value={result.xingZuo} color="from-rose-50 to-red-50" className="border border-rose-200" />
                      )}
                      {result.yueXiang && (
                        <InfoCard label="月相" value={result.yueXiang} color="from-rose-50 to-red-50" className="border border-rose-200" />
                      )}
                      {result.yueJiang && (
                        <InfoCard label="月将" value={result.yueJiang} color="from-rose-50 to-red-50" className="border border-rose-200" />
                      )}
                      {result.yueJiangShen && (
                        <InfoCard label="月将神" value={result.yueJiangShen} color="from-rose-50 to-red-50" className="border border-rose-200" />
                      )}
                      {result.wuBuYuShi !== undefined && (
                        <InfoCard
                          label="五不遇时"
                          value={result.wuBuYuShi ? '是' : '否'}
                          color={result.wuBuYuShi ? 'from-red-50 to-rose-50' : 'from-green-50 to-emerald-50'}
                          className={`border ${result.wuBuYuShi ? 'border-red-200' : 'border-green-200'}`}
                        />
                      )}
                    </div>
                  </div>
                </details>
              )}

              {/* 说明 */}
              <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">梅花易数说明</h3>
                <div className="text-sm text-gray-700 space-y-2">
                  <p>• 本卦：根据时间起卦得到的原始卦象</p>
                  <p>• 变卦：动爻变化后形成的卦象</p>
                  <p>• 互卦：由本卦2、3、4爻和3、4、5爻组成</p>
                  <p>• 错卦：本卦阴阳爻全部相反的卦象</p>
                  <p>• 综卦：本卦上下颠倒的卦象</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* AI助手 */}
      {result && <AIAssistant system="meihua" chartData={result} />}
    </div>
  );
}
