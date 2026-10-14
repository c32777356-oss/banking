import React, { useState } from 'react';
import { ArrowLeftRight, CheckCircle2, ChevronRight, Clock, Plus, Search, Send, ShieldCheck, UserCheck } from 'lucide-react';
import { useBanking } from '../../context/BankingContext';
import { Beneficiary } from '../../types/banking';

interface TransfersViewProps {
  onOpenTransfer: () => void;
}

export const TransfersView: React.FC<TransfersViewProps> = ({ onOpenTransfer }) => {
  const { beneficiaries, transactions, addBeneficiary } = useBanking();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Add Beneficiary form state
  const [name, setName] = useState('');
  const [bankName, setBankName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('021000021');
  const [accountNumber, setAccountNumber] = useState('');
  const [type, setType] = useState<'Domestic Wire' | 'ACH Transfer'>('Domestic Wire');

  const wireTransactions = transactions.filter(
    (t) => t.type === 'transfer' || t.category === 'Wire Transfers' || t.fundingMethod?.includes('Wire')
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !bankName || !accountNumber) return;
    addBeneficiary({
      name,
      bankName,
      routingNumber,
      accountNumber: `•••• ${accountNumber.slice(-4)}`,
      type,
    });
    setIsAddModalOpen(false);
    setName('');
    setBankName('');
    setAccountNumber('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Transfers & Wire Desk
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Federal Reserve Fedwire settlement and automated ACH commercial payments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-300 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Beneficiary</span>
          </button>
          <button
            onClick={onOpenTransfer}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-600/20 transition-all"
          >
            <Send className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Initiate Transfer</span>
          </button>
        </div>
      </div>

      {/* Beneficiaries Directory */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Verified Commercial Beneficiaries</h2>
            <p className="text-xs text-slate-500">Pre-authenticated counterparties for zero-delay wire clearance</p>
          </div>
          <span className="text-xs text-blue-700 font-mono font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            {beneficiaries.length} Enrolled
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {beneficiaries.map((b) => (
            <div
              key={b.id}
              className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between hover:border-blue-300 hover:bg-blue-50/30 transition-all shadow-2xs"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold text-slate-900 truncate">{b.name}</span>
                  <span className="text-[10px] font-mono font-semibold text-blue-700">{b.type}</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 truncate">{b.bankName}</p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">Acct: {b.accountNumber}</p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500">
                <span>Last wired: {b.lastUsed || 'Recent'}</span>
                <button
                  onClick={onOpenTransfer}
                  className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                >
                  Send Wire →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wire Transfer Activity Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Wire & Internal Transfer Log</h3>
            <p className="text-xs text-slate-500">Dispatches through Federal Reserve Fedwire & Book transfers</p>
          </div>
          <span className="text-xs font-mono text-slate-500">{wireTransactions.length} Total Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 bg-slate-50">
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Clearance Reference</th>
                <th className="py-3 px-4 font-semibold">Recipient / Destination</th>
                <th className="py-3 px-4 font-semibold">Settlement Method</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Amount (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {wireTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No wire transfers recorded yet.
                  </td>
                </tr>
              ) : (
                wireTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(t.timestamp).toLocaleDateString()} {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-700 whitespace-nowrap">
                      {t.referenceId}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div>{t.counterparty}</div>
                      {t.memo && <div className="text-[10px] text-slate-500 font-mono font-normal">{t.memo}</div>}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {t.fundingMethod || 'Fedwire Service'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] text-blue-700 font-medium">
                        <CheckCircle2 className="w-3 h-3 text-blue-600" />
                        Dispatched
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-sm whitespace-nowrap">
                      <span className={t.amount > 0 ? 'text-blue-700' : 'text-slate-800'}>
                        {t.amount > 0 ? '+' : '-'}${Math.abs(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Beneficiary Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-t-3xl sm:rounded-2xl border border-slate-200 bg-white shadow-2xl p-6 text-slate-900 z-10 max-h-[92vh] overflow-y-auto">
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto -mt-2 mb-3 sm:hidden" />
            <h3 className="text-base font-bold text-slate-900 mb-1">Add Commercial Wire Beneficiary</h3>
            <p className="text-xs text-slate-500 mb-4">Register account for instant domestic transfers</p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Legal Beneficiary Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Goldman Sachs Asset Management"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Receiving Institution Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. BNY Mellon, N.A."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">ABA Routing (9 Digits)</label>
                  <input
                    type="text"
                    maxLength={9}
                    value={routingNumber}
                    onChange={(e) => setRoutingNumber(e.target.value)}
                    placeholder="021000021"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Account Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="849201948"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Default Clearance Speed</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="Domestic Wire">Same-Day Domestic Fedwire</option>
                  <option value="ACH Transfer">Next-Day Corporate ACH</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 text-xs font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20"
                >
                  Enroll Beneficiary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
