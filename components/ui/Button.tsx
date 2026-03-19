import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  gradient?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  gradient,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'rounded-[22px] font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3.5 text-lg'
  };

  const variantStyles = {
    primary: gradient || 'bg-gradient-to-r from-stone-900 via-stone-800 to-amber-700 text-white shadow-lg shadow-amber-900/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-900/25 focus:ring-amber-500',
    secondary: 'border border-[rgba(117,76,40,0.14)] bg-[rgba(255,252,247,0.88)] text-[#5b4430] shadow-sm hover:border-[#a27140] hover:bg-[#fff7ed] focus:ring-amber-500',
    danger: 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-900/20 hover:-translate-y-0.5 hover:shadow-xl focus:ring-red-500',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-emerald-900/20 hover:-translate-y-0.5 hover:shadow-xl focus:ring-green-500'
  };

  const widthStyle = fullWidth ? 'w-full' : '';
  const disabledStyle = (disabled || loading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  const finalGradient = gradient
    ? `bg-gradient-to-r ${gradient} text-white shadow-lg shadow-amber-900/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-900/25 focus:ring-amber-500`
    : variantStyles[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${finalGradient} ${widthStyle} ${disabledStyle} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{children}</span>
        </span>
      ) : children}
    </button>
  );
};
