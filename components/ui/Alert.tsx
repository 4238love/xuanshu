import React from 'react';

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  icon?: string;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  icon,
  onClose,
  className = ''
}) => {
  const typeStyles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'ℹ️'
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: '✅'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: '⚠️'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: '❌'
    }
  };

  const style = typeStyles[type];

  return (
    <div
      className={`${style.bg} ${style.border} border rounded-lg p-4 ${className}`}
      role={type === 'error' || type === 'warning' ? 'alert' : 'status'}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">{icon || style.icon}</span>
        <div className="flex-1">
          {title && (
            <h4 className={`font-semibold ${style.text} mb-1`}>{title}</h4>
          )}
          <div className={`${style.text} text-sm`}>{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="关闭提示"
            className={`${style.text} hover:opacity-70 transition-opacity flex-shrink-0`}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
