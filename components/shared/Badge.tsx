import React from 'react';

/**
 * Badge组件Props接口
 */
export interface BadgeProps {
  /** 子元素 */
  children: React.ReactNode;
  /** 变体样式 */
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'pink';
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 自定义类名 */
  className?: string;
  /** 图标 */
  icon?: string;
  /** 是否使用渐变 */
  gradient?: boolean;
}

/**
 * Badge - 标签徽章组件
 *
 * 用于标记和分类的小型标签组件
 *
 * @example
 * ```tsx
 * <Badge variant="success" size="md" icon="✓">
 *   已完成
 * </Badge>
 * ```
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  icon,
  gradient = false
}) => {
  const variantStyles = gradient ? {
    default: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 text-white',
    info: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
    purple: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
    pink: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
  } : {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    pink: 'bg-pink-100 text-pink-700'
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      role="status"
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
};
