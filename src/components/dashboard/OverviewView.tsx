import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Building,
  CheckCircle2,
  ChevronRight,
  Copy,
  CreditCard,
  DollarSign,
  Filter,
  Plus,
  Search,
  Send,
  TrendingDown,
  TrendingUp,
  Vault,
  Wallet,
} from 'lucide-react';
import { useBanking } from '../../context/BankingContext';
import { Account, Transaction, TransactionType } from '../../types/banking';
import { TransactionDetailModal } from '../modals/TransactionDetailModal';

interface OverviewViewProps {
  onOpenDeposit: (accountId?: string) => void;
  onOpenWithdraw: (accountId?: string) => void;
  onOpenTransfer: (accountId?: string) => void;
  onNavigateToCards: () => void;
  onNavigateToAccounts: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onOpenDeposit,
  onOpenWithdraw,
  onOpenTransfer,
  onNavigateToCards,
  onNavigateToAccounts,
}) => {
  const {
    user,
    accounts,
    transactions,
    totalNetWorth,
    monthlyInflow,
    monthlyOutflow,
  } = useBanking();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [copiedAccountId, setCopiedAccountId] = useState<string | null>(null);

  const copyAccountNumber = (acc: Account, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(acc.fullAccountNumber);
    setCopiedAccountId(acc.id);
    setTimeout(() => setCopiedAccountId(null), 2000);
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesFilter = filterType === 'all' || t.type === filterType;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      t.counterparty.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query) ||
      t.referenceId.toLowerCase().includes(query) ||
      (t.memo && t.memo.toLowerCase().includes(query));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Hero Net Worth & Quick Actions */}
      <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-br from-white via-blue-50/40 to-blue-100/30 p-4 sm:p-6 lg:p-8 relative overflow-hidden shadow-xs">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 blur-3xl rounded-full pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{user?.company || 'Aura Commercial Account'}</span>
              <span aria-hidden="true">·</span>
              <span>Total Liquid USD Assets</span>
              <span aria-hidden="true" className="hidden xs:inline">·</span>
              <span className="text-blue-700 font-mono font-semibold hidden xs:inline">FDIC Insured</span>
            </div>

            <div className="mt-1 sm:mt-2 flex items-baseline gap-2 sm:gap-3">
              <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
                ${totalNetWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h1>
              <span className="text-xs sm:text-sm font-semibold text-slate-500 font-sans">USD</span>
            </div>

            <div className="mt-1.5 sm:mt-2 flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-blue-700 font-mono font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                <span>+$152,449.05 (+9.0%) this month</span>
              </div>
              <span className="text-slate-300 hidden sm:inline">|</span>
              <span className="text-slate-600 hidden sm:inline">
                Tier: <strong className="text-slate-900 font-semibold">{user?.tier || 'Corporate Premier'}</strong>
              </span>
            </div>
          </div>

          {/* Quick Action Buttons - Touch-friendly grid on mobile */}
          <div className="grid grid-cols-3 gap-2 w-full lg:w-auto lg:flex lg:flex-wrap items-center">
            <button
              onClick={() => onOpenDeposit()}
              className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2.5 px-3 min-h-[44px] text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all rounded-xl shadow-sm shadow-blue-600/20 text-center"
            >
              <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
              <span>Deposit</span>
            </button>

            <button
              onClick={() => onOpenWithdraw()}
              className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2.5 px-3 min-h-[44px] text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 active:scale-[0.98] transition-all rounded-xl border border-slate-300 shadow-2xs text-center"
            >
              <ArrowUpRight className="w-4 h-4 text-red-500 stroke-[2.5]" />
              <span>Withdraw</span>
            </button>

            <button
              onClick={() => onOpenTransfer()}
              className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2.5 px-3 min-h-[44px] text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 active:scale-[0.98] transition-all rounded-xl border border-blue-200 text-center"
            >
              <Send className="w-3.5 h-3.5 text-blue-600" />
              <span>Transfer</span>
            </button>
          </div>
        </div>

        {/* 30-Day Cash Flow Strip */}
        <div className="mt-5 sm:mt-8 pt-4 sm:pt-6 border-t border-blue-200/60 grid grid-cols-3 gap-2 sm:gap-4">
          <div className="p-2.5 sm:p-3.5 rounded-xl bg-white/90 border border-blue-100 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 mb-0.5 sm:mb-1">
              <span className="truncate">Inflow</span>
              <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 shrink-0" />
            </div>
            <div className="text-sm xs:text-base sm:text-xl font-bold font-mono text-blue-700 tabular-nums truncate">
              +${monthlyInflow.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
          </div>

          <div className="p-2.5 sm:p-3.5 rounded-xl bg-white/90 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 mb-0.5 sm:mb-1">
              <span className="truncate">Outflow</span>
              <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-600 shrink-0" />
            </div>
            <div className="text-sm xs:text-base sm:text-xl font-bold font-mono text-slate-800 tabular-nums truncate">
              -${monthlyOutflow.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
          </div>

          <div className="p-2.5 sm:p-3.5 rounded-xl bg-white/90 border border-blue-100 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 mb-0.5 sm:mb-1">
              <span className="truncate">Net</span>
              <DollarSign className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 shrink-0" />
            </div>
            <div
              className={`text-sm xs:text-base sm:text-xl font-bold font-mono tabular-nums truncate ${
                monthlyInflow >= monthlyOutflow ? 'text-blue-700' : 'text-slate-800'
              }`}
            >
              {monthlyInflow >= monthlyOutflow ? '+' : '-'}$
              {Math.abs(monthlyInflow - monthlyOutflow).toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>
      </div>

      {/* Account Cards Section */}
      <div>
        <div className="flex items-center justify-between mb-2.5 sm:mb-3">
          <h2 className="text-sm sm:text-base font-bold text-slate-900">Commercial Accounts & Vaults</h2>
          <button
            onClick={onNavigateToAccounts}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Details →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 hover:border-blue-300 transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      {acc.type === 'checking' && <Building className="w-4 h-4" />}
                      {acc.type === 'treasury' && <Vault className="w-4 h-4" />}
                      {acc.type === 'savings' && <Wallet className="w-4 h-4" />}
                    </div>
                    <span className="text-xs font-bold text-slate-800 truncate">{acc.name}</span>
                  </div>
                  {acc.apy && acc.apy > 1 && (
                    <span className="text-[10px] sm:text-[11px] font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 shrink-0">
                      {acc.apy}% APY
                    </span>
                  )}
                </div>

                <div className="mt-1">
                  <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tabular-nums">
                    ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                    <span>Account: {acc.accountNumber}</span>
                    <button
                      onClick={(e) => copyAccountNumber(acc, e)}
                      className="hover:text-blue-600 flex items-center gap-1 transition-colors min-h-[30px] px-1"
                      title="Copy full account number"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedAccountId === acc.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-xs">
                <button
                  onClick={() => onOpenDeposit(acc.id)}
                  className="py-1.5 font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors min-h-[36px] text-center"
                >
                  Deposit
                </button>
                <button
                  onClick={() => onOpenWithdraw(acc.id)}
                  className="py-1.5 font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors min-h-[36px] text-center"
                >
                  Withdraw
                </button>
                <button
                  onClick={() => onOpenTransfer(acc.id)}
                  className="py-1.5 font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors min-h-[36px] text-center"
                >
                  Transfer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Ledger Section */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-3.5 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Transaction Audit Ledger</h3>
            <p className="text-xs text-slate-500">All cleared deposits, disbursements, and transfers</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transactions..."
                className="w-full sm:w-56 pl-8 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-2xs min-h-[40px]"
              />
            </div>

            {/* Segmented Filter Buttons */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setFilterType('all')}
                className={`flex-1 sm:flex-none px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors min-h-[32px] whitespace-nowrap ${
                  filterType === 'all'
                    ? 'bg-white text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('deposit')}
                className={`flex-1 sm:flex-none px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors min-h-[32px] whitespace-nowrap ${
                  filterType === 'deposit'
                    ? 'bg-white text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Deposits
              </button>
              <button
                onClick={() => setFilterType('withdrawal')}
                className={`flex-1 sm:flex-none px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors min-h-[32px] whitespace-nowrap ${
                  filterType === 'withdrawal'
                    ? 'bg-white text-red-600 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Disburse
              </button>
              <button
                onClick={() => setFilterType('card_spend')}
                className={`flex-1 sm:flex-none px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors min-h-[32px] whitespace-nowrap ${
                  filterType === 'card_spend'
                    ? 'bg-white text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cards
              </button>
            </div>
          </div>
        </div>

        {/* Mobile View: Native Touch List Rows (Layout B) */}
        <div className="sm:hidden divide-y divide-slate-100">
          {filteredTransactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No transactions match the selected criteria.
            </div>
          ) : (
            filteredTransactions.map((txn) => {
              const isCredit = txn.amount > 0;
              const date = new Date(txn.timestamp);
              return (
                <div
                  key={txn.id}
                  onClick={() => setSelectedTxn(txn)}
                  className="p-3.5 flex items-center justify-between gap-3 active:bg-blue-50/60 transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isCredit
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {isCredit ? <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {txn.counterparty}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {txn.category}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`font-mono font-bold text-xs tabular-nums ${
                        isCredit ? 'text-blue-700' : 'text-slate-900'
                      }`}
                    >
                      {isCredit ? '+' : '-'}${Math.abs(txn.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <span className="text-[9px] text-blue-700 font-semibold font-mono block">
                      Cleared
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Multi-column Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 bg-slate-50">
                <th className="py-3 px-4 font-semibold">Date & Time</th>
                <th className="py-3 px-4 font-semibold">Counterparty / Description</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Channel / Method</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Amount (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No transactions match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => {
                  const isCredit = txn.amount > 0;
                  const date = new Date(txn.timestamp);
                  return (
                    <tr
                      key={txn.id}
                      onClick={() => setSelectedTxn(txn)}
                      className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                        <span className="text-slate-400 ml-1.5 hidden sm:inline">
                          {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[220px] sm:max-w-xs">{txn.counterparty}</span>
                        </div>
                        {txn.memo && (
                          <p className="text-[10px] text-slate-500 truncate max-w-[240px] font-mono font-normal">
                            {txn.memo}
                          </p>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {txn.category}
                      </td>

                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                        {txn.fundingMethod || 'Fedwire / ACH'}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] text-blue-700 font-medium">
                          <CheckCircle2 className="w-3 h-3 text-blue-600" />
                          Cleared
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-bold tabular-nums text-sm">
                        <span className={isCredit ? 'text-blue-700' : 'text-slate-800'}>
                          {isCredit ? '+' : '-'}${Math.abs(txn.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
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

      {/* Transaction Detail Audit Modal */}
      <TransactionDetailModal
        transaction={selectedTxn}
        onClose={() => setSelectedTxn(null)}
        accountName={
          accounts.find((a) => a.id === selectedTxn?.accountId)?.name || 'Commercial Account'
        }
      />
    </div>
  );
};
