'use client';

import { QuickAnalysisOption, AnalysisType } from '@/types/ai';

interface QuickPromptsProps {
  options: QuickAnalysisOption[];
  onSelect: (type: AnalysisType) => void;
  disabled?: boolean;
}

export default function QuickPrompts({ options, onSelect, disabled }: QuickPromptsProps) {
  // 过滤掉custom选项（自定义问题在聊天窗口输入）
  const displayOptions = options.filter(opt => opt.id !== 'custom');

  if (displayOptions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {displayOptions.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect(option.id)}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <span>{option.icon}</span>
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
