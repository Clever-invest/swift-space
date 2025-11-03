// =====================================
// КОМПОНЕНТ ПОЛЯ ВВОДА С МАСКОЙ И ВАЛИДАЦИЕЙ
// =====================================

import React from 'react';

interface InputFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  type: 'money' | 'percent' | 'number';
  min?: number;
  max?: number;
  step?: number;
  error?: string;
  disabled?: boolean;
  tooltip?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  type,
  min,
  max,
  step: _step = 1,
  error,
  disabled = false,
  tooltip,
}) => {
  const [focused, setFocused] = React.useState(false);
  
  const formatDisplay = (val: number): string => {
    if (type === 'money') {
      return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0 }).format(val);
    }
    return val.toString();
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d.-]/g, '');
    const num = parseFloat(raw);
    
    if (raw === '' || raw === '-') {
      onChange(0);
      return;
    }
    
    if (isNaN(num)) return;
    
    // Применяем границы
    let bounded = num;
    if (min !== undefined && num < min) bounded = min;
    if (max !== undefined && num > max) bounded = max;
    
    onChange(bounded);
  };
  
  const suffix = type === 'percent' ? '%' : type === 'money' ? 'AED' : '';
  
  return (
    <div className="mb-4">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
        {label}
        {tooltip && (
          <span className="text-gray-400 cursor-help" title={tooltip}>
            ⓘ
          </span>
        )}
      </label>
      <div className="relative">
        <input
          type="text"
          value={focused ? value : formatDisplay(value)}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
          aria-label={label}
          aria-invalid={!!error}
          aria-describedby={error ? `${label}-error` : undefined}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
            {suffix}
          </div>
        )}
      </div>
      {error && (
        <p id={`${label}-error`} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
