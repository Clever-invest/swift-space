// =====================================
// ЭКСПОРТ PDF И CSV
// =====================================

import type { DealInput, DealOutputsProject, DealOutputsInvestor } from '../calculations/types';
import { fmtMoney, fmtPct } from '../calculations/money';

/**
 * Экспорт в CSV
 */
export function exportToCSV(
  input: DealInput,
  project: DealOutputsProject,
  investor: DealOutputsInvestor
): void {
  const rows = [
    ['Параметр', 'Значение'],
    ['', ''],
    ['=== ПОКУПКА ===', ''],
    ['Цена покупки', input.purchasePrice],
    ['DLD (%)', input.dldPct],
    ['Комиссия покупателя (%)', input.buyerFeePct],
    ['VAT на комиссию покупателя (%)', input.buyerFeeVatPct],
    ['Trustee Fee', input.trusteeFee],
    ['', ''],
    ['=== РЕМОНТ ===', ''],
    ['Бюджет ремонта', input.renovationBudget],
    ['Резерв (%)', input.reservePct],
    ['', ''],
    ['=== НОСИМЫЕ РАСХОДЫ ===', ''],
    ['Service Charge (год)', input.serviceChargeAnnual],
    ['DEWA (месяц)', input.dewaMonthly],
    ['', ''],
    ['=== ПРОДАЖА ===', ''],
    ['Цена продажи', input.salePrice],
    ['Комиссия продавца (%)', input.sellerFeePct],
    ['VAT на комиссию продавца (%)', input.sellerFeeVatPct],
    ['', ''],
    ['=== СРОКИ ===', ''],
    ['Срок ремонта (мес)', input.monthsRepair],
    ['Срок экспозиции (мес)', input.monthsExposure],
    ['Общий срок (мес)', input.monthsRepair + input.monthsExposure],
    ['', ''],
    ['=== СПЛИТ ПРИБЫЛИ ===', ''],
    ['Доля инвестора (%)', input.investorProfitSharePct],
    ['Доля оператора (%)', input.operatorProfitSharePct],
    ['', ''],
    ['=== МЕТРИКИ ПРОЕКТА ===', ''],
    ['Общие затраты', project.totalCosts],
    ['Чистая выручка', project.netProceeds],
    ['Прибыль', project.profit],
    ['MOIC', project.moic.toFixed(4)],
    ['ROI за период (%)', (project.roiPeriod * 100).toFixed(1)],
    ['IRR годовой (%)', (project.irrAnnual * 100).toFixed(1)],
    ['APR простой (%)', (project.aprSimple * 100).toFixed(1)],
    ['Точка безубыточности', project.breakEvenSalePrice],
    ['Запас к безубыточности', project.breakEvenGapAbs],
    ['Запас к безубыточности (%)', (project.breakEvenGapPctOfPrice * 100).toFixed(1)],
    ['', ''],
    ['=== МЕТРИКИ ИНВЕСТОРА ===', ''],
    ['Капитал', investor.capital],
    ['Доля прибыли', investor.profitShare],
    ['Возврат всего', investor.cashBack],
    ['MOIC', investor.moic.toFixed(4)],
    ['ROI за период (%)', (investor.roiPeriod * 100).toFixed(1)],
    ['IRR годовой (%)', (investor.irrAnnual * 100).toFixed(1)],
  ];
  
  const csvContent = rows.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `flip-calculator-${Date.now()}.csv`;
  link.click();
  
  URL.revokeObjectURL(url);
}

/**
 * Экспорт в PDF (через window.print с форматированным HTML)
 */
export function exportToPDF(
  input: DealInput,
  project: DealOutputsProject,
  investor: DealOutputsInvestor
): void {
  const html = generatePDFHTML(input, project, investor);
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Не удалось открыть окно печати. Разрешите всплывающие окна.');
    return;
  }
  
  printWindow.document.write(html);
  printWindow.document.close();
  
  setTimeout(() => {
    printWindow.print();
  }, 500);
}

