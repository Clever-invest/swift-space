// =====================================
// ОСНОВНЫЕ РАСЧЕТЫ (БЕЗ XIRR)
// =====================================

import type {
  DealInput,
  DealDerived,
  DealOutputsProject,
  DealOutputsInvestor,
  SensitivityResult,
  ValidationResult,
  ValidationError,
} from './types';
import { toRate, roundMoney } from './money';

/**
 * Вычисление производных параметров
 */
export function computeDerived(input: DealInput): DealDerived {
  const monthsTotal = input.monthsRepair + input.monthsExposure;
  const carryingMonthly = input.serviceChargeAnnual / 12 + input.dewaMonthly;
  
  return {
    monthsTotal,
    carryingMonthly: roundMoney(carryingMonthly),
  };
}

/**
 * Вычисление метрик проекта
 */
export function computeProject(input: DealInput): DealOutputsProject {
  const derived = computeDerived(input);
  const { monthsTotal, carryingMonthly } = derived;
  
  // Носимые расходы за период
  const carryingTotal = carryingMonthly * monthsTotal;
  
  // Стоимость ремонта с резервом
  const renovationTotal = input.renovationBudget * (1 + toRate(input.reservePct));
  
  // Входящие комиссии на покупке
  const dld = input.purchasePrice * toRate(input.dldPct);
  const buyerFee = input.purchasePrice * toRate(input.buyerFeePct);
  const buyerFeeVAT = buyerFee * toRate(input.buyerFeeVatPct);
  
  // Общие затраты (все исходящие в t0)
  const totalCosts = roundMoney(
    input.purchasePrice +
    dld +
    buyerFee +
    buyerFeeVAT +
    renovationTotal +
    carryingTotal +
    input.trusteeFee
  );
  
  // Комиссии на продаже
  const sellerFee = input.salePrice * toRate(input.sellerFeePct);
  const sellerFeeVAT = sellerFee * toRate(input.sellerFeeVatPct);
  
  // NET-выручка
  const netProceeds = roundMoney(input.salePrice - sellerFee - sellerFeeVAT);
  
  // Прибыль и метрики
  const profit = netProceeds - totalCosts;
  const moic = totalCosts > 0 ? netProceeds / totalCosts : 0;
  const roiPeriod = totalCosts > 0 ? profit / totalCosts : 0;
  
  // IRR (компаунд-годовая)
  let irrAnnual = 0;
  if (monthsTotal > 0 && totalCosts > 0 && moic > 0) {
    irrAnnual = Math.pow(moic, 12 / monthsTotal) - 1;
  }
  
  // APR (простая годовая)
  const aprSimple = monthsTotal > 0 ? roiPeriod * 12 / monthsTotal : 0;
  
  // Точка безубыточности
  // netProceeds(s) = s * (1 - sellerFeePct*(1+sellerFeeVatPct))
  // Нужно s при netProceeds(s) = totalCosts
  const sellerFeeRate = toRate(input.sellerFeePct) * (1 + toRate(input.sellerFeeVatPct));
  const breakEvenSalePrice = totalCosts > 0 && sellerFeeRate < 1
    ? roundMoney(totalCosts / (1 - sellerFeeRate))
    : 0;
  
  const breakEvenGapAbs = input.salePrice - breakEvenSalePrice;
  const breakEvenGapPctOfPrice = input.salePrice > 0 
    ? breakEvenGapAbs / input.salePrice 
    : 0;
  
  return {
    totalCosts,
    netProceeds,
    profit,
    moic,
    roiPeriod,
    irrAnnual,
    aprSimple,
    breakEvenSalePrice,
    breakEvenGapAbs,
    breakEvenGapPctOfPrice,
  };
}

/**
 * Вычисление метрик инвестора
 */
export function computeInvestor(
  input: DealInput,
  project: DealOutputsProject
): DealOutputsInvestor {
  const derived = computeDerived(input);
  const { monthsTotal } = derived;
  
  const capital = project.totalCosts;
  const profitShare = project.profit * toRate(input.investorProfitSharePct);
  const cashBack = capital + profitShare;
  
  const moic = capital > 0 ? cashBack / capital : 0;
  const roiPeriod = capital > 0 ? profitShare / capital : 0;
  
  let irrAnnual = 0;
  if (monthsTotal > 0 && moic > 0) {
    irrAnnual = Math.pow(moic, 12 / monthsTotal) - 1;
  }
  
  return {
    capital: roundMoney(capital),
    profitShare: roundMoney(profitShare),
    cashBack: roundMoney(cashBack),
    moic,
    roiPeriod,
    irrAnnual,
  };
}

/**
 * Анализ чувствительности (sensitivity)
 */
