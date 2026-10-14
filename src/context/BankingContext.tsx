import React, { createContext, useContext, useEffect, useState } from 'react';
import { DEMO_PERSONAS, INITIAL_BENEFICIARIES, INITIAL_TRANSACTIONS } from '../data/mockData';
import { Account, Beneficiary, Transaction, UserSession, VirtualCard } from '../types/banking';

interface DepositParams {
  accountId: string;
  amount: number;
  fundingMethod: string;
  memo?: string;
}

interface WithdrawParams {
  accountId: string;
  amount: number;
  destination: string;
  memo?: string;
}

interface InternalTransferParams {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  memo?: string;
}

interface WireTransferParams {
  fromAccountId: string;
  beneficiaryName: string;
  routingNumber: string;
  accountNumber: string;
  amount: number;
  memo?: string;
  wireType: 'Domestic Wire' | 'ACH Transfer';
  saveBeneficiary?: boolean;
  bankName?: string;
}

interface IssueCardParams {
  accountId: string;
  cardName: string;
  monthlyLimit: number;
  network: 'Visa' | 'Mastercard';
  cardTier: 'Signature Corporate' | 'Private Reserve' | 'Commercial Black';
}

interface BankingContextType {
  user: UserSession | null;
  accounts: Account[];
  transactions: Transaction[];
  cards: VirtualCard[];
  beneficiaries: Beneficiary[];
  selectedAccountId: string | null;
  setSelectedAccountId: (id: string | null) => void;
  activeAccount: Account | null;
  totalNetWorth: number;
  monthlyInflow: number;
  monthlyOutflow: number;
  login: (email: string, password?: string) => boolean;
  loginAsPersona: (index: number) => void;
  logout: () => void;
  register: (name: string, email: string, company: string) => void;
  deposit: (params: DepositParams) => { success: boolean; message: string; transaction?: Transaction };
  withdraw: (params: WithdrawParams) => { success: boolean; message: string; transaction?: Transaction };
  transferInternal: (params: InternalTransferParams) => { success: boolean; message: string };
  transferWire: (params: WireTransferParams) => { success: boolean; message: string };
  issueCard: (params: IssueCardParams) => VirtualCard;
  toggleCardFreeze: (cardId: string) => void;
  updateCardLimit: (cardId: string, limit: number) => void;
  addBeneficiary: (b: Omit<Beneficiary, 'id'>) => Beneficiary;
  resetToDemoData: () => void;
}

const BankingContext = createContext<BankingContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'aura_bank_user',
  ACCOUNTS: 'aura_bank_accounts',
  TRANSACTIONS: 'aura_bank_transactions',
  CARDS: 'aura_bank_cards',
  BENEFICIARIES: 'aura_bank_beneficiaries',
};

