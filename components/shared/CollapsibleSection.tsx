import React, { useState } from 'react';

/**
 * CollapsibleSection组件Props接口
 */
export interface CollapsibleSectionProps {
  /** 标题 */
  title: string;
  /** 标题图标 */
  icon?: string;
  /** 子元素 */
  children: React.ReactNode;
  /** 默认是否展开 */
  defaultOpen?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 标题类名 */
  titleClassName?: string;
  /** 内容类名 */
  contentClassName?: string;
  /** 渐变色 */
  gradient?: string;
}

/**
 * CollapsibleSection - 折叠面板组件
 *
 * 可展开/折叠的内容面板，适用于长内容的分组展示
 *
 * @example
 * ```tsx
 * <CollapsibleSection
 *   title="详细信息"
 *   icon="📋"
 *   defaultOpen={true}
 *   gradient="from-purple-500 to-pink-500"
 * >
 *   <p>这里是可折叠的内容</p>
 * </CollapsibleSection>
 * ```
 */
export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  children,
  defaultOpen = false,
  className = '',
  titleClassName = '',
  contentClassName = '',
  gradient
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleOpen();
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 ${className}`}>
      {/* 标题栏 */}
      <div
        className={`p-4 cursor-pointer select-none transition-colors ${
          gradient ? `bg-gradient-to-r ${gradient} text-white` : 'bg-gray-50 hover:bg-gray-100'
        } ${titleClassName}`}
        onClick={toggleOpen}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-controls={`collapsible-content-${title}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon && <span className="text-xl" aria-hidden="true">{icon}</span>}
            <h3 className={`text-lg font-semibold ${gradient ? 'text-white' : 'text-gray-800'}`}>
              {title}
            </h3>
          </div>
          <svg
            className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${
              gradient ? 'text-white' : 'text-gray-600'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* 内容区 */}
      <div
        id={`collapsible-content-${title}`}
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className={`p-4 ${contentClassName}`}>
          {children}
        </div>
      </div>
    </div>
  );
};
