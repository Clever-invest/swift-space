// =====================================
// КОМПОНЕНТ СЦЕНАРИЕВ (A/B/C)
// =====================================

import React from 'react';
import type { DealInput } from '../calculations/types';
import { computeProject } from '../calculations/core';
import { fmtMoney, fmtPct } from '../calculations/money';

interface ScenariosProps {
  baseInput: DealInput;
}

export const Scenarios: React.FC<ScenariosProps> = ({ baseInput }) => {
  // Консервативный сценарий
  const conservativeInput: DealInput = {
    ...baseInput,
    salePrice: baseInput.salePrice * 0.9, // -10%
    monthsExposure: baseInput.monthsExposure + 2, // +2 месяца
    renovationBudget: baseInput.renovationBudget * 1.1, // +10%
  };
  
  // Оптимистичный сценарий
  const optimisticInput: DealInput = {
    ...baseInput,
    salePrice: baseInput.salePrice * 1.05, // +5%
    monthsExposure: Math.max(1, baseInput.monthsExposure - 1), // -1 месяц
    renovationBudget: baseInput.renovationBudget * 0.95, // -5%
  };
  
  const baseProject = computeProject(baseInput);
  const conservativeProject = computeProject(conservativeInput);
  const optimisticProject = computeProject(optimisticInput);
  
  const scenarios = [
    {
      name: 'Консервативный',
      icon: '⚠️',
      color: 'orange',
      input: conservativeInput,
      project: conservativeProject,
    },
    {
      name: 'Базовый',
      icon: '📊',
      color: 'blue',
      input: baseInput,
      project: baseProject,
    },
    {
      name: 'Оптимистичный',
      icon: '🚀',
      color: 'green',
      input: optimisticInput,
      project: optimisticProject,
    },
  ];
  
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-6">🎯 Сценарный анализ</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {scenarios.map((scenario) => (
          <div
            key={scenario.name}
            className={`border-2 border-${scenario.color}-200 rounded-lg p-5 bg-${scenario.color}-50`}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{scenario.icon}</span>
              <h4 className="text-lg font-bold text-gray-800">{scenario.name}</h4>
            </div>
            
            <div className="space-y-3">
              <div className="text-sm">
                <span className="text-gray-600">Цена продажи:</span>
                <span className="block font-semibold">{fmtMoney(scenario.input.salePrice)}</span>
              </div>
              
              <div className="text-sm">
                <span className="text-gray-600">Бюджет ремонта:</span>
                <span className="block font-semibold">{fmtMoney(scenario.input.renovationBudget)}</span>
              </div>
              
              <div className="text-sm">
                <span className="text-gray-600">Срок (мес):</span>
                <span className="block font-semibold">
                  {scenario.input.monthsRepair + scenario.input.monthsExposure}
                </span>
              </div>
              
              <div className="border-t-2 border-gray-200 pt-3 mt-3">
                <div className="text-sm mb-2">
                  <span className="text-gray-600">Прибыль:</span>
                  <span className={`block font-bold text-lg ${scenario.project.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {fmtMoney(scenario.project.profit)}
                  </span>
                </div>
                
                <div className="text-sm mb-2">
                  <span className="text-gray-600">ROI:</span>
                  <span className="block font-semibold">{fmtPct(scenario.project.roiPeriod * 100)}</span>
                </div>
                
                <div className="text-sm mb-2">
                  <span className="text-gray-600">IRR:</span>
                  <span className="block font-semibold">{fmtPct(scenario.project.irrAnnual * 100)}</span>
                </div>
                
                <div className="text-sm">
                  <span className="text-gray-600">Break-even:</span>
                  <span className="block font-semibold">{fmtMoney(scenario.project.breakEvenSalePrice)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">📝 Методика расчета сценариев:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Консервативный:</strong> −10% цена, +2 мес экспозиция, +10% бюджет ремонта</li>
          <li>• <strong>Базовый:</strong> текущие параметры без изменений</li>
          <li>• <strong>Оптимистичный:</strong> +5% цена, −1 мес экспозиция, −5% бюджет ремонта</li>
        </ul>
      </div>
    </div>
  );
};
