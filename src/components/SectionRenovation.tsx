// =====================================
// СЕКЦИЯ РЕМОНТА
// =====================================

import React from 'react';
import { InputField } from './InputField';
import type { DealInput } from '../calculations/types';

interface SectionRenovationProps {
  input: DealInput;
  onChange: (field: keyof DealInput, value: number) => void;
  errors: Record<string, string>;
}

export const SectionRenovation: React.FC<SectionRenovationProps> = ({ input, onChange, errors }) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 shadow-sm border border-gray-200 mb-4">
      <h3 className="text-lg font-bold text-gray-800 mb-4">🔧 Ремонт</h3>
      
      <InputField
        label="Бюджет ремонта"
        value={input.renovationBudget}
        onChange={(val) => onChange('renovationBudget', val)}
        type="money"
        min={0}
        error={errors['renovationBudget']}
      />
      
      <InputField
        label="Резерв"
        value={input.reservePct}
        onChange={(val) => onChange('reservePct', val)}
        type="percent"
        min={0}
        max={100}
        step={1}
        error={errors['reservePct']}
        tooltip="Процент от бюджета ремонта на непредвиденные расходы (обычно 10-20%)"
      />
    </div>
  );
};
