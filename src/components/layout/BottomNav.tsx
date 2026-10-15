import React from 'react';
import { ArrowDownLeft, Home, Send, Sliders, User } from 'lucide-react';
import { useBanking } from '../../context/BankingContext';
import { NavTab } from './Navbar';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenDeposit: () => void;
  onOpenTransfer: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenDeposit,
  onOpenTransfer,
}) => {
  const { user, isAdminMode } = useBanking();
  const isAdmin = user?.id === 'usr_admin' || isAdminMode;

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-3 pb-[env(safe-area-inset-bottom,8px)] pt-1"
    >
      <div className={`grid ${isAdmin ? 'grid-cols-5' : 'grid-cols-4'} items-center max-w-md mx-auto`}>
        {/* Dashboard / Balance Tab */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center justify-center min-h-[50px] py-1 px-1 rounded-xl transition-all select-none ${
            currentTab === 'dashboard'
              ? 'text-blue-700 font-semibold'
              : 'text-slate-500 hover:text-slate-900 active:scale-95'
          }`}
        >
          <div
            className={`p-1.5 rounded-lg transition-colors ${
              currentTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : ''
            }`}
          >
            <Home className={`w-5 h-5 ${currentTab === 'dashboard' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          </div>
          <span className={`text-[10px] tracking-tight mt-0.5 ${currentTab === 'dashboard' ? 'font-bold text-blue-700' : 'font-medium'}`}>
            Balance
          </span>
        </button>

        {/* Deposit Action */}
        <button
          onClick={onOpenDeposit}
          className="flex flex-col items-center justify-center min-h-[50px] py-1 px-1 rounded-xl text-slate-600 hover:text-blue-700 active:scale-95 transition-all select-none"
        >
          <div className="p-1.5 rounded-lg bg-blue-50/80 text-blue-600">
            <ArrowDownLeft className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5 text-slate-600">
            Deposit
          </span>
        </button>

        {/* Transfer Action */}
        <button
          onClick={onOpenTransfer}
          className="flex flex-col items-center justify-center min-h-[50px] py-1 px-1 rounded-xl text-slate-600 hover:text-blue-700 active:scale-95 transition-all select-none"
        >
          <div className="p-1.5 rounded-lg bg-blue-50/80 text-blue-600">
            <Send className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5 text-slate-600">
            Transfer
          </span>
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => onSelectTab('profile')}
          className={`flex flex-col items-center justify-center min-h-[50px] py-1 px-1 rounded-xl transition-all select-none ${
            currentTab === 'profile'
              ? 'text-blue-700 font-semibold'
              : 'text-slate-500 hover:text-slate-900 active:scale-95'
          }`}
        >
          <div
            className={`p-1.5 rounded-lg transition-colors ${
              currentTab === 'profile' ? 'bg-blue-50 text-blue-700' : ''
            }`}
          >
            <User className={`w-5 h-5 ${currentTab === 'profile' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          </div>
          <span className={`text-[10px] tracking-tight mt-0.5 ${currentTab === 'profile' ? 'font-bold text-blue-700' : 'font-medium'}`}>
            Profile
          </span>
        </button>

        {/* Admin Console Tab (Visible to Admin) */}
        {isAdmin && (
          <button
            onClick={() => onSelectTab('admin')}
            className={`flex flex-col items-center justify-center min-h-[50px] py-1 px-1 rounded-xl transition-all select-none ${
              currentTab === 'admin'
                ? 'text-indigo-700 font-bold'
                : 'text-slate-500 hover:text-slate-900 active:scale-95'
            }`}
          >
            <div
              className={`p-1.5 rounded-lg transition-colors ${
                currentTab === 'admin' ? 'bg-indigo-50 text-indigo-700' : ''
              }`}
            >
              <Sliders className={`w-5 h-5 ${currentTab === 'admin' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            </div>
            <span className={`text-[10px] tracking-tight mt-0.5 ${currentTab === 'admin' ? 'font-bold text-indigo-700' : 'font-medium'}`}>
              Admin
            </span>
          </button>
        )}
      </div>
    </nav>
  );
};
