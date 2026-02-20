'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createQiMenPaiPan } from '@/lib/qimen';
import { QiMenSettings, QiMenResult } from '@/types';
import { Card, InfoCard } from '@/components/ui/Card';
import { Input, RadioGroup } from '@/components/ui/Input';
import { DateTimePicker, Select } from '@/components/ui/FormControls';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { AIAssistant } from '@/components/ai';

export default function QiMenPage() {
  const [settings, setSettings] = useState<QiMenSettings>({
    name: '',
    occupy: '',
    sex: 1,
    date: '2024-01-01 00:00:00',
    dateType: 0,
    panType: 'zhuan',
    paiPanType: 3,  // 默认时家奇门
    zhiShiType: 0,
    yueJiaQiJuType: 1,
    jieQiType: 1,
    yearGanZhiType: 2,
    monthGanZhiType: 1,
    dayGanZhiType: 0,
    leapMonthType: 0
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const [result, setResult] = useState<QiMenResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const paiPanResult = createQiMenPaiPan(settings);
      setResult(paiPanResult);
    } catch (error) {
      console.error('排盘失败:', error);
      alert('排盘失败，请检查输入信息');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* 头部 */}
      <header className="border-b border-orange-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="text-3xl">⚍</div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  奇门遁甲排盘
                </h1>
                <p className="text-xs text-gray-500">帝王之学 · 运筹帷幄</p>
              </div>
            </Link>
            <Link
              href="/"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg transition-all"
            >
              返回首页
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 输入表单 */}
          <Card
            title="输入信息"
            icon="📝"
            className="mb-8 animate-fade-in"
          >
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
                  onChange={(value) => setSettings({ ...settings, sex: value as 0 | 1 })}
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
                  onChange={(value) => setSettings({ ...settings, dateType: value as 0 | 1 })}
                  options={[
                    { label: '公历', value: 0 },
                    { label: '农历', value: 1 }
                  ]}
                />
              </div>

              {/* 日期时间 */}
              <DateTimePicker
                label="起局日期时间"
                value={settings.date}
                onChange={(value) => setSettings({ ...settings, date: value })}
                dateType={settings.dateType}
                helperText="格式：年-月-日 时:分:秒（例如：2024-01-01 08:30:00）"
              />

              {/* 高级配置 */}
              <div className="border-t pt-6">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
                >
                  <span className="text-lg">{showAdvanced ? '▼' : '▶'}</span>
                  <span>高级配置</span>
                </button>

                {showAdvanced && (
                  <div className="mt-6 space-y-6 p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl animate-fade-in">
                    {/* 排盘类型 */}
                    <Select
                      label="排盘类型"
                      value={settings.paiPanType ?? 3}
                      onChange={(value) => setSettings({ ...settings, paiPanType: Number(value) as 0 | 1 | 2 | 3 })}
                      options={[
                        { label: '时家奇门（推荐）', value: 3 },
                        { label: '日家奇门', value: 2 },
                        { label: '月家奇门', value: 1 },
                        { label: '年家奇门', value: 0 }
                      ]}
                    />
                    <p className="text-xs text-gray-600 -mt-4">
                      时家奇门最常用，适合日常占断；年月日家奇门用于特殊预测
                    </p>

                    {/* 值使类型 */}
                    <Select
                      label="值使类型（天禽星为值符时）"
                      value={settings.zhiShiType ?? 0}
                      onChange={(value) => setSettings({ ...settings, zhiShiType: Number(value) as 0 | 1 | 2 })}
                      options={[
                        { label: '一律用死门（传统）', value: 0 },
                        { label: '根据阴阳遁判断', value: 1 },
                        { label: '根据节气判断', value: 2 }
                      ]}
                    />

                    {/* 月家奇门起局类型 */}
                    {settings.paiPanType === 1 && (
                      <Select
                        label="月家奇门起局方式"
                        value={settings.yueJiaQiJuType ?? 1}
                        onChange={(value) => setSettings({ ...settings, yueJiaQiJuType: Number(value) as 0 | 1 })}
                        options={[
                          { label: '使用年干支符头地支起局（推荐）', value: 1 },
                          { label: '使用年支起局', value: 0 }
                        ]}
                      />
                    )}

                    {/* 节气类型 */}
                    <Select
                      label="节气计算方式"
                      value={settings.jieQiType ?? 1}
                      onChange={(value) => setSettings({ ...settings, jieQiType: Number(value) as 0 | 1 })}
                      options={[
                        { label: '按分钟计算（精确）', value: 1 },
                        { label: '按天计算', value: 0 }
                      ]}
                    />

                    {/* 年干支类型 */}
                    <Select
                      label="年干支起算方式"
                      value={settings.yearGanZhiType ?? 2}
                      onChange={(value) => setSettings({ ...settings, yearGanZhiType: Number(value) as 0 | 1 | 2 })}
                      options={[
                        { label: '以立春交接时刻为新年（推荐）', value: 2 },
                        { label: '以立春当天为新年', value: 1 },
                        { label: '以正月初一为新年', value: 0 }
                      ]}
                    />

                    {/* 月干支类型 */}
                    <Select
                      label="月干支起算方式"
                      value={settings.monthGanZhiType ?? 1}
                      onChange={(value) => setSettings({ ...settings, monthGanZhiType: Number(value) as 0 | 1 })}
                      options={[
                        { label: '以节交接时刻起算（推荐）', value: 1 },
                        { label: '以节交接当天起算', value: 0 }
                      ]}
                    />

                    {/* 日干支类型 */}
                    <Select
                      label="晚子时日柱处理"
                      value={settings.dayGanZhiType ?? 0}
                      onChange={(value) => setSettings({ ...settings, dayGanZhiType: Number(value) as 0 | 1 })}
                      options={[
                        { label: '晚子时日柱按当天（推荐）', value: 0 },
                        { label: '晚子时日柱按明天', value: 1 }
                      ]}
                    />

                    {/* 闰月类型 */}
                    {settings.dateType === 1 && (
                      <Select
                        label="闰月处理"
                        value={settings.leapMonthType ?? 0}
                        onChange={(value) => setSettings({ ...settings, leapMonthType: Number(value) as 0 | 1 })}
                        options={[
                          { label: '不使用闰月', value: 0 },
                          { label: '使用闰月', value: 1 }
                        ]}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* 提交按钮 */}
              <Button
                type="submit"
                loading={loading}
                fullWidth
                size="lg"
                gradient="from-orange-500 to-red-500"
              >
                {loading ? '起局中...' : '开始起局'}
              </Button>
            </form>
          </Card>

          {/* 排盘结果 */}
          {result && (
            <div className="animate-fade-in space-y-8">
              {/* 基础信息卡片 */}
              <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl p-1 shadow-2xl">
                <div className="bg-white rounded-xl p-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      奇门遁甲局式
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">{result.juShu} · {result.yinYangDun}</p>
                  </div>

                  {/* 核心信息展示 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {result.name && (
                      <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">姓名</div>
                        <div className="font-semibold text-gray-800">{result.name}</div>
                      </div>
                    )}
                    {result.occupy && (
                      <div className="text-center p-3 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">占事</div>
                        <div className="font-semibold text-gray-800 truncate">{result.occupy}</div>
                      </div>
                    )}
                    <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">公历</div>
                      <div className="font-semibold text-gray-800">{result.solar}</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">农历</div>
                      <div className="font-semibold text-gray-800">{result.lunar}</div>
                    </div>
                  </div>

                  {/* 四柱干支 */}
                  {result.yearGanZhi && (
                    <div className="grid grid-cols-4 gap-3 mb-6">
                      <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">年柱</div>
                        <div className="font-bold text-purple-600">{result.yearGanZhi}</div>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">月柱</div>
                        <div className="font-bold text-blue-600">{result.monthGanZhi}</div>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">日柱</div>
                        <div className="font-bold text-yellow-600">{result.dayGanZhi}</div>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">时柱</div>
                        <div className="font-bold text-indigo-600">{result.hourGanZhi}</div>
                      </div>
                    </div>
                  )}

                  {/* 奇门要素 */}
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    <div className="text-center p-3 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border border-orange-200">
                      <div className="text-xs text-gray-500 mb-1">符头</div>
                      <div className="font-bold text-orange-600">{result.fuTou}</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div className="text-xs text-gray-500 mb-1">节气</div>
                      <div className="font-bold text-green-600">{result.jieQi}</div>
                    </div>
                    {result.sanYuan && (
                      <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                        <div className="text-xs text-gray-500 mb-1">三元</div>
                        <div className="font-bold text-blue-600">{result.sanYuan}</div>
                      </div>
                    )}
                    <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                      <div className="text-xs text-gray-500 mb-1">阴阳遁</div>
                      <div className="font-bold text-purple-600">{result.yinYangDun}</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                      <div className="text-xs text-gray-500 mb-1">局数</div>
                      <div className="font-bold text-yellow-600">{result.juShu}</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                      <div className="text-xs text-gray-500 mb-1">旬首</div>
                      <div className="font-bold text-indigo-600">{result.xunShou}</div>
                    </div>
                  </div>

                  {/* 值符值使 */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="p-4 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl border-2 border-orange-300 text-center">
                      <div className="text-sm text-orange-700 mb-1">值符</div>
                      <div className="text-2xl font-bold text-orange-600">{result.zhiFu}</div>
                      {result.newZhiFuGongWei !== undefined && (
                        <div className="text-xs text-orange-500 mt-1">落 {result.newZhiFuGongWei}宫</div>
                      )}
                    </div>
                    <div className="p-4 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl border-2 border-red-300 text-center">
                      <div className="text-sm text-red-700 mb-1">值使</div>
                      <div className="text-2xl font-bold text-red-600">{result.zhiShi}</div>
                      {result.newZhiShiGongWei !== undefined && (
                        <div className="text-xs text-red-500 mt-1">落 {result.newZhiShiGongWei}宫</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 传统文化装饰标题 */}
              <div className="text-center">
                <div className="inline-flex items-center gap-4">
                  <div className="h-px w-16 bg-gradient-to-r from-transparent to-orange-500"></div>
                  <h3 className="text-xl font-bold text-gray-800 px-4">
                    <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      九宫星门神格局
                    </span>
                  </h3>
                  <div className="h-px w-16 bg-gradient-to-l from-transparent to-red-500"></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">上天下地 中分八卦 · 阴阳动静 吉凶分明</p>
              </div>

              {/* 精美九宫格 */}
              <div className="bg-gradient-to-br from-orange-100 via-red-50 to-pink-100 rounded-3xl p-8 shadow-2xl border-4 border-orange-200">
                {/* 九宫外框装饰 */}
                <div className="relative">
                  {/* 四个角的装饰 */}
                  <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-orange-500 rounded-tl-lg"></div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-red-500 rounded-tr-lg"></div>
                  <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-red-500 rounded-bl-lg"></div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-orange-500 rounded-br-lg"></div>

                  <div className="grid grid-cols-3 gap-3">
                    {/* 巽四宫 - 震三宫 - 坤二宫 */}
                    {[
                      { gong: '巽四宫', index: 0, bagua: '☴', wuxing: '木', color: 'from-green-400 to-emerald-500' },
                      { gong: '离九宫', index: 1, bagua: '☲', wuxing: '火', color: 'from-red-400 to-orange-500' },
                      { gong: '坤二宫', index: 2, bagua: '☷', wuxing: '土', color: 'from-yellow-400 to-amber-500' },
                      { gong: '震三宫', index: 3, bagua: '☳', wuxing: '木', color: 'from-green-500 to-teal-500' },
                      { gong: '中五宫', index: 4, bagua: '☯', wuxing: '土', color: 'from-yellow-500 to-orange-500' },
                      { gong: '兑七宫', index: 5, bagua: '☱', wuxing: '金', color: 'from-gray-400 to-zinc-500' },
                      { gong: '坎一宫', index: 6, bagua: '☵', wuxing: '水', color: 'from-blue-400 to-cyan-500' },
                      { gong: '艮八宫', index: 7, bagua: '☶', wuxing: '土', color: 'from-amber-500 to-brown-500' },
                      { gong: '乾六宫', index: 8, bagua: '☰', wuxing: '金', color: 'from-orange-400 to-red-500' }
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className={`relative p-4 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br ${item.color} text-white`}
                      >
                        {/* 宫位标识 */}
                        <div className="absolute -top-2 -left-2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold backdrop-blur-sm">
                          {item.bagua}
                        </div>

                        {/* 宫位名称 */}
                        <div className="text-center mb-3 mt-2">
                          <div className="text-xs opacity-80">{item.wuxing}</div>
                          <div className="font-bold text-lg">{item.gong}</div>
                        </div>

                        {/* 天地人神四层 */}
                        <div className="space-y-1.5 text-center">
                          {/* 天盘九星 */}
                          <div className="bg-white/20 rounded-lg py-1.5 px-2 backdrop-blur-sm">
                            <div className="text-[10px] opacity-70">天盘</div>
                            <div className="font-bold text-sm">{result.tianPan[item.index]}</div>
                          </div>

                          {/* 神盘八神 */}
                          <div className="bg-white/15 rounded-lg py-1 px-2 backdrop-blur-sm">
                            <div className="text-[10px] opacity-70">神盘</div>
                            <div className="font-semibold text-sm">{result.shenPan[item.index]}</div>
                          </div>

                          {/* 人盘八门 */}
                          <div className="bg-white/15 rounded-lg py-1 px-2 backdrop-blur-sm">
                            <div className="text-[10px] opacity-70">人盘</div>
                            <div className="font-semibold text-sm">{result.renPan[item.index]}</div>
                          </div>

                          {/* 地盘奇仪 */}
                          <div className="bg-white/25 rounded-lg py-1.5 px-2 backdrop-blur-sm border border-white/30">
                            <div className="text-[10px] opacity-70">地盘</div>
                            <div className="font-bold text-base">{result.diPan[item.index]}</div>
                          </div>
                        </div>

                        {/* 吉凶标记 */}
                        {(result.jiXing?.includes(item.index.toString()) || result.xiongXing?.includes(item.index.toString())) && (
                          <div className="absolute top-2 right-2">
                            {result.jiXing?.includes(item.index.toString()) ? (
                              <span className="text-xs bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded-full font-bold">吉</span>
                            ) : (
                              <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">凶</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 星门神详情 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 九星 */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 shadow-lg">
                  <h4 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
                    <span className="text-2xl">⭐</span>
                    九星
                  </h4>
                  <div className="space-y-2">
                    {['天蓬', '天任', '天冲', '天辅', '天禽', '天心', '天柱', '天任', '天英'].map((star, idx) => {
                      const starIdx = [0, 7, 1, 3, 4, 5, 6, 7, 2][idx];
                      const foundInPan = result.tianPan.findIndex(s => s === star);
                      return (
                        <div key={star} className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                          <span className="font-semibold text-gray-700">{star}</span>
                          {foundInPan !== -1 && (
                            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                              {['巽四', '坎一', '离九', '巽四', '中五', '乾六', '坎一', '艮八', '离九'][foundInPan]}宫
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 八门 */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg">
                  <h4 className="text-lg font-bold text-blue-700 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🚪</span>
                    八门
                  </h4>
                  <div className="space-y-2">
                    {['休', '生', '伤', '杜', '景', '死', '惊', '开'].map((men, idx) => {
                      const foundInPan = result.renPan.findIndex(s => s === men);
                      return (
                        <div key={men} className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                          <span className="font-semibold text-gray-700">{men}门</span>
                          {foundInPan !== -1 && (
                            <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                              {['巽四', '坎一', '震三', '巽四', '离九', '坤二', '兑七', '乾六'][foundInPan]}宫
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 八神 */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200 shadow-lg">
                  <h4 className="text-lg font-bold text-purple-700 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🔯</span>
                    八神
                  </h4>
                  <div className="space-y-2">
                    {['值符', '螣蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天'].map((shen, idx) => {
                      const foundInPan = result.shenPan.findIndex(s => s === shen);
                      return (
                        <div key={shen} className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                          <span className="font-semibold text-gray-700">{shen}</span>
                          {foundInPan !== -1 && (
                            <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
                              {['巽四', '坎一', '离九', '巽四', '坤二', '兑七', '艮八', '乾六'][foundInPan]}宫
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 三奇六仪 */}
              <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 rounded-2xl p-6 border-2 border-orange-200 shadow-lg">
                <h4 className="text-lg font-bold text-orange-700 mb-4 flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  三奇六仪（地盘）
                </h4>
                <div className="flex flex-wrap justify-center gap-3">
                  {['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'].map((yi, idx) => {
                    const foundIdx = result.diPan.findIndex(d => d === yi);
                    return (
                      <div
                        key={yi}
                        className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center shadow-md ${
                          ['三奇', '六仪'].includes(yi === '丁' || yi === '丙' || yi === '乙' ? '三奇' : '六仪')
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                            : 'bg-gradient-to-br from-gray-200 to-gray-300'
                        } ${['丁', '丙', '乙'].includes(yi) ? 'ring-2 ring-yellow-400' : ''}`}
                      >
                        <span className="text-2xl font-bold text-gray-800">{yi}</span>
                        {foundIdx !== -1 && (
                          <span className="text-[10px] text-gray-600">
                            {['巽四', '坎一', '离九', '坤二', '震三', '中五', '兑七', '艮八', '乾六'][foundIdx]}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="text-center mt-4 text-sm text-gray-600">
                  <span className="inline-block px-3 py-1 bg-yellow-400/30 rounded-full mr-2">三奇：丁丙乙</span>
                  <span className="inline-block px-3 py-1 bg-gray-300/50 rounded-full">六仪：戊己庚辛壬癸</span>
                </div>
              </div>

              {/* 说明 */}
              <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-orange-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span>📖</span>
                  奇门遁甲说明
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                  <div className="flex items-start gap-2">
                    <Badge variant="info" size="sm">地盘</Badge>
                    <span>三奇六仪（戊己庚辛壬癸丁丙乙）</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="success" size="sm">天盘</Badge>
                    <span>九星（天蓬、天芮、天冲、天辅、天禽、天心、天柱、天任、天英）</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="warning" size="sm">人盘</Badge>
                    <span>八门（休、生、伤、杜、景、死、惊、开）</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="danger" size="sm">神盘</Badge>
                    <span>八神（值符、螣蛇、太阴、六合、白虎、玄武、九地、九天）</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 加载状态 */}
          {loading && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 shadow-2xl">
                <Loading size="lg" text="正在起局，请稍候..." />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* AI助手 */}
      {result && <AIAssistant system="qimen" chartData={result} />}
    </div>
  );
}
