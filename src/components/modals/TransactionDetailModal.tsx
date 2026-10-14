import React, { useState } from 'react';
import { CheckCircle2, Clock, Copy, Download, FileText, Shield, X } from 'lucide-react';
import { Transaction } from '../../types/banking';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  accountName?: string;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
  accountName,
}) => {
  const [copied, setCopied] = useState(false);

  if (!transaction) return null;

  const isCredit = transaction.amount > 0;

  const copyRef = () => {
    navigator.clipboard.writeText(transaction.referenceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl text-slate-900 overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Transaction Clearance Audit</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount & Counterparty Banner */}
        <div className="px-6 py-5 text-center bg-blue-50/50 border-b border-blue-100">
          <span
            className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums ${
              isCredit ? 'text-blue-700' : 'text-slate-900'
            }`}
          >
            {isCredit ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            <span className="text-xs font-sans text-slate-500 ml-1.5 font-normal">USD</span>
          </span>
          <p className="mt-1 text-xs font-bold text-slate-900">{transaction.counterparty}</p>
          <div className="mt-2 flex items-center justify-center gap-2 text-xs text-slate-500">
            <span>{transaction.category}</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{transaction.type.replace('_', ' ')}</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 text-blue-700 font-semibold">
              <CheckCircle2 className="w-3 h-3 text-blue-600" />
              Settled
            </span>
          </div>
        </div>

        {/* Ledger Details */}
        <div className="p-6 space-y-3 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-slate-100">
            <span className="text-slate-500">Clearance Reference</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-slate-900 font-semibold text-[11px]">{transaction.referenceId}</span>
              <button
                onClick={copyRef}
                className="p-1 hover:text-blue-700 text-slate-400 transition-colors"
                title="Copy Reference"
              >
                <Copy className="w-3 h-3" />
              </button>
              {copied && <span className="text-[10px] text-blue-600 font-medium">Copied</span>}
            </div>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Target Account</span>
            <span className="text-slate-900 font-semibold">{accountName || 'Primary Operating Account'}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Settlement Channel</span>
            <span className="text-slate-800">{transaction.fundingMethod || 'Direct Federal Clearing'}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Timestamp</span>
            <span className="text-slate-800 font-mono text-[11px]">
              {new Date(transaction.timestamp).toUTCString()}
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Processing Fee</span>
            <span className="text-blue-700 font-mono font-semibold">$0.00 USD (Waived)</span>
          </div>

          {transaction.memo && (
            <div className="pt-2">
              <span className="text-slate-500 block mb-1">Audit Memo</span>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-mono text-[11px]">
                {transaction.memo}
              </div>
            </div>
          )}

          <div className="mt-4 p-2.5 rounded-xl bg-blue-50/40 border border-blue-100 flex items-center justify-between text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Aura Federal Wire Direct Settlement</span>
            </div>
            <span className="font-mono text-[10px] font-semibold text-blue-900">AUTH #8401</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex gap-2">
          <button
            onClick={() => window.print()}
            type="button"
            className="flex-1 py-2 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={onClose}
            type="button"
            className="flex-1 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
