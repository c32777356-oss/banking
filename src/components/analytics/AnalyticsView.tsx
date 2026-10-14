import React from 'react';
import { ArrowDownLeft, ArrowUpRight, BarChart3, DollarSign, PieChart, ShieldCheck, Sparkles, TrendingUp, Vault } from 'lucide-react';
import { useBanking } from '../../context/BankingContext';
import { SpendingCategory } from '../../types/banking';

export const AnalyticsView: React.FC = () => {
  const { transactions, accounts, totalNetWorth, monthlyInflow, monthlyOutflow } = useBanking();

  // Aggregate expenditures by category
  const categoryTotals: Record<string, number> = {};
  let totalDebitSpend = 0;

  transactions.forEach((t) => {
    if (t.amount < 0) {
      const positiveAmount = Math.abs(t.amount);
      totalDebitSpend += positiveAmount;
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + positiveAmount;
    }
  });

  const categoriesSorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  // Calculate annual yield projection from APY
  const totalInterestAccounts = accounts.filter((a) => a.apy && a.apy > 0);
  const estimatedAnnualYield = totalInterestAccounts.reduce((sum, a) => {
    return sum + (a.balance * ((a.apy || 0) / 100));
  }, 0);

  // Runway calculation
  const monthlyBurn = monthlyOutflow > 0 ? monthlyOutflow : 25000;
  const runwayMonths = Math.floor(totalNetWorth / monthlyBurn);

  // Mock monthly historical cash flows
  const monthlyHistory = [
    { month: 'May 2026', inflow: 110000, outflow: 48000 },
    { month: 'Jun 2026', inflow: 145000, outflow: 62000 },
    { month: 'Jul 2026', inflow: 180000, outflow: 71000 },
    { month: 'Aug 2026', inflow: 165000, outflow: 59000 },
    { month: 'Sep 2026', inflow: 210000, outflow: 84000 },
    { month: 'Oct 2026', inflow: monthlyInflow || 248000, outflow: monthlyOutflow || 72000 },
  ];

  const maxFlow = Math.max(...monthlyHistory.map((m) => Math.max(m.inflow, m.outflow)));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Treasury Intelligence & Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Cash flow distribution, burn velocity, and institutional yield projections
        </p>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block font-medium">
            Annual Yield Projection
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-blue-700 tabular-nums">
            +${estimatedAnnualYield.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="mt-1 text-[11px] text-slate-500 font-sans">
            Blended Treasury Vault rate (~4.95% APY)
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block font-medium">
            30-Day Cash Retention Rate
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {monthlyInflow > 0
              ? `${Math.max(0, Math.round(((monthlyInflow - monthlyOutflow) / monthlyInflow) * 100))}%`
              : '68%'}
          </div>
          <p className="mt-1 text-[11px] text-slate-500 font-sans">
            Positive capital accumulation index
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block font-medium">
            Operating Capital Runway
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-blue-600 tabular-nums">
            {runwayMonths} Months
          </div>
          <p className="mt-1 text-[11px] text-slate-500 font-sans">
            Based on current trailing monthly burn
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block font-medium">
            FDIC Guaranteed Coverage
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
            $250,000 USD
          </div>
          <p className="mt-1 text-[11px] text-blue-700 font-sans font-medium">
            Per insured depositor institution
          </p>
        </div>
      </div>

      {/* Cash Flow Timeline Chart */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900">6-Month Capital Flow Dynamics</h2>
            <p className="text-xs text-slate-500">Comparison of monthly deposits vs. outflows in USD</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-blue-600"></div>
              <span className="text-slate-700 font-medium">Capital Inflow</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-blue-200"></div>
              <span className="text-slate-700 font-medium">Disbursements</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Graph */}
        <div className="grid grid-cols-6 gap-2 sm:gap-6 items-end h-56 pt-4 border-b border-slate-100 pb-3">
          {monthlyHistory.map((item) => {
            const inHeight = Math.max(12, (item.inflow / maxFlow) * 100);
            const outHeight = Math.max(12, (item.outflow / maxFlow) * 100);

            return (
              <div key={item.month} className="flex flex-col items-center gap-2 h-full justify-end group">
                <div className="flex items-end gap-1 sm:gap-2 w-full justify-center h-full">
                  {/* Inflow Bar */}
                  <div
                    className="w-1/2 max-w-[28px] bg-blue-600 hover:bg-blue-700 rounded-t transition-all relative"
                    style={{ height: `${inHeight}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-[10px] text-white px-1.5 py-0.5 rounded font-mono pointer-events-none whitespace-nowrap z-20 shadow-md">
                      +${(item.inflow / 1000).toFixed(0)}k
                    </div>
                  </div>

                  {/* Outflow Bar */}
                  <div
                    className="w-1/2 max-w-[28px] bg-blue-200 hover:bg-blue-300 rounded-t transition-all relative"
                    style={{ height: `${outHeight}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-[10px] text-white px-1.5 py-0.5 rounded font-mono pointer-events-none whitespace-nowrap z-20 shadow-md">
                      -${(item.outflow / 1000).toFixed(0)}k
                    </div>
                  </div>
                </div>
                <span className="text-[10px] sm:text-xs text-slate-500 font-mono whitespace-nowrap truncate max-w-full font-medium">
                  {item.month.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Spending Breakdown */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 mb-1">Expense Breakdown by Category</h2>
        <p className="text-xs text-slate-500 mb-6">
          Allocation across operational activities, payroll, technology, and capital investments
        </p>

        <div className="space-y-4">
          {categoriesSorted.map(([category, amount]) => {
            const pct = totalDebitSpend > 0 ? (amount / totalDebitSpend) * 100 : 0;
            return (
              <div key={category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{category}</span>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-slate-500">{pct.toFixed(1)}%</span>
                    <span className="text-slate-900 font-bold tabular-nums">
                      ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{ width: `${Math.max(3, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
