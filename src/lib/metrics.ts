export type Stock = {
  symbol: string;
  regularMarketPrice?: number;
  priceEarnings?: number;
  priceBookValue?: number;
  dividendYield?: number;
  roe?: number;
  grossDebt?: number;
  equity?: number;
  earningsPerShare?: number;
  bookValuePerShare?: number;
  profitGrowth5y?: number;
  ebitda?: number;
  marketCap?: number;
};

export function intrinsicValue(s: Stock) {
  const lpa = s.earningsPerShare ?? 0;
  const vpa = s.bookValuePerShare ?? 0;
  return Math.sqrt(22.5 * lpa * vpa);
}

export function debtEquity(s: Stock) {
  const debt = s.grossDebt ?? 0;
  const equity = s.equity ?? 1;
  return debt / equity;
}

export function pegRatio(s: Stock) {
  const growth = s.profitGrowth5y ?? 0;
  const pe = s.priceEarnings ?? 0;
  return growth ? pe / growth : Infinity;
}

export function evEbitda(s: Stock) {
  const mc = s.marketCap ?? 0;
  const debt = s.grossDebt ?? 0;
  const ebitda = s.ebitda ?? 1;
  return (mc + debt) / ebitda;
}

export function passesDefaultFilters(s: Stock) {
  if (s.priceEarnings !== undefined && s.priceEarnings <= 0) return false;
  if (s.priceBookValue !== undefined && s.priceBookValue > 1) return false;
  if (s.roe !== undefined && s.roe < 15) return false;
  if (s.grossDebt !== undefined && s.equity !== undefined && debtEquity(s) >= 1) return false;
  if (s.profitGrowth5y !== undefined && pegRatio(s) > 1) return false;
  if (s.marketCap !== undefined && s.ebitda !== undefined && evEbitda(s) > 10) return false;
  return true;
}
