import React, { useState } from 'react';
import { Check, Copy, Headset, Mail, Phone, ShieldAlert, X } from 'lucide-react';
import { useBanking } from '../../context/BankingContext';

interface ContactServiceProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: 'deposit' | 'transfer' | null;
}

export const ContactServiceProviderModal: React.FC<ContactServiceProviderModalProps> = ({
  isOpen,
  onClose,
  actionType,
}) => {
  const { user, accounts } = useBanking();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const actionName = actionType === 'deposit' ? 'Deposit' : 'Transfer';
  const primaryAccount = accounts[0];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog / Mobile Bottom Sheet */}
      <div className="relative w-full max-w-md rounded-t-3xl sm:rounded-2xl border border-slate-200 bg-white shadow-2xl text-slate-900 overflow-hidden z-10 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Mobile drag handle indicator */}
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
              <Headset className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {actionName} Notice
              </h2>
              <p className="text-[11px] text-slate-500">Service Provider Authorization Required</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* Main Headline Notice */}
          <div className="text-center py-2">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <ShieldAlert className="w-7 h-7 text-blue-600 stroke-[2.2]" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Contact service provider to continue
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed max-w-xs mx-auto">
              To proceed with your <span className="font-semibold text-slate-700">{actionName.toLowerCase()}</span>, please reach out to your assigned institutional service provider or dedicated desk representative.
            </p>
          </div>

          {/* Account Verification Summary */}
          <div className="rounded-xl bg-blue-50/70 border border-blue-100 p-3.5 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Account Owner</span>
              <span className="font-semibold text-slate-900">{user?.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Account Number</span>
              <span className="font-mono font-semibold text-slate-800">{primaryAccount?.accountNumber || '•••• 4892'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Routing Number</span>
              <span className="font-mono font-medium text-slate-800">021000021</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Request Reference</span>
              <span className="font-mono text-blue-700 font-bold bg-white px-1.5 py-0.5 rounded border border-blue-200">
                AUTH-77356-USD
              </span>
            </div>
          </div>

          {/* Official Contact Methods */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block font-mono">
              Assigned Service Contacts
            </span>

            {/* Telephone Contact */}
            <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Direct Telephone Desk</p>
                  <a
                    href="tel:+18005552872"
                    className="text-[11px] text-blue-700 font-mono font-medium hover:underline"
                  >
                    +1 (800) 555-AURA (2872)
                  </a>
                </div>
              </div>
              <button
                onClick={() => handleCopy('+18005552872', 'phone')}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                title="Copy phone"
              >
                {copiedKey === 'phone' ? (
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Email Contact */}
            <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Treasury Relationship Email</p>
                  <a
                    href="mailto:service@aurabank.com"
                    className="text-[11px] text-blue-700 font-mono font-medium hover:underline"
                  >
                    service@aurabank.com
                  </a>
                </div>
              </div>
              <button
                onClick={() => handleCopy('service@aurabank.com', 'email')}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                title="Copy email"
              >
                {copiedKey === 'email' ? (
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-3 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] rounded-xl transition-all shadow-sm shadow-blue-600/20 min-h-[44px]"
            >
              Understood
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
