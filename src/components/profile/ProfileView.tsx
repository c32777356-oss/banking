import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Copy,
  Headset,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  Sliders,
  User,
} from 'lucide-react';
import { useBanking } from '../../context/BankingContext';

interface ProfileViewProps {
  onNavigateToAdmin?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onNavigateToAdmin }) => {
  const { user, accounts, isAdminMode } = useBanking();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const isAdmin = user?.id === 'usr_admin' || isAdminMode;

  const primaryAccount = accounts[0];

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Account Owner Profile
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Verified institutional client identity, security parameters, and banking credentials
          </p>
        </div>

        {onNavigateToAdmin && isAdmin && (
          <button
            onClick={onNavigateToAdmin}
            className="self-start sm:self-center flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Open Admin Panel</span>
          </button>
        )}
      </div>

      {/* Main Profile Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center text-2xl font-bold font-mono shadow-xs shrink-0">
              {user?.avatarInitials || 'AV'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">{user?.name}</h2>
                <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Verified
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">{user?.company}</p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">{user?.tier} Client</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-800">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-medium">Verified Commercial Client Profile</span>
          </div>
        </div>

        {/* Detailed Owner Attributes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Contact & Entity Information
            </h3>

            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Legal Full Name</span>
                <span className="font-semibold text-slate-900">{user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Commercial Entity</span>
                <span className="font-semibold text-slate-900">{user?.company}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Official Email</span>
                <span className="font-mono text-slate-900">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Authorized Phone</span>
                <span className="font-mono text-slate-900">{user?.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Client Since</span>
                <span className="text-slate-900">{user?.memberSince}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Primary Account Credentials
            </h3>

            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Primary Account</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-slate-900 font-semibold">{primaryAccount?.fullAccountNumber}</span>
                  <button
                    onClick={() => copyToClipboard(primaryAccount?.fullAccountNumber || '', 'acct')}
                    className="p-1 hover:text-blue-600 text-slate-400 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  {copiedKey === 'acct' && <span className="text-[10px] text-blue-600 font-medium">Copied</span>}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">ABA Fedwire Routing</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-slate-900 font-semibold">021000021</span>
                  <button
                    onClick={() => copyToClipboard('021000021', 'rtn')}
                    className="p-1 hover:text-blue-600 text-slate-400 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  {copiedKey === 'rtn' && <span className="text-[10px] text-blue-600 font-medium">Copied</span>}
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">SWIFT / BIC</span>
                <span className="font-mono text-slate-900 font-semibold">AURAUS33NYC</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Charter Bank</span>
                <span className="text-slate-900">Aura Commercial Bank N.A.</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">FDIC Certificate</span>
                <span className="font-mono text-blue-700 font-semibold">#34910</span>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Service Provider Contact Card */}
        <div className="mt-6 p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Headset className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Dedicated Service Provider Assigned</p>
              <p className="text-[11px] text-slate-600">
                Institutional Banking Relationship Desk · Available for balance authorization & wires
              </p>
            </div>
          </div>
          <div className="text-xs font-mono font-semibold text-blue-700 shrink-0">
            +1 (800) 555-AURA · service@aurabank.com
          </div>
        </div>
      </div>
    </div>
  );
};
