import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const variantStyles = {
    default: 'border border-[rgba(117,76,40,0.14)] bg-[rgba(255,252,247,0.88)] text-[#5d4732]',
    success: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
    warning: 'border border-amber-200 bg-amber-50 text-amber-800',
    danger: 'border border-red-200 bg-red-50 text-red-700',
    info: 'border border-sky-200 bg-sky-50 text-sky-700'
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  return (
    <span className={`inline-block rounded-full font-medium shadow-[0_12px_24px_-20px_rgba(61,37,15,0.35)] ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  );
};
