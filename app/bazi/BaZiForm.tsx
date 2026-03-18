import { BaZiSettings } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DateTimePicker } from '@/components/ui/FormControls';
import { Input, RadioGroup } from '@/components/ui/Input';
import { getSupportedCities } from '@/lib/utils/trueSolarTime';

interface BaZiFormProps {
  settings: BaZiSettings;
  errors: Record<string, string>;
  loading: boolean;
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

function ToggleField({
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
      className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition-all ${
        checked
          ? 'border-stone-900 bg-stone-900 text-white shadow-md'
          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50'
      }`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 accent-amber-600"
      />
      <span className="space-y-1">
        <span className="block text-sm font-medium">{label}</span>
        <span className={`block text-xs ${checked ? 'text-stone-200' : 'text-stone-500'}`}>
          {description}
        </span>
      </span>
    </label>
  );
}

export function BaZiForm({
  settings,
  errors,
  loading,
  onSubmit,
  onTextChange,
  onNumberChange,
  onRadioChange,
  onToggle,
  onDateChange,
  onDateTypeChange,
}: BaZiFormProps) {
  return (
    <Card
      title="排盘输入"
      className="overflow-visible border border-stone-200 bg-white/90 shadow-xl backdrop-blur"
      headerClassName="bg-gradient-to-r from-stone-900 to-amber-700"
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2">
          <Input
            label="姓名"
            value={settings.name ?? ''}
            onChange={(event) => onTextChange('name', event.target.value)}
            placeholder="可选，用于报告标题"
            fullWidth
          />

          <Input
            label="占事"
            value={settings.occupy ?? ''}
            onChange={(event) => onTextChange('occupy', event.target.value)}
            placeholder="可选，例如婚恋、事业、财运"
            fullWidth
          />

          <RadioGroup
            label="性别"
            name="sex"
            value={settings.sex}
            onChange={(value) => onRadioChange('sex', value)}
            options={[
              { label: '男命', value: 1 },
              { label: '女命', value: 0 },
            ]}
          />

          <RadioGroup
            label="日期类型"
            name="dateType"
            value={settings.dateType}
            onChange={(value) => onDateTypeChange(Number(value) as 0 | 1)}
            options={[
              { label: '公历', value: 0 },
              { label: '农历', value: 1 },
            ]}
            helperText="切换时会严格转换当前输入，不再回退成默认时间。"
          />
        </div>

        <DateTimePicker
          label="出生日期时间"
          value={settings.date}
          onChange={onDateChange}
          dateType={settings.dateType}
          error={errors.date}
          helperText={
            settings.dateType === 0
              ? '公历格式：yyyy-MM-dd HH:mm:ss'
              : '农历格式：L:yyyy-M-d HH:mm:ss，可用闰月勾选生成 -R'
          }
        />

        <details className="rounded-2xl border border-stone-200 bg-stone-50/80 p-4" open>
          <summary className="cursor-pointer list-none text-sm font-semibold text-stone-800">
            进阶设置
          </summary>
          <div className="mt-4 space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <RadioGroup
                label="年龄口径"
                name="xuShiSuiType"
                value={settings.xuShiSuiType ?? 1}
                onChange={(value) => onRadioChange('xuShiSuiType', value)}
                options={[
                  { label: '实岁', value: 1 },
                  { label: '虚岁', value: 0 },
                ]}
              />

              <RadioGroup
                label="起运流派"
                name="qiYunLiuPaiType"
                value={settings.qiYunLiuPaiType ?? 1}
                onChange={(value) => onRadioChange('qiYunLiuPaiType', value)}
                options={[
                  { label: '流派一', value: 0 },
                  { label: '流派二', value: 1 },
                ]}
                helperText="流派一：出生后第3天起算；流派二：按节气间隔精确计算（主流用法）。"
              />

              <RadioGroup
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

              <RadioGroup
                label="月干支口径"
                name="monthGanZhiType"
                value={settings.monthGanZhiType ?? 1}
                onChange={(value) => onRadioChange('monthGanZhiType', value)}
                options={[
                  { label: '节交当天', value: 0 },
                  { label: '精确节交', value: 1 },
                ]}
              />

              <RadioGroup
                label="日干支换日"
                name="dayGanZhiType"
                value={settings.dayGanZhiType ?? 0}
                onChange={(value) => onRadioChange('dayGanZhiType', value)}
                options={[
                  { label: '子初换日', value: 0 },
                  { label: '子正换日', value: 1 },
                ]}
              />

              <Input
                label="大运轮数"
                type="number"
                min={6}
                max={16}
                value={settings.daYunLunShu ?? 10}
                onChange={(event) => onNumberChange('daYunLunShu', Number(event.target.value))}
                error={errors.daYunLunShu}
                helperText="建议 10，范围 6 到 16。"
                fullWidth
              />
            </div>

            <div className="space-y-4">
              <ToggleField
                id="use-true-solar-time"
                label="启用真太阳时"
                description="使用城市或经度修正出生时刻，避免只用标准时区。"
                checked={Boolean(settings.useTrueSolarTime)}
                onChange={(checked) => onToggle('useTrueSolarTime', checked)}
              />

              {settings.useTrueSolarTime && (
                <div className="grid gap-5 md:grid-cols-2">
                  <Input
                    label="城市"
                    value={settings.city ?? ''}
                    onChange={(event) => onTextChange('city', event.target.value)}
                    list={TRUE_SOLAR_CITY_LIST_ID}
                    autoComplete="off"
                    placeholder="例如 北京、上海、广州"
                    error={errors.city}
                    helperText="填城市时优先按城市经度修正。"
                    fullWidth
                  />
                  <Input
                    label="经度"
                    type="number"
                    step="0.0001"
                    value={settings.longitude ?? ''}
                    onChange={(event) => {
                      const raw = event.target.value;
                      onNumberChange('longitude', raw === '' ? undefined : Number(raw));
                    }}
                    error={errors.longitude}
                    helperText="城市留空时可直接填经度，例如 121.4737。"
                    fullWidth
                  />
                  <p className="text-xs leading-6 text-stone-500 md:col-span-2">
                    已收录 {SUPPORTED_TRUE_SOLAR_CITIES.length} 个城市，如 {FEATURED_TRUE_SOLAR_CITIES}。城市匹配成功时优先使用城市经度；未收录时请直接输入经度。
                  </p>
                  <datalist id={TRUE_SOLAR_CITY_LIST_ID}>
                    {SUPPORTED_TRUE_SOLAR_CITIES.map((city) => (
                      <option key={city} value={city} />
                    ))}
                  </datalist>
                </div>
              )}
            </div>

          </div>
        </details>

        <Button
          type="submit"
          loading={loading}
          fullWidth
          size="lg"
          gradient="from-stone-900 to-amber-700"
        >
          开始排盘
        </Button>
      </form>
    </Card>
  );
}
