import React, { useState } from 'react';
import { AlertCircle, ArrowUpRight, CheckCircle2, Copy, DollarSign, Lock, ShieldAlert, X } from 'lucide-react';
import { useBanking } from '../../context/BankingContext';
import { Transaction } from '../../types/banking';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAccountId?: string;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose, defaultAccountId }) => {
  const { accounts, withdraw, user } = useBanking();
  const [selectedAccountId, setSelectedAccountId] = useState(
    defaultAccountId || accounts[0]?.id || ''
  );
  const [amount, setAmount] = useState<string>('5000');
  const [destination, setDestination] = useState<string>('JPMorgan Chase Operating Checking (•••• 8820)');
  const [memo, setMemo] = useState<string>('');
  const [securityPin, setSecurityPin] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [completedTxn, setCompletedTxn] = useState<Transaction | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sourceAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];
  const remainingDailyLimit = sourceAccount
    ? Math.max(0, sourceAccount.dailyWithdrawalLimit - sourceAccount.withdrawnToday)
    : 0;

  const handlePercentageClick = (percent: number) => {
    if (!sourceAccount) return;
    const calculated = (sourceAccount.balance * (percent / 100));
    setAmount(Math.min(calculated, remainingDailyLimit).toFixed(2));
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid withdrawal amount greater than $0.00 USD.' });
      return;
    }

    if (numAmount > sourceAccount.balance) {
      setStatusMessage({
        type: 'error',
        text: `Insufficient funds. Available balance in ${sourceAccount.name} is $${sourceAccount.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD.`,
      });
      return;
    }

    if (numAmount > remainingDailyLimit) {
      setStatusMessage({
        type: 'error',
        text: `Requested amount exceeds remaining daily withdrawal limit ($${remainingDailyLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD).`,
      });
      return;
    }

    const res = withdraw({
      accountId: selectedAccountId,
      amount: numAmount,
      destination,
      memo: memo || undefined,
    });

    if (res.success && res.transaction) {
      setStatusMessage({ type: 'success', text: res.message });
      setCompletedTxn(res.transaction);
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  const handleResetAndClose = () => {
    setStatusMessage(null);
    setCompletedTxn(null);
    setAmount('5000');
    setMemo('');
    setSecurityPin('');
    onClose();
  };

  const copyRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={handleResetAndClose} />

      {/* Modal Dialog / Bottom Sheet on Mobile */}
      <div className="relative w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-slate-200 bg-white shadow-2xl text-slate-900 overflow-hidden z-10 max-h-[92vh] flex flex-col">
        {/* Mobile Drag Indicator */}
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Withdraw Capital (USD)</h2>
              <p className="text-[11px] text-slate-500">Fedwire · ACH Clearance</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {completedTxn ? (
            /* Receipt State */
            <div className="p-5 sm:p-6 space-y-4 sm:space-y-5">
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto mb-2.5">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Withdrawal Dispatched</h3>
                <p className="text-xs text-slate-500 mt-0.5">Funds debited from your account</p>
                <div className="mt-2.5 text-2xl sm:text-3xl font-bold font-mono text-slate-900 tabular-nums">
                  -${Math.abs(completedTxn.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  <span className="text-xs text-slate-500 font-sans ml-1 font-normal">USD</span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Debited Account</span>
                  <span className="font-semibold text-slate-900 truncate max-w-[180px]">{sourceAccount?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Remaining Balance</span>
                  <span className="font-mono font-bold text-blue-700 tabular-nums">
                    ${sourceAccount?.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Beneficiary</span>
                  <span className="text-slate-800 font-medium truncate max-w-[180px]">{completedTxn.counterparty}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Fedwire Reference</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-slate-900 text-[11px] font-semibold">{completedTxn.referenceId}</span>
                    <button
                      onClick={() => copyRef(completedTxn.referenceId)}
                      className="p-1 hover:text-blue-700 text-slate-400 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    {copied && <span className="text-[10px] text-blue-600 font-medium">Copied</span>}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCompletedTxn(null);
                    setStatusMessage(null);
                  }}
                  className="flex-1 py-3 text-xs font-semibold rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors min-h-[44px]"
                >
                  Withdraw Another
                </button>
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="flex-1 py-3 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm shadow-blue-600/20 min-h-[44px]"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Withdrawal Form */
            <form onSubmit={handleWithdrawSubmit} className="p-5 sm:p-6 space-y-4">
              {statusMessage && statusMessage.type === 'error' && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{statusMessage.text}</span>
                </div>
              )}

              {/* Source Account */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Source Account
                  </label>
                  <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                    Avail: ${sourceAccount?.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 font-sans shadow-2xs min-h-[44px]"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.accountNumber}) — ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </option>
                  ))}
                </select>
              </div>

              {/* Daily Threshold Indicator */}
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-600 font-medium">Daily Limit Allowance</span>
                  <span className="font-mono text-slate-900 font-bold tabular-nums">
                    ${(sourceAccount?.withdrawnToday || 0).toLocaleString()} / ${sourceAccount?.dailyWithdrawalLimit.toLocaleString()} USD
                  </span>
                </div>
                <div className="w-full bg-blue-200/60 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        ((sourceAccount?.withdrawnToday || 0) / (sourceAccount?.dailyWithdrawalLimit || 1)) * 100
                      )}%`,
                    }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Remaining today: ${remainingDailyLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                </p>
              </div>

              {/* Amount */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">Withdrawal Amount (USD)</label>
                  <span className="text-[11px] text-slate-500">Fedwire Dispatch</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 font-bold">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    max={sourceAccount?.balance}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-12 py-2.5 text-lg font-mono font-bold bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 tabular-nums shadow-2xs min-h-[44px]"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs font-mono text-slate-400">
                    USD
                  </div>
                </div>

                {/* Percentage Buttons */}
                <div className="grid grid-cols-4 gap-1.5 mt-2">
                  {[10, 25, 50, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handlePercentageClick(pct)}
                      className="py-2 text-[11px] font-mono font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors min-h-[36px] text-center"
                    >
                      {pct === 100 ? 'Max' : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Destination Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Destination Routing
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 shadow-2xs min-h-[44px]"
                >
                  <option value="JPMorgan Chase Operating Checking (•••• 8820)">
                    JPMorgan Chase (•••• 8820) — Linked
                  </option>
                  <option value="Bank of America Corporate Escrow (•••• 1948)">
                    Bank of America (•••• 1948) — Linked
                  </option>
                  <option value="Morgan Stanley Wealth Account (•••• 4410)">
                    Morgan Stanley (•••• 4410) — Linked
                  </option>
                  <option value="Domestic Fedwire Direct Payee">
                    Ad-hoc Outgoing Fedwire
                  </option>
                </select>
              </div>

              {/* Memo */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Memo Note
                </label>
                <input
                  type="text"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="e.g. Escrow disbursement"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-2xs min-h-[40px]"
                />
              </div>

              {/* Security PIN Authorization */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-600" />
                    Security PIN
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">Demo: 4892</span>
                </div>
                <input
                  type="password"
                  maxLength={6}
                  value={securityPin}
                  onChange={(e) => setSecurityPin(e.target.value)}
                  placeholder="Enter 4-digit PIN (4892)"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 font-mono tracking-widest shadow-2xs min-h-[44px]"
                />
              </div>

              {/* Submit */}
              <div className="pt-2 pb-4">
                <button
                  type="submit"
                  className="w-full py-3 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] rounded-xl transition-all shadow-sm shadow-blue-600/20 min-h-[44px]"
                >
                  Authorize & Disburse Capital
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