export function computeSensitivity(
  input: DealInput,
  project: DealOutputsProject
): SensitivityResult {
  const derived = computeDerived(input);
  
  // Чувствительность по цене продажи (±15%)
  const salePriceMultipliers = [0.85, 0.90, 0.95, 1.00, 1.05, 1.10, 1.15];
  const bySalePrice = salePriceMultipliers.map(mult => {
    const newSalePrice = roundMoney(input.salePrice * mult);
    const newInput = { ...input, salePrice: newSalePrice };
    const newProject = computeProject(newInput);
    
    return {
      salePrice: newSalePrice,
      roiPeriod: newProject.roiPeriod,
      irrAnnual: newProject.irrAnnual,
      profit: newProject.profit,
    };
  });
  
  // Чувствительность по срокам (от текущего до +6 месяцев)
  const monthsRange = [];
  const maxMonths = Math.max(derived.monthsTotal + 6, 12);
  for (let m = derived.monthsTotal; m <= maxMonths; m++) {
    monthsRange.push(m);
  }
  
  const byMonths = monthsRange.map(months => {
    // Увеличиваем носимые расходы пропорционально
    const additionalMonths = months - derived.monthsTotal;
    const additionalCarrying = derived.carryingMonthly * additionalMonths;
    
    // Пересчет с новыми затратами
    const newTotalCosts = project.totalCosts + additionalCarrying;
    const profit = project.netProceeds - newTotalCosts;
    const moic = newTotalCosts > 0 ? project.netProceeds / newTotalCosts : 0;
    const roiPeriod = newTotalCosts > 0 ? profit / newTotalCosts : 0;
    const irrAnnual = months > 0 && moic > 0 
      ? Math.pow(moic, 12 / months) - 1 
      : 0;
    
    return {
      monthsTotal: months,
      roiPeriod,
      irrAnnual,
      profit: roundMoney(profit),
    };
  });
  
  // Чувствительность по бюджету ремонта (±20%)
  const renovationMultipliers = [0.8, 0.9, 1.0, 1.1, 1.2];
  const byRenovation = renovationMultipliers.map(mult => {
    const newRenovationBudget = roundMoney(input.renovationBudget * mult);
    const newInput = { ...input, renovationBudget: newRenovationBudget };
    const newProject = computeProject(newInput);
    
    return {
      renovationBudget: newRenovationBudget,
      roiPeriod: newProject.roiPeriod,
      irrAnnual: newProject.irrAnnual,
      profit: newProject.profit,
    };
  });
  
  return {
    bySalePrice,
    byMonths,
    byRenovation,
  };
}

/**
 * Валидация входных данных
 */
export function validateInput(input: DealInput): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  
  // Проверка процентов (0..100)
  const pctFields: Array<[keyof DealInput, string]> = [
    ['dldPct', 'DLD'],
    ['buyerFeePct', 'Комиссия покупателя'],
    ['buyerFeeVatPct', 'VAT на комиссию покупателя'],
    ['sellerFeePct', 'Комиссия продавца'],
    ['sellerFeeVatPct', 'VAT на комиссию продавца'],
    ['reservePct', 'Резерв ремонта'],
    ['investorProfitSharePct', 'Доля инвестора'],
    ['operatorProfitSharePct', 'Доля оператора'],
  ];
  
  pctFields.forEach(([field, label]) => {
    const value = input[field] as number;
    if (value < 0 || value > 100) {
      errors.push({
        field,
        message: `${label} должен быть в диапазоне 0-100%`,
      });
    }
  });
  
  // Проверка денег (≥0)
  const moneyFields: Array<[keyof DealInput, string]> = [
    ['purchasePrice', 'Цена покупки'],
    ['salePrice', 'Цена продажи'],
    ['renovationBudget', 'Бюджет ремонта'],
    ['serviceChargeAnnual', 'Service Charge'],
    ['dewaMonthly', 'DEWA'],
    ['trusteeFee', 'Trustee Fee'],
  ];
  
  moneyFields.forEach(([field, label]) => {
    const value = input[field] as number;
    if (value < 0) {
      errors.push({
        field,
        message: `${label} не может быть отрицательным`,
      });
    }
  });
  
  // Проверка месяцев
  if (input.monthsRepair < 0) {
    errors.push({
      field: 'monthsRepair',
      message: 'Срок ремонта не может быть отрицательным',
    });
  }
  
  if (input.monthsExposure < 0) {
    errors.push({
      field: 'monthsExposure',
      message: 'Срок экспозиции не может быть отрицательным',
    });
  }
  
  const monthsTotal = input.monthsRepair + input.monthsExposure;
  if (monthsTotal <= 0) {
    errors.push({
      field: 'monthsTotal',
      message: 'Общий срок сделки должен быть больше 0',
    });
  }
  
  // Проверка сплита прибыли
  const splitSum = input.investorProfitSharePct + input.operatorProfitSharePct;
  if (Math.abs(splitSum - 100) > 0.01) {
    errors.push({
      field: 'profitSplit',
      message: 'Сумма долей инвестора и оператора должна равняться 100%',
    });
  }
  
  // Предупреждения
  const sellerFeeRate = toRate(input.sellerFeePct) * (1 + toRate(input.sellerFeeVatPct));
  if (sellerFeeRate >= 1) {
    warnings.push({
      field: 'sellerFeePct',
      message: 'Комиссия продавца с VAT ≥100% - невозможная конфигурация',
    });
  }
  
  // Проверка убыточности
  if (errors.length === 0) {
    const project = computeProject(input);
    if (input.salePrice < project.breakEvenSalePrice) {
      warnings.push({
        field: 'salePrice',
        message: `Цена продажи ниже точки безубыточности (${roundMoney(project.breakEvenSalePrice)} AED)`,
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
