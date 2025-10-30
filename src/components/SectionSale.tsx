// =====================================
// СЕКЦИЯ ПРОДАЖИ
// =====================================

import React from 'react';
import { InputField } from './InputField';
import type { DealInput } from '../calculations/types';

interface SectionSaleProps {
  input: DealInput;
  onChange: (field: keyof DealInput, value: number) => void;
  errors: Record<string, string>;
}

export const SectionSale: React.FC<SectionSaleProps> = ({ input, onChange, errors }) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 shadow-sm border border-gray-200 mb-4">
      <h3 className="text-lg font-bold text-gray-800 mb-4">💸 Продажа</h3>
      
      <InputField
        label="Цена продажи"
        value={input.salePrice}
        onChange={(val) => onChange('salePrice', val)}
        type="money"
        min={0}
        error={errors['salePrice']}
      />
      
      <InputField
        label="Комиссия продавца"
        value={input.sellerFeePct}
        onChange={(val) => onChange('sellerFeePct', val)}
        type="percent"
        min={0}
        max={100}
        step={0.1}
        error={errors['sellerFeePct']}
        tooltip="Процент от цены продажи (обычно 2-4%)"
      />
      
      <InputField
        label="VAT на комиссию продавца"
        value={input.sellerFeeVatPct}
        onChange={(val) => onChange('sellerFeeVatPct', val)}
        type="percent"
        min={0}
        max={100}
        step={0.1}
        error={errors['sellerFeeVatPct']}
        tooltip="VAT от комиссии продавца (обычно 5%)"
      />
    </div>
  );
};
