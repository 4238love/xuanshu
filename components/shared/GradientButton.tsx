import React from 'react';

/**
 * GradientButton组件Props接口
 */
export interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 渐变色类名 (如: 'from-purple-500 to-pink-500') */
  gradient?: string;
  /** 按钮尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 加载状态 */
  loading?: boolean;
  /** 是否全宽 */
  fullWidth?: boolean;
  /** 子元素 */
  children: React.ReactNode;
  /** 图标 */
  icon?: React.ReactNode;
  /** 图标位置 */
  iconPosition?: 'left' | 'right';
}

/**
 * GradientButton - 渐变按钮组件
 *
 * 支持渐变背景、加载状态、图标等功能的按钮组件
 *
 * @example
 * ```tsx
 * <GradientButton
 *   gradient="from-purple-500 to-pink-500"
 *   size="md"
 *   loading={false}
 *   onClick={handleClick}
 * >
 *   开始排盘
 * </GradientButton>
 * ```
 */
export const GradientButton: React.FC<GradientButtonProps> = ({
  gradient = 'from-purple-500 to-pink-500',
  size = 'md',
  loading = false,
  fullWidth = false,
  children,
  icon,
  iconPosition = 'left',
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const widthStyle = fullWidth ? 'w-full' : '';
  const disabledStyle = (disabled || loading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg';
  const gradientStyle = `bg-gradient-to-r ${gradient} text-white`;

  const renderContent = () => {
    if (loading) {
      return (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{children}</span>
        </span>
      );
    }

    if (icon) {
      return (
        <span className="flex items-center justify-center gap-2">
          {iconPosition === 'left' && <span aria-hidden="true">{icon}</span>}
          <span>{children}</span>
          {iconPosition === 'right' && <span aria-hidden="true">{icon}</span>}
        </span>
      );
    }

    return children;
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${gradientStyle} ${widthStyle} ${disabledStyle} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {renderContent()}
    </button>
  );
};
