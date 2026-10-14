import React, { useState } from 'react';
import { AuthModal } from './components/auth/AuthModal';
import { OverviewView } from './components/dashboard/OverviewView';
import { BottomNav } from './components/layout/BottomNav';
import { Navbar, NavTab } from './components/layout/Navbar';
import { ContactServiceProviderModal } from './components/modals/ContactServiceProviderModal';
import { ProfileView } from './components/profile/ProfileView';
import { BankingProvider, useBanking } from './context/BankingContext';

const BankingAppContent: React.FC = () => {
  const { user } = useBanking();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [serviceProviderModal, setServiceProviderModal] = useState<{
    isOpen: boolean;
    actionType: 'deposit' | 'transfer' | null;
  }>({
    isOpen: false,
    actionType: null,
  });

  if (!user) {
    return <AuthModal />;
  }

  const handleOpenDeposit = () => {
    setServiceProviderModal({
      isOpen: true,
      actionType: 'deposit',
    });
  };

  const handleOpenTransfer = () => {
    setServiceProviderModal({
      isOpen: true,
      actionType: 'transfer',
    });
  };

  const handleCloseModal = () => {
    setServiceProviderModal({
      isOpen: false,
      actionType: null,
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFD] text-slate-900 flex flex-col font-sans">
      {/* Top Bar Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenDeposit={handleOpenDeposit}
        onOpenTransfer={handleOpenTransfer}
      />

      {/* Main Content Viewport with mobile bottom navigation clearance */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-12">
        {currentTab === 'dashboard' && (
          <OverviewView
            onOpenDeposit={handleOpenDeposit}
            onOpenTransfer={handleOpenTransfer}
            onNavigateToProfile={() => setCurrentTab('profile')}
          />
        )}

        {currentTab === 'profile' && <ProfileView />}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar (Thumb Zone) */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenDeposit={handleOpenDeposit}
        onOpenTransfer={handleOpenTransfer}
      />

      {/* Institutional Legal Footer */}
      <footer className="no-print mt-auto border-t border-slate-200 bg-white py-6 sm:py-8 text-xs text-slate-500 hidden md:block">
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

      {/* Contact Service Provider Popup Modal for Deposit & Transfer */}
      <ContactServiceProviderModal
        isOpen={serviceProviderModal.isOpen}
        onClose={handleCloseModal}
        actionType={serviceProviderModal.actionType}
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
