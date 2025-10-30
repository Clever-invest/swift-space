// =====================================
// KPI HEADER - STICKY ШАПКА С МЕТРИКАМИ
// =====================================

import React from 'react';
import { TrendingUp, DollarSign, Calendar, AlertCircle, Info } from 'lucide-react';
import type { DealOutputsProject } from '../calculations/types';
import { fmtMoney, fmtPct } from '../calculations/money';

interface KPIHeaderProps {
  project: DealOutputsProject;
  monthsTotal: number;
}

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  tooltip: string;
  isWarning?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ icon, label, value, tooltip, isWarning }) => {
  const [showTooltip, setShowTooltip] = React.useState(false);
  
  return (
    <div className={`relative bg-gradient-to-br ${isWarning ? 'from-amber-500 to-orange-600' : 'from-blue-500 to-purple-600'} text-white rounded-lg p-4 shadow-lg`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium opacity-90">{label}</span>
        </div>
        <button
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="text-white/80 hover:text-white transition-colors"
          aria-label={`Подсказка: ${tooltip}`}
        >
          <Info size={16} />
        </button>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      
      {showTooltip && (
        <div className="absolute z-50 top-full mt-2 left-0 right-0 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
          {tooltip}
          <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45" />
        </div>
      )}
    </div>
  );
};

export const KPIHeader: React.FC<KPIHeaderProps> = ({ project, monthsTotal }) => {
  const isLoss = project.profit < 0;
  const isNearBreakeven = project.breakEvenGapPctOfPrice < 0.05 && project.breakEvenGapPctOfPrice > 0;
  
  return (
    <div className="sticky top-0 z-40 bg-white border-b-2 border-gray-200 shadow-md">
      <div className="max-w-7xl mx-auto p-4">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Ключевые метрики</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <KPICard
            icon={<DollarSign size={20} />}
            label="Прибыль"
            value={fmtMoney(project.profit)}
            tooltip="Чистая прибыль: NET-выручка минус все затраты проекта"
            isWarning={isLoss}
          />
          
          <KPICard
            icon={<TrendingUp size={20} />}
            label="ROI за период"
            value={fmtPct(project.roiPeriod * 100)}
            tooltip="ROI = (Чистая выручка − Затраты) / Затраты за весь период владения"
            isWarning={isLoss}
          />
          
          <KPICard
            icon={<TrendingUp size={20} />}
            label="IRR (год.)"
            value={fmtPct(project.irrAnnual * 100)}
            tooltip="Годовая доходность из одной продажи: IRR = MOIC^(12/мес) − 1, где MOIC = NET-выручка / Затраты"
            isWarning={isLoss}
          />
          
          <KPICard
            icon={<Calendar size={20} />}
            label="Срок сделки"
            value={`${monthsTotal} мес`}
            tooltip="Общий срок от покупки до продажи (ремонт + экспозиция)"
          />
          
          <KPICard
            icon={<AlertCircle size={20} />}
            label="Break-even"
            value={fmtMoney(project.breakEvenSalePrice)}
            tooltip="Цена продажи, при которой чистая выручка равна сумме затрат. Выше — прибыль, ниже — убыток"
            isWarning={isNearBreakeven}
          />
          
          <KPICard
            icon={<AlertCircle size={20} />}
            label="Запас к BE"
            value={`${fmtMoney(project.breakEvenGapAbs)} (${fmtPct(project.breakEvenGapPctOfPrice * 100)})`}
            tooltip="Разница между ценой продажи и точкой безубыточности. Показывает запас прочности сделки"
            isWarning={isNearBreakeven}
          />
        </div>
      </div>
    </div>
  );
};
