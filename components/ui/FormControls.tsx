import React, { useId, useMemo, useState } from 'react';
import { LunarYear } from 'lunar-javascript';
import {
  convertDateValue,
  formatLunarDateTime,
  formatSolarDateTime,
  LunarDateTimeParts,
  parseLunarDateTimeString,
  parseSolarDateTimeString,
  SolarDateTimeParts,
} from '@/lib/utils/dateTime';

interface DateTimePickerProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  dateType?: 0 | 1;
  error?: string;
  helperText?: string;
  pickerOnly?: boolean;
}

interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  id?: string;
  label?: string;
  value: string | number;
  onChange: (value: string) => void;
  options: SelectOption[];
  error?: string;
  helperText?: string;
}

const LUNAR_MONTHS = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];

const DEFAULT_SOLAR: SolarDateTimeParts = {
  year: 2024,
  month: 1,
  day: 1,
  hour: 0,
  minute: 0,
  second: 0,
};

const DEFAULT_LUNAR: LunarDateTimeParts = {
  year: 2024,
  month: 1,
  day: 1,
  hour: 0,
  minute: 0,
  second: 0,
  isLeap: false,
};

interface LunarYearWithMonthData {
  getLeapMonth(): number;
  getMonths(): Array<{ getMonth(): number; getDayCount(): number }>;
}

function getLeapMonth(year: number): number | null {
  try {
    const lunarYear = LunarYear.fromYear(year) as unknown as LunarYearWithMonthData;
    const leapMonth = lunarYear.getLeapMonth();
    return leapMonth > 0 ? leapMonth : null;
  } catch {
    return null;
  }
}

