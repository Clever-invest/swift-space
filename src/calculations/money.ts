// =====================================
// ФОРМАТИРОВАНИЕ ДЕНЕГ И ПРОЦЕНТОВ
// =====================================

import type { Money, Pct } from './types';

/**
 * Округление до целых AED (0 знаков после запятой)
 */
export function roundMoney(x: number): Money {
  return Math.round(x);
}

/**
 * Форматирование денег: "1 234 567 AED"
 */
export function fmtMoney(x: Money): string {
  const rounded = roundMoney(x);
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(rounded));
  
  const sign = rounded < 0 ? '−' : '';
  return `${sign}${formatted} AED`;
}

/**
 * Форматирование процентов: "24.3%"
 */
export function fmtPct(x: number): string {
  return `${x.toFixed(1)}%`;
}

/**
 * Конвертация процента из UI (0..100) в rate (0..1)
 */
export function toRate(pct: Pct): number {
  return pct / 100;
}

/**
 * Конвертация rate (0..1) в процент для UI (0..100)
 */
export function toPct(rate: number): Pct {
  return rate * 100;
}

/**
 * Парсинг денег из строки (убирает пробелы, запятые)
 */
export function parseMoney(str: string): Money {
  const cleaned = str.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : roundMoney(parsed);
}

/**
 * Парсинг процента из строки
 */
export function parsePct(str: string): Pct {
  const cleaned = str.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
