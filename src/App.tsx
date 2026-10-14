import React, { useState } from 'react';
import { AccountsView } from './components/accounts/AccountsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AuthModal } from './components/auth/AuthModal';
import { CardsView } from './components/cards/CardsView';
import { OverviewView } from './components/dashboard/OverviewView';
import { Navbar, NavTab } from './components/layout/Navbar';
import { DepositModal } from './components/modals/DepositModal';
import { TransferModal } from './components/modals/TransferModal';
import { WithdrawModal } from './components/modals/WithdrawModal';
import { StatementsView } from './components/statements/StatementsView';
import { TransfersView } from './components/transfers/TransfersView';
import { BankingProvider, useBanking } from './context/BankingContext';

const BankingAppContent: React.FC = () => {
  const { user } = useBanking();
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');

  // Modal states
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [targetAccountId, setTargetAccountId] = useState<string | undefined>(undefined);

  if (!user) {
    return <AuthModal />;
  }

  const handleOpenDeposit = (accountId?: string) => {
    setTargetAccountId(accountId);
    setIsDepositOpen(true);
  };

  const handleOpenWithdraw = (accountId?: string) => {
    setTargetAccountId(accountId);
    setIsWithdrawOpen(true);
  };

  const handleOpenTransfer = (accountId?: string) => {
    setTargetAccountId(accountId);
    setIsTransferOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFD] text-slate-900 flex flex-col font-sans">
      {/* Top Bar Contract Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenDeposit={() => handleOpenDeposit()}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'overview' && (
          <OverviewView
            onOpenDeposit={handleOpenDeposit}
            onOpenWithdraw={handleOpenWithdraw}
            onOpenTransfer={handleOpenTransfer}
            onNavigateToCards={() => setCurrentTab('cards')}
            onNavigateToAccounts={() => setCurrentTab('accounts')}
          />
        )}

        {currentTab === 'accounts' && (
          <AccountsView
            onOpenDeposit={handleOpenDeposit}
            onOpenWithdraw={handleOpenWithdraw}
            onOpenTransfer={handleOpenTransfer}
          />
        )}

        {currentTab === 'transfers' && (
          <TransfersView onOpenTransfer={() => handleOpenTransfer()} />
        )}

        {currentTab === 'cards' && <CardsView />}

        {currentTab === 'analytics' && <AnalyticsView />}

        {currentTab === 'statements' && <StatementsView />}
      </main>

      {/* Institutional Legal Footer */}
      <footer className="no-print mt-auto border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span className="font-semibold text-slate-800">Aura Commercial Bank N.A.</span>
            <span className="hidden sm:inline text-slate-300">·</span>
            <span>Charter # 021000021</span>
            <span className="hidden sm:inline text-slate-300">·</span>
            <span>Equal Housing Lender</span>
            <span className="hidden sm:inline text-slate-300">·</span>
            <span className="text-blue-700 font-medium">FDIC Certificate #34910</span>
          </div>

          <div className="text-slate-400 text-[11px] text-center sm:text-right">
            © 2026 Aura Commercial Bank N.A. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        defaultAccountId={targetAccountId}
      />

      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        defaultAccountId={targetAccountId}
      />

      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        defaultFromAccountId={targetAccountId}
      />
    </div>
  );
};

export default function App() {
  return (
    <BankingProvider>
      <BankingAppContent />
    </BankingProvider>
  );
}
