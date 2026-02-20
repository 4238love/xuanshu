import React from 'react';

/**
 * AnimatedCard组件Props接口
 */
export interface AnimatedCardProps {
  /** 卡片标题 */
  title: string;
  /** 卡片描述 */
  description?: string;
  /** 图标 */
  icon?: string;
  /** 渐变色类名 */
  gradient?: string;
  /** 点击事件 */
  onClick?: () => void;
  /** 链接地址 */
  href?: string;
  /** 自定义类名 */
  className?: string;
  /** 子元素 */
  children?: React.ReactNode;
  /** 动画类型 */
  animation?: 'lift' | 'scale' | 'glow' | 'slide';
}

/**
 * AnimatedCard - 动画卡片组件
 *
 * 带有悬停动画效果的交互式卡片
 *
 * @example
 * ```tsx
 * <AnimatedCard
 *   title="八字排盘"
 *   description="四柱八字，推算命理"
 *   icon="☯"
 *   gradient="from-purple-500 to-pink-500"
 *   animation="lift"
 *   onClick={handleClick}
 * />
 * ```
 */
export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  title,
  description,
  icon,
  gradient = 'from-purple-500 to-pink-500',
  onClick,
  href,
  className = '',
  children,
  animation = 'lift'
}) => {
  const animationStyles = {
    lift: 'hover:-translate-y-2 hover:shadow-2xl',
    scale: 'hover:scale-105 hover:shadow-2xl',
    glow: 'hover:shadow-2xl hover:shadow-purple-500/50',
    slide: 'hover:translate-x-1 hover:shadow-2xl'
  };

  const cardContent = (
    <>
      {/* 渐变背景 */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
        aria-hidden="true"
      />

      {/* 内容 */}
      <div className="relative z-10">
        {icon && (
          <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300" aria-hidden="true">
            {icon}
          </div>
        )}
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-gray-600 mb-4">
            {description}
          </p>
        )}
        {children}
        <div className={`inline-flex items-center gap-2 text-sm font-medium bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
          查看详情
          <span className="transform group-hover:translate-x-1 transition-transform duration-300" aria-hidden="true">→</span>
        </div>
      </div>

      {/* 装饰性底部边框 */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}
        aria-hidden="true"
      />
    </>
  );

  const baseClasses = `group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 ${animationStyles[animation]} ${className}`;

  if (href) {
    return (
      <a
        href={href}
        className={baseClasses}
        onClick={onClick}
      >
        {cardContent}
      </a>
    );
  }

  return (
    <div
      className={`${baseClasses} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {cardContent}
    </div>
  );
};
