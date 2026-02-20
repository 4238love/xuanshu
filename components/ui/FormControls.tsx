import React, { useState, useEffect } from 'react';
import { Solar } from 'lunar-javascript';
const { Lunar, LunarYear } = require('lunar-javascript');

interface DateTimePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  dateType?: 0 | 1; // 0: 公历, 1: 农历
  error?: string;
  helperText?: string;
}

// 农历月份名称
const LUNAR_MONTHS = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];

// 时辰名称
const SHI_CHEN = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时'];

// 解析公历日期时间字符串
const parseSolarDateTime = (dateStr: string) => {
  // 排除农历格式 L:xxxx
  if (dateStr.startsWith('L:')) return null;
  const match = dateStr.match(/(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})/);
  if (match) {
    return {
      year: match[1],
      month: match[2].padStart(2, '0'),
      day: match[3].padStart(2, '0'),
      hour: match[4].padStart(2, '0'),
      minute: match[5].padStart(2, '0'),
      second: match[6].padStart(2, '0')
    };
  }
  return null;
};

// 解析农历日期时间字符串
const parseLunarDateTime = (dateStr: string) => {
  // 农历格式: L:2024-1-15-08-30-00-R (R表示闰月)
  if (!dateStr.startsWith('L:')) return null;
  const match = dateStr.match(/L:(\d{1,4})-(\d{1,2})-(\d{1,2})-(\d{1,2}):(\d{1,2}):(\d{1,2})(-R)?/);
  if (match) {
    return {
      year: match[1],
      month: parseInt(match[2]),
      day: parseInt(match[3]),
      hour: match[4].padStart(2, '0'),
      minute: match[5].padStart(2, '0'),
      second: match[6].padStart(2, '0'),
      isLeap: !!match[7]
    };
  }
  return null;
};

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  label,
  value,
  onChange,
  dateType = 0,
  error,
  helperText
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [lunarYear, setLunarYear] = useState(2024);
  const [lunarMonth, setLunarMonth] = useState(1);
  const [lunarDay, setLunarDay] = useState(1);
  const [lunarHour, setLunarHour] = useState(0);
  const [lunarMinute, setLunarMinute] = useState(0);
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [lunarDaysInMonth, setLunarDaysInMonth] = useState(30);

  // 解析当前日期
  const parsedSolar = parseSolarDateTime(value);
  const parsedLunar = parseLunarDateTime(value);

  // 当切换到农历模式时，如果没有有效的农历日期，自动设置当前日期的农历
  useEffect(() => {
    if (dateType === 1 && !parsedLunar) {
      // 切换到农历模式但没有农历日期时，获取当前公历日期对应的农历
      const now = new Date();
      try {
        const solar = Solar.fromDate(now);
        const lunar = solar.getLunar();
        setLunarYear(lunar.getYear());
        setLunarMonth(lunar.getMonth());
        setLunarDay(lunar.getDay());
        setLunarHour(now.getHours());
        setLunarMinute(now.getMinutes());
        setIsLeapMonth(false);
        // 使用 LunarYear 获取农历月的天数
        const lunarYearObj = LunarYear.fromYear(lunar.getYear());
        const monthData = lunarYearObj.getMonth(lunar.getMonth());
        setLunarDaysInMonth(monthData ? monthData.getDayCount() : 30);

        // 自动设置农历格式的值
        const leapStr = '';
        const newValue = `L:${lunar.getYear()}-${lunar.getMonth()}-${lunar.getDay()}-${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00${leapStr}`;
        onChange(newValue);
      } catch (e) {
        // 如果失败，设置默认农历日期
        const defaultValue = 'L:2024-1-1-08:00:00';
        onChange(defaultValue);
      }
    } else if (dateType === 0 && value.startsWith('L:')) {
      // 切换到公历模式时，将农历日期转换为公历
      try {
        // 解析农历日期
        const match = value.match(/L:(\d{1,4})-(\d{1,2})-(\d{1,2})-(\d{1,2}):(\d{1,2}):(\d{1,2})(-R)?/);
        if (match) {
          const year = parseInt(match[1]);
          const month = parseInt(match[2]);
          const day = parseInt(match[3]);
          const hour = parseInt(match[4]);
          const minute = parseInt(match[5]);

          // 创建农历日期并获取对应的公历日期
          const lunar = Lunar.fromYmd(year, month, day);
          const solar = lunar.getSolar();

          // 创建公历日期字符串
          const newValue = `${solar.getYear()}-${String(solar.getMonth()).padStart(2, '0')}-${String(solar.getDay()).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
          onChange(newValue);
        }
      } catch (e) {
        // 转换失败，设置默认公历日期
        onChange('2024-01-01 08:00:00');
      }
    }
  }, [dateType]);

  // 当日期类型或值变化时，更新农历选择器的值
  useEffect(() => {
    if (dateType === 1 && parsedLunar) {
      setLunarYear(parseInt(parsedLunar.year));
      setLunarMonth(parsedLunar.month);
      setLunarDay(parsedLunar.day);
      setLunarHour(parseInt(parsedLunar.hour));
      setLunarMinute(parseInt(parsedLunar.minute));
      setIsLeapMonth(parsedLunar.isLeap);

      // 获取该月的天数
      try {
        const lunar = Lunar.fromYmd(
          parseInt(parsedLunar.year),
          parsedLunar.month,
          parsedLunar.day
        );
        // 使用 LunarYear 获取农历月的天数
        const lunarYearObj = LunarYear.fromYear(lunar.getYear());
        const monthData = lunarYearObj.getMonth(lunar.getMonth());
        setLunarDaysInMonth(monthData ? monthData.getDayCount() : 30);
      } catch (e) {
        setLunarDaysInMonth(30);
      }
    }
  }, [value, dateType]);

  // 更新农历某个月的天数
  useEffect(() => {
    if (dateType === 1) {
      try {
        const lunar = Lunar.fromYmd(lunarYear, lunarMonth, 1);
        // 使用 LunarYear 获取农历月的天数
        const lunarYearObj = LunarYear.fromYear(lunar.getYear());
        const monthData = lunarYearObj.getMonth(lunar.getMonth());
        setLunarDaysInMonth(monthData ? monthData.getDayCount() : 30);
      } catch (e) {
        setLunarDaysInMonth(30);
      }
    }
  }, [lunarYear, lunarMonth, dateType]);

  // 生成农历年份选项（1900-2100）
  const lunarYears = [];
  for (let y = 1900; y <= 2100; y++) {
    lunarYears.push(y);
  }

  // 处理公历日期变化
  const handleSolarChange = (field: string, val: string) => {
    const current = parsedSolar || {
      year: '2024',
      month: '01',
      day: '01',
      hour: '00',
      minute: '00',
      second: '00'
    };

    const updated = { ...current, [field]: val };
    const newValue = `${updated.year}-${updated.month}-${updated.day} ${updated.hour}:${updated.minute}:${updated.second}`;
    onChange(newValue);
  };

  // 处理农历日期变化
  const handleLunarChange = () => {
    const leapStr = isLeapMonth ? '-R' : '';
    const newValue = `L:${lunarYear}-${lunarMonth}-${lunarDay}-${String(lunarHour).padStart(2, '0')}:${String(lunarMinute).padStart(2, '0')}:00${leapStr}`;
    onChange(newValue);
  };

  // 设置为当前时间
  const setNow = () => {
    const now = new Date();
    const newValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    onChange(newValue);
  };

  // 判断某年是否有闰月及闰月月份
  const getLeapMonth = (year: number): number | null => {
    try {
      const lunar = Lunar.fromYmd(year, 1, 1);
      const leapMonth = lunar.getLeapMonth();
      return leapMonth > 0 ? leapMonth : null;
    } catch {
      return null;
    }
  };

  const leapMonth = getLeapMonth(lunarYear);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div className="space-y-3">
        {/* 快捷按钮 */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={setNow}
            className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            当前时间
          </button>
          <button
            type="button"
            onClick={() => setShowPicker(!showPicker)}
            className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            {showPicker ? '收起' : '展开'}选择器
          </button>
        </div>

        {/* 文本输入 */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
          } focus:ring-2 focus:border-transparent transition-all`}
          placeholder={dateType === 0 ? "格式：2024-01-01 08:30:00" : "格式：L:2024-1-15 08:30:00 (农历)"}
        />

        {/* 详细选择器 */}
        {showPicker && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            {dateType === 0 ? (
              /* 公历选择器 */
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {/* 年 */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">年</label>
                  <input
                    type="number"
                    value={parsedSolar?.year || '2024'}
                    onChange={(e) => handleSolarChange('year', e.target.value)}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    min="1900"
                    max="2100"
                  />
                </div>

                {/* 月 */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">月</label>
                  <input
                    type="number"
                    value={parsedSolar?.month || '01'}
                    onChange={(e) => handleSolarChange('month', String(e.target.value).padStart(2, '0'))}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="12"
                  />
                </div>

                {/* 日 */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">日</label>
                  <input
                    type="number"
                    value={parsedSolar?.day || '01'}
                    onChange={(e) => handleSolarChange('day', String(e.target.value).padStart(2, '0'))}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="31"
                  />
                </div>

                {/* 时 */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">时</label>
                  <input
                    type="number"
                    value={parsedSolar?.hour || '00'}
                    onChange={(e) => handleSolarChange('hour', String(e.target.value).padStart(2, '0'))}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="23"
                  />
                </div>

                {/* 分 */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">分</label>
                  <input
                    type="number"
                    value={parsedSolar?.minute || '00'}
                    onChange={(e) => handleSolarChange('minute', String(e.target.value).padStart(2, '0'))}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="59"
                  />
                </div>

                {/* 秒 */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">秒</label>
                  <input
                    type="number"
                    value={parsedSolar?.second || '00'}
                    onChange={(e) => handleSolarChange('second', String(e.target.value).padStart(2, '0'))}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="59"
                  />
                </div>
              </div>
            ) : (
              /* 农历选择器 */
              <div className="space-y-4">
                {/* 年 */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">农历年</label>
                  <select
                    value={lunarYear}
                    onChange={(e) => {
                      setLunarYear(parseInt(e.target.value));
                      setIsLeapMonth(false);
                    }}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  >
                    {lunarYears.map(y => (
                      <option key={y} value={y}>{y}年</option>
                    ))}
                  </select>
                </div>

                {/* 月 */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">农历月</label>
                  <div className="flex gap-2">
                    <select
                      value={lunarMonth}
                      onChange={(e) => setLunarMonth(parseInt(e.target.value))}
                      className="flex-1 px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    >
                      {LUNAR_MONTHS.map((m, idx) => (
                        <option key={idx + 1} value={idx + 1}>{m}</option>
                      ))}
                    </select>
                    {leapMonth && (
                      <label className="flex items-center gap-1 px-3 py-2 bg-amber-50 rounded border border-amber-200">
                        <input
                          type="checkbox"
                          checked={isLeapMonth}
                          onChange={(e) => setIsLeapMonth(e.target.checked)}
                          className="mr-1"
                        />
                        <span className="text-sm text-amber-700">闰月</span>
                      </label>
                    )}
                  </div>
                  {!leapMonth && (
                    <p className="text-xs text-gray-400 mt-1">该年无闰月</p>
                  )}
                </div>

                {/* 日 */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">农历日 ({lunarDaysInMonth}天)</label>
                  <select
                    value={lunarDay}
                    onChange={(e) => setLunarDay(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: lunarDaysInMonth }, (_, i) => i + 1).map(d => (
                      <option key={d} value={d}>{d}日</option>
                    ))}
                  </select>
                </div>

                {/* 时 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">时</label>
                    <select
                      value={lunarHour}
                      onChange={(e) => setLunarHour(parseInt(e.target.value))}
                      className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">分</label>
                    <select
                      value={lunarMinute}
                      onChange={(e) => setLunarMinute(parseInt(e.target.value))}
                      className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    >
                      {Array.from({ length: 60 }, (_, i) => (
                        <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 确认按钮 */}
                <button
                  type="button"
                  onClick={handleLunarChange}
                  className="w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  确认农历日期
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

interface SelectProps {
  label?: string;
  value: string | number;
  onChange: (value: any) => void;
  options: Array<{ label: string; value: string | number }>;
  error?: string;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  error,
  placeholder = '请选择'
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-3 rounded-lg border ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
        } focus:ring-2 focus:border-transparent transition-all bg-white`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
