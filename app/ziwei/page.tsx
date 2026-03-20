'use client';

import { useState } from 'react';
import { createZiWeiPaiPan } from '@/lib/ziwei';
import { ZiWeiSettings, ZiWeiResult } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, RadioGroup } from '@/components/ui/Input';
import { DateTimePicker, Select } from '@/components/ui/FormControls';
import { AIAssistant } from '@/components/ai';
import { PageLayout as DossierPageLayout, WorkbenchPanel, WorkbenchStat } from '@/components/ui/page-layout';
import {
  DossierResultBlock,
  DossierResultList,
  DossierResultMetric,
  DossierResultSection,
  DossierResultTagList,
} from '@/components/ui/result';

const GONG_ORDER = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'] as const;
const CARD_TONES = [
  'border-[#d9c5a9] bg-[#fff7ea]',
  'border-[#ddd8c7] bg-[#faf7f0]',
  'border-[#d3ddcf] bg-[#f3faf2]',
  'border-[#e2d3c2] bg-[#fff4ea]',
  'border-[#d6ccbd] bg-[#faf5ed]',
  'border-[#d2d9de] bg-[#f2f7fa]',
  'border-[#d8d4c4] bg-[#f7f6f1]',
  'border-[#ddd1c2] bg-[#fbf2ea]',
  'border-[#d7cab9] bg-[#f8f2e8]',
  'border-[#d4dccc] bg-[#f4f8f1]',
  'border-[#d3d9df] bg-[#f2f7fb]',
  'border-[#d7cec2] bg-[#faf4ec]',
] as const;
const SI_HUA_ITEMS = [
  { label: '化禄', valueKey: 'huaLu', descKey: 'huaLuJieDu', tone: 'success' as const },
  { label: '化权', valueKey: 'huaQuan', descKey: 'huaQuanJieDu', tone: 'default' as const },
  { label: '化科', valueKey: 'huaKe', descKey: 'huaKeJieDu', tone: 'muted' as const },
  { label: '化忌', valueKey: 'huaJi', descKey: 'huaJiJieDu', tone: 'danger' as const },
] as const;

