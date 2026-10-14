import React, { useState } from 'react';
import { ArrowDownLeft, Building2, ChevronDown, LogOut, RefreshCw, Shield, User, Wallet } from 'lucide-react';
import { useBanking } from '../../context/BankingContext';
import { DEMO_PERSONAS } from '../../data/mockData';

export type NavTab = 'overview' | 'accounts' | 'transfers' | 'cards' | 'analytics' | 'statements';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenDeposit: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onOpenDeposit }) => {
  const { user, logout, loginAsPersona, resetToDemoData } = useBanking();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navItems: { id: NavTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'accounts', label: 'Accounts' },
    { id: 'transfers', label: 'Transfers & Wires' },
    { id: 'cards', label: 'Virtual Cards' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'statements', label: 'Statements' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark with banking emblem */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm shadow-blue-600/20 text-white font-bold">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
              Aura Commercial Bank
            </span>
            <span className="text-[10px] text-slate-500 tracking-wider uppercase font-medium">
              Member FDIC · Equal Housing Lender
            </span>
          </div>
        </div>

        {/* Zone 2: 4-6 concise single-line nav links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary action + Profile lockup */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenDeposit}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all rounded-md shadow-sm shadow-blue-600/20 whitespace-nowrap shrink-0"
          >
            <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Deposit Funds</span>
          </button>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-lg border border-slate-200 bg-slate-50/80 hover:bg-slate-100 transition-colors text-left"
            >
              <div className="w-7 h-7 rounded bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center justify-center font-mono">
                {user?.avatarInitials || 'AC'}
              </div>
              <div className="hidden sm:flex flex-col pr-1">
                <span className="text-xs font-semibold text-slate-900 leading-tight max-w-[120px] truncate">
                  {user?.name || 'Authorized User'}
                </span>
                <span className="text-[10px] text-slate-500 leading-tight">
                  {user?.tier || 'Commercial Client'}
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
                <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white shadow-xl z-50 p-2 text-xs">
                  <div className="px-3 py-2 border-b border-slate-100 mb-2">
                    <p className="font-semibold text-slate-900">{user?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate font-mono">{user?.email}</p>
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-blue-700 font-medium">
                      <Shield className="w-3 h-3 text-blue-600" />
                      <span>256-bit Encrypted Session Active</span>
                    </div>
                  </div>

                  <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Switch Demo Persona
                  </div>
                  {DEMO_PERSONAS.map((p, idx) => (
                    <button
                      key={p.user.id}
                      onClick={() => {
                        loginAsPersona(idx);
                        setIsProfileOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded text-slate-700 hover:bg-blue-50 hover:text-blue-900 flex items-center justify-between transition-colors"
                    >
                      <div className="truncate">
                        <p className="font-medium text-slate-900">{p.user.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{p.user.company}</p>
                      </div>
                      {user?.id === p.user.id && (
                        <span className="text-[10px] text-blue-600 font-mono font-medium">Active</span>
                      )}
                    </button>
                  ))}

                  <div className="my-2 border-t border-slate-100" />

                  <button
                    onClick={() => {
                      resetToDemoData();
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded text-slate-600 hover:bg-slate-100 hover:text-slate-900 flex items-center gap-2 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                    <span>Restore Initial Ledger State</span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                    <span>Sign Out of Portal</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="lg:hidden flex overflow-x-auto border-t border-slate-200 px-4 py-2 gap-2 scrollbar-none bg-slate-50">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`px-3 py-1 text-xs font-medium rounded whitespace-nowrap ${
              currentTab === item.id
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