export const BankingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      return saved ? JSON.parse(saved) : DEMO_PERSONAS[0].user;
    } catch {
      return DEMO_PERSONAS[0].user;
    }
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      return saved ? JSON.parse(saved) : DEMO_PERSONAS[0].accounts;
    } catch {
      return DEMO_PERSONAS[0].accounts;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [cards, setCards] = useState<VirtualCard[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CARDS);
      return saved ? JSON.parse(saved) : DEMO_PERSONAS[0].cards;
    } catch {
      return DEMO_PERSONAS[0].cards;
    }
  });

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BENEFICIARIES);
      return saved ? JSON.parse(saved) : INITIAL_BENEFICIARIES;
    } catch {
      return INITIAL_BENEFICIARIES;
    }
  });

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEYS.USER);
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BENEFICIARIES, JSON.stringify(beneficiaries));
  }, [beneficiaries]);

  const activeAccount = accounts.find((a) => a.id === selectedAccountId) || null;

  const totalNetWorth = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  // Compute 30-day cash flow metrics
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const monthlyInflow = transactions
    .filter((t) => t.amount > 0 && new Date(t.timestamp) >= thirtyDaysAgo)
    .reduce((acc, t) => acc + t.amount, 0);

  const monthlyOutflow = transactions
    .filter((t) => t.amount < 0 && new Date(t.timestamp) >= thirtyDaysAgo)
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const loginAsPersona = (index: number) => {
    const persona = DEMO_PERSONAS[index] || DEMO_PERSONAS[0];
    setUser(persona.user);
    setAccounts(persona.accounts);
    setCards(persona.cards);
    setSelectedAccountId(null);
  };

  const login = (email: string) => {
    const matched = DEMO_PERSONAS.find(
      (p) => p.user.email.toLowerCase() === email.toLowerCase()
    );
    if (matched) {
      setUser(matched.user);
      setAccounts(matched.accounts);
      setCards(matched.cards);
    } else {
      // Create guest session
      const name = email.split('@')[0].replace(/[._]/g, ' ');
      const initials = name
        .split(' ')
        .map((n) => n[0]?.toUpperCase())
        .join('')
        .slice(0, 2) || 'US';
      const guestUser: UserSession = {
        id: `usr_${Date.now()}`,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email,
        company: 'Commercial Account',
        tier: 'Standard Commercial' as any,
        avatarInitials: initials,
        memberSince: 'October 2026',
        phone: '+1 (555) 012-3456',
        twoFactorEnabled: true,
      };
      setUser(guestUser);
    }
    return true;
  };

  const register = (name: string, email: string, company: string) => {
    const initials = name
      .split(' ')
      .map((n) => n[0]?.toUpperCase())
      .join('')
      .slice(0, 2) || 'AC';
    const newUser: UserSession = {
      id: `usr_${Date.now()}`,
      name,
      email,
      company: company || 'Private Enterprise',
      tier: 'Premier Corporate',
      avatarInitials: initials,
      memberSince: 'October 2026',
      phone: '+1 (415) 800-9900',
      twoFactorEnabled: true,
    };
    const defaultAccounts: Account[] = [
      {
        id: `acc_chk_${Date.now()}`,
        name: 'Primary Commercial Checking',
        accountNumber: `•••• ${Math.floor(1000 + Math.random() * 9000)}`,
        fullAccountNumber: `928100${Math.floor(1000 + Math.random() * 9000)}`,
        routingNumber: '021000021',
        type: 'checking',
        balance: 100000.0,
        currency: 'USD',
        apy: 0.85,
        dailyWithdrawalLimit: 50000.0,
        withdrawnToday: 0,
      },
      {
        id: `acc_tsy_${Date.now()}`,
        name: 'High-Yield Treasury Yield Vault',
        accountNumber: `•••• ${Math.floor(1000 + Math.random() * 9000)}`,
        fullAccountNumber: `449100${Math.floor(1000 + Math.random() * 9000)}`,
        routingNumber: '021000021',
        type: 'treasury',
        balance: 250000.0,
        currency: 'USD',
        apy: 4.95,
        dailyWithdrawalLimit: 200000.0,
        withdrawnToday: 0,
      },
    ];
    setUser(newUser);
    setAccounts(defaultAccounts);
  };

  const logout = () => {
    setUser(null);
  };

  const deposit = ({ accountId, amount, fundingMethod, memo }: DepositParams) => {
    if (amount <= 0 || isNaN(amount)) {
      return { success: false, message: 'Please specify a valid deposit amount greater than $0.00 USD.' };
    }
    const targetAccount = accounts.find((a) => a.id === accountId);
    if (!targetAccount) {
      return { success: false, message: 'Target destination account not found.' };
    }

    const ref = `AURA-DEP-${Math.floor(100000 + Math.random() * 900000)}`;
    const newTxn: Transaction = {
      id: `txn_${Date.now()}`,
      accountId,
      type: 'deposit',
      amount: Math.round(amount * 100) / 100,
      category: 'Income & Deposits',
      counterparty: fundingMethod || 'External Bank ACH Deposit',
      timestamp: new Date().toISOString(),
      status: 'completed',
      referenceId: ref,
      memo: memo || 'Instant deposit credit to ' + targetAccount.name,
      fundingMethod,
      destinationAccount: targetAccount.name,
    };

    setAccounts((prev) =>
      prev.map((acc) => (acc.id === accountId ? { ...acc, balance: acc.balance + newTxn.amount } : acc))
    );
    setTransactions((prev) => [newTxn, ...prev]);

    return {
      success: true,
      message: `Successfully deposited $${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD into ${targetAccount.name}.`,
      transaction: newTxn,
    };
  };

  const withdraw = ({ accountId, amount, destination, memo }: WithdrawParams) => {
    if (amount <= 0 || isNaN(amount)) {
      return { success: false, message: 'Please specify a valid withdrawal amount greater than $0.00 USD.' };
    }
    const targetAccount = accounts.find((a) => a.id === accountId);
    if (!targetAccount) {
      return { success: false, message: 'Source account not found.' };
    }

    if (amount > targetAccount.balance) {
      return {
        success: false,
        message: `Insufficient funds. Available balance is $${targetAccount.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD.`,
      };
    }

    const remainingDaily = targetAccount.dailyWithdrawalLimit - targetAccount.withdrawnToday;
    if (amount > remainingDaily) {
      return {
        success: false,
        message: `Daily withdrawal threshold exceeded. Remaining daily limit is $${remainingDaily.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD.`,
      };
    }

    const ref = `AURA-WDL-${Math.floor(100000 + Math.random() * 900000)}`;
    const newTxn: Transaction = {
      id: `txn_${Date.now()}`,
      accountId,
      type: 'withdrawal',
      amount: -Math.round(amount * 100) / 100,
      category: 'Wire Transfers',
      counterparty: destination || 'External Bank Withdrawal',
      timestamp: new Date().toISOString(),
      status: 'completed',
      referenceId: ref,
      memo: memo || 'Withdrawal disbursement from ' + targetAccount.name,
      fundingMethod: 'Fedwire / ACH Clearance',
      destinationAccount: destination,
    };

    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === accountId
          ? {
              ...acc,
              balance: acc.balance - amount,
              withdrawnToday: acc.withdrawnToday + amount,
            }
          : acc
      )
    );
    setTransactions((prev) => [newTxn, ...prev]);

    return {
      success: true,
      message: `Successfully processed withdrawal of $${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD.`,
      transaction: newTxn,
    };
  };

  const transferInternal = ({ fromAccountId, toAccountId, amount, memo }: InternalTransferParams) => {
    if (fromAccountId === toAccountId) {
      return { success: false, message: 'Source and destination accounts must be distinct.' };
    }
    if (amount <= 0 || isNaN(amount)) {
      return { success: false, message: 'Transfer amount must be greater than $0.00 USD.' };
    }

    const source = accounts.find((a) => a.id === fromAccountId);
    const destination = accounts.find((a) => a.id === toAccountId);

    if (!source || !destination) {
      return { success: false, message: 'Invalid source or destination account.' };
    }

    if (amount > source.balance) {
      return {
        success: false,
        message: `Insufficient funds in ${source.name}. Available: $${source.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD.`,
      };
    }

    const ref = `AURA-INT-${Math.floor(100000 + Math.random() * 900000)}`;
    const outTxn: Transaction = {
      id: `txn_${Date.now()}_out`,
      accountId: fromAccountId,
      type: 'transfer',
      amount: -amount,
      category: 'Wire Transfers',
      counterparty: `Internal Transfer -> ${destination.name}`,
      timestamp: new Date().toISOString(),
      status: 'completed',
      referenceId: ref,
      memo: memo || `Internal reallocation to ${destination.name}`,
      fundingMethod: 'Real-Time Internal Book Transfer',
    };

    const inTxn: Transaction = {
      id: `txn_${Date.now()}_in`,
      accountId: toAccountId,
      type: 'transfer',
      amount: amount,
      category: 'Income & Deposits',
      counterparty: `Internal Transfer <- ${source.name}`,
      timestamp: new Date().toISOString(),
      status: 'completed',
      referenceId: `${ref}-CR`,
      memo: memo || `Internal reallocation from ${source.name}`,
      fundingMethod: 'Real-Time Internal Book Transfer',
    };

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === fromAccountId) return { ...acc, balance: acc.balance - amount };
        if (acc.id === toAccountId) return { ...acc, balance: acc.balance + amount };
        return acc;
      })
    );
    setTransactions((prev) => [outTxn, inTxn, ...prev]);

    return {
      success: true,
      message: `Transferred $${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD from ${source.name} to ${destination.name}.`,
    };
  };

  const transferWire = ({
    fromAccountId,
    beneficiaryName,
    routingNumber,
    accountNumber,
    amount,
    memo,
    wireType,
    saveBeneficiary,
    bankName,
  }: WireTransferParams) => {
    if (amount <= 0 || isNaN(amount)) {
      return { success: false, message: 'Wire transfer amount must be greater than $0.00 USD.' };
    }
    const source = accounts.find((a) => a.id === fromAccountId);
    if (!source) {
      return { success: false, message: 'Source account not found.' };
    }
    if (amount > source.balance) {
      return {
        success: false,
        message: `Insufficient funds in ${source.name}. Available: $${source.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD.`,
      };
    }

    const ref = `AURA-WIRE-${Math.floor(100000 + Math.random() * 900000)}`;
    const newTxn: Transaction = {
      id: `txn_${Date.now()}`,
      accountId: fromAccountId,
      type: 'withdrawal',
      amount: -amount,
      category: 'Wire Transfers',
      counterparty: `${beneficiaryName} (${wireType})`,
      timestamp: new Date().toISOString(),
      status: 'completed',
      referenceId: ref,
      memo: memo || `${wireType} dispatched to ${beneficiaryName} (Acct ending ${accountNumber.slice(-4)})`,
      fundingMethod: `${wireType} - Fedwire Real-Time`,
      destinationAccount: `${beneficiaryName} / RTN ${routingNumber}`,
    };

    setAccounts((prev) =>
      prev.map((acc) => (acc.id === fromAccountId ? { ...acc, balance: acc.balance - amount } : acc))
    );
    setTransactions((prev) => [newTxn, ...prev]);

    if (saveBeneficiary && !beneficiaries.some((b) => b.name.toLowerCase() === beneficiaryName.toLowerCase())) {
      const newBen: Beneficiary = {
        id: `ben_${Date.now()}`,
        name: beneficiaryName,
        bankName: bankName || 'Verified US Commercial Bank',
        routingNumber,
        accountNumber: `•••• ${accountNumber.slice(-4)}`,
        type: wireType,
        lastUsed: 'Just now',
      };
      setBeneficiaries((prev) => [newBen, ...prev]);
    }

    return {
      success: true,
      message: `${wireType} of $${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD successfully initiated to ${beneficiaryName}.`,
    };
  };

  const issueCard = ({ accountId, cardName, monthlyLimit, network, cardTier }: IssueCardParams): VirtualCard => {
    const randomPanLast4 = `${Math.floor(1000 + Math.random() * 9000)}`;
    const randomPanFirst = network === 'Visa' ? '4111' : '5500';
    const randomCvv = `${Math.floor(100 + Math.random() * 900)}`;
    const newCard: VirtualCard = {
      id: `crd_${Date.now()}`,
      accountId,
      cardholderName: (user?.name || 'AURA CLIENT').toUpperCase(),
      cardName,
      last4: randomPanLast4,
      fullPan: `${randomPanFirst} •••• •••• ${randomPanLast4}`,
      expiry: '10/30',
      cvv: randomCvv,
      monthlyLimit,
      currentSpend: 0,
      isFrozen: false,
      network,
      cardTier,
    };

    setCards((prev) => [newCard, ...prev]);
    return newCard;
  };

  const toggleCardFreeze = (cardId: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isFrozen: !c.isFrozen } : c))
    );
  };

  const updateCardLimit = (cardId: string, limit: number) => {
    if (limit <= 0) return;
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, monthlyLimit: limit } : c))
    );
  };

  const addBeneficiary = (b: Omit<Beneficiary, 'id'>) => {
    const newBen: Beneficiary = {
      ...b,
      id: `ben_${Date.now()}`,
      lastUsed: 'Never',
    };
    setBeneficiaries((prev) => [newBen, ...prev]);
    return newBen;
  };

  const resetToDemoData = () => {
    setUser(DEMO_PERSONAS[0].user);
    setAccounts(DEMO_PERSONAS[0].accounts);
    setTransactions(INITIAL_TRANSACTIONS);
    setCards(DEMO_PERSONAS[0].cards);
    setBeneficiaries(INITIAL_BENEFICIARIES);
    setSelectedAccountId(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.CARDS);
    localStorage.removeItem(STORAGE_KEYS.BENEFICIARIES);
  };

  return (
    <BankingContext.Provider
      value={{
        user,
        accounts,
        transactions,
        cards,
        beneficiaries,
        selectedAccountId,
        setSelectedAccountId,
        activeAccount,
        totalNetWorth,
        monthlyInflow,
        monthlyOutflow,
        login,
        loginAsPersona,
        logout,
        register,
        deposit,
        withdraw,
        transferInternal,
        transferWire,
        issueCard,
        toggleCardFreeze,
        updateCardLimit,
        addBeneficiary,
        resetToDemoData,
      }}
    >
      {children}
    </BankingContext.Provider>
  );
};

export const useBanking = () => {
  const context = useContext(BankingContext);
  if (!context) {
    throw new Error('useBanking must be used within a BankingProvider');
  }
  return context;
};
