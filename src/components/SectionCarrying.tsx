// =====================================
// СЕКЦИЯ НОСИМЫХ РАСХОДОВ
// =====================================

import React from 'react';
import { InputField } from './InputField';
import type { DealInput } from '../calculations/types';

interface SectionCarryingProps {
  input: DealInput;
  onChange: (field: keyof DealInput, value: number) => void;
  errors: Record<string, string>;
}

export const SectionCarrying: React.FC<SectionCarryingProps> = ({ input, onChange, errors }) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 shadow-sm border border-gray-200 mb-4">
      <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Носимые расходы</h3>
      
      <InputField
        label="Service Charge (годовой)"
        value={input.serviceChargeAnnual}
        onChange={(val) => onChange('serviceChargeAnnual', val)}
        type="money"
        min={0}
        error={errors['serviceChargeAnnual']}
        tooltip="Годовая плата за обслуживание здания"
      />
      
      <InputField
        label="DEWA / AC (ежемесячный)"
        value={input.dewaMonthly}
        onChange={(val) => onChange('dewaMonthly', val)}
        type="money"
        min={0}
        error={errors['dewaMonthly']}
        tooltip="Ежемесячные коммунальные платежи (электричество, вода, охлаждение)"
      />
    </div>
  );
};
