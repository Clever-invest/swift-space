// =====================================
// ГЛАВНОЕ ПРИЛОЖЕНИЕ V2 - КАЛЬКУЛЯТОР ФЛИППИНГА
// =====================================

import React, { useState, useEffect, useMemo } from 'react';
import type { DealInput } from './calculations/types';
import { computeProject, computeInvestor, validateInput, computeSensitivity, computeDerived } from './calculations/core';
import { saveToStorage, loadFromStorage, decodeFromQuery } from './utils/share';
import { KPIHeader } from './components/KPIHeader';
import { Tabs } from './components/Tabs';
import { SectionPurchase } from './components/SectionPurchase';
import { SectionRenovation } from './components/SectionRenovation';
import { SectionCarrying } from './components/SectionCarrying';
import { SectionSale } from './components/SectionSale';
import { SectionTiming } from './components/SectionTiming';
import { SectionSplit } from './components/SectionSplit';
import { Sensitivity } from './components/Sensitivity';
import { Scenarios } from './components/Scenarios';
import { InvestorView } from './components/InvestorView';
import { ShareExport } from './components/ShareExport';

// Значения по умолчанию
const defaultInput: DealInput = {
  purchasePrice: 1390000,
  dldPct: 4,
  buyerFeePct: 2,
  buyerFeeVatPct: 5,
  trusteeFee: 5000,
  renovationBudget: 250000,
  reservePct: 15,
  serviceChargeAnnual: 6000,
  dewaMonthly: 500,
  salePrice: 2300000,
  sellerFeePct: 4,
  sellerFeeVatPct: 5,
  monthsRepair: 2,
  monthsExposure: 4,
  investorProfitSharePct: 50,
  operatorProfitSharePct: 50,
};

export default function App() {
  const [input, setInput] = useState<DealInput>(defaultInput);
  const [activeTab, setActiveTab] = useState<'project' | 'investor'>('project');
  
  // Загрузка из URL или localStorage при монтировании
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dealParam = params.get('deal');
    
    if (dealParam) {
      const decoded = decodeFromQuery(dealParam);
      if (decoded) {
        setInput(decoded);
        return;
      }
    }
    
    const stored = loadFromStorage();
    if (stored) {
      setInput(stored);
    }
  }, []);
  
  // Автосохранение при изменении
  useEffect(() => {
    const timeout = setTimeout(() => {
      saveToStorage(input);
    }, 500);
    
    return () => clearTimeout(timeout);
  }, [input]);
  
  // Вычисление метрик
  const derived = useMemo(() => computeDerived(input), [input]);
  const project = useMemo(() => computeProject(input), [input]);
  const investor = useMemo(() => computeInvestor(input, project), [input, project]);
  const sensitivity = useMemo(() => computeSensitivity(input, project), [input, project]);
  const validation = useMemo(() => validateInput(input), [input]);
  
  // Обработчик изменения полей
  const handleInputChange = (field: keyof DealInput, value: number) => {
    setInput(prev => ({ ...prev, [field]: value }));
  };
  
  // Формирование ошибок для полей
  const fieldErrors: Record<string, string> = {};
  validation.errors.forEach(err => {
    fieldErrors[err.field] = err.message;
  });
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-2">Калькулятор флиппинга недвижимости v2</h1>
          <p className="text-blue-100">Точный расчет ROI и IRR без XIRR • Модульная архитектура • TypeScript</p>
        </div>
      </header>
      
      {/* KPI Header - Sticky */}
      <KPIHeader project={project} monthsTotal={derived.monthsTotal} />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Validation Warnings */}
        {validation.warnings.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Предупреждения:</h3>
            <ul className="list-disc list-inside text-yellow-700 space-y-1">
              {validation.warnings.map((warn, idx) => (
                <li key={idx}>{warn.message}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Validation Errors */}
        {!validation.isValid && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">❌ Ошибки валидации:</h3>
            <ul className="list-disc list-inside text-red-700 space-y-1">
              {validation.errors.map((err, idx) => (
                <li key={idx}>{err.message}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Tabs */}
        <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
        
        {activeTab === 'project' ? (
          <div className="space-y-6">
            {/* Input Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <SectionPurchase input={input} onChange={handleInputChange} errors={fieldErrors} />
                <SectionRenovation input={input} onChange={handleInputChange} errors={fieldErrors} />
                <SectionCarrying input={input} onChange={handleInputChange} errors={fieldErrors} />
              </div>
              
              <div className="space-y-4">
                <SectionSale input={input} onChange={handleInputChange} errors={fieldErrors} />
                <SectionTiming input={input} onChange={handleInputChange} errors={fieldErrors} />
                <SectionSplit input={input} onChange={handleInputChange} errors={fieldErrors} />
              </div>
            </div>
            
            {/* Scenarios */}
            <Scenarios baseInput={input} />
            
            {/* Sensitivity Analysis */}
            <Sensitivity sensitivity={sensitivity} />
            
            {/* Share & Export */}
            <ShareExport input={input} project={project} investor={investor} />
          </div>
        ) : (
          <InvestorView investor={investor} input={input} monthsTotal={derived.monthsTotal} />
        )}
      </main>
      
      {/* Footer */}
      <footer className="mt-12 bg-gray-800 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm">
            <strong>Калькулятор флиппинга v2</strong> • Модель без XIRR • Все затраты в t0, один приток на продаже
          </p>
          <p className="text-xs mt-2 text-gray-400">
            IRR = MOIC^(12/месяцы) − 1 | NET-выручка = Цена − Комиссия − VAT
          </p>
        </div>
      </footer>
    </div>
  );
}
