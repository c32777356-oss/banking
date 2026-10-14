import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Building,
  CheckCircle2,
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
    <div className="space-y-6 pb-12">
      {/* Hero Net Worth & Quick Actions */}
      <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-br from-white via-blue-50/40 to-blue-100/30 p-6 lg:p-8 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 blur-3xl rounded-full pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-medium text-slate-700">{user?.company || 'Aura Commercial Account'}</span>
              <span aria-hidden="true">·</span>
              <span>Total Liquid USD Assets</span>
              <span aria-hidden="true">·</span>
              <span className="text-blue-700 font-mono font-semibold">FDIC Insured</span>
            </div>

            <div className="mt-2 flex items-baseline gap-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
                ${totalNetWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h1>
              <span className="text-sm font-semibold text-slate-500 font-sans">USD</span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-blue-700 font-mono font-medium">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>+$152,449.05 (+9.0%) this month</span>
              </div>
              <span className="text-slate-300 hidden sm:inline">|</span>
              <span className="text-slate-600">
                Active Tier:{' '}
                <strong className="text-slate-900 font-semibold">{user?.tier || 'Corporate Premier'}</strong>
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onOpenDeposit()}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all rounded-lg shadow-sm shadow-blue-600/20 whitespace-nowrap shrink-0"
            >
              <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
              <span>Deposit Funds</span>
            </button>

            <button
              onClick={() => onOpenWithdraw()}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 active:scale-[0.98] transition-all rounded-lg border border-slate-300 shadow-2xs whitespace-nowrap shrink-0"
            >
              <ArrowUpRight className="w-4 h-4 text-red-500 stroke-[2.5]" />
              <span>Withdraw Capital</span>
            </button>

            <button
              onClick={() => onOpenTransfer()}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 active:scale-[0.98] transition-all rounded-lg border border-blue-200 whitespace-nowrap shrink-0"
            >
              <Send className="w-3.5 h-3.5 text-blue-600" />
              <span>Wire / Transfer</span>
            </button>
          </div>
        </div>

        {/* 30-Day Cash Flow Strip */}
        <div className="mt-8 pt-6 border-t border-blue-200/60 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-white/90 border border-blue-100 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>30-Day Inflow</span>
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-xl font-bold font-mono text-blue-700 tabular-nums">
              +${monthlyInflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              <span className="text-[10px] text-slate-500 font-sans ml-1">USD</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/90 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>30-Day Outflow</span>
              <TrendingDown className="w-3.5 h-3.5 text-slate-600" />
            </div>
            <div className="text-xl font-bold font-mono text-slate-800 tabular-nums">
              -${monthlyOutflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              <span className="text-[10px] text-slate-500 font-sans ml-1">USD</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/90 border border-blue-100 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Net Cash Flow</span>
              <DollarSign className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div
              className={`text-xl font-bold font-mono tabular-nums ${
                monthlyInflow >= monthlyOutflow ? 'text-blue-700' : 'text-slate-800'
              }`}
            >
              {monthlyInflow >= monthlyOutflow ? '+' : '-'}$
              {Math.abs(monthlyInflow - monthlyOutflow).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              <span className="text-[10px] text-slate-500 font-sans ml-1">USD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Cards Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900">Commercial Accounts & Vaults</h2>
          <button
            onClick={onNavigateToAccounts}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            View Account Details & Wiring Instructions →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-300 hover:shadow-md transition-all shadow-xs flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {acc.type === 'checking' && <Building className="w-4 h-4" />}
                      {acc.type === 'treasury' && <Vault className="w-4 h-4" />}
                      {acc.type === 'savings' && <Wallet className="w-4 h-4" />}
                    </div>
                    <span className="text-xs font-bold text-slate-800">{acc.name}</span>
                  </div>
                  {acc.apy && acc.apy > 1 && (
                    <span className="text-[11px] font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {acc.apy}% APY
                    </span>
                  )}
                </div>

                <div className="mt-2">
                  <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                    ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                    <span>Account: {acc.accountNumber}</span>
                    <button
                      onClick={(e) => copyAccountNumber(acc, e)}
                      className="hover:text-blue-600 flex items-center gap-1 transition-colors"
                      title="Copy full account number"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedAccountId === acc.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => onOpenDeposit(acc.id)}
                  className="font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  + Deposit
                </button>
                <button
                  onClick={() => onOpenWithdraw(acc.id)}
                  className="font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Withdraw
                </button>
                <button
                  onClick={() => onOpenTransfer(acc.id)}
                  className="font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Transfer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Ledger Section */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Transaction Audit Ledger</h3>
            <p className="text-xs text-slate-500">All cleared deposits, disbursements, and transfers</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipient, memo, ref ID..."
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 w-56 font-sans shadow-2xs"
              />
            </div>

            {/* Segmented Filter Buttons */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md border border-slate-200">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  filterType === 'all'
                    ? 'bg-white text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('deposit')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  filterType === 'deposit'
                    ? 'bg-white text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Deposits
              </button>
              <button
                onClick={() => setFilterType('withdrawal')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  filterType === 'withdrawal'
                    ? 'bg-white text-red-600 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Disbursements
              </button>
              <button
                onClick={() => setFilterType('card_spend')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
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

        {/* Ledger Table */}
        <div className="overflow-x-auto">
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
