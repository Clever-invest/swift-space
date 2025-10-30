// =====================================
// ПРЕДСТАВЛЕНИЕ МЕТРИК ИНВЕСТОРА
// =====================================

import React from 'react';
import type { DealOutputsInvestor, DealInput } from '../calculations/types';
import { fmtMoney, fmtPct } from '../calculations/money';

interface InvestorViewProps {
  investor: DealOutputsInvestor;
  input: DealInput;
  monthsTotal: number;
}

export const InvestorView: React.FC<InvestorViewProps> = ({ investor, input, monthsTotal }) => {
  const operatorShare = investor.profitShare > 0 
    ? (investor.cashBack - investor.capital) - investor.profitShare 
    : 0;
  
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200">
        <h3 className="text-xl font-bold text-blue-900 mb-4">👤 Метрики инвестора</h3>
        <p className="text-sm text-blue-700 mb-6">
          Инвестор финансирует все затраты проекта и получает возврат капитала + свою долю прибыли.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-5 shadow-sm">
            <div className="text-sm text-gray-600 mb-2">Вложенный капитал</div>
            <div className="text-3xl font-bold text-gray-900">{fmtMoney(investor.capital)}</div>
            <div className="text-xs text-gray-500 mt-1">Покрывает все затраты проекта</div>
          </div>
          
          <div className="bg-white rounded-lg p-5 shadow-sm">
            <div className="text-sm text-gray-600 mb-2">Доля прибыли ({fmtPct(input.investorProfitSharePct)})</div>
            <div className={`text-3xl font-bold ${investor.profitShare >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {fmtMoney(investor.profitShare)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Часть от общей прибыли</div>
          </div>
          
          <div className="bg-white rounded-lg p-5 shadow-sm">
            <div className="text-sm text-gray-600 mb-2">Возврат всего</div>
            <div className="text-3xl font-bold text-blue-600">{fmtMoney(investor.cashBack)}</div>
            <div className="text-xs text-gray-500 mt-1">Капитал + доля прибыли</div>
          </div>
          
          <div className="bg-white rounded-lg p-5 shadow-sm">
            <div className="text-sm text-gray-600 mb-2">MOIC (Multiple)</div>
            <div className="text-3xl font-bold text-purple-600">{investor.moic.toFixed(2)}x</div>
            <div className="text-xs text-gray-500 mt-1">Возврат / Капитал</div>
          </div>
          
          <div className="bg-white rounded-lg p-5 shadow-sm">
            <div className="text-sm text-gray-600 mb-2">ROI за период</div>
            <div className={`text-3xl font-bold ${investor.roiPeriod >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {fmtPct(investor.roiPeriod * 100)}
            </div>
            <div className="text-xs text-gray-500 mt-1">За {monthsTotal} месяцев</div>
          </div>
          
          <div className="bg-white rounded-lg p-5 shadow-sm">
            <div className="text-sm text-gray-600 mb-2">IRR (годовой)</div>
            <div className={`text-3xl font-bold ${investor.irrAnnual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {fmtPct(investor.irrAnnual * 100)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Аннуализированная доходность</div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h4 className="text-lg font-bold text-gray-800 mb-4">💰 Распределение денежных потоков</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
            <div>
              <div className="font-semibold text-red-900">Исходящий поток (t0)</div>
              <div className="text-sm text-red-700">Инвестор финансирует все затраты</div>
            </div>
            <div className="text-2xl font-bold text-red-600">−{fmtMoney(investor.capital)}</div>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="text-gray-400 text-2xl">⬇</div>
          </div>
          
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="font-semibold text-gray-700 mb-2">Период владения: {monthsTotal} месяцев</div>
            <div className="text-sm text-gray-600">Ремонт, экспозиция, продажа</div>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="text-gray-400 text-2xl">⬇</div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div>
              <div className="font-semibold text-green-900">Входящий поток (продажа)</div>
              <div className="text-sm text-green-700">Возврат капитала + доля прибыли</div>
            </div>
            <div className="text-2xl font-bold text-green-600">+{fmtMoney(investor.cashBack)}</div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h4 className="text-lg font-bold text-gray-800 mb-4">👥 Сравнение с оператором</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="text-2xl">🏦</div>
              <div className="font-bold text-blue-900">Инвестор</div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Капитал:</span>
                <span className="font-semibold">{fmtMoney(investor.capital)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Доля прибыли:</span>
                <span className="font-semibold">{fmtMoney(investor.profitShare)}</span>
              </div>
              <div className="flex justify-between border-t border-blue-200 pt-2">
                <span className="text-blue-900 font-bold">Итого:</span>
                <span className="font-bold">{fmtMoney(investor.cashBack)}</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-purple-50 border-2 border-purple-300 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="text-2xl">⚙️</div>
              <div className="font-bold text-purple-900">Оператор</div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-purple-700">Капитал:</span>
                <span className="font-semibold">—</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">Доля прибыли:</span>
                <span className="font-semibold">{fmtMoney(operatorShare)}</span>
              </div>
              <div className="flex justify-between border-t border-purple-200 pt-2">
                <span className="text-purple-900 font-bold">Итого:</span>
                <span className="font-bold">{fmtMoney(operatorShare)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h5 className="font-semibold text-blue-900 mb-2">ℹ️ Методика расчета</h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Инвестор финансирует все затраты проекта на старте (t0)</li>
          <li>• При продаже инвестор получает возврат капитала + {fmtPct(input.investorProfitSharePct)} прибыли</li>
          <li>• Оператор получает {fmtPct(input.operatorProfitSharePct)} прибыли без вложения капитала</li>
          <li>• IRR рассчитывается по формуле: MOIC^(12/месяцы) − 1</li>
        </ul>
      </div>
    </div>
  );
};
