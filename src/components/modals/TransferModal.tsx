import React, { useState } from 'react';
import { ArrowLeftRight, CheckCircle2, ChevronRight, DollarSign, Send, ShieldCheck, X } from 'lucide-react';
import { useBanking } from '../../context/BankingContext';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFromAccountId?: string;
}

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, defaultFromAccountId }) => {
  const { accounts, beneficiaries, transferInternal, transferWire } = useBanking();
  const [transferType, setTransferType] = useState<'internal' | 'wire'>('internal');

  // Internal Transfer State
  const [fromAccountId, setFromAccountId] = useState(defaultFromAccountId || accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || accounts[0]?.id || '');
  const [internalAmount, setInternalAmount] = useState('25000');
  const [internalMemo, setInternalMemo] = useState('');

  // Wire Transfer State
  const [wireSourceAccountId, setWireSourceAccountId] = useState(defaultFromAccountId || accounts[0]?.id || '');
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string>(beneficiaries[0]?.id || 'custom');
  const [customName, setCustomName] = useState('');
  const [customBank, setCustomBank] = useState('');
  const [customRouting, setCustomRouting] = useState('021000021');
  const [customAccount, setCustomAccount] = useState('');
  const [wireSpeed, setWireSpeed] = useState<'Domestic Wire' | 'ACH Transfer'>('Domestic Wire');
  const [wireAmount, setWireAmount] = useState('15000');
  const [wireMemo, setWireMemo] = useState('');
  const [saveBeneficiary, setSaveBeneficiary] = useState(true);

  // Status state
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  if (!isOpen) return null;

  const fromAccount = accounts.find((a) => a.id === fromAccountId) || accounts[0];
  const wireSourceAccount = accounts.find((a) => a.id === wireSourceAccountId) || accounts[0];

  const handleInternalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(internalAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid transfer amount.' });
      return;
    }

    const res = transferInternal({
      fromAccountId,
      toAccountId,
      amount: numAmount,
      memo: internalMemo || undefined,
    });

    if (res.success) {
      setStatusMessage({ type: 'success', text: res.message });
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  const handleWireSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(wireAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid wire amount.' });
      return;
    }

    let bName = customName;
    let bBank = customBank;
    let bRouting = customRouting;
    let bAccount = customAccount;

    if (selectedBeneficiaryId !== 'custom') {
      const ben = beneficiaries.find((b) => b.id === selectedBeneficiaryId);
      if (ben) {
        bName = ben.name;
        bBank = ben.bankName;
        bRouting = ben.routingNumber;
        bAccount = ben.accountNumber;
      }
    }

    if (!bName || !bRouting || !bAccount) {
      setStatusMessage({ type: 'error', text: 'Please provide all recipient banking details.' });
      return;
    }

    const res = transferWire({
      fromAccountId: wireSourceAccountId,
      beneficiaryName: bName,
      routingNumber: bRouting,
      accountNumber: bAccount,
      amount: numAmount,
      memo: wireMemo || undefined,
      wireType: wireSpeed,
      saveBeneficiary,
      bankName: bBank,
    });

    if (res.success) {
      setStatusMessage({ type: 'success', text: res.message });
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  const handleClose = () => {
    setStatusMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={handleClose} />

      <div className="relative w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-slate-200 bg-white shadow-2xl text-slate-900 overflow-hidden z-10 max-h-[92vh] flex flex-col">
        {/* Drag handle */}
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
              <ArrowLeftRight className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Transfer & Wire Desk</h2>
              <p className="text-[11px] text-slate-500">Zero-Latency Transfers · Fedwire</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="px-5 sm:px-6 pt-3.5 sm:pt-4 shrink-0">
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => {
                setTransferType('internal');
                setStatusMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all min-h-[38px] ${
                transferType === 'internal'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Internal Transfer
            </button>
            <button
              type="button"
              onClick={() => {
                setTransferType('wire');
                setStatusMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all min-h-[38px] ${
                transferType === 'wire'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Wire / ACH Recipient
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {statusMessage ? (
            <div className="p-5 sm:p-6 space-y-4">
              <div className="text-center py-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    statusMessage.type === 'success'
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'bg-red-50 text-red-600 border border-red-200'
                  }`}
                >
                  {statusMessage.type === 'success' ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <X className="w-6 h-6" />
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {statusMessage.type === 'success' ? 'Transfer Completed' : 'Transfer Failed'}
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">{statusMessage.text}</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusMessage(null)}
                  className="flex-1 py-3 text-xs font-semibold rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 min-h-[44px]"
                >
                  New Transfer
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-3 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm min-h-[44px]"
                >
                  Done
                </button>
              </div>
            </div>
          ) : transferType === 'internal' ? (
            /* Internal Transfer Form */
            <form onSubmit={handleInternalSubmit} className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">From Account</label>
                  <select
                    value={fromAccountId}
                    onChange={(e) => setFromAccountId(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 shadow-2xs min-h-[44px]"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.accountNumber})
                      </option>
                    ))}
                  </select>
                  <div className="mt-1 text-[11px] font-mono text-slate-500 tabular-nums">
                    Avail: ${fromAccount?.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">To Destination Account</label>
                  <select
                    value={toAccountId}
                    onChange={(e) => setToAccountId(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 shadow-2xs min-h-[44px]"
                  >
                    {accounts
                      .filter((a) => a.id !== fromAccountId)
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.accountNumber})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Transfer Amount (USD)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-600 font-bold">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    step="any"
                    value={internalAmount}
                    onChange={(e) => setInternalAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-12 py-2.5 text-lg font-mono font-bold bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 tabular-nums shadow-2xs min-h-[44px]"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs font-mono font-medium text-slate-400">
                    USD
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Memo / Note</label>
                <input
                  type="text"
                  value={internalMemo}
                  onChange={(e) => setInternalMemo(e.target.value)}
                  placeholder="e.g. Allocation to Treasury Yield vault"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 shadow-2xs min-h-[40px]"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] text-slate-600 flex items-center justify-between">
                <span>Speed: Instantaneous (0s)</span>
                <span className="text-blue-700 font-mono font-bold">Fee: $0.00 USD</span>
              </div>

              <div className="pt-2 pb-4">
                <button
                  type="submit"
                  className="w-full py-3 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] rounded-xl transition-all shadow-sm shadow-blue-600/20 min-h-[44px]"
                >
                  Transfer Funds Now
                </button>
              </div>
            </form>
          ) : (
            /* Wire Transfer Form */
            <form onSubmit={handleWireSubmit} className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Disburse From Account</label>
                <select
                  value={wireSourceAccountId}
                  onChange={(e) => setWireSourceAccountId(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 shadow-2xs min-h-[44px]"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.accountNumber}) — ${a.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Beneficiary</label>
                <select
                  value={selectedBeneficiaryId}
                  onChange={(e) => setSelectedBeneficiaryId(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 shadow-2xs min-h-[44px]"
                >
                  {beneficiaries.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.bankName} · {b.accountNumber})
                    </option>
                  ))}
                  <option value="custom">+ New Unsaved Payee</option>
                </select>
              </div>

              {selectedBeneficiaryId === 'custom' && (
                <div className="space-y-3 p-3.5 rounded-xl bg-blue-50/50 border border-blue-100">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Beneficiary Legal Name</label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. Acme Tech Solutions LLC"
                      className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 min-h-[40px]"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={customBank}
                        onChange={(e) => setCustomBank(e.target.value)}
                        placeholder="e.g. JPMorgan Chase Bank"
                        className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 min-h-[40px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">ABA Routing (9 Digits)</label>
                      <input
                        type="text"
                        maxLength={9}
                        value={customRouting}
                        onChange={(e) => setCustomRouting(e.target.value)}
                        placeholder="021000021"
                        className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 font-mono min-h-[40px]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Account Number</label>
                    <input
                      type="text"
                      value={customAccount}
                      onChange={(e) => setCustomAccount(e.target.value)}
                      placeholder="e.g. 9840291048"
                      className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 font-mono min-h-[40px]"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Wire Amount (USD)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-blue-600 font-bold">
                      <DollarSign className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="number"
                      step="any"
                      value={wireAmount}
                      onChange={(e) => setWireAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-7 pr-3 py-2 text-base font-mono font-bold bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 tabular-nums shadow-2xs min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Speed</label>
                  <select
                    value={wireSpeed}
                    onChange={(e) => setWireSpeed(e.target.value as any)}
                    className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 shadow-2xs min-h-[44px]"
                  >
                    <option value="Domestic Wire">Same-Day Fedwire</option>
                    <option value="ACH Transfer">Next-Day ACH</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Invoice / Memo Ref</label>
                <input
                  type="text"
                  value={wireMemo}
                  onChange={(e) => setWireMemo(e.target.value)}
                  placeholder="e.g. INV-2026-4029"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 shadow-2xs min-h-[40px]"
                />
              </div>

              <div className="pt-2 pb-4">
                <button
                  type="submit"
                  className="w-full py-3 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] rounded-xl transition-all shadow-sm shadow-blue-600/20 min-h-[44px]"
                >
                  Authorize & Dispatch Wire
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
