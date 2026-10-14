import React, { useState } from 'react';
import { ArrowDownLeft, CheckCircle2, ChevronRight, Copy, DollarSign, Shield, X } from 'lucide-react';
import { useBanking } from '../../context/BankingContext';
import { Transaction } from '../../types/banking';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAccountId?: string;
}

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, defaultAccountId }) => {
  const { accounts, deposit } = useBanking();
  const [selectedAccountId, setSelectedAccountId] = useState(
    defaultAccountId || accounts[0]?.id || ''
  );
  const [amount, setAmount] = useState<string>('10000');
  const [fundingMethod, setFundingMethod] = useState<string>('Fedwire Real-Time Inbound');
  const [memo, setMemo] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [completedTxn, setCompletedTxn] = useState<Transaction | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const quickAmounts = [1000, 5000, 25000, 100000];

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid deposit amount greater than $0.00 USD.' });
      return;
    }

    const res = deposit({
      accountId: selectedAccountId,
      amount: numAmount,
      fundingMethod,
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
    setAmount('10000');
    setMemo('');
    onClose();
  };

  const targetAccount = accounts.find((a) => a.id === selectedAccountId);

  const copyRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={handleResetAndClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl text-slate-900 overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Deposit Capital (USD)</h2>
              <p className="text-[11px] text-slate-500">Fedwire · ACH Credit · Real-Time Settlement</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {completedTxn ? (
          /* Receipt State */
          <div className="p-6 space-y-5">
            <div className="text-center py-2">
              <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Deposit Successfully Credited</h3>
              <p className="text-xs text-slate-500 mt-0.5">Funds are immediately available in your balance</p>
              <div className="mt-3 text-3xl font-bold font-mono text-blue-700 tabular-nums">
                +${completedTxn.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                <span className="text-xs text-slate-500 font-sans ml-1 font-normal">USD</span>
              </div>
            </div>

            <div className="rounded-xl bg-blue-50/60 border border-blue-100 p-4 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Destination Account</span>
                <span className="font-semibold text-slate-900">{targetAccount?.name} ({targetAccount?.accountNumber})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">New Available Balance</span>
                <span className="font-mono font-bold text-blue-700 tabular-nums">
                  ${targetAccount?.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Settlement Method</span>
                <span className="text-slate-800">{completedTxn.counterparty}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Reference Tracking ID</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-slate-900 text-[11px] font-semibold">{completedTxn.referenceId}</span>
                  <button
                    onClick={() => copyRef(completedTxn.referenceId)}
                    className="p-1 hover:text-blue-700 text-slate-400 transition-colors"
                    title="Copy Reference"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  {copied && <span className="text-[10px] text-blue-600 font-medium">Copied</span>}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Timestamp</span>
                <span className="text-slate-700 font-mono text-[11px]">
                  {new Date(completedTxn.timestamp).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setCompletedTxn(null);
                  setStatusMessage(null);
                }}
                className="flex-1 py-2 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors"
              >
                Make Another Deposit
              </button>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="flex-1 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm shadow-blue-600/20"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Deposit Form */
          <form onSubmit={handleDepositSubmit} className="p-6 space-y-4">
            {statusMessage && statusMessage.type === 'error' && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {statusMessage.text}
              </div>
            )}

            {/* Account Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Deposit Destination Account
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-600 font-sans shadow-2xs"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.accountNumber}) — Available: ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                  </option>
                ))}
              </select>
            </div>

            {/* Deposit Amount Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-700">Deposit Amount (USD)</label>
                <span className="text-[11px] text-blue-700 font-medium">Zero Processing Fees</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-600 font-bold">
                  <DollarSign className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  step="any"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-12 py-2.5 text-base font-mono font-bold bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 tabular-nums shadow-2xs"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs font-mono font-medium text-slate-400">
                  USD
                </div>
              </div>

              {/* Quick Suggestion Chips */}
              <div className="flex gap-2 mt-2">
                {quickAmounts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setAmount(q.toString())}
                    className="flex-1 py-1 text-[11px] font-mono font-semibold rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
                  >
                    +${q >= 1000 ? `${q / 1000}k` : q}
                  </button>
                ))}
              </div>
            </div>

            {/* Funding Method */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Originating Settlement Channel
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'Fedwire Real-Time Inbound', title: 'Fedwire Funds Service', desc: 'Instant availability' },
                  { id: 'Pre-linked External ACH', title: 'ACH Direct Debit', desc: 'Zero cost ACH' },
                  { id: 'Treasury Clearing Wire', title: 'Institutional Wire', desc: 'Large ticket settlement' },
                  { id: 'Corporate Debit Settlement', title: 'Card Network Push', desc: 'Instant authorization' },
                ].map((channel) => (
                  <button
                    key={channel.id}
                    type="button"
                    onClick={() => setFundingMethod(channel.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      fundingMethod === channel.id
                        ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold">{channel.title}</div>
                    <div className="text-[10px] text-slate-500">{channel.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Reference Memo */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Transaction Memo (Optional)
              </label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="e.g. Q4 Capital Call Distribution"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-2xs"
              />
            </div>

            {/* Compliance Note */}
            <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-[11px] text-slate-600 flex items-start gap-2">
              <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Deposits are routed through the Federal Reserve Fedwire system or ACH clearing house with automated anti-money laundering (AML) verification and instant credit.
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] rounded-md transition-all shadow-sm shadow-blue-600/20"
              >
                Confirm & Execute Deposit
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
