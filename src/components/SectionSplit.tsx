// =====================================
// СЕКЦИЯ СПЛИТА ПРИБЫЛИ
// =====================================

import React from 'react';
import { InputField } from './InputField';
import type { DealInput } from '../calculations/types';

interface SectionSplitProps {
  input: DealInput;
  onChange: (field: keyof DealInput, value: number) => void;
  errors: Record<string, string>;
}

export const SectionSplit: React.FC<SectionSplitProps> = ({ input, onChange, errors }) => {
  const handleInvestorChange = (val: number) => {
    onChange('investorProfitSharePct', val);
    onChange('operatorProfitSharePct', 100 - val);
  };
  
  const handleOperatorChange = (val: number) => {
    onChange('operatorProfitSharePct', val);
    onChange('investorProfitSharePct', 100 - val);
  };
  
  const splitSum = input.investorProfitSharePct + input.operatorProfitSharePct;
  const isInvalidSplit = Math.abs(splitSum - 100) > 0.01;
  
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-4">
      <h3 className="text-lg font-bold text-gray-800 mb-4">🤝 Сплит прибыли</h3>
      
      <InputField
        label="Доля инвестора"
        value={input.investorProfitSharePct}
        onChange={handleInvestorChange}
        type="percent"
        min={0}
        max={100}
        step={1}
        error={errors['investorProfitSharePct']}
        tooltip="Процент прибыли, получаемый инвестором"
      />
      
      <InputField
        label="Доля оператора"
        value={input.operatorProfitSharePct}
        onChange={handleOperatorChange}
        type="percent"
        min={0}
        max={100}
        step={1}
        error={errors['operatorProfitSharePct']}
        tooltip="Процент прибыли, получаемый оператором (автоматически = 100 - доля инвестора)"
      />
      
      {isInvalidSplit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4" role="alert">
          <p className="text-sm text-red-800">
            ⚠️ Сумма долей должна равняться 100% (текущая: {splitSum.toFixed(1)}%)
          </p>
        </div>
      )}
      
      {!isInvalidSplit && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
          <p className="text-sm text-green-800">
            ✓ Сплит корректен: {input.investorProfitSharePct}% / {input.operatorProfitSharePct}%
          </p>
        </div>
      )}
    </div>
  );
};
