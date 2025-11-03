// =====================================
// ЮНИТ-ТЕСТЫ ДЛЯ РАСЧЕТОВ
// =====================================

import { describe, it, expect } from 'vitest';
import { computeProject, computeInvestor, validateInput, computeSensitivity } from '../calculations/core';
import type { DealInput } from '../calculations/types';

const testInput: DealInput = {
  dealType: 'secondary',
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

describe('Основные расчеты проекта', () => {
  it('должны рассчитать totalCosts корректно', () => {
    const project = computeProject(testInput);
    expect(project.totalCosts).toBeCloseTo(1773290, 0);
  });
  
  it('должны рассчитать netProceeds корректно', () => {
    const project = computeProject(testInput);
    expect(project.netProceeds).toBeCloseTo(2203400, 0);
  });
  
  it('должны рассчитать profit корректно', () => {
    const project = computeProject(testInput);
    expect(project.profit).toBeCloseTo(430110, 0);
  });
  
  it('должны рассчитать roiPeriod корректно', () => {
    const project = computeProject(testInput);
    expect(project.roiPeriod).toBeCloseTo(0.243, 0.001);
  });
  
  it('должны рассчитать moic корректно', () => {
    const project = computeProject(testInput);
    expect(project.moic).toBeCloseTo(1.2425, 0.001);
  });
  
  it('должны рассчитать irrAnnual корректно', () => {
    const project = computeProject(testInput);
    expect(project.irrAnnual).toBeCloseTo(0.544, 0.002);
  });
  
  it('должны рассчитать breakEvenSalePrice корректно', () => {
    const project = computeProject(testInput);
    expect(project.breakEvenSalePrice).toBeCloseTo(1851033, 100);
  });
});

describe('Расчеты для инвестора', () => {
  it('должны рассчитать capital = totalCosts', () => {
    const project = computeProject(testInput);
    const investor = computeInvestor(testInput, project);
    expect(investor.capital).toBe(project.totalCosts);
  });
  
  it('должны рассчитать profitShare корректно', () => {
    const project = computeProject(testInput);
    const investor = computeInvestor(testInput, project);
    expect(investor.profitShare).toBeCloseTo(215055, 10);
  });
  
  it('должны рассчитать roiPeriod инвестора корректно', () => {
    const project = computeProject(testInput);
    const investor = computeInvestor(testInput, project);
    expect(investor.roiPeriod).toBeCloseTo(0.121, 0.001);
  });
  
  it('должны рассчитать irrAnnual инвестора корректно', () => {
    const project = computeProject(testInput);
    const investor = computeInvestor(testInput, project);
    expect(investor.irrAnnual).toBeCloseTo(0.257, 0.002);
  });
  
  it('должны рассчитать cashBack корректно', () => {
    const project = computeProject(testInput);
    const investor = computeInvestor(testInput, project);
    expect(investor.cashBack).toBeCloseTo(project.totalCosts + investor.profitShare, 10);
  });
});

describe('Граничные случаи', () => {
  it('должны обработать убыточный сценарий', () => {
    const lossInput: DealInput = {
      ...testInput,
      salePrice: 1500000, // ниже break-even
    };
    const project = computeProject(lossInput);
    
    expect(project.profit).toBeLessThan(0);
    expect(project.irrAnnual).toBeLessThan(0);
  });
  
  it('должны обработать monthsTotal = 0', () => {
    const zeroMonthsInput: DealInput = {
      ...testInput,
      monthsRepair: 0,
      monthsExposure: 0,
    };
    const project = computeProject(zeroMonthsInput);
    
    expect(project.irrAnnual).toBe(0);
  });
  
  it('должны обработать нулевые затраты', () => {
    const zeroCostsInput: DealInput = {
      ...testInput,
      purchasePrice: 0,
      renovationBudget: 0,
      trusteeFee: 0,
      serviceChargeAnnual: 0,
      dewaMonthly: 0,
    };
    const project = computeProject(zeroCostsInput);
    
    expect(project.totalCosts).toBe(0);
    expect(project.moic).toBe(0);
    expect(project.roiPeriod).toBe(0);
  });
});

describe('Валидация', () => {
  it('должна пройти валидацию для корректных данных', () => {
    const result = validateInput(testInput);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
  
  it('должна выдать ошибку для процента > 100', () => {
    const invalidInput: DealInput = {
      ...testInput,
      dldPct: 150,
    };
    const result = validateInput(invalidInput);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
  
  it('должна выдать ошибку для отрицательной цены', () => {
    const invalidInput: DealInput = {
      ...testInput,
      purchasePrice: -1000,
    };
    const result = validateInput(invalidInput);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
  
  it('должна выдать ошибку если сплит != 100', () => {
    const invalidInput: DealInput = {
      ...testInput,
      investorProfitSharePct: 60,
      operatorProfitSharePct: 30,
    };
    const result = validateInput(invalidInput);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'profitSplit')).toBe(true);
  });
  
  it('должна выдать предупреждение для убыточной сделки', () => {
    const warningInput: DealInput = {
      ...testInput,
      salePrice: 1500000,
    };
    const result = validateInput(warningInput);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
  
  it('должна выдать предупреждение для невозможной комиссии', () => {
    const invalidFeeInput: DealInput = {
      ...testInput,
      sellerFeePct: 95,
      sellerFeeVatPct: 10,
    };
    const result = validateInput(invalidFeeInput);
    expect(result.warnings.some(w => w.field === 'sellerFeePct')).toBe(true);
  });
});

describe('Анализ чувствительности', () => {
  it('должен рассчитать чувствительность по цене', () => {
    const project = computeProject(testInput);
    const sensitivity = computeSensitivity(testInput, project);
    
    expect(sensitivity.bySalePrice).toHaveLength(7);
    expect(sensitivity.bySalePrice[3].salePrice).toBe(testInput.salePrice); // базовый
  });
  
  it('должен рассчитать чувствительность по срокам', () => {
    const project = computeProject(testInput);
    const sensitivity = computeSensitivity(testInput, project);
    
    expect(sensitivity.byMonths.length).toBeGreaterThan(0);
    expect(sensitivity.byMonths[0].monthsTotal).toBe(6); // начальный
  });
  
  it('должен рассчитать чувствительность по ремонту', () => {
    const project = computeProject(testInput);
    const sensitivity = computeSensitivity(testInput, project);
    
    expect(sensitivity.byRenovation).toHaveLength(5);
    expect(sensitivity.byRenovation[2].renovationBudget).toBe(testInput.renovationBudget); // базовый
  });
  
  it('должен показать снижение ROI при увеличении сроков', () => {
    const project = computeProject(testInput);
    const sensitivity = computeSensitivity(testInput, project);
    
    const first = sensitivity.byMonths[0];
    const last = sensitivity.byMonths[sensitivity.byMonths.length - 1];
    
    expect(first.irrAnnual).toBeGreaterThan(last.irrAnnual);
  });
});