export default function ZiWeiPage() {
  const [settings, setSettings] = useState<ZiWeiSettings>({
    name: '',
    occupy: '',
    sex: 1,
    date: '2024-01-01 00:00:00',
    dateType: 0,
    leapMonthType: 0,
    xuShiSuiType: 0,
    jieQiType: 1,
    wuXingJuType: 0,
    yearGanZhiType: 2,
    monthGanZhiType: 1,
    dayGanZhiType: 0,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<ZiWeiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const paiPanResult = createZiWeiPaiPan(settings);
      setResult(paiPanResult);
    } catch (error) {
      console.error('排盘失败:', error);
      alert('排盘失败，请检查输入信息');
    } finally {
      setLoading(false);
    }
  };

  const orderedGongWei = result
    ? GONG_ORDER.map((zhi) => ({
        zhi,
        gong: result.gongWei[zhi],
      }))
    : [];
  const quickStats = [
    { label: '占事', value: settings.occupy?.trim() || '未填写' },
    { label: '性别', value: settings.sex === 1 ? '男命' : '女命' },
    { label: '日期类型', value: settings.dateType === 0 ? '公历' : '农历' },
    { label: '虚实岁', value: settings.xuShiSuiType === 0 ? '虚岁' : '实岁' },
  ];
  const configNotes = [
    { label: '出生时刻', value: settings.date || '未设置' },
    { label: '节气口径', value: settings.jieQiType === 1 ? '按分钟' : '按天' },
    { label: '五行局', value: settings.wuXingJuType === 0 ? '年干 + 命宫地支' : '命宫天干 + 命宫地支' },
    { label: '年柱口径', value: settings.yearGanZhiType === 2 ? '立春交接时刻' : settings.yearGanZhiType === 1 ? '立春当天' : '正月初一' },
  ];
  const outputItems = ['十二宫命盘布局', '命主、身主与四化', '大限小限与节气底稿', '宫位详情与 AI 解读'];

  return (
    <DossierPageLayout
      title="紫微斗数排盘"
      hasResult={Boolean(result)}
      rail={
        <Card title="输入信息" icon="📝">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Input
                label="姓名（可选）"
                type="text"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                placeholder="请输入姓名"
                fullWidth
              />
              <Input
                label="占事（可选）"
                type="text"
                value={settings.occupy}
                onChange={(e) => setSettings({ ...settings, occupy: e.target.value })}
                placeholder="请输入关注主题"
                fullWidth
              />
              <RadioGroup
                label="性别"
                name="sex"
                value={settings.sex}
                onChange={(value) => setSettings({ ...settings, sex: Number(value) as 0 | 1 })}
                options={[
                  { label: '男', value: 1 },
                  { label: '女', value: 0 },
                ]}
              />
              <RadioGroup
                label="日期类型"
                name="dateType"
                value={settings.dateType}
                onChange={(value) => setSettings({ ...settings, dateType: Number(value) as 0 | 1 })}
                options={[
                  { label: '公历', value: 0 },
                  { label: '农历', value: 1 },
                ]}
              />
            </div>

            <DateTimePicker
              label="出生日期时间"
              value={settings.date}
              onChange={(value) => setSettings({ ...settings, date: value })}
              dateType={settings.dateType}
              helperText="格式：年-月-日 时:分:秒（例如：2024-01-01 08:30:00）"
              pickerOnly
            />

            <div className="border-t border-[rgba(117,76,40,0.12)] pt-6">
              <button
                type="button"
                onClick={() => setShowAdvanced((prev) => !prev)}
                className="flex items-center gap-2 text-sm font-medium text-[#7d5830] transition-colors hover:text-[#9a6a38]"
              >
                <span>{showAdvanced ? '▼' : '▶'}</span>
                <span>高级配置</span>
              </button>

              {showAdvanced ? (
                <div className="mt-5 grid gap-4 rounded-[22px] border border-[rgba(117,76,40,0.12)] bg-[rgba(255,250,244,0.92)] p-5 md:grid-cols-2">
                  <Select
                    label="虚实岁"
                    value={settings.xuShiSuiType ?? 0}
                    onChange={(value) => setSettings({ ...settings, xuShiSuiType: Number(value) as 0 | 1 })}
                    options={[
                      { label: '虚岁', value: 0 },
                      { label: '实岁', value: 1 },
                    ]}
                  />
                  <Select
                    label="节气口径"
                    value={settings.jieQiType ?? 1}
                    onChange={(value) => setSettings({ ...settings, jieQiType: Number(value) as 0 | 1 })}
                    options={[
                      { label: '按分钟', value: 1 },
                      { label: '按天', value: 0 },
                    ]}
                  />
                  <Select
                    label="五行局"
                    value={settings.wuXingJuType ?? 0}
                    onChange={(value) => setSettings({ ...settings, wuXingJuType: Number(value) as 0 | 1 })}
                    options={[
                      { label: '年干 + 命宫地支', value: 0 },
                      { label: '命宫天干 + 命宫地支', value: 1 },
                    ]}
                  />
                  <Select
                    label="年柱口径"
                    value={settings.yearGanZhiType ?? 2}
                    onChange={(value) => setSettings({ ...settings, yearGanZhiType: Number(value) as 0 | 1 | 2 })}
                    options={[
                      { label: '立春交接时刻', value: 2 },
                      { label: '立春当天', value: 1 },
                      { label: '正月初一', value: 0 },
                    ]}
                  />
                  <Select
                    label="月柱口径"
                    value={settings.monthGanZhiType ?? 1}
                    onChange={(value) => setSettings({ ...settings, monthGanZhiType: Number(value) as 0 | 1 })}
                    options={[
                      { label: '节交接时刻', value: 1 },
                      { label: '节交接当天', value: 0 },
                    ]}
                  />
                  <Select
                    label="日柱口径"
                    value={settings.dayGanZhiType ?? 0}
                    onChange={(value) => setSettings({ ...settings, dayGanZhiType: Number(value) as 0 | 1 })}
                    options={[
                      { label: '晚子时算当天', value: 0 },
                      { label: '晚子时算明天', value: 1 },
                    ]}
                  />
                  {settings.dateType === 1 ? (
                    <Select
                      label="闰月处理"
                      value={settings.leapMonthType ?? 0}
                      onChange={(value) => setSettings({ ...settings, leapMonthType: Number(value) as 0 | 1 })}
                      options={[
                        { label: '不启用闰月', value: 0 },
                        { label: '启用闰月', value: 1 },
                      ]}
                    />
                  ) : null}
                </div>
              ) : null}
            </div>

            <Button type="submit" loading={loading} fullWidth size="lg">
              开始排盘
            </Button>
          </form>
        </Card>
      }
      emptySidebar={
        <>
          <WorkbenchPanel
            eyebrow="当前配置"
            title="命盘工作台"
            description="未排盘时右栏先集中展示命盘口径和关键规则，页面更完整。"
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
            eyebrow="排盘输出"
            title="提交后会展开这些内容"
            description="结果区会直接转入十二宫、四化和限运结构。"
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
      }
      stage={
        <>
          {result ? (
            <div className="space-y-6">
              <DossierResultSection
                eyebrow="ZiWei Chart"
                title="十二宫命盘"
                description="先读宫位、命主、身主和四化，再向下读限运和宫位细目。"
              >
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="rounded-[28px] border border-[rgba(117,76,40,0.12)] bg-[linear-gradient(180deg,rgba(255,251,244,0.96),rgba(246,238,226,0.96))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:p-5">
                    <div className="relative mx-auto aspect-square w-full max-w-3xl">
                      <div className="absolute inset-0 rounded-full border border-[#d8c1a1] bg-[radial-gradient(circle_at_center,rgba(255,252,247,0.96)_0%,rgba(244,233,215,0.94)_55%,rgba(231,217,194,0.92)_100%)] shadow-inner" />
                      <div className="absolute inset-[8%] rounded-full border border-dashed border-[#c7a47a]/70" />
                      <div className="absolute inset-[16%] rounded-full border border-[#d4c2a9]/75" />
                      <div className="absolute inset-[26%] rounded-full border border-[#e1d3c0]/80" />

                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="z-10 flex h-32 w-32 flex-col items-center justify-center rounded-full border border-[#7d5830]/20 bg-[linear-gradient(135deg,#4b2e19,#8f5b2d)] text-center text-white shadow-[0_24px_48px_-24px_rgba(61,37,15,0.85)]">
                          <div className="text-[11px] uppercase tracking-[0.22em] text-stone-200">五行局</div>
                          <div className="mt-2 text-xl font-semibold tracking-[0.08em]">{result.wuXingJu}</div>
                          <div className="mt-2 text-xs text-stone-200">{result.mingGong}宫</div>
                        </div>
                      </div>

                      {orderedGongWei.map(({ zhi, gong }, index) => {
                        const angle = (index * 30 - 90) * (Math.PI / 180);
                        const radius = 38;
                        const x = 50 + radius * Math.cos(angle);
                        const y = 50 + radius * Math.sin(angle);

                        return (
                          <div
                            key={zhi}
                            className="absolute -translate-x-1/2 -translate-y-1/2"
                            style={{ left: `${x}%`, top: `${y}%`, width: '96px' }}
                          >
                            <div
                              className={`rounded-[18px] border p-2 text-center shadow-[0_16px_32px_-24px_rgba(61,37,15,0.38)] ${
                                index === 0
                                  ? 'border-[#9d7343] bg-[linear-gradient(135deg,#6c4625,#a06d38)] text-white'
                                  : CARD_TONES[index]
                              }`}
                            >
                              <div className={`text-[10px] font-semibold ${index === 0 ? 'text-stone-100' : 'text-[#6b5a4c]'}`}>
                                {gong?.name || zhi}
                              </div>
                              <div className={`mt-1 text-[11px] font-semibold ${index === 0 ? 'text-white' : 'text-[#2f2118]'}`}>
                                {gong?.zhuXing?.[0] || '暂无'}
                              </div>
                              {gong?.zhuXing?.[1] ? (
                                <div className={`mt-0.5 break-words text-[10px] leading-[1.25] ${index === 0 ? 'text-stone-100' : 'text-[#5d4732]'}`}>
                                  {gong.zhuXing[1]}
                                </div>
                              ) : null}
                              {gong?.siHua?.[0] ? (
                                <div className={`mt-1 text-[10px] font-medium ${index === 0 ? 'text-amber-100' : 'text-[#8a6239]'}`}>
                                  {gong.siHua[0]}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <DossierResultMetric label="命宫" value={result.mingGong} note={result.age ? `${result.age} 岁` : undefined} />
                      <DossierResultMetric label="身宫" value={result.shenGong} note={result.zao || undefined} />
                      <DossierResultMetric label="命主" value={result.mingZhu || '暂无'} />
                      <DossierResultMetric label="身主" value={result.shenZhu || '暂无'} />
                    </div>

                    <DossierResultBlock title="命盘底稿">
                      <DossierResultList
                        items={[
                          { label: '公历', value: result.solar },
                          { label: '农历', value: result.lunar },
                          { label: '五行局', value: result.wuXingJu },
                          { label: '命宫 / 身宫', value: `${result.mingGong} / ${result.shenGong}` },
                          { label: '生肖 / 星座', value: `${result.shengXiao || '暂无'} / ${result.xingZuo || '暂无'}` },
                          { label: '月将 / 月将神', value: `${result.yueJiang || '暂无'} / ${result.yueJiangShen || '暂无'}` },
                        ]}
                      />
                    </DossierResultBlock>

                    <DossierResultBlock title="干支与节气">
                      <DossierResultList
                        items={[
                          { label: '年柱', value: result.yearGanZhi || '暂无' },
                          { label: '月柱', value: result.monthGanZhi || '暂无' },
                          { label: '日柱', value: result.dayGanZhi || '暂无' },
                          { label: '时柱', value: result.hourGanZhi || '暂无' },
                          { label: '出生节', value: result.chuShengJie || '暂无' },
                          { label: '出生气', value: result.chuShengQi || '暂无' },
                        ]}
                      />
                    </DossierResultBlock>
                  </div>
                </div>
              </DossierResultSection>

              <DossierResultSection
                eyebrow="Transformation"
                title="四化与限运"
                description="四化和限运拆成独立内页，不再沿用粉色渐变卡的旧视觉。"
              >
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  <DossierResultBlock title="四化星">
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {SI_HUA_ITEMS.map((item) => (
                        <DossierResultMetric
                          key={item.label}
                          label={item.label}
                          value={result[item.valueKey] || '—'}
                          note={result[item.descKey] || '暂无补充解读'}
                        />
                      ))}
                    </div>
                  </DossierResultBlock>

                  <DossierResultBlock title="四化解读">
                    <div className="space-y-4">
                      {SI_HUA_ITEMS.map((item) =>
                        result[item.descKey] ? (
                          <div
                            key={`${item.label}-desc`}
                            className="rounded-[20px] border border-[rgba(117,76,40,0.12)] bg-[rgba(255,252,247,0.86)] px-4 py-4"
                          >
                            <div className="mb-2">
                              <DossierResultTagList items={[item.label]} tone={item.tone} />
                            </div>
                            <p className="text-sm leading-7 text-[#5d4732]">{result[item.descKey]}</p>
                          </div>
                        ) : null
                      )}
                      {!SI_HUA_ITEMS.some((item) => result[item.descKey]) ? (
                        <div className="text-sm leading-7 text-[#7b6b5f]">当前命盘未提供额外四化解读。</div>
                      ) : null}
                    </div>
                  </DossierResultBlock>
                </div>

                {(result.daXian?.length || result.xiaoXian?.length) ? (
                  <div className="mt-4 grid gap-4 xl:grid-cols-2">
                    {result.daXian?.length ? (
                      <DossierResultBlock title="大限">
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          {result.daXian.map((limit, index) => (
                            <DossierResultMetric
                              key={`da-${index}`}
                              label={result.gongWei[GONG_ORDER[index]]?.name || `第${index + 1}宫`}
                              value={limit}
                              note={GONG_ORDER[index]}
                            />
                          ))}
                        </div>
                      </DossierResultBlock>
                    ) : null}

                    {result.xiaoXian?.length ? (
                      <DossierResultBlock title="小限">
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          {result.xiaoXian.map((limit, index) => (
                            <DossierResultMetric
                              key={`xiao-${index}`}
                              label={result.gongWei[GONG_ORDER[index]]?.name || `第${index + 1}宫`}
                              value={limit}
                              note={GONG_ORDER[index]}
                            />
                          ))}
                        </div>
                      </DossierResultBlock>
                    ) : null}
                  </div>
                ) : null}
              </DossierResultSection>

              <DossierResultSection
                eyebrow="Palace Detail"
                title="十二宫位详情"
                description="宫位详情统一回表格式纸页，主星、辅星、杂曜与四化保持同一套标签语言。"
              >
                <div className="overflow-x-auto rounded-[24px] border border-[rgba(117,76,40,0.12)] bg-[rgba(255,253,248,0.92)] shadow-[0_20px_38px_-32px_rgba(56,35,12,0.5)]">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-[linear-gradient(135deg,#4b2e19,#8f5b2d)] text-left text-white">
                        <th className="px-4 py-3">宫位</th>
                        <th className="px-4 py-3">主星</th>
                        <th className="px-4 py-3">辅星</th>
                        <th className="px-4 py-3">杂曜</th>
                        <th className="px-4 py-3">四化</th>
                        <th className="px-4 py-3">辅记</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderedGongWei.map(({ zhi, gong }, index) => (
                        <tr
                          key={zhi}
                          className={index % 2 === 0 ? 'bg-[rgba(255,252,247,0.92)]' : 'bg-[rgba(247,240,229,0.86)]'}
                        >
                          <td className="px-4 py-4 align-top">
                            <div className="font-semibold text-[#2f2118]">{gong?.name || zhi}</div>
                            <div className="mt-1 text-xs text-[#8a6239]">{zhi}</div>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <DossierResultTagList items={gong?.zhuXing} />
                          </td>
                          <td className="px-4 py-4 align-top">
                            <DossierResultTagList items={gong?.auxStars} tone="muted" />
                          </td>
                          <td className="px-4 py-4 align-top">
                            <DossierResultTagList items={gong?.minorStars} tone="warning" />
                          </td>
                          <td className="px-4 py-4 align-top">
                            <DossierResultTagList items={gong?.siHua} tone="danger" />
                          </td>
                          <td className="px-4 py-4 align-top">
                            <div className="space-y-1 text-xs leading-6 text-[#6b5a4c]">
                              <div>天干：{gong?.tianGan || '—'}</div>
                              <div>长生：{gong?.zhangSheng || '—'}</div>
                              <div>博士：{gong?.boShi || '—'}</div>
                              <div>岁前：{gong?.liuNianSuiQian || '—'}</div>
                              <div>将前：{gong?.liuNianJiangQian || '—'}</div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DossierResultSection>
            </div>
          ) : null}
        </>
      }
      footer={result ? <AIAssistant system="ziwei" chartData={result} /> : null}
    />
  );
}
