import { DateTimePicker } from '@/components/ui/FormControls';
import { BaZiSettings } from '@/types';
import { getSupportedCities } from '@/lib/utils/trueSolarTime';

interface BaZiFormProps {
  settings: BaZiSettings;
  errors: Record<string, string>;
  loading: boolean;
  advancedDefaultOpen?: boolean;
  showSummaryTiles?: boolean;
  onSubmit: (event: React.FormEvent) => void;
  onTextChange: (field: keyof BaZiSettings, value: string) => void;
  onNumberChange: (field: keyof BaZiSettings, value: number | undefined) => void;
  onRadioChange: (field: keyof BaZiSettings, value: string | number) => void;
  onToggle: (field: keyof BaZiSettings, checked: boolean) => void;
  onDateChange: (value: string) => void;
  onDateTypeChange: (value: 0 | 1) => void;
}

const TRUE_SOLAR_CITY_LIST_ID = 'true-solar-city-list';
const SUPPORTED_TRUE_SOLAR_CITIES = getSupportedCities();
const FEATURED_TRUE_SOLAR_CITIES = SUPPORTED_TRUE_SOLAR_CITIES.slice(0, 12).join('、');
const INPUT_BASE =
  'w-full rounded-[18px] border border-[#d9c9b4] bg-[rgba(255,252,246,0.92)] px-4 py-3 text-sm text-stone-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none transition focus:border-[#8f5b2d] focus:ring-2 focus:ring-[#d0a26a]/30';

function SectionLabel({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] uppercase tracking-[0.32em] text-[#8a6239]">{eyebrow}</p>
      <div>
        <h2 className="text-[1.75rem] font-semibold tracking-[0.06em] text-[#2f2118]">{title}</h2>
        <p className="mt-2 text-sm leading-7 text-[#66584d]">{description}</p>
      </div>
    </div>
  );
}

