'use client';

import { AnalysisType, QuickAnalysisOption } from '@/types/ai';

interface QuickPromptsProps {
  options: QuickAnalysisOption[];
  onSelect: (type: AnalysisType) => void;
  disabled?: boolean;
}

const PROMPT_META: Record<
  Exclude<AnalysisType, 'custom'>,
  { mark: string; brief: string; markClass: string }
> = {
  comprehensive: {
    mark: '总',
    brief: '整体判断、结构主线与重点提醒',
    markClass: 'bg-[#4a2d19] text-white',
  },
  fortune: {
    mark: '运',
    brief: '时间阶段、趋势变化与关键年份',
    markClass: 'bg-[#8b5e34] text-white',
  },
  career: {
    mark: '事',
    brief: '事业推进、财务结构与取舍建议',
    markClass: 'bg-[#6b4c34] text-white',
  },
  love: {
    mark: '情',
    brief: '关系模式、情感节奏与注意事项',
    markClass: 'bg-[#9a602e] text-white',
  },
  health: {
    mark: '养',
    brief: '身心耗泄、日常保养与风险提示',
    markClass: 'bg-[#5f6b58] text-white',
  },
};

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export default function QuickPrompts({ options, onSelect, disabled }: QuickPromptsProps) {
  const displayOptions = options.filter((option) => option.id !== 'custom');

  if (displayOptions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {displayOptions.map((option) => {
        const meta = PROMPT_META[option.id as Exclude<AnalysisType, 'custom'>];
        const brief = meta?.brief ?? '围绕当前盘面生成专题批注';

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            disabled={disabled}
            title={brief}
            aria-label={`${option.label}：${brief}`}
            className={cx(
              'group inline-flex items-center gap-2.5 rounded-full border border-[rgba(117,76,40,0.14)] bg-[rgba(255,252,247,0.92)] px-3 py-2 text-left shadow-[0_12px_24px_-24px_rgba(61,37,15,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#a27140] hover:bg-[#fff7ed] hover:shadow-[0_18px_30px_-24px_rgba(61,37,15,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c69055]/35',
              disabled && 'cursor-not-allowed opacity-50 hover:translate-y-0'
            )}
          >
            <span
              className={cx(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold shadow-[0_10px_18px_-16px_rgba(61,37,15,0.55)]',
                meta?.markClass ?? 'bg-[#4a2d19] text-white'
              )}
              aria-hidden="true"
            >
              {meta?.mark ?? option.label.slice(0, 1)}
            </span>

            <span className="text-sm font-semibold tracking-[0.01em] text-[#2f2118]">
              {option.label}
            </span>

            <svg
              className="h-3.5 w-3.5 shrink-0 text-[#9a6e45] transition-transform duration-200 group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
