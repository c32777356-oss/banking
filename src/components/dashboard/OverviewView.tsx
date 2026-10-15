import React, { useState } from 'react';
import {
  ArrowDownLeft,
  CheckCircle2,
  Copy,
  DollarSign,
  Search,
  Send,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { useBanking } from '../../context/BankingContext';
import { Account, Transaction, TransactionType } from '../../types/banking';
import { TransactionDetailModal } from '../modals/TransactionDetailModal';

interface OverviewViewProps {
  onOpenDeposit: () => void;
  onOpenTransfer: () => void;
  onNavigateToProfile: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onOpenDeposit,
  onOpenTransfer,
  onNavigateToProfile,
}) => {
  const {
    user,
    accounts,
    transactions,
    totalNetWorth,
  } = useBanking();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);

  const primaryAccount = accounts[0];

  const copyAccountNumber = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!primaryAccount) return;
    navigator.clipboard.writeText(primaryAccount.fullAccountNumber);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
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
      {/* Balance & Quick Actions Hero */}
      <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-br from-white via-blue-50/40 to-blue-100/30 p-5 sm:p-7 lg:p-8 relative overflow-hidden shadow-xs">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 blur-3xl rounded-full pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-500">
              <span className="font-semibold text-slate-800">{user?.name}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-600">{user?.company}</span>
              <span aria-hidden="true" className="hidden xs:inline">·</span>
              <span className="text-blue-700 font-mono font-semibold hidden xs:inline">FDIC Insured</span>
            </div>

            <div className="mt-2">
              <span className="text-xs uppercase tracking-wider text-slate-500 font-mono font-medium block">
                Total Available Balance
              </span>
              <div className="flex items-baseline gap-2 sm:gap-3 mt-0.5">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
                  ${totalNetWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h1>
                <span className="text-sm font-semibold text-slate-500 font-sans">USD</span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-slate-600 font-mono">
                <span>Account:</span>
                <span className="font-semibold text-slate-800">{primaryAccount?.accountNumber || '•••• 4892'}</span>
                <button
                  onClick={copyAccountNumber}
                  className="p-1 hover:text-blue-600 text-slate-400 transition-colors ml-1"
                  title="Copy full account number"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {copiedAccount && <span className="text-[10px] text-blue-600 font-medium">Copied</span>}
              </div>
              <span className="text-slate-300 hidden sm:inline">|</span>
              <div className="flex items-center gap-1 text-slate-600 font-mono">
                <span>Routing:</span>
                <span className="font-semibold text-slate-800">021000021</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Deposit & Transfer ONLY */}
          <div className="grid grid-cols-2 gap-3 w-full sm:w-auto sm:flex sm:items-center">
            <button
              onClick={onOpenDeposit}
              className="flex items-center justify-center gap-2 py-3 px-5 min-h-[46px] text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all rounded-xl shadow-sm shadow-blue-600/20 text-center"
            >
              <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
              <span>Deposit Funds</span>
            </button>

            <button
              onClick={onOpenTransfer}
              className="flex items-center justify-center gap-2 py-3 px-5 min-h-[46px] text-xs font-semibold text-blue-700 bg-white hover:bg-blue-50 active:scale-[0.98] transition-all rounded-xl border border-blue-200 shadow-2xs text-center"
            >
              <Send className="w-4 h-4 text-blue-600" />
              <span>Transfer Funds</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Transaction History</h3>
            <p className="text-xs text-slate-500">Record of cleared deposits, transfers, and disbursements</p>
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
                className="w-full sm:w-56 pl-8 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-2xs min-h-[38px]"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filterType === 'all'
                    ? 'bg-white text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('deposit')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filterType === 'deposit'
                    ? 'bg-white text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Deposits
              </button>
              <button
                onClick={() => setFilterType('transfer')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filterType === 'transfer'
                    ? 'bg-white text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Transfers
              </button>
            </div>
          </div>
        </div>

        {/* Mobile View: Clean Touch List Rows */}
        <div className="sm:hidden divide-y divide-slate-100">
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-slate-500">
                {transactions.length === 0
                  ? 'No transaction records found'
                  : 'No transactions match the selected filter'}
              </p>
              <p className="text-[11px] text-slate-400">
                {transactions.length === 0
                  ? 'This account is brand new and clean with zero prior activity.'
                  : 'Try adjusting your search query or filter criteria.'}
              </p>
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
                      {isCredit ? <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" /> : <Send className="w-4 h-4" />}
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

        {/* Desktop View: Clean Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 bg-slate-50">
                <th className="py-3 px-4 font-semibold">Date & Time</th>
                <th className="py-3 px-4 font-semibold">Counterparty / Description</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Method</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Amount (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 space-y-1">
                    <p className="font-semibold text-slate-500">
                      {transactions.length === 0
                        ? 'No transaction records found'
                        : 'No transactions match the selected filter.'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {transactions.length === 0
                        ? 'This account is brand new and clean with zero prior activity.'
                        : 'Try adjusting your search query or filter criteria.'}
                    </p>
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
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                        <span className="text-slate-400 ml-1.5 hidden sm:inline">
                          {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-800">
                        <div className="truncate max-w-xs">{txn.counterparty}</div>
                        {txn.memo && (
                          <p className="text-[10px] text-slate-500 truncate max-w-xs font-mono font-normal">
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

      {/* Transaction Detail Slip Modal */}
      <TransactionDetailModal
        transaction={selectedTxn}
        onClose={() => setSelectedTxn(null)}
        accountName={primaryAccount?.name || 'Primary Operating Account'}
      />
    </div>
  );
};
