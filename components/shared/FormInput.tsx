import React from 'react';

/**
 * FormInput组件Props接口
 */
export interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** 标签文本 */
  label?: string;
  /** 错误信息 */
  error?: string;
  /** 帮助文本 */
  helperText?: string;
  /** 输入框尺寸 */
  inputSize?: 'sm' | 'md' | 'lg';
  /** 是否必填 */
  required?: boolean;
  /** 前置图标 */
  prefixIcon?: React.ReactNode;
  /** 后置图标 */
  suffixIcon?: React.ReactNode;
  /** 容器类名 */
  containerClassName?: string;
}

/**
 * FormInput - 表单输入组件
 *
 * 带标签、错误提示、帮助文本的表单输入框
 *
 * @example
 * ```tsx
 * <FormInput
 *   label="姓名"
 *   placeholder="请输入姓名"
 *   required
 *   error={errors.name}
 *   helperText="请输入真实姓名"
 * />
 * ```
 */
export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  helperText,
  inputSize = 'md',
  required = false,
  prefixIcon,
  suffixIcon,
  containerClassName = '',
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${label?.replace(/\s+/g, '-').toLowerCase()}`;

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg'
  };

  const baseInputStyles = 'w-full rounded-lg border transition-all focus:outline-none focus:ring-2';
  const normalStyles = 'border-gray-300 focus:border-purple-500 focus:ring-purple-500/20';
  const errorStyles = 'border-red-500 focus:border-red-500 focus:ring-red-500/20';

  const inputClasses = `${baseInputStyles} ${sizeStyles[inputSize]} ${
    error ? errorStyles : normalStyles
  } ${prefixIcon ? 'pl-10' : ''} ${suffixIcon ? 'pr-10' : ''} ${className}`;

  return (
    <div className={`w-full ${containerClassName}`}>
      {/* 标签 */}
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="必填">*</span>}
        </label>
      )}

      {/* 输入框容器 */}
      <div className="relative">
        {/* 前置图标 */}
        {prefixIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
            {prefixIcon}
          </div>
        )}

        {/* 输入框 */}
        <input
          id={inputId}
          className={inputClasses}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          aria-required={required}
          {...props}
        />

        {/* 后置图标 */}
        {suffixIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
            {suffixIcon}
          </div>
        )}
      </div>

      {/* 错误信息 */}
      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}

      {/* 帮助文本 */}
      {!error && helperText && (
        <p
          id={`${inputId}-helper`}
          className="mt-1 text-sm text-gray-500"
        >
          {helperText}
        </p>
      )}
    </div>
  );
};

/**
 * FormTextarea组件Props接口
 */
export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** 标签文本 */
  label?: string;
  /** 错误信息 */
  error?: string;
  /** 帮助文本 */
  helperText?: string;
  /** 是否必填 */
  required?: boolean;
  /** 容器类名 */
  containerClassName?: string;
}

/**
 * FormTextarea - 表单文本域组件
 */
export const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  error,
  helperText,
  required = false,
  containerClassName = '',
  className = '',
  id,
  ...props
}) => {
  const textareaId = id || `textarea-${label?.replace(/\s+/g, '-').toLowerCase()}`;

  const baseStyles = 'w-full px-4 py-2 rounded-lg border transition-all focus:outline-none focus:ring-2';
  const normalStyles = 'border-gray-300 focus:border-purple-500 focus:ring-purple-500/20';
  const errorStyles = 'border-red-500 focus:border-red-500 focus:ring-red-500/20';

  const textareaClasses = `${baseStyles} ${error ? errorStyles : normalStyles} ${className}`;

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="必填">*</span>}
        </label>
      )}

      <textarea
        id={textareaId}
        className={textareaClasses}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined
        }
        aria-required={required}
        {...props}
      />

      {error && (
        <p
          id={`${textareaId}-error`}
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}

      {!error && helperText && (
        <p
          id={`${textareaId}-helper`}
          className="mt-1 text-sm text-gray-500"
        >
          {helperText}
        </p>
      )}
    </div>
  );
};
