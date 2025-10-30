// =====================================
// ТИПЫ ДЛЯ КАЛЬКУЛЯТОРА ФЛИППИНГА V2
// =====================================

export type Money = number; // в AED, работа ведётся в "целых" AED
export type Pct = number;   // 0..100 в UI, 0..1 в вычислениях

export interface DealInput {
  // Покупка
  purchasePrice: Money;
  dldPct: Pct;                     // напр. 4
  buyerFeePct: Pct;                // напр. 2
  buyerFeeVatPct: Pct;             // напр. 5 (VAT на комиссию покупателя)
  trusteeFee: Money;

  // Ремонт
  renovationBudget: Money;
  reservePct: Pct;                 // резерв от бюджета ремонта (например 15)

  // Носимые расходы за период владения
  serviceChargeAnnual: Money;      // годовой
  dewaMonthly: Money;              // ежемесячный

  // Продажа
  salePrice: Money;
  sellerFeePct: Pct;               // напр. 4
  sellerFeeVatPct: Pct;            // напр. 5 (VAT на комиссию продавца)

  // Сроки
  monthsRepair: number;            // целые месяцы
  monthsExposure: number;          // целые месяцы

  // Сплит прибыли
  investorProfitSharePct: Pct;     // напр. 50 (инвестор)
  operatorProfitSharePct: Pct;     // напр. 50 (оператор)
}

export interface DealDerived {
  monthsTotal: number;
  carryingMonthly: Money;          // serviceChargeAnnual/12 + dewaMonthly
}

export interface DealOutputsProject {
  totalCosts: Money;               // сумма всех исходящих на старте + носимые
  netProceeds: Money;              // чистая выручка на продаже
  profit: Money;                   // netProceeds - totalCosts
  moic: number;                    // netProceeds / totalCosts
  roiPeriod: number;               // (profit / totalCosts)
  irrAnnual: number;               // moic^(12/monthsTotal) - 1
  aprSimple: number;               // roiPeriod * 12 / monthsTotal
  breakEvenSalePrice: Money;       // цена продажи при profit = 0
  breakEvenGapAbs: Money;          // salePrice - breakEvenSalePrice
  breakEvenGapPctOfPrice: number;  // (salePrice - breakEven)/salePrice
}

export interface DealOutputsInvestor {
  capital: Money;                  // инвестор финансирует totalCosts проекта
  profitShare: Money;              // profit * investorProfitSharePct
  cashBack: Money;                 // capital + profitShare
  moic: number;                    // cashBack / capital
  roiPeriod: number;               // profitShare / capital
  irrAnnual: number;               // moic^(12/monthsTotal) - 1
}

export interface SensitivityDataPoint {
  salePrice?: Money;
  monthsTotal?: number;
  renovationBudget?: Money;
  roiPeriod: number;
  irrAnnual: number;
  profit: Money;
}

export interface SensitivityResult {
  bySalePrice: SensitivityDataPoint[];
  byMonths: SensitivityDataPoint[];
  byRenovation: SensitivityDataPoint[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}
