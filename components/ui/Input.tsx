import React from 'react';

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
  ...props
}) => {
  const widthStyle = fullWidth ? 'w-full' : '';
  const errorStyle = error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500';

  return (
    <div className={widthStyle}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        className={`${widthStyle} px-4 py-3 rounded-lg border ${errorStyle} focus:ring-2 focus:border-transparent transition-all ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

interface RadioGroupProps {
  label?: string;
  options: Array<{ label: string; value: string | number }>;
  value: string | number;
  onChange: (value: any) => void;
  name: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  options,
  value,
  onChange,
  name
}) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="flex gap-4">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="w-4 h-4 text-purple-600"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
