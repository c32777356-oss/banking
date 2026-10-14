import React, { useState } from 'react';
import { ArrowDownLeft, Building2, ChevronDown, LogOut, RefreshCw, Send, Shield, User } from 'lucide-react';
import { useBanking } from '../../context/BankingContext';
import { DEMO_PERSONAS } from '../../data/mockData';

export type NavTab = 'dashboard' | 'profile';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenDeposit: () => void;
  onOpenTransfer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenDeposit,
  onOpenTransfer,
}) => {
  const { user, logout, loginAsPersona, resetToDemoData } = useBanking();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3 sm:gap-8">
        {/* Zone 1: Single text element wordmark with banking emblem */}
        <div
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-2.5 sm:gap-3 shrink-0 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm shadow-blue-600/20 text-white font-bold shrink-0">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
              Aura Commercial Bank
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-500 tracking-wider uppercase font-medium">
              Member FDIC
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden md:flex items-center gap-1.5">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              currentTab === 'dashboard'
                ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            Balance & History
          </button>

          <button
            onClick={onOpenDeposit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-lg transition-colors whitespace-nowrap"
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-blue-600" />
            <span>Deposit</span>
          </button>

          <button
            onClick={onOpenTransfer}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-lg transition-colors whitespace-nowrap"
          >
            <Send className="w-3.5 h-3.5 text-blue-600" />
            <span>Transfer</span>
          </button>

          <button
            onClick={() => onSelectTab('profile')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              currentTab === 'profile'
                ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Account Owner</span>
          </button>
        </nav>

        {/* Zone 3: Primary action + Profile lockup */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onOpenDeposit}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 min-h-[36px] sm:min-h-[38px] text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all rounded-lg shadow-sm shadow-blue-600/20 whitespace-nowrap shrink-0"
          >
            <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Deposit</span>
          </button>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1 sm:p-1.5 rounded-lg border border-slate-200 bg-slate-50/80 hover:bg-slate-100 transition-colors text-left min-h-[36px] min-w-[36px] justify-center"
              aria-label="User profile menu"
            >
              <div className="w-7 h-7 rounded-md bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center justify-center font-mono">
                {user?.avatarInitials || 'AV'}
              </div>
              <div className="hidden sm:flex flex-col pr-1">
                <span className="text-xs font-semibold text-slate-900 leading-tight max-w-[120px] truncate">
                  {user?.name || 'Authorized User'}
                </span>
                <span className="text-[10px] text-slate-500 leading-tight">
                  Account Owner
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white shadow-2xl z-50 p-2.5 text-xs max-sm:fixed max-sm:right-4 max-sm:left-4 max-sm:w-auto max-sm:top-14">
                  <div className="px-3 py-2 border-b border-slate-100 mb-2">
                    <p className="font-bold text-slate-900 text-sm">{user?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate font-mono">{user?.email}</p>
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-blue-700 font-medium">
                      <Shield className="w-3 h-3 text-blue-600" />
                      <span>256-bit Encrypted Session Active</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectTab('profile');
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-blue-50 hover:text-blue-900 flex items-center gap-2 transition-colors min-h-[38px] font-semibold"
                  >
                    <User className="w-4 h-4 text-blue-600" />
                    <span>View Account Owner Profile</span>
                  </button>

                  <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
                    Switch Demo Persona
                  </div>
                  {DEMO_PERSONAS.map((p, idx) => (
                    <button
                      key={p.user.id}
                      onClick={() => {
                        loginAsPersona(idx);
                        setIsProfileOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-blue-50 hover:text-blue-900 flex items-center justify-between transition-colors min-h-[38px]"
                    >
                      <div className="truncate">
                        <p className="font-semibold text-slate-900 text-xs">{p.user.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{p.user.company}</p>
                      </div>
                      {user?.id === p.user.id && (
                        <span className="text-[10px] text-blue-600 font-mono font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">Active</span>
                      )}
                    </button>
                  ))}

                  <div className="my-2 border-t border-slate-100" />

                  <button
                    onClick={() => {
                      resetToDemoData();
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 flex items-center gap-2 transition-colors min-h-[38px]"
                  >
                    <RefreshCw className="w-4 h-4 text-slate-400" />
                    <span>Restore Initial Ledger State</span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors min-h-[38px] font-semibold"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Sign Out of Portal</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
