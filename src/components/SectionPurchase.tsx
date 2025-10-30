// =====================================
// СЕКЦИЯ ПОКУПКИ
// =====================================

import React from 'react';
import { InputField } from './InputField';
import type { DealInput } from '../calculations/types';

interface SectionPurchaseProps {
  input: DealInput;
  onChange: (field: keyof DealInput, value: number) => void;
  errors: Record<string, string>;
}

export const SectionPurchase: React.FC<SectionPurchaseProps> = ({ input, onChange, errors }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-4">
      <h3 className="text-lg font-bold text-gray-800 mb-4">💰 Покупка</h3>
      
      <InputField
        label="Цена покупки"
        value={input.purchasePrice}
        onChange={(val) => onChange('purchasePrice', val)}
        type="money"
        min={0}
        error={errors['purchasePrice']}
      />
      
      <InputField
        label="DLD / Регистрация"
        value={input.dldPct}
        onChange={(val) => onChange('dldPct', val)}
        type="percent"
        min={0}
        max={100}
        step={0.1}
        error={errors['dldPct']}
        tooltip="Процент от цены покупки (обычно 4%)"
      />
      
      <InputField
        label="Комиссия покупателя"
        value={input.buyerFeePct}
        onChange={(val) => onChange('buyerFeePct', val)}
        type="percent"
        min={0}
        max={100}
        step={0.1}
        error={errors['buyerFeePct']}
        tooltip="Процент от цены покупки (обычно 2%)"
      />
      
      <InputField
        label="VAT на комиссию покупателя"
        value={input.buyerFeeVatPct}
        onChange={(val) => onChange('buyerFeeVatPct', val)}
        type="percent"
        min={0}
        max={100}
        step={0.1}
        error={errors['buyerFeeVatPct']}
        tooltip="VAT от комиссии покупателя (обычно 5%)"
      />
      
      <InputField
        label="Trustee Office Fee"
        value={input.trusteeFee}
        onChange={(val) => onChange('trusteeFee', val)}
        type="money"
        min={0}
        error={errors['trusteeFee']}
        tooltip="Фиксированная плата за услуги попечителя"
      />
    </div>
  );
};
