'use client';

import { useState } from 'react';
import { createQiMenPaiPan } from '@/lib/qimen';
import { QiMenSettings, QiMenResult } from '@/types';
import { Card, InfoCard } from '@/components/ui/Card';
import { Input, RadioGroup } from '@/components/ui/Input';
import { DateTimePicker, Select } from '@/components/ui/FormControls';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { AIAssistant } from '@/components/ai';
import { PageLayout as DossierPageLayout, WorkbenchPanel, WorkbenchStat } from '@/components/ui/page-layout';

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

  const palaceMeta = [
    { gong: '巽四宫', short: '巽四', index: 0, bagua: '☴', wuxing: '木', tone: 'emerald' },
    { gong: '离九宫', short: '离九', index: 1, bagua: '☲', wuxing: '火', tone: 'rose' },
    { gong: '坤二宫', short: '坤二', index: 2, bagua: '☷', wuxing: '土', tone: 'amber' },
    { gong: '震三宫', short: '震三', index: 3, bagua: '☳', wuxing: '木', tone: 'teal' },
    { gong: '中五宫', short: '中五', index: 4, bagua: '☯', wuxing: '土', tone: 'stone' },
    { gong: '兑七宫', short: '兑七', index: 5, bagua: '☱', wuxing: '金', tone: 'slate' },
    { gong: '坎一宫', short: '坎一', index: 6, bagua: '☵', wuxing: '水', tone: 'sky' },
    { gong: '艮八宫', short: '艮八', index: 7, bagua: '☶', wuxing: '土', tone: 'orange' },
    { gong: '乾六宫', short: '乾六', index: 8, bagua: '☰', wuxing: '金', tone: 'amber' }
  ] as const;

  const toneStyles = {
    emerald: {
      shell: 'border-emerald-200 bg-[linear-gradient(180deg,rgba(240,253,244,0.96),rgba(236,253,245,0.92))]',
      badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      strip: 'bg-emerald-600',
    },
    rose: {
      shell: 'border-rose-200 bg-[linear-gradient(180deg,rgba(255,241,242,0.96),rgba(255,247,237,0.92))]',
      badge: 'border-rose-200 bg-rose-50 text-rose-700',
      strip: 'bg-rose-600',
    },
    amber: {
      shell: 'border-amber-200 bg-[linear-gradient(180deg,rgba(255,251,235,0.96),rgba(255,247,237,0.92))]',
      badge: 'border-amber-200 bg-amber-50 text-amber-700',
      strip: 'bg-amber-600',
    },
    teal: {
      shell: 'border-teal-200 bg-[linear-gradient(180deg,rgba(240,253,250,0.96),rgba(236,253,245,0.92))]',
      badge: 'border-teal-200 bg-teal-50 text-teal-700',
      strip: 'bg-teal-600',
    },
    stone: {
      shell: 'border-stone-200 bg-[linear-gradient(180deg,rgba(250,245,236,0.96),rgba(255,250,242,0.92))]',
      badge: 'border-stone-200 bg-stone-100 text-stone-700',
      strip: 'bg-stone-700',
    },
    slate: {
      shell: 'border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(241,245,249,0.92))]',
      badge: 'border-slate-200 bg-slate-50 text-slate-700',
      strip: 'bg-slate-700',
    },
    sky: {
      shell: 'border-sky-200 bg-[linear-gradient(180deg,rgba(240,249,255,0.96),rgba(236,253,245,0.92))]',
      badge: 'border-sky-200 bg-sky-50 text-sky-700',
      strip: 'bg-sky-600',
    },
    orange: {
      shell: 'border-orange-200 bg-[linear-gradient(180deg,rgba(255,247,237,0.96),rgba(255,251,235,0.92))]',
      badge: 'border-orange-200 bg-orange-50 text-orange-700',
      strip: 'bg-orange-600',
    },
  } as const;

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
  const paiPanTypeLabel =
    settings.paiPanType === 3 ? '时家奇门' : settings.paiPanType === 2 ? '日家奇门' : settings.paiPanType === 1 ? '月家奇门' : '年家奇门';
  const panTypeLabel = settings.panType === 'zhuan' ? '转盘' : settings.panType === 'fei' ? '飞盘' : settings.panType;
  const zhiShiTypeLabel = settings.zhiShiType === 2 ? '按节气判断' : settings.zhiShiType === 1 ? '按阴阳遁判断' : '死门为值使';
  const quickStats = [
    { label: '占事', value: settings.occupy?.trim() || '未填写' },
    { label: '排盘类型', value: paiPanTypeLabel },
    { label: '盘式', value: panTypeLabel },
    { label: '日期类型', value: settings.dateType === 0 ? '公历' : '农历' },
  ];
  const configNotes = [
    { label: '起局时刻', value: settings.date || '未设置' },
    { label: '值使规则', value: zhiShiTypeLabel },
    { label: '节气口径', value: settings.jieQiType === 1 ? '按分钟计算' : '按天计算' },
    { label: '年柱口径', value: settings.yearGanZhiType === 2 ? '立春交接时刻' : settings.yearGanZhiType === 1 ? '立春当天' : '正月初一' },
  ];
  const outputItems = ['九宫盘面与天地人神', '值符值使与局数', '九星八门八神定位', '三奇六仪与宫位提示'];

  return (
    <DossierPageLayout
      title="奇门遁甲排盘"
      hasResult={Boolean(result)}
      rail={(
        <Card
          title="输入信息"
          icon="📝"
          className="animate-fade-in"
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
                pickerOnly
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
      )}
      emptySidebar={(
        <>
          <WorkbenchPanel
            eyebrow="当前配置"
            title="起局工作台"
            description="未起局时右侧直接显示当前盘式与关键规则，桌面端不会只剩空白结果区。"
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {quickStats.map((item) => <WorkbenchStat key={item.label} label={item.label} value={item.value} />)}
            </div>
            <div className="mt-5 grid gap-3">
              {configNotes.map((item) => (
                <div key={item.label} className="flex items-start justify-between gap-4 rounded-[18px] border border-[#d8cab6] bg-white/72 px-4 py-3">
                  <span className="text-xs uppercase tracking-[0.22em] text-[#8b6641]">{item.label}</span>
                  <span className="text-right text-sm font-medium text-[#2f2118]">{item.value}</span>
                </div>
              ))}
            </div>
          </WorkbenchPanel>

          <WorkbenchPanel
            eyebrow="起局输出"
            title="提交后会展开这些内容"
            description="结果区会直接进入九宫、值符值使与格局关系。"
            tone="dark"
          >
            <div className="space-y-3">
              {outputItems.map((item, index) => (
                <div key={item} className="flex items-start gap-3 rounded-[18px] border border-white/12 bg-white/8 px-4 py-3">
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/22 bg-white/10 text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <span className="text-sm leading-6 text-white/88">{item}</span>
                </div>
              ))}
            </div>
          </WorkbenchPanel>
        </>
      )}
      stage={(
        <>
          {result && (
            <div className="animate-fade-in space-y-8">
              {/* 基础信息卡片 */}
              <div className="overflow-hidden rounded-[34px] border border-[#6b4524]/15 bg-[radial-gradient(circle_at_top_left,rgba(255,212,141,0.22),transparent_28%),linear-gradient(135deg,#2c1b12_0%,#573520_52%,#98612e_100%)] p-5 text-white shadow-[0_34px_72px_-38px_rgba(72,38,10,0.95)] sm:p-6">
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold tracking-[0.06em] text-white">
                      奇门遁甲局式
                    </h2>
                    <p className="mt-1 text-sm text-stone-200">{result.juShu} · {result.yinYangDun}</p>
                  </div>

                  {/* 核心信息展示 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {result.name && (
                      <div className="rounded-[18px] border border-white/10 bg-white/8 p-3 text-center">
                        <div className="mb-1 text-[11px] uppercase tracking-[0.22em] text-stone-300">姓名</div>
                        <div className="font-semibold text-white">{result.name}</div>
                      </div>
                    )}
                    {result.occupy && (
                      <div className="rounded-[18px] border border-white/10 bg-white/8 p-3 text-center">
                        <div className="mb-1 text-[11px] uppercase tracking-[0.22em] text-stone-300">占事</div>
                        <div className="break-words font-semibold leading-6 text-white">{result.occupy}</div>
                      </div>
                    )}
                    <div className="rounded-[18px] border border-white/10 bg-white/8 p-3 text-center">
                      <div className="mb-1 text-[11px] uppercase tracking-[0.22em] text-stone-300">公历</div>
                      <div className="font-semibold text-white">{result.solar}</div>
                    </div>
                    <div className="rounded-[18px] border border-white/10 bg-white/8 p-3 text-center">
                      <div className="mb-1 text-[11px] uppercase tracking-[0.22em] text-stone-300">农历</div>
                      <div className="font-semibold text-white">{result.lunar}</div>
                    </div>
                  </div>

                  {/* 四柱干支 */}
                  {result.yearGanZhi && (
                    <div className="grid grid-cols-4 gap-3 mb-6">
                      <div className="rounded-[18px] border border-white/10 bg-white/8 p-3 text-center">
                        <div className="mb-1 text-[11px] uppercase tracking-[0.22em] text-stone-300">年柱</div>
                        <div className="font-bold text-white">{result.yearGanZhi}</div>
                      </div>
                      <div className="rounded-[18px] border border-white/10 bg-white/8 p-3 text-center">
                        <div className="mb-1 text-[11px] uppercase tracking-[0.22em] text-stone-300">月柱</div>
                        <div className="font-bold text-white">{result.monthGanZhi}</div>
                      </div>
                      <div className="rounded-[18px] border border-white/10 bg-white/8 p-3 text-center">
                        <div className="mb-1 text-[11px] uppercase tracking-[0.22em] text-stone-300">日柱</div>
                        <div className="font-bold text-white">{result.dayGanZhi}</div>
                      </div>
                      <div className="rounded-[18px] border border-white/10 bg-white/8 p-3 text-center">
                        <div className="mb-1 text-[11px] uppercase tracking-[0.22em] text-stone-300">时柱</div>
                        <div className="font-bold text-white">{result.hourGanZhi}</div>
                      </div>
                    </div>
                  )}

                  {/* 奇门要素 */}
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    <div className="rounded-[18px] border border-white/10 bg-white/8 p-3 text-center">
                      <div className="mb-1 text-[11px] uppercase tracking-[0.22em] text-stone-300">符头</div>
                      <div className="font-bold text-white">{result.fuTou}</div>
                    </div>
                    <div className="rounded-[18px] border border-white/10 bg-white/8 p-3 text-center">
                      <div className="mb-1 text-[11px] uppercase tracking-[0.22em] text-stone-300">节气</div>
                      <div className="font-bold text-white">{result.jieQi}</div>
                    </div>
                    {result.sanYuan && (
                      <div className="rounded-[18px] border border-white/10 bg-white/8 p-3 text-center">
                        <div className="mb-1 text-[11px] uppercase tracking-[0.22em] text-stone-300">三元</div>
                        <div className="font-bold text-white">{result.sanYuan}</div>
                      </div>
                    )}
                    <div className="rounded-[18px] border border-white/10 bg-white/8 p-3 text-center">
                      <div className="mb-1 text-[11px] uppercase tracking-[0.22em] text-stone-300">阴阳遁</div>
                      <div className="font-bold text-white">{result.yinYangDun}</div>
                    </div>
                    <div className="rounded-[18px] border border-white/10 bg-white/8 p-3 text-center">
                      <div className="mb-1 text-[11px] uppercase tracking-[0.22em] text-stone-300">局数</div>
                      <div className="font-bold text-white">{result.juShu}</div>
                    </div>
                    <div className="rounded-[18px] border border-white/10 bg-white/8 p-3 text-center">
                      <div className="mb-1 text-[11px] uppercase tracking-[0.22em] text-stone-300">旬首</div>
                      <div className="font-bold text-white">{result.xunShou}</div>
                    </div>
                  </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-[24px] border border-white/10 bg-white/10 p-5 text-center">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-stone-300">值符</div>
                      <div className="mt-3 text-3xl font-bold text-white">{result.zhiFu}</div>
                      {result.newZhiFuGongWei !== undefined && (
                        <div className="mt-2 text-xs text-stone-200">落 {result.newZhiFuGongWei}宫</div>
                      )}
                    </div>
                    <div className="rounded-[24px] border border-white/10 bg-white/10 p-5 text-center">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-stone-300">值使</div>
                      <div className="mt-3 text-3xl font-bold text-white">{result.zhiShi}</div>
                      {result.newZhiShiGongWei !== undefined && (
                        <div className="mt-2 text-xs text-stone-200">落 {result.newZhiShiGongWei}宫</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 传统文化装饰标题 */}
              <div className="text-center">
                <div className="inline-flex items-center gap-4">
                  <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#9a6a3a]"></div>
                  <h3 className="px-4 text-xl font-bold tracking-[0.06em] text-[#3a281a]">九宫星门神格局</h3>
                  <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#9a6a3a]"></div>
                </div>
                <p className="mt-2 text-sm text-[#7b6b5f]">上天下地 中分八卦 · 阴阳动静 吉凶分明</p>
              </div>

              {/* 精美九宫格 */}
              <div className="rounded-[32px] border border-[rgba(114,76,37,0.12)] bg-[rgba(255,250,242,0.84)] p-6 shadow-[0_30px_60px_-36px_rgba(61,37,15,0.48)] backdrop-blur-xl">
                {/* 九宫外框装饰 */}
                <div className="relative">
                  {/* 四个角的装饰 */}
                  <div className="absolute -top-2 -left-2 h-8 w-8 rounded-tl-lg border-l-4 border-t-4 border-[#8f5b2d]"></div>
                  <div className="absolute -top-2 -right-2 h-8 w-8 rounded-tr-lg border-r-4 border-t-4 border-[#8f5b2d]"></div>
                  <div className="absolute -bottom-2 -left-2 h-8 w-8 rounded-bl-lg border-b-4 border-l-4 border-[#8f5b2d]"></div>
                  <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-br-lg border-b-4 border-r-4 border-[#8f5b2d]"></div>

                  <div className="grid grid-cols-3 gap-3">
                    {/* 巽四宫 - 震三宫 - 坤二宫 */}
                    {[
                      { gong: '巽四宫', index: 0, bagua: '☴', wuxing: '木', tone: 'from-[#edf6ef] to-[#e2f1e4]' },
                      { gong: '离九宫', index: 1, bagua: '☲', wuxing: '火', tone: 'from-[#fbefea] to-[#f9e6dc]' },
                      { gong: '坤二宫', index: 2, bagua: '☷', wuxing: '土', tone: 'from-[#f7f0e1] to-[#f1e4c8]' },
                      { gong: '震三宫', index: 3, bagua: '☳', wuxing: '木', tone: 'from-[#eef5ea] to-[#e2ecdc]' },
                      { gong: '中五宫', index: 4, bagua: '☯', wuxing: '土', tone: 'from-[#f5ead9] to-[#ecd8b8]' },
                      { gong: '兑七宫', index: 5, bagua: '☱', wuxing: '金', tone: 'from-[#f1f0ed] to-[#e0ddd4]' },
                      { gong: '坎一宫', index: 6, bagua: '☵', wuxing: '水', tone: 'from-[#ebf3f8] to-[#dceaf2]' },
                      { gong: '艮八宫', index: 7, bagua: '☶', wuxing: '土', tone: 'from-[#f6ecdf] to-[#eddcc0]' },
                      { gong: '乾六宫', index: 8, bagua: '☰', wuxing: '金', tone: 'from-[#f4ede7] to-[#ebddd0]' }
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className={`relative rounded-[24px] border border-[rgba(114,76,37,0.12)] bg-gradient-to-br ${item.tone} p-4 text-[#2f2118] shadow-[0_20px_40px_-30px_rgba(61,37,15,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_50px_-34px_rgba(61,37,15,0.45)]`}
                      >
                        {/* 宫位标识 */}
                        <div className="absolute -left-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(114,76,37,0.12)] bg-white/80 text-xs font-bold shadow-sm">
                          {item.bagua}
                        </div>

                        {/* 宫位名称 */}
                        <div className="text-center mb-3 mt-2">
                          <div className="text-xs text-[#7b6b5f]">{item.wuxing}</div>
                          <div className="font-bold text-lg">{item.gong}</div>
                        </div>

                        {/* 天地人神四层 */}
                        <div className="space-y-1.5 text-center">
                          {/* 天盘九星 */}
                          <div className="rounded-[16px] border border-[rgba(114,76,37,0.1)] bg-white/75 px-2 py-1.5 backdrop-blur-sm">
                            <div className="text-[10px] uppercase tracking-[0.18em] text-[#8a6239]">天盘</div>
                            <div className="font-bold text-sm">{result.tianPan[item.index]}</div>
                          </div>

                          {/* 神盘八神 */}
                          <div className="rounded-[16px] border border-[rgba(114,76,37,0.1)] bg-white/72 px-2 py-1 backdrop-blur-sm">
                            <div className="text-[10px] uppercase tracking-[0.18em] text-[#8a6239]">神盘</div>
                            <div className="font-semibold text-sm">{result.shenPan[item.index]}</div>
                          </div>

                          {/* 人盘八门 */}
                          <div className="rounded-[16px] border border-[rgba(114,76,37,0.1)] bg-white/72 px-2 py-1 backdrop-blur-sm">
                            <div className="text-[10px] uppercase tracking-[0.18em] text-[#8a6239]">人盘</div>
                            <div className="font-semibold text-sm">{result.renPan[item.index]}</div>
                          </div>

                          {/* 地盘奇仪 */}
                          <div className="rounded-[16px] border border-[rgba(114,76,37,0.12)] bg-white/82 px-2 py-1.5 backdrop-blur-sm">
                            <div className="text-[10px] uppercase tracking-[0.18em] text-[#8a6239]">地盘</div>
                            <div className="font-bold text-base">{result.diPan[item.index]}</div>
                          </div>
                        </div>

                        {/* 吉凶标记 */}
                        {(result.jiXing?.includes(item.index.toString()) || result.xiongXing?.includes(item.index.toString())) && (
                          <div className="absolute top-2 right-2">
                            {result.jiXing?.includes(item.index.toString()) ? (
                              <span className="rounded-full bg-[#efe4b8] px-1.5 py-0.5 text-xs font-bold text-[#7a5a13]">吉</span>
                            ) : (
                              <span className="rounded-full bg-[#c86c57] px-1.5 py-0.5 text-xs font-bold text-white">凶</span>
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
                <div className="rounded-[28px] border border-[rgba(114,76,37,0.12)] bg-[rgba(255,250,242,0.84)] p-6 shadow-[0_24px_48px_-34px_rgba(61,37,15,0.42)]">
                  <h4 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#3a281a]">
                    <span className="text-2xl">⭐</span>
                    九星
                  </h4>
                  <div className="space-y-2">
                    {['天蓬', '天芮', '天冲', '天辅', '天禽', '天心', '天柱', '天任', '天英'].map((star, idx) => {
                      const foundInPan = result.tianPan.findIndex(s => s === star);
                      return (
                        <div key={`${star}-${idx}`} className="flex items-center justify-between rounded-[16px] border border-[rgba(114,76,37,0.1)] bg-white/78 p-2">
                          <span className="font-semibold text-[#3a281a]">{star}</span>
                          {foundInPan !== -1 && (
                            <span className="rounded-full bg-[#5f775f] px-2 py-0.5 text-xs text-white">
                              {['巽四', '坎一', '离九', '巽四', '中五', '乾六', '坎一', '艮八', '离九'][foundInPan]}宫
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 八门 */}
                <div className="rounded-[28px] border border-[rgba(114,76,37,0.12)] bg-[rgba(255,250,242,0.84)] p-6 shadow-[0_24px_48px_-34px_rgba(61,37,15,0.42)]">
                  <h4 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#3a281a]">
                    <span className="text-2xl">🚪</span>
                    八门
                  </h4>
                  <div className="space-y-2">
                    {['休', '生', '伤', '杜', '景', '死', '惊', '开'].map((men) => {
                      const foundInPan = result.renPan.findIndex(s => s === men);
                      return (
                        <div key={men} className="flex items-center justify-between rounded-[16px] border border-[rgba(114,76,37,0.1)] bg-white/78 p-2">
                          <span className="font-semibold text-[#3a281a]">{men}门</span>
                          {foundInPan !== -1 && (
                            <span className="rounded-full bg-[#496e8d] px-2 py-0.5 text-xs text-white">
                              {['巽四', '坎一', '震三', '巽四', '离九', '坤二', '兑七', '乾六'][foundInPan]}宫
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 八神 */}
                <div className="rounded-[28px] border border-[rgba(114,76,37,0.12)] bg-[rgba(255,250,242,0.84)] p-6 shadow-[0_24px_48px_-34px_rgba(61,37,15,0.42)]">
                  <h4 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#3a281a]">
                    <span className="text-2xl">🔯</span>
                    八神
                  </h4>
                  <div className="space-y-2">
                    {['值符', '螣蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天'].map((shen) => {
                      const foundInPan = result.shenPan.findIndex(s => s === shen);
                      return (
                        <div key={shen} className="flex items-center justify-between rounded-[16px] border border-[rgba(114,76,37,0.1)] bg-white/78 p-2">
                          <span className="font-semibold text-[#3a281a]">{shen}</span>
                          {foundInPan !== -1 && (
                            <span className="rounded-full bg-[#7f6488] px-2 py-0.5 text-xs text-white">
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
              <div className="rounded-[28px] border border-[rgba(114,76,37,0.12)] bg-[rgba(255,250,242,0.84)] p-6 shadow-[0_24px_48px_-34px_rgba(61,37,15,0.42)]">
                <h4 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#3a281a]">
                  <span className="text-2xl">⚡</span>
                  三奇六仪（地盘）
                </h4>
                <div className="flex flex-wrap justify-center gap-3">
                  {['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'].map((yi) => {
                    const foundIdx = result.diPan.findIndex(d => d === yi);
                    return (
                      <div
                        key={yi}
                        className={`flex h-16 w-16 flex-col items-center justify-center rounded-[20px] border border-[rgba(114,76,37,0.12)] shadow-sm ${
                          ['丁', '丙', '乙'].includes(yi)
                            ? 'bg-gradient-to-br from-[#f3deb6] to-[#e6c987] ring-2 ring-[#d7b07d]'
                            : 'bg-gradient-to-br from-[#ece9e2] to-[#dad4c9]'
                        }`}
                      >
                        <span className="text-2xl font-bold text-[#2f2118]">{yi}</span>
                        {foundIdx !== -1 && (
                          <span className="text-[10px] text-[#6b5a4c]">
                            {['巽四', '坎一', '离九', '坤二', '震三', '中五', '兑七', '艮八', '乾六'][foundIdx]}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 text-center text-sm text-[#6b5a4c]">
                  <span className="mr-2 inline-block rounded-full bg-[#f4e4c8] px-3 py-1">三奇：丁丙乙</span>
                  <span className="inline-block rounded-full bg-[#e7dfd2] px-3 py-1">六仪：戊己庚辛壬癸</span>
                </div>
              </div>

              {/* 说明 */}
              <div className="rounded-[28px] border border-[rgba(114,76,37,0.12)] bg-[rgba(255,250,242,0.84)] p-6 shadow-[0_24px_48px_-34px_rgba(61,37,15,0.42)]">
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-[#3a281a]">
                  <span>📖</span>
                  奇门遁甲说明
                </h3>
                <div className="grid grid-cols-1 gap-3 text-sm text-[#5d4732] md:grid-cols-2">
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
        </>
      )}
      footer={result && <AIAssistant system="qimen" chartData={result} />}
    />
  );
}
