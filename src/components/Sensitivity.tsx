// =====================================
// КОМПОНЕНТ АНАЛИЗА ЧУВСТВИТЕЛЬНОСТИ
// =====================================

import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { SensitivityResult } from '../calculations/types';
import { fmtMoney, fmtPct } from '../calculations/money';

interface SensitivityProps {
  sensitivity: SensitivityResult;
}

export const Sensitivity: React.FC<SensitivityProps> = ({ sensitivity }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📈 Чувствительность по цене продажи</h3>
        
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Цена</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Прибыль</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ROI</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IRR</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sensitivity.bySalePrice.map((item, idx) => (
                <tr key={idx} className={idx === 3 ? 'bg-blue-50 font-semibold' : ''}>
                  <td className="px-4 py-3 text-sm">{fmtMoney(item.salePrice!)}</td>
                  <td className={`px-4 py-3 text-sm ${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {fmtMoney(item.profit)}
                  </td>
                  <td className="px-4 py-3 text-sm">{fmtPct(item.roiPeriod * 100)}</td>
                  <td className="px-4 py-3 text-sm">{fmtPct(item.irrAnnual * 100)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={sensitivity.bySalePrice}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="salePrice" 
              tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
            />
            <YAxis tickFormatter={(val) => `${(val * 100).toFixed(1)}%`} />
            <Tooltip 
              formatter={(value: any) => fmtPct(value * 100)}
              labelFormatter={(label) => fmtMoney(label)}
            />
            <Line type="monotone" dataKey="irrAnnual" stroke="#3b82f6" strokeWidth={2} name="IRR" />
            <Line type="monotone" dataKey="roiPeriod" stroke="#10b981" strokeWidth={2} name="ROI" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">⏱️ Чувствительность по срокам</h3>
        
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Срок (мес)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Прибыль</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ROI</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IRR</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sensitivity.byMonths.map((item, idx) => (
                <tr key={idx} className={idx === 0 ? 'bg-blue-50 font-semibold' : ''}>
                  <td className="px-4 py-3 text-sm">{item.monthsTotal}</td>
                  <td className={`px-4 py-3 text-sm ${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {fmtMoney(item.profit)}
                  </td>
                  <td className="px-4 py-3 text-sm">{fmtPct(item.roiPeriod * 100)}</td>
                  <td className="px-4 py-3 text-sm">{fmtPct(item.irrAnnual * 100)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={sensitivity.byMonths}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="monthsTotal" label={{ value: 'Месяцы', position: 'insideBottom', offset: -5 }} />
            <YAxis tickFormatter={(val) => `${(val * 100).toFixed(1)}%`} />
            <Tooltip formatter={(value: any) => fmtPct(value * 100)} />
            <Bar dataKey="irrAnnual" fill="#3b82f6" name="IRR" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🔧 Чувствительность по бюджету ремонта</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Бюджет</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Прибыль</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ROI</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IRR</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sensitivity.byRenovation.map((item, idx) => (
                <tr key={idx} className={idx === 2 ? 'bg-blue-50 font-semibold' : ''}>
                  <td className="px-4 py-3 text-sm">{fmtMoney(item.renovationBudget!)}</td>
                  <td className={`px-4 py-3 text-sm ${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {fmtMoney(item.profit)}
                  </td>
                  <td className="px-4 py-3 text-sm">{fmtPct(item.roiPeriod * 100)}</td>
                  <td className="px-4 py-3 text-sm">{fmtPct(item.irrAnnual * 100)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
