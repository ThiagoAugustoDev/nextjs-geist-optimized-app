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
  const lpa = s.earningsPerShare;
  const vpa = s.bookValuePerShare;
  if (lpa === undefined || vpa === undefined) return undefined;
  return Math.sqrt(22.5 * lpa * vpa);
}

export function debtEquity(s: Stock) {
  const debt = s.grossDebt;
  const equity = s.equity;
  if (debt === undefined || equity === undefined || equity === 0) return undefined;
  return debt / equity;
}

export function pegRatio(s: Stock) {
  const growth = s.profitGrowth5y;
  const pe = s.priceEarnings;
  if (growth === undefined || pe === undefined || growth === 0) return undefined;
  return pe / growth;
}

export function evEbitda(s: Stock) {
  const mc = s.marketCap;
  const debt = s.grossDebt ?? 0;
  const ebitda = s.ebitda;
  if (mc === undefined || ebitda === undefined || ebitda === 0) return undefined;
  return (mc + debt) / ebitda;
}

export function passesDefaultFilters(s: Stock) {
  if (s.priceEarnings !== undefined && s.priceEarnings <= 0) return false;
  if (s.priceBookValue !== undefined && s.priceBookValue > 1) return false;
  if (s.roe !== undefined && s.roe < 15) return false;
  const de = debtEquity(s);
  if (de !== undefined && de >= 1) return false;
  const peg = pegRatio(s);
  if (peg !== undefined && peg > 1) return false;
  const ev = evEbitda(s);
  if (ev !== undefined && ev > 10) return false;
  return true;
}
