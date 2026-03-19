'use client';

import Link from 'next/link';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { AIAssistant } from '@/components/ai';
import { createBaZiPaiPan } from '@/lib/bazi';
import { convertDateValue, normalizeDateValue } from '@/lib/utils/dateTime';
import { getLongitudeByCity } from '@/lib/utils/trueSolarTime';
import { BaZiResult, BaZiSettings } from '@/types';
import { BaZiForm } from './BaZiForm';
import { BaZiResults } from './BaZiResults';

const INITIAL_SETTINGS: BaZiSettings = {
  name: '',
  occupy: '',
  sex: 1,
  date: '2024-01-01 00:00:00',
  dateType: 0,
  xuShiSuiType: 1,
  jieQiType: 1,
  qiYunLiuPaiType: 1,
  renYuanType: 0,
  daYunLunShu: 10,
  yearGanZhiType: 2,
  monthGanZhiType: 1,
  dayGanZhiType: 0,
  useTrueSolarTime: false,
  showXiaoYun: true,
  showLiuYue: true,
  showLiuRi: false,
  showLiuShi: true,
  showJiuXing: true,
  showGanZhiLiuYi: true,
  showShenSha: true,
  showGeJu: true,
  showDaYunShenSha: true,
  showLiuNianShenSha: true,
};

const EXAMPLE_SETTINGS: Partial<BaZiSettings> = {
  name: '示例命盘',
  occupy: '事业 / 财运',
  sex: 1,
  date: '1990-01-15 08:00:00',
  dateType: 0,
};

function validateSettings(settings: BaZiSettings) {
  const errors: Record<string, string> = {};

  try {
    normalizeDateValue(settings.date, settings.dateType);
  } catch (error) {
    errors.date = error instanceof Error ? error.message : '日期格式无效';
  }

  const daYunLunShu = settings.daYunLunShu ?? 10;
  if (Number.isNaN(daYunLunShu) || daYunLunShu < 6 || daYunLunShu > 16) {
    errors.daYunLunShu = '大运轮数必须在 6 到 16 之间。';
  }

  if (settings.useTrueSolarTime) {
    const city = settings.city?.trim();
    const longitude = settings.longitude;
    const cityLongitude = city ? getLongitudeByCity(city) : null;

    if (!city && longitude === undefined) {
      errors.longitude = '启用真太阳时后，请填写城市或经度。';
    }

    if (city && cityLongitude === null && longitude === undefined) {
      errors.city = '城市未收录，请改填支持城市或直接输入经度。';
    }

    if (longitude !== undefined && (Number.isNaN(longitude) || longitude < -180 || longitude > 180)) {
      errors.longitude = '经度必须在 -180 到 180 之间。';
    }
  }

  return errors;
}

function buildSettings(patch?: Partial<BaZiSettings>) {
  return { ...INITIAL_SETTINGS, ...patch };
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[#d8cab6] bg-white/75 px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.26em] text-[#8b6641]">{label}</div>
      <div className="mt-2 text-sm font-medium text-[#2f2118]">{value}</div>
    </div>
  );
}

function SidePanel({
  eyebrow,
  title,
  description,
  children,
  tone = 'light',
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  tone?: 'light' | 'dark';
}) {
  const dark = tone === 'dark';

  return (
    <div
      className={
        dark
          ? 'overflow-hidden rounded-[32px] border border-[#6b4524]/15 bg-[radial-gradient(circle_at_top_left,rgba(255,212,141,0.2),transparent_30%),linear-gradient(135deg,#342014_0%,#5a3821_55%,#8d5a2f_100%)] p-5 text-white shadow-[0_30px_60px_-36px_rgba(57,30,10,0.9)] backdrop-blur-xl sm:p-6'
          : 'rounded-[32px] border border-[rgba(114,76,37,0.12)] bg-[rgba(250,245,236,0.82)] p-5 shadow-[0_30px_60px_-36px_rgba(61,37,15,0.55)] backdrop-blur-xl sm:p-6'
      }
    >
      <p className={`text-[10px] uppercase tracking-[0.32em] ${dark ? 'text-[#f5d2a8]' : 'text-[#8a6239]'}`}>{eyebrow}</p>
      <h2 className={`mt-3 text-[1.9rem] font-semibold tracking-[0.06em] ${dark ? 'text-white' : 'text-[#2f2118]'}`}>{title}</h2>
      {description ? (
        <p className={`mt-3 text-sm leading-7 ${dark ? 'text-white/78' : 'text-[#66584d]'}`}>{description}</p>
      ) : null}
      <div className="mt-5">{children}</div>
    </div>
  );
}

