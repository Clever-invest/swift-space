// =====================================
// СЕКЦИЯ СРОКОВ
// =====================================

import React from 'react';
import { InputField } from './InputField';
import type { DealInput } from '../calculations/types';

interface SectionTimingProps {
  input: DealInput;
  onChange: (field: keyof DealInput, value: number) => void;
  errors: Record<string, string>;
}

export const SectionTiming: React.FC<SectionTimingProps> = ({ input, onChange, errors }) => {
  const monthsTotal = input.monthsRepair + input.monthsExposure;
  
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-4">
      <h3 className="text-lg font-bold text-gray-800 mb-4">⏱️ Сроки</h3>
      
      <InputField
        label="Срок ремонта (месяцев)"
        value={input.monthsRepair}
        onChange={(val) => onChange('monthsRepair', Math.round(val))}
        type="number"
        min={0}
        step={1}
        error={errors['monthsRepair']}
      />
      
      <InputField
        label="Срок экспозиции (месяцев)"
        value={input.monthsExposure}
        onChange={(val) => onChange('monthsExposure', Math.round(val))}
        type="number"
        min={0}
        step={1}
        error={errors['monthsExposure']}
        tooltip="Время от окончания ремонта до продажи"
      />
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-blue-900">Общий срок сделки:</span>
          <span className="text-2xl font-bold text-blue-600">{monthsTotal} мес</span>
        </div>
      </div>
    </div>
  );
};
