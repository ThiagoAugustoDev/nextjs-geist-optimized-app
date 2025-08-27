'use client'
import { useEffect, useState } from 'react'
import { passesDefaultFilters, debtEquity, pegRatio, evEbitda, intrinsicValue, Stock } from '../lib/metrics'

async function fetchStocks(): Promise<Stock[]> {
  try {
    const res = await fetch('https://brapi.dev/api/quote/list?limit=50&fundamental=true')
    const json = await res.json()
    const items = (json.stocks || json.results || []) as Array<Record<string, unknown>>
    const toNumber = (v: unknown) => (typeof v === 'number' ? v : undefined)
    return items.map((item) => {
      const fundamental = (item.fundamental as Record<string, unknown>) || {}
      return {
        symbol: typeof item.symbol === 'string' ? item.symbol : (typeof item.stock === 'string' ? item.stock : ''),
        regularMarketPrice: toNumber(item.regularMarketPrice) ?? toNumber(item.close),
        priceEarnings: toNumber(item.priceEarnings) ?? toNumber(fundamental.priceEarnings),
        priceBookValue: toNumber(item.priceBookValue) ?? toNumber(fundamental.priceBookValue),
        dividendYield: toNumber(item.dividendYield) ?? toNumber(fundamental.dividendYield),
        roe: toNumber(item.roe) ?? toNumber(fundamental.roe),
        grossDebt: toNumber(item.grossDebt) ?? toNumber(fundamental.grossDebt),
        equity: toNumber(item.equity) ?? toNumber(fundamental.equity),
        earningsPerShare: toNumber(item.earningsPerShare) ?? toNumber(fundamental.earningsPerShare),
        bookValuePerShare: toNumber(item.bookValuePerShare) ?? toNumber(fundamental.bookValuePerShare),
        profitGrowth5y: toNumber(item.profitGrowth5y) ?? toNumber(fundamental.profitGrowth5y),
        ebitda: toNumber(item.ebitda) ?? toNumber(fundamental.ebitda),
        marketCap: toNumber(item.marketCap) ?? toNumber(fundamental.marketCap),
      }
    })
  } catch {
    return []
  }
}

export default function Home() {
  const [stocks, setStocks] = useState<Stock[]>([])
  useEffect(() => {
    fetchStocks().then(setStocks)
  }, [])

  const filtered = stocks.filter(passesDefaultFilters)

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Monitor de Ações Brasileiras</h1>
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            <th className="px-2 py-1 text-left">Ticker</th>
            <th className="px-2 py-1 text-right">Preço</th>
            <th className="px-2 py-1 text-right">P/L</th>
            <th className="px-2 py-1 text-right">P/VP</th>
            <th className="px-2 py-1 text-right">DY%</th>
            <th className="px-2 py-1 text-right">ROE%</th>
            <th className="px-2 py-1 text-right">Dívida/Patrimônio</th>
            <th className="px-2 py-1 text-right">PEG</th>
            <th className="px-2 py-1 text-right">EV/EBITDA</th>
            <th className="px-2 py-1 text-right">Graham</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((s) => (
            <tr key={s.symbol} className="border-t">
              <td className="px-2 py-1">{s.symbol}</td>
              <td className="px-2 py-1 text-right">{s.regularMarketPrice?.toFixed(2)}</td>
              <td className="px-2 py-1 text-right">{s.priceEarnings?.toFixed(2)}</td>
              <td className="px-2 py-1 text-right">{s.priceBookValue?.toFixed(2)}</td>
              <td className="px-2 py-1 text-right">{s.dividendYield?.toFixed(2)}</td>
              <td className="px-2 py-1 text-right">{s.roe?.toFixed(2)}</td>
              <td className="px-2 py-1 text-right">{debtEquity(s).toFixed(2)}</td>
              <td className="px-2 py-1 text-right">{pegRatio(s).toFixed(2)}</td>
              <td className="px-2 py-1 text-right">{evEbitda(s).toFixed(2)}</td>
              <td className="px-2 py-1 text-right">{intrinsicValue(s).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