function getLunarMonthDayCount(year: number, month: number, isLeap: boolean): number {
  try {
    const lunarYear = LunarYear.fromYear(year) as unknown as LunarYearWithMonthData;
    const targetMonth = isLeap ? -month : month;
    const monthData = lunarYear.getMonths()
      .find((item) => item.getMonth() === targetMonth);
    return monthData?.getDayCount() ?? 30;
  } catch {
    return 30;
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function getSolarMonthDayCount(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function PickerField({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`space-y-1 text-sm text-[#6b5a4c] ${className}`}>
      <span className="text-[11px] uppercase tracking-[0.22em] text-[#8f6a45]">{label}</span>
      {children}
    </label>
  );
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  id,
  label,
  value,
  onChange,
  dateType = 0,
  error,
  helperText,
  pickerOnly = false,
}) => {
  const generatedId = useId();
  const inputId = id ?? `date-time-${generatedId}`;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;
  const pickerId = `${inputId}-picker`;
  const describedBy = error ? errorId : helperText ? helperId : undefined;

  const [showPicker, setShowPicker] = useState(false);
  const pickerVisible = pickerOnly || showPicker;

  const solarDraft = useMemo(
    () => parseSolarDateTimeString(value) ?? DEFAULT_SOLAR,
    [value]
  );

  const lunarDraft = useMemo<LunarDateTimeParts>(() => {
    const parsed = parseLunarDateTimeString(value) ?? DEFAULT_LUNAR;
    const month = Math.abs(parsed.month);
    const leapMonth = getLeapMonth(parsed.year);
    const isLeap = parsed.isLeap && leapMonth === month;

    return {
      ...parsed,
      month,
      day: clamp(parsed.day, 1, getLunarMonthDayCount(parsed.year, month, isLeap)),
      isLeap,
    };
  }, [value]);

  const leapMonth = getLeapMonth(lunarDraft.year);
  const lunarDayCount = getLunarMonthDayCount(lunarDraft.year, lunarDraft.month, lunarDraft.isLeap);
  const solarDayCount = getSolarMonthDayCount(solarDraft.year, solarDraft.month);

  const updateSolarDraft = (next: Partial<SolarDateTimeParts>) => {
    const merged = { ...solarDraft, ...next };
    const updated = {
      ...merged,
      day: clamp(merged.day, 1, getSolarMonthDayCount(merged.year, merged.month)),
    };
    onChange(formatSolarDateTime(updated));
  };

  const updateLunarDraft = (next: Partial<LunarDateTimeParts>) => {
    const merged = { ...lunarDraft, ...next };
    const maxDay = getLunarMonthDayCount(merged.year, merged.month, merged.isLeap);
    const updated = {
      ...merged,
      day: clamp(merged.day, 1, maxDay),
    };
    onChange(
      formatLunarDateTime({
        ...updated,
        month: Math.abs(updated.month),
      })
    );
  };

  const setNow = () => {
    const now = new Date();
    const nowValue = formatSolarDateTime({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
      second: now.getSeconds(),
    });

    if (dateType === 0) {
      onChange(nowValue);
      return;
    }

    onChange(convertDateValue(nowValue, 0, 1));
  };

  return (
    <div className="w-full space-y-3">
      {label ? (
        <label htmlFor={inputId} className="block text-[11px] uppercase tracking-[0.24em] text-[#8f6a45]">
          {label}
        </label>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={setNow}
          className="rounded-full border border-[rgba(117,76,40,0.14)] bg-[rgba(255,252,247,0.88)] px-3 py-1.5 text-sm text-[#5b4430] transition-colors hover:border-[#a27140] hover:bg-[#fff7ed]"
        >
          当前时间
        </button>
        {pickerOnly ? (
          <div className="inline-flex items-center rounded-full border border-[#d7b07d] bg-[#fff3de] px-3 py-1.5 text-sm text-[#7a5328]">
            选择模式
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowPicker((prev) => !prev)}
            aria-expanded={pickerVisible}
            aria-controls={pickerId}
            className="rounded-full border border-[rgba(117,76,40,0.14)] bg-[rgba(255,252,247,0.88)] px-3 py-1.5 text-sm text-[#5b4430] transition-colors hover:border-[#a27140] hover:bg-[#fff7ed]"
          >
            {pickerVisible ? '收起选择器' : '展开选择器'}
          </button>
        )}
      </div>

      {pickerOnly ? (
        <div
          id={inputId}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          className={`rounded-[18px] border bg-[rgba(255,252,246,0.92)] px-4 py-3 text-stone-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] ${
            error ? 'border-red-500' : 'border-[#d9c9b4]'
          }`}
        >
          {value}
        </div>
      ) : (
        <input
          id={inputId}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          className={`w-full rounded-[18px] border bg-[rgba(255,252,246,0.92)] px-4 py-3 text-stone-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition-all focus:border-transparent focus:outline-none focus:ring-2 ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-[#d9c9b4] focus:ring-amber-500'
          }`}
          placeholder={dateType === 0 ? '例如 2024-01-01 08:30:00' : '例如 L:2025-6-1 08:30:00-R'}
        />
      )}

      {pickerVisible ? (
        <div id={pickerId} className="rounded-[24px] border border-[#dbcdbb] bg-[rgba(255,250,242,0.86)] p-4 shadow-[0_14px_30px_-24px_rgba(42,24,8,0.45)]">
          {dateType === 0 ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <PickerField label="年">
                {pickerOnly ? (
                  <select
                    value={solarDraft.year}
                    onChange={(event) => updateSolarDraft({ year: Number(event.target.value) })}
                    className="w-full rounded-[14px] border border-[#d9c9b4] bg-[rgba(255,252,246,0.92)] px-3 py-2 text-stone-900"
                  >
                    {Array.from({ length: 201 }, (_, index) => 1900 + index).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    min={1900}
                    max={2100}
                    value={solarDraft.year}
                    onChange={(event) => updateSolarDraft({ year: Number(event.target.value) })}
                    className="w-full rounded-[14px] border border-[#d9c9b4] bg-[rgba(255,252,246,0.92)] px-3 py-2 text-stone-900"
                  />
                )}
              </PickerField>
              <PickerField label="月">
                {pickerOnly ? (
                  <select
                    value={solarDraft.month}
                    onChange={(event) => updateSolarDraft({ month: Number(event.target.value) })}
                    className="w-full rounded-[14px] border border-[#d9c9b4] bg-[rgba(255,252,246,0.92)] px-3 py-2 text-stone-900"
                  >
                    {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={solarDraft.month}
                    onChange={(event) => updateSolarDraft({ month: clamp(Number(event.target.value), 1, 12) })}
                    className="w-full rounded-[14px] border border-[#d9c9b4] bg-[rgba(255,252,246,0.92)] px-3 py-2 text-stone-900"
                  />
                )}
              </PickerField>
              <PickerField label="日">
                {pickerOnly ? (
                  <select
                    value={solarDraft.day}
                    onChange={(event) => updateSolarDraft({ day: Number(event.target.value) })}
                    className="w-full rounded-[14px] border border-[#d9c9b4] bg-[rgba(255,252,246,0.92)] px-3 py-2 text-stone-900"
                  >
                    {Array.from({ length: solarDayCount }, (_, index) => index + 1).map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={solarDraft.day}
                    onChange={(event) => updateSolarDraft({ day: clamp(Number(event.target.value), 1, 31) })}
                    className="w-full rounded-[14px] border border-[#d9c9b4] bg-[rgba(255,252,246,0.92)] px-3 py-2 text-stone-900"
                  />
                )}
              </PickerField>
              <PickerField label="时">
                {pickerOnly ? (
                  <select
                    value={solarDraft.hour}
                    onChange={(event) => updateSolarDraft({ hour: Number(event.target.value) })}
                    className="w-full rounded-[14px] border border-[#d9c9b4] bg-[rgba(255,252,246,0.92)] px-3 py-2 text-stone-900"
                  >
                    {Array.from({ length: 24 }, (_, index) => index).map((hour) => (
                      <option key={hour} value={hour}>
                        {pad(hour)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={solarDraft.hour}
                    onChange={(event) => updateSolarDraft({ hour: clamp(Number(event.target.value), 0, 23) })}
                    className="w-full rounded-[14px] border border-[#d9c9b4] bg-[rgba(255,252,246,0.92)] px-3 py-2 text-stone-900"
                  />
                )}
              </PickerField>
              <PickerField label="分">
                {pickerOnly ? (
                  <select
                    value={solarDraft.minute}
                    onChange={(event) => updateSolarDraft({ minute: Number(event.target.value) })}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900"
                  >
                    {Array.from({ length: 60 }, (_, index) => index).map((minute) => (
                      <option key={minute} value={minute}>
                        {pad(minute)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={solarDraft.minute}
                    onChange={(event) => updateSolarDraft({ minute: clamp(Number(event.target.value), 0, 59) })}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900"
                  />
                )}
              </PickerField>
              <PickerField label="秒">
                {pickerOnly ? (
                  <select
                    value={solarDraft.second}
                    onChange={(event) => updateSolarDraft({ second: Number(event.target.value) })}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900"
                  >
                    {Array.from({ length: 60 }, (_, index) => index).map((second) => (
                      <option key={second} value={second}>
                        {pad(second)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={solarDraft.second}
                    onChange={(event) => updateSolarDraft({ second: clamp(Number(event.target.value), 0, 59) })}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900"
                  />
                )}
              </PickerField>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <PickerField label="农历年">
                  <select
                    value={lunarDraft.year}
                    onChange={(event) => updateLunarDraft({ year: Number(event.target.value), isLeap: false })}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900"
                  >
                    {Array.from({ length: 201 }, (_, index) => 1900 + index).map((year) => (
                      <option key={year} value={year}>
                        {year}年
                      </option>
                    ))}
                  </select>
                </PickerField>
                <PickerField label="农历月">
                  <select
                    value={lunarDraft.month}
                    onChange={(event) => updateLunarDraft({ month: Number(event.target.value), isLeap: false })}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900"
                  >
                    {LUNAR_MONTHS.map((monthLabel, index) => (
                      <option key={monthLabel} value={index + 1}>
                        {monthLabel}
                      </option>
                    ))}
                  </select>
                </PickerField>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <PickerField label="农历日" className="min-w-32">
                  <select
                    value={lunarDraft.day}
                    onChange={(event) => updateLunarDraft({ day: Number(event.target.value) })}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900"
                  >
                    {Array.from({ length: lunarDayCount }, (_, index) => index + 1).map((day) => (
                      <option key={day} value={day}>
                        {day}日
                      </option>
                    ))}
                  </select>
                </PickerField>

                <label className="inline-flex items-center gap-2 rounded-[16px] border border-[#d7b07d] bg-[#fff3de] px-3 py-2 text-sm text-[#7a5328]">
                  <input
                    type="checkbox"
                    checked={Boolean(leapMonth && leapMonth === lunarDraft.month && lunarDraft.isLeap)}
                    disabled={!leapMonth || leapMonth !== lunarDraft.month}
                    onChange={(event) => updateLunarDraft({ isLeap: event.target.checked })}
                  />
                  <span>
                    闰月
                    {leapMonth
                      ? leapMonth === lunarDraft.month
                        ? '（本月可用）'
                        : `（本年闰${LUNAR_MONTHS[leapMonth - 1]}）`
                      : '（本年无闰月）'}
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <PickerField label="时">
                  <select
                    value={lunarDraft.hour}
                    onChange={(event) => updateLunarDraft({ hour: Number(event.target.value) })}
                    className="w-full rounded-[14px] border border-[#d9c9b4] bg-[rgba(255,252,246,0.92)] px-3 py-2 text-stone-900"
                  >
                    {Array.from({ length: 24 }, (_, index) => index).map((hour) => (
                      <option key={hour} value={hour}>
                        {pad(hour)}时
                      </option>
                    ))}
                  </select>
                </PickerField>
                <PickerField label="分">
                  <select
                    value={lunarDraft.minute}
                    onChange={(event) => updateLunarDraft({ minute: Number(event.target.value) })}
                    className="w-full rounded-[14px] border border-[#d9c9b4] bg-[rgba(255,252,246,0.92)] px-3 py-2 text-stone-900"
                  >
                    {Array.from({ length: 60 }, (_, index) => index).map((minute) => (
                      <option key={minute} value={minute}>
                        {pad(minute)}分
                      </option>
                    ))}
                  </select>
                </PickerField>
                <PickerField label="秒">
                  <select
                    value={lunarDraft.second}
                    onChange={(event) => updateLunarDraft({ second: Number(event.target.value) })}
                    className="w-full rounded-[14px] border border-[#d9c9b4] bg-[rgba(255,252,246,0.92)] px-3 py-2 text-stone-900"
                  >
                    {Array.from({ length: 60 }, (_, index) => index).map((second) => (
                      <option key={second} value={second}>
                        {pad(second)}秒
                      </option>
                    ))}
                  </select>
                </PickerField>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {error ? (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {helperText && !error ? (
        <p id={helperId} className="text-sm text-[#7b6b5f]">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

export const Select: React.FC<SelectProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  error,
  helperText,
  className = '',
  ...props
}) => {
  const generatedId = useId();
  const selectId = id ?? `select-${generatedId}`;
  const helperId = `${selectId}-helper`;
  const errorId = `${selectId}-error`;
  const describedBy = error ? errorId : helperText ? helperId : undefined;

  return (
    <div className="space-y-2">
      {label ? (
        <label htmlFor={selectId} className="block text-[11px] uppercase tracking-[0.24em] text-[#8f6a45]">
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy}
        className={`w-full rounded-[18px] border bg-[rgba(255,252,246,0.92)] px-4 py-3 text-stone-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition-all focus:border-transparent focus:outline-none focus:ring-2 ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-[#d9c9b4] focus:ring-amber-500'
        } ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={`${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {helperText && !error ? (
        <p id={helperId} className="text-sm text-[#7b6b5f]">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};
