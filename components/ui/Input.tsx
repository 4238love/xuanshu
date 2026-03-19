import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  fullWidth = false,
  className = '',
  id,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id ?? `input-${generatedId}`;
  const widthStyle = fullWidth ? 'w-full' : '';
  const errorStyle = error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-amber-500';
  const descriptionIds = [
    error ? `${inputId}-error` : '',
    !error && helperText ? `${inputId}-helper` : '',
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className={widthStyle}>
      {label && (
        <label htmlFor={inputId} className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-[#8f6a45]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={descriptionIds}
        className={`${widthStyle} rounded-[18px] border bg-[rgba(255,252,246,0.92)] px-4 py-3 text-stone-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition-all focus:border-transparent focus:outline-none focus:ring-2 ${errorStyle} ${className}`}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="mt-2 text-sm text-[#7b6b5f]">
          {helperText}
        </p>
      )}
    </div>
  );
};

interface RadioGroupProps {
  id?: string;
  label?: string;
  options: Array<{ label: string; value: string | number }>;
  value: string | number;
  onChange: (value: string | number) => void;
  name: string;
  error?: string;
  helperText?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  id,
  label,
  options,
  value,
  onChange,
  name,
  error,
  helperText,
}) => {
  const generatedId = useId();
  const groupId = id ?? `${name}-${generatedId}`;
  const legendId = `${groupId}-legend`;
  const descriptionIds = [
    error ? `${groupId}-error` : '',
    !error && helperText ? `${groupId}-helper` : '',
  ].filter(Boolean).join(' ') || undefined;

  return (
    <fieldset
      aria-invalid={error ? 'true' : 'false'}
      aria-describedby={descriptionIds}
      className="space-y-3"
    >
      {label && (
        <legend id={legendId} className="text-[11px] uppercase tracking-[0.24em] text-[#8f6a45]">
          {label}
        </legend>
      )}
      <div className="flex flex-wrap gap-3" role="radiogroup" aria-labelledby={label ? legendId : undefined}>
        {options.map((option, index) => {
          const optionId = `${groupId}-${index}`;
          const checked = value === option.value;
          return (
            <div key={option.value}>
              <input
                id={optionId}
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="peer sr-only"
              />
              <label
                htmlFor={optionId}
                className={`inline-flex cursor-pointer items-center rounded-[16px] border px-4 py-2 text-sm font-medium transition-all ${
                  checked
                    ? 'border-[#4b2e19] bg-[linear-gradient(135deg,#4b2e19,#8f5b2d)] text-white shadow-[0_18px_36px_-24px_rgba(66,37,13,0.9)]'
                    : 'border-[#d9c9b4] bg-white/80 text-[#4b3a2c] hover:border-[#b98c5e] hover:bg-[#fff8ef]'
                }`}
              >
                {option.label}
              </label>
            </div>
          );
        })}
      </div>
      {error && (
        <p id={`${groupId}-error`} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${groupId}-helper`} className="text-sm text-[#7b6b5f]">
          {helperText}
        </p>
      )}
    </fieldset>
  );
};
