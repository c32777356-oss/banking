import React, { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Building2, Check, Copy, Download, FileText, Info, Send, ShieldCheck, Vault, Wallet } from 'lucide-react';
import { useBanking } from '../../context/BankingContext';
import { Account } from '../../types/banking';

interface AccountsViewProps {
  onOpenDeposit: (accountId: string) => void;
  onOpenWithdraw: (accountId: string) => void;
  onOpenTransfer: (accountId: string) => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  onOpenDeposit,
  onOpenWithdraw,
  onOpenTransfer,
}) => {
  const { accounts, user } = useBanking();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Accounts & Vault Portfolios
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            FDIC Insured multi-tiered corporate and wealth reserve facilities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-700 font-mono font-medium">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Primary Routing # 021000021</span>
          </div>
        </div>
      </div>

      {/* Account Cards List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {accounts.map((acc) => {
          return (
            <div
              key={acc.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Account Type Banner */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
                      {acc.type === 'checking' && <Building2 className="w-4 h-4" />}
                      {acc.type === 'treasury' && <Vault className="w-4 h-4" />}
                      {acc.type === 'savings' && <Wallet className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{acc.name}</h3>
                      <p className="text-[11px] text-slate-500 font-mono">{acc.accountNumber}</p>
                    </div>
                  </div>
                  {acc.apy && acc.apy > 1 && (
                    <span className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {acc.apy}% APY
                    </span>
                  )}
                </div>

                {/* Available Balance */}
                <div className="py-5">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-mono font-medium">
                    Available USD Balance
                  </span>
                  <div className="text-3xl font-bold font-mono text-slate-900 tabular-nums mt-1">
                    ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Currency: United States Dollar (USD)
                  </p>
                </div>

                {/* Banking Identifiers */}
                <div className="space-y-2.5 p-3 rounded-xl bg-blue-50/50 border border-blue-100/80 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Full Account Number</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-slate-900 font-medium">{acc.fullAccountNumber}</span>
                      <button
                        onClick={() => copyToClipboard(acc.fullAccountNumber, `acc_${acc.id}`)}
                        className="p-1 hover:text-blue-600 text-slate-400 transition-colors"
                      >
                        {copiedKey === `acc_${acc.id}` ? <Check className="w-3 h-3 text-blue-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Fedwire / ACH Routing</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-slate-900 font-medium">{acc.routingNumber}</span>
                      <button
                        onClick={() => copyToClipboard(acc.routingNumber, `rtn_${acc.id}`)}
                        className="p-1 hover:text-blue-600 text-slate-400 transition-colors"
                      >
                        {copiedKey === `rtn_${acc.id}` ? <Check className="w-3 h-3 text-blue-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">SWIFT / BIC Code</span>
                    <span className="font-mono text-slate-900 font-medium">AURAUS33NYC</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Daily Withdrawal Cap</span>
                    <span className="font-mono text-slate-900 font-medium tabular-nums">
                      ${acc.dailyWithdrawalLimit.toLocaleString()} USD
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => onOpenDeposit(acc.id)}
                  className="flex-1 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-blue-600/20"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Deposit</span>
                </button>
                <button
                  onClick={() => onOpenWithdraw(acc.id)}
                  className="flex-1 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-red-500" />
                  <span>Withdraw</span>
                </button>
                <button
                  onClick={() => onOpenTransfer(acc.id)}
                  className="py-2 px-3 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
                  title="Transfer"
                >
                  <Send className="w-3.5 h-3.5 text-blue-600" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Wire Receiving Details Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600" />
          Domestic & International Wire Settlement Instructions
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Provide these exact credentials to external institutions or clients sending USD wires to your Aura Bank account.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block font-sans font-medium">Beneficiary Bank</span>
            <span className="text-slate-900 font-semibold mt-1 block">Aura Commercial Bank N.A.</span>
            <span className="text-[11px] text-slate-500 block font-sans">55 Wall Street, New York, NY</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block font-sans font-medium">ABA Fedwire Routing</span>
            <span className="text-slate-900 font-semibold mt-1 block">021000021</span>
            <span className="text-[11px] text-blue-700 font-medium block font-sans">Direct Fedwire participant</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block font-sans font-medium">SWIFT / BIC (Cross-Border)</span>
            <span className="text-slate-900 font-semibold mt-1 block">AURAUS33NYC</span>
            <span className="text-[11px] text-slate-500 block font-sans">USD Global Settlement</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block font-sans font-medium">Account Beneficiary</span>
            <span className="text-slate-900 font-semibold mt-1 block truncate">{user?.name}</span>
            <span className="text-[11px] text-slate-500 block font-sans truncate">{user?.company}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
