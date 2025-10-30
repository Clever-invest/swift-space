// =====================================
// ТЕСТЫ ФОРМАТИРОВАНИЯ
// =====================================

import { describe, it, expect } from 'vitest';
import { roundMoney, fmtMoney, fmtPct, toRate, toPct, parseMoney, parsePct } from '../calculations/money';

describe('Форматирование денег', () => {
  it('должно округлять деньги до целых', () => {
    expect(roundMoney(1234.567)).toBe(1235);
    expect(roundMoney(1234.4)).toBe(1234);
    expect(roundMoney(-1234.567)).toBe(-1235);
  });
  
  it('должно форматировать деньги с разделителями тысяч', () => {
    expect(fmtMoney(1234567)).toBe('1,234,567 AED');
    expect(fmtMoney(1000)).toBe('1,000 AED');
    expect(fmtMoney(0)).toBe('0 AED');
  });
  
  it('должно форматировать отрицательные деньги со знаком минус', () => {
    const result = fmtMoney(-1234567);
    expect(result).toContain('1,234,567');
    expect(result).toContain('−'); // длинное тире
  });
  
  it('должно парсить деньги из строки', () => {
    expect(parseMoney('1,234,567')).toBe(1234567);
    expect(parseMoney('1 234 567 AED')).toBe(1234567);
    expect(parseMoney('1234.56')).toBe(1235); // округление
  });
});

describe('Форматирование процентов', () => {
  it('должно форматировать проценты с 1 знаком', () => {
    expect(fmtPct(24.267)).toBe('24.3%');
    expect(fmtPct(100)).toBe('100.0%');
    expect(fmtPct(0)).toBe('0.0%');
  });
  
  it('должно конвертировать процент в rate', () => {
    expect(toRate(100)).toBe(1);
    expect(toRate(50)).toBe(0.5);
    expect(toRate(4)).toBe(0.04);
  });
  
  it('должно конвертировать rate в процент', () => {
    expect(toPct(1)).toBe(100);
    expect(toPct(0.5)).toBe(50);
    expect(toPct(0.04)).toBe(4);
  });
  
  it('должно парсить проценты из строки', () => {
    expect(parsePct('24.3%')).toBe(24.3);
    expect(parsePct('100')).toBe(100);
    expect(parsePct('4.5')).toBe(4.5);
  });
});