function generatePDFHTML(
  input: DealInput,
  project: DealOutputsProject,
  investor: DealOutputsInvestor
): string {
  const date = new Date().toLocaleString('ru-RU');
  const profitColor = project.profit > 0 ? '#d1fae5' : '#fee2e2';
  const profitClass = project.profit > 0 ? 'positive' : 'negative';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Отчет по флиппингу - ${date}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
      padding: 24px; 
      background: #f9fafb; 
      color: #1f2937; 
    }
    .container { 
      max-width: 1000px; 
      margin: 0 auto; 
      background: white; 
      padding: 32px; 
      border-radius: 12px; 
      box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
    }
    .header { 
      text-align: center; 
      border-bottom: 3px solid #3b82f6; 
      padding-bottom: 16px; 
      margin-bottom: 24px; 
    }
    h1 { color: #1e40af; font-size: 28px; margin-bottom: 8px; }
    .subtitle { color: #6b7280; font-size: 14px; }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .kpi-card {
      padding: 16px;
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      color: white;
      border-radius: 12px;
      text-align: center;
    }
    .kpi-label { font-size: 12px; opacity: 0.9; margin-bottom: 8px; }
    .kpi-value { font-size: 24px; font-weight: 700; }
    .section { 
      margin-bottom: 24px; 
      padding: 20px; 
      background: #f9fafb; 
      border-radius: 8px; 
      border-left: 4px solid #3b82f6; 
    }
    .section h2 { color: #1e40af; font-size: 18px; margin-bottom: 16px; }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      background: white; 
      border-radius: 8px;
      overflow: hidden;
    }
    th, td { 
      padding: 12px; 
      text-align: left; 
      border-bottom: 1px solid #e5e7eb; 
    }
    th { 
      background: #f3f4f6; 
      color: #374151; 
      font-weight: 600; 
    }
    .positive { color: #10b981; font-weight: 600; }
    .negative { color: #ef4444; font-weight: 600; }
    .methodology {
      margin-top: 32px;
      padding: 20px;
      background: #eff6ff;
      border-radius: 8px;
      border-left: 4px solid #2563eb;
    }
    .methodology h3 { color: #1e40af; margin-bottom: 12px; }
    .methodology p { color: #374151; line-height: 1.6; margin-bottom: 8px; }
    @media print {
      body { background: white; padding: 16px; }
      .container { box-shadow: none; }
      @page { margin: 1cm; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Отчет по флиппингу недвижимости</h1>
      <div class="subtitle">Создано: ${date}</div>
    </div>
    
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Прибыль</div>
        <div class="kpi-value">${fmtMoney(project.profit)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">ROI за период</div>
        <div class="kpi-value">${fmtPct(project.roiPeriod * 100)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">IRR (год.)</div>
        <div class="kpi-value">${fmtPct(project.irrAnnual * 100)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Срок</div>
        <div class="kpi-value">${input.monthsRepair + input.monthsExposure} мес</div>
      </div>
    </div>
    
    <div class="section">
      <h2>📥 Входные параметры</h2>
      <table>
        <tr><th colspan="2">Покупка</th></tr>
        <tr><td>Цена покупки</td><td>${fmtMoney(input.purchasePrice)}</td></tr>
        <tr><td>DLD</td><td>${fmtPct(input.dldPct)}</td></tr>
        <tr><td>Комиссия покупателя</td><td>${fmtPct(input.buyerFeePct)}</td></tr>
        <tr><td>VAT на комиссию</td><td>${fmtPct(input.buyerFeeVatPct)}</td></tr>
        <tr><td>Trustee Fee</td><td>${fmtMoney(input.trusteeFee)}</td></tr>
        
        <tr><th colspan="2">Ремонт</th></tr>
        <tr><td>Бюджет ремонта</td><td>${fmtMoney(input.renovationBudget)}</td></tr>
        <tr><td>Резерв</td><td>${fmtPct(input.reservePct)}</td></tr>
        
        <tr><th colspan="2">Носимые расходы</th></tr>
        <tr><td>Service Charge (год)</td><td>${fmtMoney(input.serviceChargeAnnual)}</td></tr>
        <tr><td>DEWA (месяц)</td><td>${fmtMoney(input.dewaMonthly)}</td></tr>
        
        <tr><th colspan="2">Продажа</th></tr>
        <tr><td>Цена продажи</td><td>${fmtMoney(input.salePrice)}</td></tr>
        <tr><td>Комиссия продавца</td><td>${fmtPct(input.sellerFeePct)}</td></tr>
        <tr><td>VAT на комиссию</td><td>${fmtPct(input.sellerFeeVatPct)}</td></tr>
      </table>
    </div>
    
    <div class="section">
      <h2>📊 Метрики проекта</h2>
      <table>
        <tr><td><strong>Общие затраты</strong></td><td><strong>${fmtMoney(project.totalCosts)}</strong></td></tr>
        <tr><td><strong>Чистая выручка</strong></td><td><strong>${fmtMoney(project.netProceeds)}</strong></td></tr>
        <tr style="background: ${profitColor};">
          <td><strong>Прибыль</strong></td>
          <td class="${profitClass}"><strong>${fmtMoney(project.profit)}</strong></td>
        </tr>
        <tr><td>MOIC</td><td>${project.moic.toFixed(4)}</td></tr>
        <tr><td>ROI за период</td><td>${fmtPct(project.roiPeriod * 100)}</td></tr>
        <tr><td>IRR (годовой)</td><td>${fmtPct(project.irrAnnual * 100)}</td></tr>
        <tr><td>APR (простой)</td><td>${fmtPct(project.aprSimple * 100)}</td></tr>
        <tr><td>Точка безубыточности</td><td>${fmtMoney(project.breakEvenSalePrice)}</td></tr>
        <tr><td>Запас к безубыточности</td><td>${fmtMoney(project.breakEvenGapAbs)} (${fmtPct(project.breakEvenGapPctOfPrice * 100)})</td></tr>
      </table>
    </div>
    
    <div class="section">
      <h2>👥 Распределение прибыли</h2>
      <table>
        <tr><th></th><th>Инвестор (${fmtPct(input.investorProfitSharePct)})</th><th>Оператор (${fmtPct(input.operatorProfitSharePct)})</th></tr>
        <tr>
          <td>Капитал</td>
          <td>${fmtMoney(investor.capital)}</td>
          <td>—</td>
        </tr>
        <tr>
          <td>Доля прибыли</td>
          <td>${fmtMoney(investor.profitShare)}</td>
          <td>${fmtMoney(project.profit - investor.profitShare)}</td>
        </tr>
        <tr style="font-weight: 600;">
          <td>Итого</td>
          <td>${fmtMoney(investor.cashBack)}</td>
          <td>${fmtMoney(project.profit - investor.profitShare)}</td>
        </tr>
        <tr>
          <td>ROI за период</td>
          <td>${fmtPct(investor.roiPeriod * 100)}</td>
          <td>—</td>
        </tr>
        <tr>
          <td>IRR (годовой)</td>
          <td>${fmtPct(investor.irrAnnual * 100)}</td>
          <td>—</td>
        </tr>
      </table>
    </div>
    
    <div class="methodology">
      <h3>📚 Методика расчета</h3>
      <p><strong>IRR (годовой):</strong> Рассчитывается как компаунд-доходность из двухпоточной модели: все затраты в t0, одна продажа в конце. IRR = MOIC^(12/месяцы) − 1, где MOIC = NET-выручка / Затраты.</p>
      <p><strong>NET-выручка:</strong> Цена продажи минус комиссия продавца и VAT на комиссию.</p>
      <p><strong>Точка безубыточности:</strong> Цена продажи, при которой NET-выручка равна общим затратам.</p>
      <p><strong>Сплит прибыли:</strong> Инвестор финансирует все затраты и получает возврат капитала + свою долю прибыли. Оператор получает только свою долю прибыли.</p>
    </div>
  </div>
</body>
</html>
  `;
}
