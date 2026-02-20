import React from 'react';

/**
 * Card组件Props接口
 */
export interface CardProps {
  /** 卡片标题 */
  title?: string;
  /** 标题图标 */
  icon?: string;
  /** 渐变色类名 (如: 'from-purple-500 to-pink-500') */
  gradient?: string;
  /** 子元素 */
  children: React.ReactNode;
  /** 自定义容器类名 */
  className?: string;
  /** 自定义头部类名 */
  headerClassName?: string;
  /** 自定义内容区类名 */
  bodyClassName?: string;
  /** 是否显示阴影 */
  shadow?: boolean;
  /** 是否可悬停效果 */
  hoverable?: boolean;
  /** 点击事件 */
  onClick?: () => void;
}

/**
 * Card - 卡片容器组件
 *
 * 用于展示内容的通用卡片容器，支持标题、图标、渐变背景等
 *
 * @example
 * ```tsx
 * <Card
 *   title="八字排盘"
 *   icon="☯"
 *   gradient="from-purple-500 to-pink-500"
 *   hoverable
 * >
 *   <p>卡片内容</p>
 * </Card>
 * ```
 */
export const Card: React.FC<CardProps> = ({
  title,
  icon,
  gradient,
  children,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  shadow = true,
  hoverable = false,
  onClick
}) => {
  const shadowClass = shadow ? 'shadow-xl' : '';
  const hoverClass = hoverable ? 'hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer' : '';
  const clickableClass = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden ${shadowClass} ${hoverClass} ${clickableClass} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {title && (
        <div className={`p-6 ${gradient ? `bg-gradient-to-r ${gradient}` : 'bg-gray-50'} ${headerClassName}`}>
          <h2 className={`text-2xl font-bold flex items-center gap-2 ${gradient ? 'text-white' : 'text-gray-800'}`}>
            {icon && <span className="text-3xl" aria-hidden="true">{icon}</span>}
            {title}
          </h2>
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};
