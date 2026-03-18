'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AIAssistant } from '@/components/ai';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
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
  qiYunLiuPaiType: 1,
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
      errors.longitude = '启用真太阳时时，请填写城市或经度。';
    }

    if (city && cityLongitude === null && longitude === undefined) {
      errors.city = '城市未收录，请改填受支持城市名称或直接输入经度。';
    }

    if (longitude !== undefined && (Number.isNaN(longitude) || longitude < -180 || longitude > 180)) {
      errors.longitude = '经度必须在 -180 到 180 之间。';
    }
  }

  return errors;
}

const EXAMPLE_SETTINGS: Partial<BaZiSettings> = {
  name: '示例命盘',
  sex: 1,
  date: '1990-01-15 08:00:00',
  dateType: 0,
};

export default function BaZiPage() {
  const [settings, setSettings] = useState<BaZiSettings>(INITIAL_SETTINGS);
  const [result, setResult] = useState<BaZiResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const clearErrors = (...fields: string[]) => {
    setErrors(current => {
      if (fields.length === 0) {
        return {};
      }

      const next = { ...current };
      fields.forEach(field => {
        delete next[field];
      });
      return next;
    });
  };

  const updateSettings = (patch: Partial<BaZiSettings>, clearedFields: string[] = []) => {
    setSettings(current => ({ ...current, ...patch }));
    clearErrors(...clearedFields);
    setSubmitError('');
  };

  const handleTextChange = (field: keyof BaZiSettings, value: string) => {
    updateSettings({ [field]: value } as Partial<BaZiSettings>, [String(field)]);
  };

  const handleNumberChange = (field: keyof BaZiSettings, value: number | undefined) => {
    updateSettings({ [field]: value } as Partial<BaZiSettings>, [String(field)]);
  };

  const handleRadioChange = (field: keyof BaZiSettings, value: string | number) => {
    updateSettings({ [field]: value as never } as Partial<BaZiSettings>, [String(field)]);
  };

  const handleToggle = (field: keyof BaZiSettings, checked: boolean) => {
    if (field === 'useTrueSolarTime' && !checked) {
      updateSettings({ useTrueSolarTime: false, city: '', longitude: undefined }, ['city', 'longitude']);
      return;
    }
    updateSettings({ [field]: checked } as Partial<BaZiSettings>, [String(field)]);
  };

  const handleDateChange = (value: string) => {
    updateSettings({ date: value }, ['date']);
  };

  const handleDateTypeChange = (nextDateType: 0 | 1) => {
    try {
      const convertedDate = convertDateValue(settings.date, settings.dateType, nextDateType);
      updateSettings({ dateType: nextDateType, date: convertedDate }, ['date']);
    } catch (error) {
      setErrors(current => ({
        ...current,
        date: error instanceof Error ? error.message : '日期转换失败',
      }));
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validateSettings(settings);

    if (Object.keys(nextErrors).length > 0) {
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

        const paiPanResult = createBaZiPaiPan(normalizedSettings);
        setSettings(normalizedSettings);
        setResult(paiPanResult);
        clearErrors();
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : '排盘失败，请检查输入。');
      } finally {
        setLoading(false);
      }
    }, 0);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8f5ef_0%,#f3efe7_34%,#ede8de_100%)] text-stone-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-stone-900 focus:px-4 focus:py-2 focus:text-white"
      >
        跳到主内容
      </a>

      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-amber-700">BaZi Studio</p>
            <h1 className="mt-1 text-xl font-semibold text-stone-900">八字排盘</h1>
          </div>
          <Link
            href="/"
            className="rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-700 transition-colors hover:border-stone-500 hover:bg-stone-50"
          >
            返回首页
          </Link>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <BaZiForm
              settings={settings}
              errors={errors}
              loading={loading}
              onSubmit={handleSubmit}
              onTextChange={handleTextChange}
              onNumberChange={handleNumberChange}
              onRadioChange={handleRadioChange}
              onToggle={handleToggle}
              onDateChange={handleDateChange}
              onDateTypeChange={handleDateTypeChange}
            />
          </aside>

          <section className="space-y-6">
            <div className="rounded-[32px] border border-stone-200 bg-white/80 p-6 shadow-lg backdrop-blur">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-stone-400">输入可信</p>
                  <h2 className="mt-2 text-lg font-semibold text-stone-900">不再静默改日期</h2>
                  <p className="mt-2 text-sm leading-7 text-stone-600">
                    公历、农历、闰月和历法切换都走严格校验。格式错了会停在输入层，不再回填当前时间。
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-stone-400">结果分层</p>
                  <h2 className="mt-2 text-lg font-semibold text-stone-900">先结论，再深挖</h2>
                  <p className="mt-2 text-sm leading-7 text-stone-600">
                    结果区按概览、判断、运势、结构、细化解释拆段，移动端优先摘要，不再依赖超长滚动。
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-stone-400">进阶能力</p>
                  <h2 className="mt-2 text-lg font-semibold text-stone-900">算法与产品对齐</h2>
                  <p className="mt-2 text-sm leading-7 text-stone-600">
                    真太阳时、闰月、小运、流时、九星、干支留意和格局判断现在都能在页面上直接配置与查看。
                  </p>
                </div>
              </div>
            </div>

            {submitError && (
              <Alert type="error" title="排盘失败">
                {submitError}
              </Alert>
            )}

            {loading && (
              <div className="rounded-[32px] border border-stone-200 bg-white/80 p-12 shadow-lg backdrop-blur">
                <Loading size="lg" text="正在排盘…" />
              </div>
            )}

            {!result && !loading && (
              <div className="rounded-[32px] border border-dashed border-stone-300 bg-white/60 p-8 text-center shadow-sm">
                <h2 className="text-2xl font-semibold text-stone-900">等待生成命盘</h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-stone-600">
                  先填出生信息，再按需展开进阶设置。提交后会显示四柱、格局、喜用神、大运流年、小运、九星与详细分析。
                </p>
                <button
                  type="button"
                  onClick={() => updateSettings(EXAMPLE_SETTINGS)}
                  className="mt-6 rounded-full border border-stone-300 px-6 py-2 text-sm text-stone-700 transition-colors hover:border-stone-500 hover:bg-stone-50"
                >
                  填入示例：1990年1月15日男命
                </button>
              </div>
            )}

            {result && !loading && (
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
                onToggle={handleToggle}
              />
            )}
          </section>
        </div>
      </main>

      {result && <AIAssistant system="bazi" chartData={result} />}
    </div>
  );
}
