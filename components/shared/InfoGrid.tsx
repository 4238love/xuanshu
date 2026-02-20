import React from 'react';

/**
 * InfoGrid组件Props接口
 */
export interface InfoGridProps {
  /** 信息项数组 */
  items: InfoGridItem[];
  /** 列数 (响应式) */
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
  };
  /** 间距大小 */
  gap?: 'sm' | 'md' | 'lg';
  /** 自定义类名 */
  className?: string;
}

/**
 * 信息项接口
 */
export interface InfoGridItem {
  /** 标签 */
  label: string;
  /** 值 */
  value: string | number | React.ReactNode;
  /** 图标 */
  icon?: string;
  /** 渐变色 */
  color?: string;
  /** 自定义类名 */
  className?: string;
}

/**
 * InfoGrid - 信息网格组件
 *
 * 用于展示结构化信息的网格布局组件
 *
 * @example
 * ```tsx
 * <InfoGrid
 *   items={[
 *     { label: '年柱', value: '甲子', icon: '☯', color: 'from-purple-50 to-pink-50' },
 *     { label: '月柱', value: '乙丑', icon: '☯', color: 'from-blue-50 to-cyan-50' }
 *   ]}
 *   columns={{ sm: 1, md: 2, lg: 4 }}
 * />
 * ```
 */
export const InfoGrid: React.FC<InfoGridProps> = ({
  items,
  columns = { sm: 1, md: 2, lg: 3 },
  gap = 'md',
  className = ''
}) => {
  const gapStyles = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  const gridCols = `grid-cols-${columns.sm || 1} md:grid-cols-${columns.md || 2} lg:grid-cols-${columns.lg || 3}`;

  return (
    <div className={`grid ${gridCols} ${gapStyles[gap]} ${className}`}>
      {items.map((item, index) => (
        <InfoGridItem key={index} {...item} />
      ))}
    </div>
  );
};

/**
 * InfoGridItem - 单个信息项组件
 */
const InfoGridItem: React.FC<InfoGridItem> = ({
  label,
  value,
  icon,
  color = 'from-gray-50 to-gray-100',
  className = ''
}) => {
  return (
    <div
      className={`p-4 bg-gradient-to-br ${color} rounded-lg text-center border border-gray-200 ${className}`}
      role="group"
      aria-label={`${label}: ${value}`}
    >
      {icon && (
        <div className="text-2xl mb-2" aria-hidden="true">
          {icon}
        </div>
      )}
      <div className="text-xs text-gray-600 mb-1 font-medium">{label}</div>
      <div className="text-lg font-bold text-gray-800">
        {typeof value === 'string' || typeof value === 'number' ? value : value}
      </div>
    </div>
  );
};