function FieldShell({
  label,
  hint,
  error,
  children,
  className = '',
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-[22px] border border-[#dbcdbb] bg-[rgba(255,250,242,0.86)] p-4 shadow-[0_14px_30px_-24px_rgba(42,24,8,0.45)] ${className}`}>
      <label className="block text-[11px] uppercase tracking-[0.24em] text-[#8f6a45]">{label}</label>
      <div className="mt-3">{children}</div>
      {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}
      {!error && hint ? <p className="mt-3 text-xs leading-6 text-[#7b6b5f]">{hint}</p> : null}
    </div>
  );
}

function ChoiceGroup({
  label,
  name,
  value,
  options,
  hint,
  error,
  onChange,
}: {
  label: string;
  name: string;
  value: string | number;
  options: Array<{ label: string; value: string | number }>;
  hint?: string;
  error?: string;
  onChange: (value: string | number) => void;
}) {
  return (
    <FieldShell label={label} hint={hint} error={error}>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => {
          const checked = value === option.value;

          return (
            <label
              key={`${name}-${option.value}`}
              className={`cursor-pointer rounded-[16px] border px-3 py-3 text-center text-sm transition ${
                checked
                  ? 'border-[#4b2e19] bg-[linear-gradient(135deg,#4b2e19,#8f5b2d)] text-white shadow-[0_18px_36px_-24px_rgba(66,37,13,0.9)]'
                  : 'border-[#d9c9b4] bg-white/80 text-[#4b3a2c] hover:border-[#b98c5e] hover:bg-[#fff8ef]'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={String(option.value)}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </FieldShell>
  );
}

function ToggleCard({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer gap-3 rounded-[22px] border p-4 transition ${
        checked
          ? 'border-[#4b2e19] bg-[linear-gradient(135deg,rgba(64,38,19,0.98),rgba(154,96,42,0.92))] text-white shadow-[0_18px_38px_-24px_rgba(63,34,11,0.85)]'
          : 'border-[#d9c9b4] bg-[rgba(255,251,244,0.88)] text-[#4b3a2c] hover:border-[#bc9163] hover:bg-[#fffbf5]'
      }`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 rounded border-stone-300 accent-[#8f5b2d]"
      />
      <span className="space-y-1">
        <span className="block text-sm font-medium">{label}</span>
        <span className={`block text-xs leading-6 ${checked ? 'text-stone-200' : 'text-[#7b6b5f]'}`}>
          {description}
        </span>
      </span>
    </label>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[#d8c9b3] bg-white/70 px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.26em] text-[#8b6641]">{label}</div>
      <div className="mt-2 text-sm font-medium text-[#2f2118]">{value}</div>
    </div>
  );
}

export function BaZiForm({
  settings,
  errors,
  loading,
  advancedDefaultOpen = true,
  showSummaryTiles = true,
  onSubmit,
  onTextChange,
  onNumberChange,
  onRadioChange,
  onToggle,
  onDateChange,
  onDateTypeChange,
}: BaZiFormProps) {
  const summaryTiles = [
    { label: '姓名', value: settings.name?.trim() || '未填写' },
    { label: '占事', value: settings.occupy?.trim() || '未指定' },
    { label: '性别', value: settings.sex === 1 ? '男命' : '女命' },
    { label: '日期类型', value: settings.dateType === 0 ? '公历' : '农历' },
    { label: '年龄口径', value: settings.xuShiSuiType === 0 ? '虚岁' : '实岁' },
    {
      label: '真太阳时',
      value: settings.useTrueSolarTime
        ? settings.city?.trim()
          ? `城市校正 ${settings.city.trim()}`
          : settings.longitude !== undefined
            ? `经度 ${settings.longitude}`
            : '已启用'
        : '关闭',
    },
  ];

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-[32px] border border-[rgba(114,76,37,0.12)] bg-[rgba(250,245,236,0.82)] p-5 shadow-[0_30px_60px_-36px_rgba(61,37,15,0.55)] backdrop-blur-xl sm:p-6"
    >
      <SectionLabel
        eyebrow="八字输入"
        title="命主输入"
        description="填写出生信息与排盘参数，提交后可继续在这里调整。"
      />

      {showSummaryTiles ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {summaryTiles.map((item) => (
            <SummaryTile key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <FieldShell label="姓名">
          <input
            value={settings.name ?? ''}
            onChange={(event) => onTextChange('name', event.target.value)}
            placeholder="用于报告标题，可留空"
            className={INPUT_BASE}
          />
        </FieldShell>

        <FieldShell label="占事">
          <input
            value={settings.occupy ?? ''}
            onChange={(event) => onTextChange('occupy', event.target.value)}
            placeholder="例如事业、财运、婚恋"
            className={INPUT_BASE}
          />
        </FieldShell>

        <ChoiceGroup
          label="性别"
          name="sex"
          value={settings.sex}
          onChange={(value) => onRadioChange('sex', value)}
          options={[
            { label: '男命', value: 1 },
            { label: '女命', value: 0 },
          ]}
        />

        <ChoiceGroup
          label="日期类型"
          name="dateType"
          value={settings.dateType}
          onChange={(value) => onDateTypeChange(Number(value) as 0 | 1)}
          options={[
            { label: '公历', value: 0 },
            { label: '农历', value: 1 },
          ]}
          hint="切换时会把当前日期严格转换，不会悄悄回退成默认时间。"
        />
      </div>

      <FieldShell
        label="出生日期时间"
        error={errors.date}
        hint={
          settings.dateType === 0
            ? '公历格式：yyyy-MM-dd HH:mm:ss'
            : '农历格式：L:yyyy-M-d HH:mm:ss，闰月可在末尾加 -R'
        }
      >
        <DateTimePicker
          label=""
          value={settings.date}
          onChange={onDateChange}
          dateType={settings.dateType}
          error={errors.date}
          pickerOnly
        />
      </FieldShell>

      <details
        className="rounded-[28px] border border-[#d8cab6] bg-[rgba(255,251,244,0.78)] p-4 shadow-[0_20px_40px_-34px_rgba(68,41,17,0.6)]"
        open={advancedDefaultOpen}
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-[#8a6239]">进阶设置</p>
            <h3 className="mt-2 text-xl font-semibold text-[#2f2118]">进阶设置</h3>
          </div>
          <span className="rounded-full border border-[#d6c6b0] bg-white/80 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[#7a5c3d]">
            展开 / 收起
          </span>
        </summary>

        <div className="mt-5 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <ChoiceGroup
              label="年龄口径"
              name="xuShiSuiType"
              value={settings.xuShiSuiType ?? 1}
              onChange={(value) => onRadioChange('xuShiSuiType', value)}
              options={[
                { label: '实岁', value: 1 },
                { label: '虚岁', value: 0 },
              ]}
            />

            <ChoiceGroup
              label="起运流派"
              name="qiYunLiuPaiType"
              value={settings.qiYunLiuPaiType ?? 1}
              onChange={(value) => onRadioChange('qiYunLiuPaiType', value)}
              options={[
                { label: '流派一', value: 0 },
                { label: '流派二', value: 1 },
              ]}
              hint="流派一按出生后第 3 天起算；流派二按节气间隔精确计算。"
            />

            <ChoiceGroup
              label="节气口径"
              name="jieQiType"
              value={settings.jieQiType ?? 1}
              onChange={(value) => onRadioChange('jieQiType', value)}
              options={[
                { label: '整日切换', value: 0 },
                { label: '精确分钟', value: 1 },
              ]}
            />

            <ChoiceGroup
              label="人元司令"
              name="renYuanType"
              value={settings.renYuanType ?? 0}
              onChange={(value) => onRadioChange('renYuanType', value)}
              options={[
                { label: '子平真诠', value: 0 },
                { label: '渊海子平', value: 1 },
                { label: '星平会海', value: 2 },
                { label: '三命通会', value: 3 },
                { label: '神峰通考', value: 4 },
                { label: '万育吾之', value: 5 },
              ]}
            />

            <ChoiceGroup
              label="年干支口径"
              name="yearGanZhiType"
              value={settings.yearGanZhiType ?? 2}
              onChange={(value) => onRadioChange('yearGanZhiType', value)}
              options={[
                { label: '春节切换', value: 0 },
                { label: '立春切换', value: 1 },
                { label: '精确立春', value: 2 },
              ]}
            />

            <ChoiceGroup
              label="月干支口径"
              name="monthGanZhiType"
              value={settings.monthGanZhiType ?? 1}
              onChange={(value) => onRadioChange('monthGanZhiType', value)}
              options={[
                { label: '节交当天', value: 0 },
                { label: '精确节交', value: 1 },
              ]}
            />

            <ChoiceGroup
              label="日干支换日"
              name="dayGanZhiType"
              value={settings.dayGanZhiType ?? 0}
              onChange={(value) => onRadioChange('dayGanZhiType', value)}
              options={[
                { label: '子初换日', value: 0 },
                { label: '子正换日', value: 1 },
              ]}
            />

            <FieldShell label="大运轮数" error={errors.daYunLunShu} hint="建议 10，允许范围 6 到 16。">
              <input
                type="number"
                min={6}
                max={16}
                value={settings.daYunLunShu ?? 10}
                onChange={(event) => {
                  const value = event.target.value;
                  onNumberChange('daYunLunShu', value === '' ? undefined : Number(value));
                }}
                className={INPUT_BASE}
              />
            </FieldShell>
          </div>

          <div className="space-y-4">
            <ToggleCard
              id="use-true-solar-time"
              label="启用真太阳时"
              description="使用城市或经度修正出生时刻，避免只用标准时区。"
              checked={Boolean(settings.useTrueSolarTime)}
              onChange={(checked) => onToggle('useTrueSolarTime', checked)}
            />

            {settings.useTrueSolarTime ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldShell
                  label="城市"
                  error={errors.city}
                  hint="优先按城市经度修正，支持直接搜索常见城市。"
                >
                  <input
                    value={settings.city ?? ''}
                    onChange={(event) => onTextChange('city', event.target.value)}
                    list={TRUE_SOLAR_CITY_LIST_ID}
                    autoComplete="off"
                    placeholder="例如 北京、上海、杭州"
                    className={INPUT_BASE}
                  />
                </FieldShell>

                <FieldShell
                  label="经度"
                  error={errors.longitude}
                  hint="城市未收录时可直接填经度，例如 120.1551。"
                >
                  <input
                    type="number"
                    step="0.0001"
                    value={settings.longitude ?? ''}
                    onChange={(event) => {
                      const value = event.target.value;
                      onNumberChange('longitude', value === '' ? undefined : Number(value));
                    }}
                    className={INPUT_BASE}
                  />
                </FieldShell>

                <p className="rounded-[18px] border border-[#dbcdbb] bg-[#fffaf2] px-4 py-3 text-xs leading-6 text-[#7b6b5f] sm:col-span-2">
                  已收录 {SUPPORTED_TRUE_SOLAR_CITIES.length} 个城市，例如 {FEATURED_TRUE_SOLAR_CITIES}。城市匹配成功时优先使用城市经度；未收录时可直接输入经度。
                </p>

                <datalist id={TRUE_SOLAR_CITY_LIST_ID}>
                  {SUPPORTED_TRUE_SOLAR_CITIES.map((city) => (
                    <option key={city} value={city} />
                  ))}
                </datalist>
              </div>
            ) : null}
          </div>
        </div>
      </details>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-3 rounded-[22px] border border-[#3a2412] bg-[linear-gradient(135deg,#3a2412,#88552a)] px-5 py-4 text-base font-medium text-white shadow-[0_24px_44px_-24px_rgba(68,37,11,0.9)] transition hover:-translate-y-0.5 hover:shadow-[0_30px_48px_-24px_rgba(68,37,11,0.95)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            正在排盘
          </>
        ) : (
          '开始排盘'
        )}
      </button>
    </form>
  );
}
