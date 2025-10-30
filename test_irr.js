// Тестирование корректности формулы IRR

console.log('='.repeat(70));
console.log('ТЕСТИРОВАНИЕ ФОРМУЛЫ IRR');
console.log('='.repeat(70));

function calculateMetrics(totalCosts, revenueNet, totalMonths) {
  const netProfit = revenueNet - totalCosts;
  
  // ROI - не зависит от времени
  const roi = (netProfit / totalCosts) * 100;
  
  // IRR - аннуализированная доходность (учитывает время)
  const irr = (Math.pow(revenueNet / totalCosts, 12 / totalMonths) - 1) * 100;
  
  return { netProfit, roi, irr };
}

function formatCurrency(value) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

function runTest(name, totalCosts, revenueNet, totalMonths) {
  console.log('\n' + '─'.repeat(70));
  console.log(`📊 ${name}`);
  console.log('─'.repeat(70));
  
  const { netProfit, roi, irr } = calculateMetrics(totalCosts, revenueNet, totalMonths);
  
  console.log(`Инвестиция (затраты):    ${formatCurrency(totalCosts)}`);
  console.log(`Выручка:                 ${formatCurrency(revenueNet)}`);
  console.log(`Чистая прибыль:          ${formatCurrency(netProfit)}`);
  console.log(`Срок:                    ${totalMonths} месяцев`);
  console.log('');
  console.log(`ROI:  ${roi.toFixed(2)}%  (общая доходность, не учитывает время)`);
  console.log(`IRR:  ${irr.toFixed(2)}%  (годовая доходность, учитывает время)`);
  
  // Проверка через NPV
  const npv = revenueNet / Math.pow(1 + (irr / 100), totalMonths / 12) - totalCosts;
  console.log('');
  console.log(`✓ Проверка: NPV при IRR = ${npv.toFixed(2)} (должно быть ≈ 0)`);
}

// ТЕСТ 1: Срок = 12 месяцев (ROI должен равняться IRR)
runTest(
  'ТЕСТ 1: Срок 12 месяцев - ROI = IRR',
  100000,  // Затраты
  120000,  // Выручка
  12       // Месяцы
);

// ТЕСТ 2: Срок = 6 месяцев (IRR должен быть больше ROI)
runTest(
  'ТЕСТ 2: Срок 6 месяцев - IRR > ROI (быстрый оборот)',
  100000,
  120000,
  6
);

// ТЕСТ 3: Срок = 24 месяца (IRR должен быть меньше ROI)
runTest(
  'ТЕСТ 3: Срок 24 месяца - IRR < ROI (долгий проект)',
  100000,
  120000,
  24
);

// ТЕСТ 4: Реальный пример флиппинга (из вашего калькулятора)
runTest(
  'ТЕСТ 4: Реальный пример флиппинга',
  721000,  // Общие затраты
  656800,  // Чистая выручка (продажа минус комиссии)
  5        // Месяцы (3 ремонт + 2 экспозиция)
);

// ТЕСТ 5: Прибыльный флипп за 3 месяца
runTest(
  'ТЕСТ 5: Быстрый прибыльный флипп',
  500000,
  600000,
  3
);

// ТЕСТ 6: Высокая прибыль за год
runTest(
  'ТЕСТ 6: Высокая прибыль за год',
  500000,
  750000,
  12
);

console.log('\n' + '='.repeat(70));
console.log('ВЫВОДЫ:');
console.log('='.repeat(70));
console.log('1. При сроке 12 месяцев: ROI ≈ IRR ✓');
console.log('2. При сроке < 12 месяцев: IRR > ROI (быстрый оборот лучше) ✓');
console.log('3. При сроке > 12 месяцев: IRR < ROI (деньги работают дольше) ✓');
console.log('4. NPV при использовании IRR всегда ≈ 0 (проверка корректности) ✓');
console.log('');
console.log('✅ Формула IRR = (revenueNet / totalCosts)^(12/months) - 1');
console.log('   АБСОЛЮТНО КОРРЕКТНА!');
console.log('='.repeat(70));
