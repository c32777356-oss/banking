import React, { useState } from 'react';
import { Building2, CheckCircle2, Download, FileText, Printer, ShieldCheck } from 'lucide-react';
import { useBanking } from '../../context/BankingContext';

export const StatementsView: React.FC = () => {
  const { accounts, transactions, user } = useBanking();
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [period, setPeriod] = useState<'current' | 'last_month' | 'q3' | 'ytd'>('current');

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  // Filter transactions for statement
  const accountTransactions = transactions.filter((t) => t.accountId === selectedAccountId);

  const totalDeposits = accountTransactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawals = accountTransactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const endingBalance = selectedAccount ? selectedAccount.balance : 0;
  const startingBalance = endingBalance - totalDeposits + totalWithdrawals;

  const handlePrint = () => {
    window.print();
  };

  const periodLabels = {
    current: 'October 01, 2026 – October 31, 2026',
    last_month: 'September 01, 2026 – September 30, 2026',
    q3: 'July 01, 2026 – September 30, 2026',
    ytd: 'January 01, 2026 – Present',
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Interactive Controls Bar (Hidden when printing) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Official Account Statements
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            FDIC verified institutional statements for accounting, tax, and audit reporting
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:border-blue-600 font-sans shadow-2xs"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.accountNumber})
              </option>
            ))}
          </select>

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:border-blue-600 font-sans shadow-2xs"
          >
            <option value="current">Current Cycle (October 2026)</option>
            <option value="last_month">Previous Month (September 2026)</option>
            <option value="q3">Third Quarter (Q3 2026)</option>
            <option value="ytd">Year-to-Date (2026 YTD)</option>
          </select>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm shadow-blue-600/20 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Official Printable Bank Statement Document */}
      <div className="rounded-2xl border border-slate-200 bg-white text-slate-900 p-8 sm:p-12 shadow-sm space-y-8 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
        {/* Header Lockup */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-6 print:border-neutral-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                Aura Commercial Bank N.A.
              </h2>
              <p className="text-[11px] text-slate-500 font-mono">
                Member FDIC · Federal Reserve ABA 021000021 · SWIFT: AURAUS33NYC
              </p>
              <p className="text-[10px] text-slate-500 font-sans">
                55 Wall Street, Suite 1400, New York, NY 10005 · United States
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono uppercase tracking-widest text-blue-700 font-bold block">
              Official Account Statement
            </span>
            <span className="text-xs text-slate-700 font-semibold mt-1 block font-mono">
              {periodLabels[period]}
            </span>
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
              Statement ID: STM-{Date.now().toString().slice(-8)}
            </span>
          </div>
        </div>

        {/* Client & Account Info Two-Column Block */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-b border-slate-200 pb-6 print:border-neutral-300">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-medium">
              Account Holder Entity
            </span>
            <p className="text-sm font-bold text-slate-900">{user?.name}</p>
            <p className="text-slate-600">{user?.company}</p>
            <p className="text-slate-500 font-mono text-[11px]">{user?.email}</p>
          </div>

          <div className="space-y-1 sm:text-right font-mono">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-sans sm:block font-medium">
              Account Parameters
            </span>
            <p className="text-sm font-bold text-slate-900">{selectedAccount.name}</p>
            <p className="text-slate-600">Account: {selectedAccount.fullAccountNumber}</p>
            <p className="text-slate-500">Routing (Fedwire/ACH): 021000021</p>
          </div>
        </div>

        {/* Statement Summary Box */}
        <div className="rounded-xl bg-blue-50/50 border border-blue-100 p-5">
          <div className="text-xs font-bold text-blue-900 mb-4 uppercase tracking-wider font-mono">
            Period Summary (USD)
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-[11px] text-slate-500 block">Starting Balance</span>
              <span className="text-base font-bold text-slate-900 tabular-nums mt-0.5 block">
                ${startingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 block">Total Deposits (+)</span>
              <span className="text-base font-bold text-blue-700 tabular-nums mt-0.5 block">
                +${totalDeposits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 block">Total Withdrawals (-)</span>
              <span className="text-base font-bold text-slate-800 tabular-nums mt-0.5 block">
                -${totalWithdrawals.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 block">Ending Available Balance</span>
              <span className="text-base font-bold text-slate-900 tabular-nums mt-0.5 block">
                ${endingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Itemized Transactions Table */}
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono mb-3">
            Itemized Ledger Transactions
          </h3>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="py-2.5 px-3 font-semibold">Posting Date</th>
                  <th className="py-2.5 px-3 font-semibold">Description / Payee</th>
                  <th className="py-2.5 px-3 font-semibold">Reference ID</th>
                  <th className="py-2.5 px-3 font-semibold">Category</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Amount (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accountTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No transactions recorded for this statement period.
                    </td>
                  </tr>
                ) : (
                  accountTransactions.map((t) => {
                    const isCredit = t.amount > 0;
                    return (
                      <tr key={t.id}>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {new Date(t.timestamp).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          <div>{t.counterparty}</div>
                          {t.memo && <div className="text-[10px] text-slate-500 font-mono font-normal">{t.memo}</div>}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                          {t.referenceId}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {t.category}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-xs whitespace-nowrap">
                          <span className={isCredit ? 'text-blue-700' : 'text-slate-800'}>
                            {isCredit ? '+' : '-'}${Math.abs(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legal Disclosures & FDIC Seal */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[10px] text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>
              FDIC Insurance Coverage Verified · Deposits backed by the full faith and credit of the United States Government.
            </span>
          </div>
          <div className="font-mono text-right">
            <span>OFFICIAL SEAL #NY-89240</span>
          </div>
        </div>
      </div>
    </div>
  );
};
