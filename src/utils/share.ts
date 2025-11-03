// =====================================
// ШАРИНГ И АВТОСОХРАНЕНИЕ
// =====================================

import type { DealInput } from '../calculations/types';

const STORAGE_KEY = 'flip-calc:v1';

/**
 * Кодирование данных в URL query
 */
export function encodeToQuery(input: DealInput): string {
  const compressed = {
    dt: input.dealType,
    pp: input.purchasePrice,
    sp: input.salePrice,
    dld: input.dldPct,
    bf: input.buyerFeePct,
    bfv: input.buyerFeeVatPct,
    sf: input.sellerFeePct,
    sfv: input.sellerFeeVatPct,
    rb: input.renovationBudget,
    rp: input.reservePct,
    sc: input.serviceChargeAnnual,
    dw: input.dewaMonthly,
    tf: input.trusteeFee,
    mr: input.monthsRepair,
    me: input.monthsExposure,
    ip: input.investorProfitSharePct,
    op: input.operatorProfitSharePct,
    pa: input.paidAmount,
    ps: input.paymentSchedule,
  };
  
  const jsonStr = JSON.stringify(compressed);
  return btoa(jsonStr);
}

/**
 * Декодирование данных из URL query
 */
export function decodeFromQuery(queryParam: string): DealInput | null {
  try {
    const jsonStr = atob(queryParam);
    const compressed = JSON.parse(jsonStr);
    
    return {
      dealType: compressed.dt || 'secondary',
      purchasePrice: compressed.pp || 0,
      salePrice: compressed.sp || 0,
      dldPct: compressed.dld || 4,
      buyerFeePct: compressed.bf || 2,
      buyerFeeVatPct: compressed.bfv || 5,
      sellerFeePct: compressed.sf || 4,
      sellerFeeVatPct: compressed.sfv || 5,
      renovationBudget: compressed.rb || 0,
      reservePct: compressed.rp || 15,
      serviceChargeAnnual: compressed.sc || 6000,
      dewaMonthly: compressed.dw || 500,
      trusteeFee: compressed.tf || 5000,
      monthsRepair: compressed.mr || 2,
      monthsExposure: compressed.me || 4,
      investorProfitSharePct: compressed.ip || 50,
      operatorProfitSharePct: compressed.op || 50,
      paidAmount: compressed.pa,
      paymentSchedule: compressed.ps || [],
    };
  } catch (e) {
    console.error('Failed to decode query:', e);
    return null;
  }
}

/**
 * Сохранение в localStorage
 */
export function saveToStorage(input: DealInput): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(input));
    return true;
  } catch (e) {
    console.error('Failed to save to storage:', e);
    return false;
  }
}

/**
 * Загрузка из localStorage
 */
export function loadFromStorage(): DealInput | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to load from storage:', e);
    return null;
  }
}

/**
 * Очистка localStorage
 */
export function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear storage:', e);
  }
}

/**
 * Создание shareable URL
 */
export function createShareUrl(input: DealInput): string {
  const encoded = encodeToQuery(input);
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?deal=${encoded}`;
}
