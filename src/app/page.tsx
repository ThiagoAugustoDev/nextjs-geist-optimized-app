'use client'
import { useEffect, useState } from 'react'
import { passesDefaultFilters, debtEquity, pegRatio, evEbitda, intrinsicValue, Stock } from '../lib/metrics'

async function fetchStocks(): Promise<Stock[]> {
  try {
    const listRes = await fetch('https://brapi.dev/api/quote/list?limit=50')
    const listJson = await listRes.json()
    const symbols = (listJson.stocks || [])
      .map((s: Record<string, unknown>) => (typeof s.stock === 'string' ? s.stock : ''))
      .filter(Boolean)
    if (!symbols.length) return []

    const detailRes = await fetch(
      `https://brapi.dev/api/quote/${symbols.join(',')}?modules=financialData,defaultKeyStatistics`
    )
    const detailJson = await detailRes.json()
    const items = (detailJson.results || []) as Array<Record<string, unknown>>

    const toNumber = (v: unknown) => {
      if (typeof v === 'number') return v
      if (typeof v === 'string') {
        const n = Number(v)
        return Number.isFinite(n) ? n : undefined
      }
      return undefined
    }

    return items.map((item) => {
      const financial = (item.financialData as Record<string, unknown>) || {}
      const stats = (item.defaultKeyStatistics as Record<string, unknown>) || {}
      const debt = toNumber(financial.totalDebt)
      const debtToEquity = toNumber(financial.debtToEquity)
      const equity =
        debt !== undefined && debtToEquity && debtToEquity !== 0
          ? (debt * 100) / debtToEquity
          : undefined

      return {
        symbol: typeof item.symbol === 'string' ? item.symbol : '',
        regularMarketPrice: toNumber(item.regularMarketPrice),
        priceEarnings: toNumber(item.priceEarnings),
        priceBookValue: toNumber(stats.priceToBook),
        dividendYield: toNumber(stats.dividendYield),
        roe:
          toNumber(financial.returnOnEquity) !== undefined
            ? toNumber(financial.returnOnEquity)! * 100
            : undefined,
        grossDebt: debt,
        equity,
        earningsPerShare:
          toNumber(item.earningsPerShare) ?? toNumber(stats.trailingEps),
        bookValuePerShare: toNumber(stats.bookValue),
        profitGrowth5y:
          toNumber(stats.earningsAnnualGrowth) !== undefined
            ? toNumber(stats.earningsAnnualGrowth)! * 100
            : undefined,
        ebitda: toNumber(financial.ebitda),
        marketCap: toNumber(item.marketCap),
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
          {filtered.map((s) => {
            const format = (v?: number) =>
              v === undefined || !Number.isFinite(v) ? '-' : v.toFixed(2)
            return (
              <tr key={s.symbol} className="border-t">
                <td className="px-2 py-1">{s.symbol}</td>
                <td className="px-2 py-1 text-right">{format(s.regularMarketPrice)}</td>
                <td className="px-2 py-1 text-right">{format(s.priceEarnings)}</td>
                <td className="px-2 py-1 text-right">{format(s.priceBookValue)}</td>
                <td className="px-2 py-1 text-right">{format(s.dividendYield)}</td>
                <td className="px-2 py-1 text-right">{format(s.roe)}</td>
                <td className="px-2 py-1 text-right">{format(debtEquity(s))}</td>
                <td className="px-2 py-1 text-right">{format(pegRatio(s))}</td>
                <td className="px-2 py-1 text-right">{format(evEbitda(s))}</td>
                <td className="px-2 py-1 text-right">{format(intrinsicValue(s))}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </main>
  )
}
