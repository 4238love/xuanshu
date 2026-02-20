'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createBaZiPaiPan } from '@/lib/bazi';
import { BaZiSettings, BaZiResult } from '@/types';
import { Card, InfoCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, RadioGroup } from '@/components/ui/Input';
import { DateTimePicker } from '@/components/ui/FormControls';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { ExportButton, CopyButton, PrintButton } from '@/components/ui/Export';
import { AIAssistant } from '@/components/ai';

export default function BaZiPage() {
  const [settings, setSettings] = useState<BaZiSettings>({
    name: '',
    occupy: '',
    sex: 1,
    date: '2024-01-01 00:00:00',
    dateType: 0,
    showLiuYue: true,
    showLiuRi: true,
    showLiuShi: true
  });

  const [result, setResult] = useState<BaZiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const paiPanResult = createBaZiPaiPan(settings);
      setResult(paiPanResult);
    } catch (error) {
      console.error('排盘失败:', error);
      alert('排盘失败，请检查输入信息');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      {/* 头部 */}
      <header className="border-b border-purple-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="text-3xl">☯</div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  八字排盘
                </h1>
                <p className="text-xs text-gray-500">四柱八字 · 推算命理</p>
              </div>
            </Link>
            <Link
              href="/"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transition-all"
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
                  label="占事（可选）"
                  type="text"
                  value={settings.occupy}
                  onChange={(e) => setSettings({ ...settings, occupy: e.target.value })}
                  placeholder="请输入占事"
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
                  onChange={(value) => {
                    const newDateType = Number(value) as 0 | 1;
                    // 切换到公历时，清除L:前缀
                    let newDate = settings.date;
                    if (newDateType === 0 && newDate.startsWith('L:')) {
                      newDate = newDate.replace('L:', '');
                    }
                    setSettings({ ...settings, dateType: newDateType, date: newDate });
                  }}
                  options={[
                    { label: '公历', value: 0 },
                    { label: '农历', value: 1 }
                  ]}
                />
              </div>

              {/* 日期时间 */}
              <DateTimePicker
                label="出生日期时间"
                value={settings.date}
                onChange={(value) => setSettings({ ...settings, date: value })}
                dateType={settings.dateType}
                helperText={settings.dateType === 0
                  ? "公历格式：2024-01-01 08:30:00"
                  : "农历格式：选择农历年月日时间后确认"
                }
              />

              {/* 提交按钮 */}
              <Button
                type="submit"
                loading={loading}
                fullWidth
                size="lg"
                gradient="from-purple-500 to-pink-500"
              >
                开始排盘
              </Button>
            </form>
          </Card>

          {/* 加载状态 */}
          {loading && (
            <div className="flex justify-center py-12">
              <Loading size="lg" text="正在排盘..." />
            </div>
          )}

          {/* 排盘结果 */}
          {result && !loading && (
            <div className="space-y-8 animate-fadeIn">
              {/* 操作按钮 */}
              <Card>
                <div className="flex flex-wrap gap-3">
                  <ExportButton data={result} filename={`八字排盘-${result.name || '未命名'}`} type="json">
                    导出数据
                  </ExportButton>
                  <PrintButton>打印结果</PrintButton>
                  <CopyButton text={JSON.stringify(result, null, 2)}>
                    复制结果
                  </CopyButton>
                </div>
              </Card>

              {/* 传统风格四柱展示 - 核心区域 */}
              <div className="bg-gradient-to-br from-purple-950 via-purple-900 to-pink-950 rounded-3xl p-8 shadow-2xl border border-purple-700/50">
                {/* 标题区 */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 mb-2">
                    四柱八字
                  </h2>
                  <div className="flex items-center justify-center gap-2 text-purple-300">
                    <span className="text-lg">☯</span>
                    <span className="text-sm">年柱 · 月柱 · 日柱 · 时柱</span>
                    <span className="text-lg">☯</span>
                  </div>
                </div>

                {/* 垂直四柱布局 - 传统命理纸风格 */}
                <div className="flex flex-col md:flex-row items-stretch justify-center gap-4 md:gap-8">
                  {[
                    { name: '年柱', data: result.baZi[0], wuXing: result.baZiWuXing[0], naYin: result.baZiNaYin[0], gan: result.yearGan, zhi: result.yearZhi, shiShen: result.shiShen?.year, cangGan: result.diZhiCangGan?.year, label: 'year' },
                    { name: '月柱', data: result.baZi[1], wuXing: result.baZiWuXing[1], naYin: result.baZiNaYin[1], gan: result.monthGan, zhi: result.monthZhi, shiShen: result.shiShen?.month, cangGan: result.diZhiCangGan?.month, label: 'month' },
                    { name: '日柱', data: result.baZi[2], wuXing: result.baZiWuXing[2], naYin: result.baZiNaYin[2], gan: result.dayGan, zhi: result.dayZhi, shiShen: result.shiShen?.day, cangGan: result.diZhiCangGan?.day, label: 'day' },
                    { name: '时柱', data: result.baZi[3], wuXing: result.baZiWuXing[3], naYin: result.baZiNaYin[3], gan: result.hourGan, zhi: result.hourZhi, shiShen: result.shiShen?.hour, cangGan: result.diZhiCangGan?.hour, label: 'hour' }
                  ].map((pillar, index) => (
                    <div
                      key={pillar.label}
                      className="flex-1 min-w-[180px] bg-gradient-to-b from-purple-800/80 to-pink-800/80 rounded-2xl border-2 border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 group overflow-hidden"
                    >
                      {/* 柱子标题 */}
                      <div className="bg-gradient-to-r from-purple-700/50 to-pink-700/50 py-3 text-center border-b border-purple-500/30">
                        <span className="text-lg font-semibold text-purple-100">{pillar.name}</span>
                      </div>

                      {/* 主干信息 */}
                      <div className="p-4 space-y-3">
                        {/* 天干地支 - 大字展示 */}
                        <div className="text-center py-2">
                          <div className="text-5xl font-bold text-white tracking-wider">{pillar.data}</div>
                        </div>

                        {/* 天干地支分离展示 */}
                        <div className="flex justify-center gap-4">
                          <div className="text-center">
                            <div className="text-xs text-purple-300 mb-1">天干</div>
                            <div className="text-2xl font-bold text-pink-200">{pillar.gan}</div>
                          </div>
                          <div className="w-px bg-purple-500/30"></div>
                          <div className="text-center">
                            <div className="text-xs text-purple-300 mb-1">地支</div>
                            <div className="text-2xl font-bold text-pink-200">{pillar.zhi}</div>
                          </div>
                        </div>

                        {/* 十神 */}
                        <div className="text-center">
                          <div className="inline-block px-4 py-1 bg-purple-900/50 rounded-full border border-purple-400/30">
                            <span className="text-sm text-purple-200">{pillar.shiShen}</span>
                          </div>
                        </div>

                        {/* 纳音五行 */}
                        <div className="text-center">
                          <div className="text-sm text-pink-300 font-medium">{pillar.naYin}</div>
                        </div>

                        {/* 五行属性 */}
                        <div className="flex justify-center">
                          <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            pillar.wuXing === '木' ? 'bg-green-500/20 text-green-300' :
                            pillar.wuXing === '火' ? 'bg-red-500/20 text-red-300' :
                            pillar.wuXing === '土' ? 'bg-yellow-500/20 text-yellow-300' :
                            pillar.wuXing === '金' ? 'bg-gray-400/20 text-gray-300' :
                            'bg-blue-500/20 text-blue-300'
                          }`}>
                            {pillar.wuXing}
                          </div>
                        </div>

                        {/* 地支藏干 */}
                        {(() => {
                          const cangGan = pillar.cangGan;
                          if (!cangGan?.gan || !cangGan?.shiShen) return null;
                          return (
                            <div className="mt-3 pt-3 border-t border-purple-500/20">
                              <div className="text-xs text-purple-400 text-center mb-2">地支藏干</div>
                              <div className="flex flex-wrap justify-center gap-1">
                                {cangGan.gan.map((gan, idx) => (
                                  <span key={idx} className="text-xs px-2 py-0.5 bg-purple-800/50 rounded text-purple-200">
                                    {gan}
                                    <span className="text-pink-300 ml-1">{cangGan.shiShen?.[idx]}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 日主信息 */}
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-purple-900/50 rounded-full border border-purple-500/30">
                    <span className="text-purple-300">日主</span>
                    <span className="text-2xl font-bold text-white">{result.dayGan}</span>
                    <span className="text-purple-300">
                      {result.shiShen?.day === '日主' ? '身旺' : '身弱'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 基础信息 */}
              <Card title="基础信息" icon="👤" gradient="from-purple-500 to-pink-500">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {result.name && (
                    <InfoCard label="姓名" value={result.name} color="from-purple-50 to-pink-50" />
                  )}
                  <InfoCard label="性别" value={result.sex} color="from-blue-50 to-cyan-50" />
                  <InfoCard label="年龄" value={`${result.age}岁`} color="from-green-50 to-emerald-50" />
                  <InfoCard label="生肖" value={result.shengXiao} color="from-orange-50 to-red-50" icon="🐉" />
                  <InfoCard label="星座" value={result.xingZuo} color="from-indigo-50 to-purple-50" icon="⭐" />
                  <InfoCard label="星期" value={result.xingQi} color="from-teal-50 to-cyan-50" />
                  <InfoCard label="季节" value={result.jiJie} color="from-amber-50 to-yellow-50" />
                </div>
                <div className="mt-6 pt-6 border-t border-purple-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="info" size="sm">公历</Badge>
                    <span className="font-medium text-gray-700">{result.solar}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="warning" size="sm">农历</Badge>
                    <span className="font-medium text-gray-700">{result.lunar}</span>
                  </div>
                </div>
              </Card>

              {/* 传统风格五行统计 - 太极图样式 */}
              <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl p-8 shadow-2xl border border-purple-700/50">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 mb-2">
                    五行运势
                  </h2>
                  <div className="text-purple-300 text-sm">木 · 火 · 土 · 金 · 水</div>
                </div>

                {/* 太极图式五行展示 */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
                  {/* 太极图装饰 */}
                  <div className="relative w-32 h-32 flex-shrink-0">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse"></div>
                    <div className="absolute inset-2 rounded-full bg-slate-900"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-900"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-purple-300"></div>
                  </div>

                  {/* 五行柱状图 */}
                  <div className="flex-1 max-w-2xl">
                    <div className="grid grid-cols-5 gap-3">
                      {[
                        { name: '木', count: result.muCount, color: 'from-green-500 to-emerald-600', lightColor: 'bg-green-400' },
                        { name: '火', count: result.huoCount, color: 'from-red-500 to-orange-600', lightColor: 'bg-red-400' },
                        { name: '土', count: result.tuCount, color: 'from-yellow-500 to-amber-600', lightColor: 'bg-yellow-400' },
                        { name: '金', count: result.jinCount, color: 'from-gray-400 to-slate-500', lightColor: 'bg-gray-300' },
                        { name: '水', count: result.shuiCount, color: 'from-blue-500 to-cyan-600', lightColor: 'bg-blue-400' }
                      ].map((item) => {
                        const maxCount = Math.max(result.muCount, result.huoCount, result.tuCount, result.jinCount, result.shuiCount, 1);
                        const height = (item.count / maxCount) * 100;
                        return (
                          <div key={item.name} className="flex flex-col items-center">
                            <div className="text-2xl font-bold text-white mb-2">{item.count}</div>
                            <div className="w-full h-32 flex items-end justify-center">
                              <div
                                className={`w-12 md:w-16 rounded-t-lg bg-gradient-to-t ${item.color} transition-all duration-500 hover:shadow-lg hover:shadow-purple-500/30`}
                                style={{ height: `${Math.max(height, 10)}%` }}
                              ></div>
                            </div>
                            <div className={`mt-2 px-3 py-1 rounded-full ${item.lightColor} bg-opacity-20 text-white text-sm font-medium`}>
                              {item.name}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 五行分析 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {result.wuXingWangShuai && (
                    <div className="text-center p-4 bg-purple-800/30 rounded-xl border border-purple-500/30">
                      <div className="text-purple-300 text-sm mb-1">五行旺衰</div>
                      <div className="text-xl font-bold text-white">{result.wuXingWangShuai}</div>
                    </div>
                  )}
                  {result.xiYongShen && (
                    <div className="text-center p-4 bg-pink-800/30 rounded-xl border border-pink-500/30">
                      <div className="text-pink-300 text-sm mb-1">喜用神</div>
                      <div className="text-xl font-bold text-white">{result.xiYongShen}</div>
                    </div>
                  )}
                  {result.wuXingQueShi && result.wuXingQueShi.length > 0 && (
                    <div className="text-center p-4 bg-red-900/30 rounded-xl border border-red-500/30">
                      <div className="text-red-300 text-sm mb-1">五行缺失</div>
                      <div className="flex justify-center gap-2 flex-wrap">
                        {result.wuXingQueShi.map((ws, idx) => (
                          <span key={idx} className="text-white font-medium">{ws}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 格局判断 */}
              {result.geJu && (
                <Card title="格局判断" icon="🎯" gradient="from-indigo-500 to-purple-500">
                  <div className="p-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-2xl border border-purple-500/30 mb-6">
                    <div className="flex items-center gap-6">
                      <div className="text-6xl">🎯</div>
                      <div className="flex-1">
                        <h4 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 mb-2">
                          {result.geJu.geJuName}
                        </h4>
                        <p className="text-purple-200 text-sm leading-relaxed">{result.geJu.geJuMeaning}</p>
                      </div>
                    </div>
                  </div>

                  {/* 用神系统 - 传统风格 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: '用神', value: result.geJu.yongShen, color: 'from-green-500 to-emerald-600', icon: '✨', desc: '命局核心' },
                      { label: '喜神', value: result.geJu.xiShen, color: 'from-blue-500 to-cyan-600', icon: '💫', desc: '辅助用神' },
                      { label: '忌神', value: result.geJu.jiShen, color: 'from-red-500 to-orange-600', icon: '⚠️', desc: '需要避免' },
                      { label: '仇神', value: result.geJu.chouShen, color: 'from-gray-500 to-slate-600', icon: '🚫', desc: '最不利五行' }
                    ].map((item, idx) => (
                      <div key={idx} className={`p-5 bg-gradient-to-br ${item.color} rounded-xl text-white`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span>{item.icon}</span>
                          <span className="text-sm opacity-90">{item.label}</span>
                        </div>
                        <div className="text-3xl font-bold mb-1">{item.value}</div>
                        <div className="text-xs opacity-75">{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* 传统风格大运流年 - 时间轴 */}
              {result.daYun && result.daYun.length > 0 && (
                <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl p-8 shadow-2xl border border-purple-700/50">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 mb-2">
                      大运流年
                    </h2>
                    <div className="text-purple-300 text-sm">时间轴 · 运势起伏</div>
                  </div>

                  {/* 起运信息 */}
                  <div className="flex justify-center mb-8">
                    <div className="px-6 py-3 bg-purple-800/40 rounded-full border border-purple-500/30">
                      <span className="text-purple-300 mr-2">起运</span>
                      <span className="text-white font-bold">{result.qiYunSui}岁</span>
                      {result.currentDaYun && (
                        <>
                          <span className="text-purple-300 mx-2">·</span>
                          <span className="text-pink-300 font-bold">当前大运 {result.currentDaYun.ganZhi}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 大运时间轴 */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-purple-200 mb-4 text-center">大运十年</h4>
                    <div className="relative">
                      {/* 时间轴线 */}
                      <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-pink-500 to-purple-500 transform -translate-x-1/2"></div>

                      {/* 大运节点 */}
                      <div className="space-y-4">
                        {result.daYun.slice(0, 10).map((dy, index) => {
                          const isCurrent = result.currentDaYun && dy.ganZhi === result.currentDaYun.ganZhi;
                          const isLeft = index % 2 === 0;
                          return (
                            <div key={index} className={`flex items-center ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
                              <div className={`flex-1 ${isLeft ? 'text-right pr-8' : 'text-left pl-8'}`}>
                                <div className={`inline-block p-4 rounded-xl border-2 transition-all hover:shadow-lg ${
                                  isCurrent
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-pink-400 shadow-purple-500/30'
                                    : 'bg-purple-900/50 border-purple-600/30 hover:border-purple-500/50'
                                }`}>
                                  <div className={`text-2xl font-bold mb-1 ${isCurrent ? 'text-white' : 'text-purple-200'}`}>
                                    {dy.ganZhi}
                                  </div>
                                  <div className={`text-sm ${isCurrent ? 'text-purple-100' : 'text-purple-400'}`}>
                                    {dy.startAge} - {dy.endAge}岁
                                  </div>
                                  <div className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${
                                    isCurrent ? 'bg-white/20 text-white' : 'bg-purple-800/50 text-purple-300'
                                  }`}>
                                    {dy.shiShen}
                                  </div>
                                </div>
                              </div>
                              {/* 时间轴节点 */}
                              <div className={`w-4 h-4 rounded-full border-2 z-10 flex-shrink-0 ${
                                isCurrent
                                  ? 'bg-pink-500 border-white shadow-lg shadow-pink-500/50'
                                  : 'bg-purple-600 border-purple-400'
                              }`}></div>
                              <div className="flex-1"></div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 近期流年 */}
                  {result.liuNian && result.liuNian.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-purple-200 mb-4 text-center">近期流年</h4>
                      <div className="flex flex-wrap justify-center gap-3">
                        {result.liuNian.map((ln, index) => {
                          const isCurrent = result.currentLiuNian && ln.year === result.currentLiuNian.year;
                          return (
                            <div
                              key={index}
                              className={`px-4 py-3 rounded-xl text-center transition-all hover:scale-105 ${
                                isCurrent
                                  ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg shadow-green-500/30'
                                  : 'bg-purple-800/40 border border-purple-500/30 text-purple-200'
                              }`}
                            >
                              <div className="text-xs mb-1">{ln.year}年</div>
                              <div className="text-xl font-bold">{ln.ganZhi}</div>
                              <div className={`text-xs ${isCurrent ? 'text-green-100' : 'text-purple-400'}`}>
                                {ln.shiShen} · {ln.age}岁
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 流月 */}
                  {result.liuYue && result.liuYue.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-blue-200 mb-4 text-center">流月</h4>
                      <div className="flex flex-wrap justify-center gap-2">
                        {result.liuYue.map((ly, index) => (
                          <div
                            key={index}
                            className={`px-3 py-2 rounded-lg text-center transition-all hover:scale-105 ${
                              ly.isCurrent
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                                : 'bg-blue-800/30 border border-blue-500/30 text-blue-200'
                            }`}
                          >
                            <div className="text-xs">{ly.monthName}</div>
                            <div className="text-lg font-bold">{ly.ganZhi}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 流日 */}
                  {result.liuRi && result.liuRi.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-green-200 mb-4 text-center">流日 ({result.liuRi.length}天)</h4>
                      <div className="flex flex-wrap justify-center gap-2 max-h-64 overflow-y-auto p-2">
                        {result.liuRi.map((lr, index) => (
                          <div
                            key={index}
                            className={`px-3 py-2 rounded-lg text-center transition-all hover:scale-105 ${
                              lr.isCurrent
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                                : 'bg-green-800/30 border border-green-500/30 text-green-200'
                            }`}
                          >
                            <div className="text-xs">{lr.day}日{lr.isCurrent && ' (今天)'}</div>
                            <div className="text-lg font-bold">{lr.ganZhi}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 神煞系统 */}
              {result.shenSha && result.shenSha.length > 0 && (
                <Card title="神煞分析" icon="✨" gradient="from-rose-500 to-pink-500">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: '年柱', ganZhi: result.baZi[0], shenSha: result.shenSha[0] },
                      { label: '月柱', ganZhi: result.baZi[1], shenSha: result.shenSha[1] },
                      { label: '日柱', ganZhi: result.baZi[2], shenSha: result.shenSha[2] },
                      { label: '时柱', ganZhi: result.baZi[3], shenSha: result.shenSha[3] }
                    ].map((item, index) => (
                      <div key={index} className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg border-2 border-rose-200 hover:border-rose-300 transition-all">
                        <div className="text-xs text-gray-600 mb-1">{item.label}</div>
                        <div className="text-2xl font-bold text-gray-800 mb-2">{item.ganZhi}</div>
                        <div className="flex flex-wrap gap-1">
                          {item.shenSha && item.shenSha.length > 0 ? (
                            item.shenSha.map((ss, idx) => (
                              <Badge key={idx} variant="danger" size="sm">
                                {ss}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">无</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 神煞汇总 */}
                  <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border-2 border-yellow-300">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span>📋</span>
                      神煞汇总
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(result.shenSha.flat())).map((ss, idx) => (
                        <Badge key={idx} variant="warning" size="md">
                          {ss}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {/* 五行生克关系 */}
              {result.wuXingShengKe && (
                <Card title="五行生克关系" icon="🔄" gradient="from-teal-500 to-cyan-500">
                  <div className="space-y-4">
                    {/* 天干五合 */}
                    {result.wuXingShengKe.tianGanWuHe && result.wuXingShengKe.tianGanWuHe.length > 0 && (
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-300">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <span className="text-lg">🤝</span>
                          天干五合
                        </h4>
                        <div className="space-y-2">
                          {result.wuXingShengKe.tianGanWuHe.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-white/80 rounded px-3 py-2">
                              <Badge variant="success" size="sm">{item.position1}</Badge>
                              <span className="font-medium">{item.gan1}</span>
                              <span className="text-green-600">合</span>
                              <Badge variant="success" size="sm">{item.position2}</Badge>
                              <span className="font-medium">{item.gan2}</span>
                              {item.heHua && (
                                <>
                                  <span className="text-green-600">→</span>
                                  <Badge variant="success" size="sm">化{item.heHua}</Badge>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 地支三合 */}
                    {result.wuXingShengKe.diZhiSanHe && result.wuXingShengKe.diZhiSanHe.length > 0 && (
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-300">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <span className="text-lg">🔷</span>
                          地支三合
                        </h4>
                        <div className="space-y-2">
                          {result.wuXingShengKe.diZhiSanHe.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-white/80 rounded px-3 py-2 flex-wrap">
                              {item.positions.map((pos, i) => (
                                <Badge key={i} variant="info" size="sm">{pos}</Badge>
                              ))}
                              <span className="font-medium">{item.zhis.join('、')}</span>
                              <Badge variant="info" size="md">
                                {item.isComplete ? '三合' : '半合'}{item.wuXing}局
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 地支三会 */}
                    {result.wuXingShengKe.diZhiSanHui && result.wuXingShengKe.diZhiSanHui.length > 0 && (
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border-2 border-purple-300">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <span className="text-lg">🔶</span>
                          地支三会
                        </h4>
                        <div className="space-y-2">
                          {result.wuXingShengKe.diZhiSanHui.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-white/80 rounded px-3 py-2 flex-wrap">
                              {item.positions.map((pos, i) => (
                                <Badge key={i} variant="info" size="sm">{pos}</Badge>
                              ))}
                              <span className="font-medium">{item.zhis.join('、')}</span>
                              <Badge variant="info" size="md">
                                {item.isComplete ? '三会' : '半会'}{item.wuXing}局
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 地支六合 */}
                    {result.wuXingShengKe.diZhiLiuHe && result.wuXingShengKe.diZhiLiuHe.length > 0 && (
                      <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border-2 border-teal-300">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <span className="text-lg">💚</span>
                          地支六合
                        </h4>
                        <div className="space-y-2">
                          {result.wuXingShengKe.diZhiLiuHe.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-white/80 rounded px-3 py-2">
                              <Badge variant="success" size="sm">{item.position1}</Badge>
                              <span className="font-medium">{item.zhi1}</span>
                              <span className="text-teal-600">合</span>
                              <Badge variant="success" size="sm">{item.position2}</Badge>
                              <span className="font-medium">{item.zhi2}</span>
                              {item.heHua && (
                                <>
                                  <span className="text-teal-600">→</span>
                                  <Badge variant="success" size="sm">化{item.heHua}</Badge>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 地支相冲 */}
                    {result.wuXingShengKe.diZhiXiangChong && result.wuXingShengKe.diZhiXiangChong.length > 0 && (
                      <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border-2 border-red-300">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <span className="text-lg">⚡</span>
                          地支相冲
                        </h4>
                        <div className="space-y-2">
                          {result.wuXingShengKe.diZhiXiangChong.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-white/80 rounded px-3 py-2">
                              <Badge variant="danger" size="sm">{item.position1}</Badge>
                              <span className="font-medium">{item.zhi1}</span>
                              <span className="text-red-600 font-bold">冲</span>
                              <Badge variant="danger" size="sm">{item.position2}</Badge>
                              <span className="font-medium">{item.zhi2}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 地支相刑 */}
                    {result.wuXingShengKe.diZhiXiangXing && result.wuXingShengKe.diZhiXiangXing.length > 0 && (
                      <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border-2 border-orange-300">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <span className="text-lg">⚠️</span>
                          地支相刑
                        </h4>
                        <div className="space-y-2">
                          {result.wuXingShengKe.diZhiXiangXing.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-white/80 rounded px-3 py-2 flex-wrap">
                              {item.positions.map((pos, i) => (
                                <Badge key={i} variant="warning" size="sm">{pos}</Badge>
                              ))}
                              <span className="font-medium">{item.zhis.join('、')}</span>
                              <Badge variant="warning" size="md">{item.xingType}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 地支相害 */}
                    {result.wuXingShengKe.diZhiXiangHai && result.wuXingShengKe.diZhiXiangHai.length > 0 && (
                      <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border-2 border-gray-300">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <span className="text-lg">🔸</span>
                          地支相害
                        </h4>
                        <div className="space-y-2">
                          {result.wuXingShengKe.diZhiXiangHai.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-white/80 rounded px-3 py-2">
                              <Badge variant="default" size="sm">{item.position1}</Badge>
                              <span className="font-medium">{item.zhi1}</span>
                              <span className="text-gray-600">害</span>
                              <Badge variant="default" size="sm">{item.position2}</Badge>
                              <span className="font-medium">{item.zhi2}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 地支相破 */}
                    {result.wuXingShengKe.diZhiXiangPo && result.wuXingShengKe.diZhiXiangPo.length > 0 && (
                      <div className="p-4 bg-gradient-to-r from-stone-50 to-neutral-50 rounded-lg border-2 border-stone-300">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <span className="text-lg">💔</span>
                          地支相破
                        </h4>
                        <div className="space-y-2">
                          {result.wuXingShengKe.diZhiXiangPo.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-white/80 rounded px-3 py-2">
                              <Badge variant="default" size="sm">{item.position1}</Badge>
                              <span className="font-medium">{item.zhi1}</span>
                              <span className="text-stone-600">破</span>
                              <Badge variant="default" size="sm">{item.position2}</Badge>
                              <span className="font-medium">{item.zhi2}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* 十神系统 */}
              {result.shiShen && (
                <Card title="十神分析" icon="🔮" gradient="from-indigo-500 to-purple-500">
                  {/* 天干十神 */}
                  <div className="mb-6">
                    <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span className="text-lg">☀️</span>
                      天干十神
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: '年干', value: result.shiShen.year, gan: result.yearGan },
                        { label: '月干', value: result.shiShen.month, gan: result.monthGan },
                        { label: '日干', value: result.shiShen.day, gan: result.dayGan },
                        { label: '时干', value: result.shiShen.hour, gan: result.hourGan }
                      ].map((item, index) => (
                        <div key={index} className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200 hover:border-indigo-300 transition-all">
                          <div className="text-xs text-gray-600 mb-1">{item.label}</div>
                          <div className="text-3xl font-bold text-gray-800 mb-2">{item.gan}</div>
                          <Badge
                            variant={item.value === '日主' ? 'danger' : 'info'}
                            size="md"
                            className="w-full text-center"
                          >
                            {item.value}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 地支藏干十神 */}
                  {result.shiShenZhi && (
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="text-lg">🌙</span>
                        地支藏干十神
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: '年支', value: result.shiShenZhi.year, zhi: result.yearZhi },
                          { label: '月支', value: result.shiShenZhi.month, zhi: result.monthZhi },
                          { label: '日支', value: result.shiShenZhi.day, zhi: result.dayZhi },
                          { label: '时支', value: result.shiShenZhi.hour, zhi: result.hourZhi }
                        ].map((item, index) => (
                          <div key={index} className="p-4 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg border-2 border-teal-200 hover:border-teal-300 transition-all">
                            <div className="text-xs text-gray-600 mb-1">{item.label}</div>
                            <div className="text-2xl font-bold text-gray-800 mb-2">{item.zhi}</div>
                            <div className="flex flex-wrap gap-1">
                              {item.value.map((ss, idx) => (
                                <Badge key={idx} variant="success" size="sm">
                                  {ss}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 地支藏干详情 */}
                  {result.diZhiCangGan && (
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="text-lg">📦</span>
                        地支藏干详情
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: '年支', zhi: result.yearZhi, data: result.diZhiCangGan.year },
                          { label: '月支', zhi: result.monthZhi, data: result.diZhiCangGan.month },
                          { label: '日支', zhi: result.dayZhi, data: result.diZhiCangGan.day },
                          { label: '时支', zhi: result.hourZhi, data: result.diZhiCangGan.hour }
                        ].map((item, index) => (
                          <div key={index} className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg border-2 border-emerald-200 hover:border-emerald-300 transition-all">
                            <div className="text-xs text-gray-600 mb-1">{item.label}</div>
                            <div className="text-xl font-bold text-gray-800 mb-2">{item.zhi}</div>
                            <div className="space-y-1">
                              {item.data.gan.map((gan, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-white/80 rounded px-2 py-1 text-sm">
                                  <span className="font-medium text-gray-700">{gan}</span>
                                  <Badge variant="success" size="sm">{item.data.shiShen[idx]}</Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 十神格局分析 */}
                  {result.shiShenAnalysis && (
                    <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-300">
                      <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="text-xl">💡</span>
                        格局分析
                      </h4>
                      <p className="text-sm text-gray-700 leading-relaxed">{result.shiShenAnalysis}</p>
                    </div>
                  )}
                </Card>
              )}

              {/* 干支详情 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="天干" icon="☀️" gradient="from-orange-500 to-red-500">
                  <div className="space-y-3">
                    {[
                      { label: '年干', value: result.yearGan },
                      { label: '月干', value: result.monthGan },
                      { label: '日干', value: result.dayGan },
                      { label: '时干', value: result.hourGan }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                        <Badge variant="warning" size="md">{item.label}</Badge>
                        <span className="text-2xl font-bold text-gray-800">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="地支" icon="🌙" gradient="from-green-500 to-emerald-500">
                  <div className="space-y-3">
                    {[
                      { label: '年支', value: result.yearZhi },
                      { label: '月支', value: result.monthZhi },
                      { label: '日支', value: result.dayZhi },
                      { label: '时支', value: result.hourZhi }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                        <Badge variant="success" size="md">{item.label}</Badge>
                        <span className="text-2xl font-bold text-gray-800">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* 新增：彭祖百忌、命卦、重冲生肖 */}
              {(result.pengZuBaiJi || result.mingGua || result.chongShengXiao || result.yueJiang || result.riZhuLunMing) && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {result.pengZuBaiJi && (
                    <Card title="彭祖百忌" icon="📜">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-amber-100 rounded">
                          <span className="text-amber-800">干百忌</span>
                          <span className="font-bold text-amber-900 text-lg">{result.pengZuBaiJi.gan}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-orange-100 rounded">
                          <span className="text-orange-800">支百忌</span>
                          <span className="font-bold text-orange-900 text-lg">{result.pengZuBaiJi.zhi}</span>
                        </div>
                      </div>
                    </Card>
                  )}

                  {result.mingGua && (
                    <Card title="命卦" icon="🏠">
                      <div className="text-center py-4">
                        <span className="text-2xl font-bold text-purple-900">{result.mingGua}</span>
                      </div>
                    </Card>
                  )}

                  {result.chongShengXiao && (
                    <Card title="重冲生肖" icon="⚡">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm p-2 bg-red-50 rounded">
                          <span className="text-red-700">年柱</span>
                          <span className="font-bold text-red-900">{result.chongShengXiao.year}</span>
                        </div>
                        <div className="flex justify-between text-sm p-2 bg-pink-50 rounded">
                          <span className="text-pink-700">月柱</span>
                          <span className="font-bold text-pink-900">{result.chongShengXiao.month}</span>
                        </div>
                        <div className="flex justify-between text-sm p-2 bg-rose-50 rounded">
                          <span className="text-rose-700">日柱</span>
                          <span className="font-bold text-rose-900">{result.chongShengXiao.day}</span>
                        </div>
                        <div className="flex justify-between text-sm p-2 bg-red-50 rounded">
                          <span className="text-red-700">时柱</span>
                          <span className="font-bold text-red-900">{result.chongShengXiao.hour}</span>
                        </div>
                      </div>
                    </Card>
                  )}

                  {result.yueJiang && (
                    <Card title="月将" icon="🌙">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-3 bg-blue-100 rounded">
                          <span className="text-blue-800">月将</span>
                          <span className="font-bold text-blue-900 text-lg">{result.yueJiang.yueJiang}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-cyan-100 rounded">
                          <span className="text-cyan-800">月将神</span>
                          <span className="font-bold text-cyan-900">{result.yueJiang.yueJiangShen}</span>
                        </div>
                      </div>
                    </Card>
                  )}

                  {result.riZhuLunMing && (
                    <Card title="日主论命" icon="💫">
                      <p className="text-teal-900 text-center font-medium bg-teal-50 p-3 rounded">{result.riZhuLunMing}</p>
                    </Card>
                  )}
                </div>
              )}

              {/* 新增：财运 */}
              {result.caiYun && (result.caiYun.zhengCai?.length > 0 || result.caiYun.pianCai?.length > 0) && (
                <Card title="财运分析" icon="💰">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {result.caiYun.zhengCai && result.caiYun.zhengCai.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-bold text-amber-900 flex items-center gap-2">
                          <span>正财</span>
                          <span className="text-xs bg-amber-200 px-2 py-0.5 rounded">稳定收入</span>
                        </h4>
                        <div className="space-y-2">
                          {result.caiYun.zhengCai.slice(0, 5).map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-amber-50 rounded">
                              <span className="font-bold text-amber-900 text-lg">{item.ganZhi}</span>
                              <span className="text-sm text-amber-700">{item.year > 0 ? `${item.year}年` : `大运第${item.age}岁`}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {result.caiYun.pianCai && result.caiYun.pianCai.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-bold text-orange-900 flex items-center gap-2">
                          <span>偏财</span>
                          <span className="text-xs bg-orange-200 px-2 py-0.5 rounded">意外之财</span>
                        </h4>
                        <div className="space-y-2">
                          {result.caiYun.pianCai.slice(0, 5).map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-orange-50 rounded">
                              <span className="font-bold text-orange-900 text-lg">{item.ganZhi}</span>
                              <span className="text-sm text-orange-700">{item.year > 0 ? `${item.year}年` : `大运第${item.age}岁`}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* 新增：桃花运 */}
              {result.taoHuaYun && (result.taoHuaYun.zhengTaoHua?.length > 0 || result.taoHuaYun.pianTaoHua?.length > 0) && (
                <Card title="桃花运" icon="🌸">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {result.taoHuaYun.zhengTaoHua && result.taoHuaYun.zhengTaoHua.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-bold text-rose-900 flex items-center gap-2">
                          <span>正桃花</span>
                          <span className="text-xs bg-rose-200 px-2 py-0.5 rounded">稳定感情</span>
                        </h4>
                        <div className="space-y-2">
                          {result.taoHuaYun.zhengTaoHua.slice(0, 5).map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-rose-50 rounded">
                              <span className="font-bold text-rose-900 text-lg">{item.ganZhi}</span>
                              <span className="text-sm text-rose-700">{item.year > 0 ? `${item.year}年` : `大运第${item.age}岁`}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {result.taoHuaYun.pianTaoHua && result.taoHuaYun.pianTaoHua.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-bold text-pink-900 flex items-center gap-2">
                          <span>偏桃花</span>
                          <span className="text-xs bg-pink-200 px-2 py-0.5 rounded">浪漫邂逅</span>
                        </h4>
                        <div className="space-y-2">
                          {result.taoHuaYun.pianTaoHua.slice(0, 5).map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-pink-50 rounded">
                              <span className="font-bold text-pink-900 text-lg">{item.ganZhi}</span>
                              <span className="text-sm text-pink-700">{item.year > 0 ? `${item.year}年` : `大运第${item.age}岁`}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>

      {/* AI助手 */}
      {result && <AIAssistant system="bazi" chartData={result} />}
    </div>
  );
}