export default function BaZiPage() {
  const [settings, setSettings] = useState<BaZiSettings>(INITIAL_SETTINGS);
  const [result, setResult] = useState<BaZiResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const resultRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!result || !resultRef.current) return;
    const frame = window.requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [result]);

  const clearErrors = (...fields: string[]) => {
    setErrors((current) => {
      if (!fields.length) return {};
      const next = { ...current };
      fields.forEach((field) => delete next[field]);
      return next;
    });
  };

  const updateSettings = (patch: Partial<BaZiSettings>, clearedFields: string[] = []) => {
    setSettings((current) => ({ ...current, ...patch }));
    clearErrors(...clearedFields);
    setSubmitError('');
  };

  const resetWith = (patch?: Partial<BaZiSettings>) => {
    setSettings(buildSettings(patch));
    setResult(null);
    setErrors({});
    setSubmitError('');
    setLoading(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validateSettings(settings);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setSubmitError('');

    setTimeout(() => {
      try {
        const normalizedDate = normalizeDateValue(settings.date, settings.dateType);
        const normalizedSettings: BaZiSettings = {
          ...settings,
          date: normalizedDate,
          city: settings.city?.trim() || undefined,
          longitude: settings.longitude,
        };
        const nextResult = createBaZiPaiPan(normalizedSettings);
        setSettings(normalizedSettings);
        setResult(nextResult);
        setErrors({});
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : '排盘失败，请检查输入。');
      } finally {
        setLoading(false);
      }
    }, 0);
  };

  const hasResult = Boolean(result);
  const hasStageContent = hasResult || loading || Boolean(submitError);
  const quickStats = [
    { label: '姓名', value: settings.name?.trim() || '未填写' },
    { label: '占事', value: settings.occupy?.trim() || '未指定' },
    { label: '性别', value: settings.sex === 1 ? '男命' : '女命' },
    { label: '日期类型', value: settings.dateType === 0 ? '公历' : '农历' },
    { label: '真太阳时', value: settings.useTrueSolarTime ? '已启用' : '关闭' },
  ];
  const intakeNotes = [
    { label: '出生时刻', value: settings.date || '未设置' },
    { label: '年龄口径', value: settings.xuShiSuiType === 0 ? '虚岁' : '实岁' },
    { label: '节气口径', value: settings.jieQiType === 0 ? '整日切换' : '精确分钟' },
    { label: '起运流派', value: settings.qiYunLiuPaiType === 0 ? '流派一' : '流派二' },
  ];
  const outputItems = ['四柱与十神结构', '五行计量与命局强弱', '格局喜用与结构辅助', '大运流年与 AI 解读'];

  const formSharedProps = {
    settings,
    errors,
    loading,
    onSubmit: handleSubmit,
    onTextChange: (field: keyof BaZiSettings, value: string) => updateSettings({ [field]: value } as Partial<BaZiSettings>, [String(field)]),
    onNumberChange: (field: keyof BaZiSettings, value: number | undefined) => updateSettings({ [field]: value } as Partial<BaZiSettings>, [String(field)]),
    onRadioChange: (field: keyof BaZiSettings, value: string | number) => updateSettings({ [field]: value as never } as Partial<BaZiSettings>, [String(field)]),
    onToggle: (field: keyof BaZiSettings, checked: boolean) => {
      if (field === 'useTrueSolarTime' && !checked) {
        updateSettings({ useTrueSolarTime: false, city: '', longitude: undefined }, ['city', 'longitude']);
        return;
      }
      updateSettings({ [field]: checked } as Partial<BaZiSettings>, [String(field)]);
    },
    onDateChange: (value: string) => updateSettings({ date: value }, ['date']),
    onDateTypeChange: (nextDateType: 0 | 1) => {
      try {
        const convertedDate = convertDateValue(settings.date, settings.dateType, nextDateType);
        updateSettings({ dateType: nextDateType, date: convertedDate }, ['date']);
      } catch (error) {
        setErrors((current) => ({
          ...current,
          date: error instanceof Error ? error.message : '日期转换失败',
        }));
      }
    },
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#e8ddcc] text-stone-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(185,120,43,0.18),transparent_22%),radial-gradient(circle_at_82%_12%,rgba(80,100,88,0.13),transparent_24%),linear-gradient(180deg,#f4ecdf_0%,#eee5d5_45%,#e6dbc9_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(62,40,20,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(62,40,20,0.08)_1px,transparent_1px)] [background-size:26px_26px]" />

      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-stone-900 focus:px-4 focus:py-2 focus:text-white">
        跳到主内容
      </a>

      <header className="sticky top-0 z-40">
        <div className={`mx-auto px-4 pt-4 sm:px-6 lg:px-8 ${hasStageContent ? 'max-w-[1500px]' : 'max-w-[1420px]'}`}>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[32px] border border-white/50 bg-white/72 px-5 py-4 shadow-[0_24px_60px_-36px_rgba(58,35,10,0.65)] backdrop-blur-xl">
            <div>
              <p className="text-[10px] uppercase tracking-[0.36em] text-[#8a6239]">八字排盘 · 综合分析</p>
              <h1 className="mt-2 text-[1.9rem] font-semibold tracking-[0.08em] text-[#2f2118]">八字排盘</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a href="#input-rail" className="rounded-full border border-[rgba(117,76,40,0.14)] bg-[rgba(255,252,247,0.88)] px-4 py-2 text-sm text-[#5b4430] transition hover:border-[#a27140] hover:bg-[#fff7ed]">编辑输入</a>
              {hasResult ? <a href="#report-stage" className="rounded-full border border-[#4a2d19] bg-[#4a2d19] px-4 py-2 text-sm text-white transition hover:bg-[#3e2616]">查看命盘</a> : null}
              <Link href="/" className="rounded-full border border-[rgba(117,76,40,0.14)] bg-[rgba(255,252,247,0.88)] px-4 py-2 text-sm text-[#5b4430] transition hover:border-[#a27140] hover:bg-[#fff7ed]">返回首页</Link>
            </div>
          </div>
        </div>
      </header>

      <main
        id="main-content"
        className={`relative z-10 mx-auto px-4 pb-24 pt-6 sm:px-6 lg:px-8 ${hasStageContent ? 'max-w-[1500px]' : 'max-w-[1420px]'}`}
      >
        <div
          className={`grid gap-6 ${
            hasStageContent
              ? 'lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)]'
              : 'lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_390px] lg:items-start'
          }`}
        >
          {hasStageContent ? (
            <>
              <section ref={resultRef} id="report-stage" className="order-1 lg:col-start-2">
                <div className="space-y-6">
                  {submitError ? (
                    <div className="rounded-[28px] border border-[#d39c89] bg-[#fff6f2] px-5 py-4 text-[#8f3d2d] shadow-[0_18px_38px_-32px_rgba(140,58,35,0.5)]">
                      <div className="text-sm font-semibold">排盘失败</div>
                      <p className="mt-2 text-sm leading-7">{submitError}</p>
                    </div>
                  ) : null}

                  {loading ? (
                    <div className="rounded-[30px] border border-[rgba(116,74,36,0.12)] bg-[rgba(255,250,242,0.8)] px-6 py-12 text-center shadow-[0_32px_60px_-42px_rgba(60,38,15,0.6)] backdrop-blur-xl">
                      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#d7b07d]/40 border-t-[#8f5b2d]" />
                      <p className="mt-4 text-sm tracking-[0.2em] text-[#7b6b5f]">正在排盘</p>
                    </div>
                  ) : null}

                  {result && !loading ? (
                    <BaZiResults
                      result={result}
                      showConfig={{
                        showXiaoYun: settings.showXiaoYun !== false,
                        showLiuYue: settings.showLiuYue !== false,
                        showLiuRi: settings.showLiuRi === true,
                        showLiuShi: settings.showLiuShi !== false,
                        showJiuXing: settings.showJiuXing !== false,
                        showGanZhiLiuYi: settings.showGanZhiLiuYi !== false,
                        showShenSha: settings.showShenSha !== false,
                        showGeJu: settings.showGeJu !== false,
                        showDaYunShenSha: settings.showDaYunShenSha !== false,
                        showLiuNianShenSha: settings.showLiuNianShenSha !== false,
                      }}
                      onToggle={(field, checked) => updateSettings({ [field]: checked } as Partial<BaZiSettings>)}
                    />
                  ) : null}
                </div>
              </section>

              <aside id="input-rail" className="order-2 space-y-5 lg:col-start-1 lg:row-start-1 lg:sticky lg:top-24 lg:self-start">
                <SidePanel
                  eyebrow="快速起盘"
                  title="输入侧栏"
                  description="生成后结果会在右侧展开，移动端则按自然顺序继续阅读并调整参数。"
                >
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    {quickStats.map((item) => <QuickStat key={item.label} label={item.label} value={item.value} />)}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button type="button" onClick={() => resetWith(EXAMPLE_SETTINGS)} className="rounded-full border border-[#4a2d19] bg-[#4a2d19] px-4 py-2 text-sm text-white transition hover:bg-[#3d2617]">填入示例</button>
                    <button type="button" onClick={() => resetWith()} className="rounded-full border border-[rgba(117,76,40,0.14)] bg-[rgba(255,252,247,0.88)] px-4 py-2 text-sm text-[#5b4430] transition hover:border-[#a27140] hover:bg-[#fff7ed]">恢复默认</button>
                  </div>
                </SidePanel>

                <BaZiForm
                  {...formSharedProps}
                  advancedDefaultOpen={!hasResult}
                  showSummaryTiles
                />
              </aside>
            </>
          ) : (
            <>
              <section id="input-rail" className="order-1">
                <BaZiForm
                  {...formSharedProps}
                  advancedDefaultOpen
                  showSummaryTiles={false}
                />
              </section>

              <aside className="order-2 space-y-5 lg:sticky lg:top-24 lg:self-start">
                <SidePanel
                  eyebrow="当前配置"
                  title="排盘工作台"
                  description="桌面端改成左表单右信息栏，不再把起盘摘要单独堆在表单上方。"
                >
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    {quickStats.map((item) => <QuickStat key={item.label} label={item.label} value={item.value} />)}
                  </div>
                  <div className="mt-5 grid gap-3">
                    {intakeNotes.map((item) => (
                      <div key={item.label} className="flex items-start justify-between gap-4 rounded-[18px] border border-[#d8cab6] bg-white/72 px-4 py-3">
                        <span className="text-xs uppercase tracking-[0.22em] text-[#8b6641]">{item.label}</span>
                        <span className="text-right text-sm font-medium text-[#2f2118]">{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button type="button" onClick={() => resetWith(EXAMPLE_SETTINGS)} className="rounded-full border border-[#4a2d19] bg-[#4a2d19] px-4 py-2 text-sm text-white transition hover:bg-[#3d2617]">填入示例</button>
                    <button type="button" onClick={() => resetWith()} className="rounded-full border border-[rgba(117,76,40,0.14)] bg-[rgba(255,252,247,0.88)] px-4 py-2 text-sm text-[#5b4430] transition hover:border-[#a27140] hover:bg-[#fff7ed]">恢复默认</button>
                  </div>
                </SidePanel>

                <SidePanel
                  eyebrow="排盘输出"
                  title="提交后会展开这些内容"
                  description="不再放大面积留白，直接把生成结果的核心内容收进右栏。"
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
                </SidePanel>
              </aside>
            </>
          )}
        </div>
      </main>

      {result ? <AIAssistant system="bazi" chartData={result} /> : null}
    </div>
  );
}
