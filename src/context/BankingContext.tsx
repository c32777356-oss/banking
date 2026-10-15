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
  registeredUsers: UserSession[];
  isAdminMode: boolean;
  setIsAdminMode: (val: boolean) => void;
  monthlyInflow: number;
  monthlyOutflow: number;
  login: (email: string, password?: string, rememberMe?: boolean) => boolean;
  loginAsPersona: (index: number, rememberMe?: boolean) => void;
  logout: () => void;
  register: (name: string, email: string, company: string, rememberMe?: boolean) => void;
  deposit: (params: DepositParams) => { success: boolean; message: string; transaction?: Transaction };
  withdraw: (params: WithdrawParams) => { success: boolean; message: string; transaction?: Transaction };
  transferInternal: (params: InternalTransferParams) => { success: boolean; message: string };
  transferWire: (params: any) => { success: boolean; message: string };
  issueCard: (params: any) => VirtualCard;
  toggleCardFreeze: (cardId: string) => void;
  updateCardLimit: (cardId: string, limit: number) => void;
  addBeneficiary: (b: any) => Beneficiary;
  updateUserDetails: (userId: string, data: Partial<UserSession>) => void;
  deleteUser: (userId: string) => boolean;
  updateAccountDetails: (accountId: string, data: Partial<Account>) => void;
  updateTransaction: (transactionId: string, data: Partial<Transaction>) => void;
  addTransaction: (data: Omit<Transaction, 'id'>) => Transaction;
  deleteTransaction: (transactionId: string) => void;
  setAccountBalance: (accountId: string, newBalance: number) => void;
  resetToDemoData: () => void;
}

const BankingContext = createContext<BankingContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'aura_bank_user',
  REMEMBER_ME: 'aura_bank_remember_me',
  SESSION_USER: 'aura_bank_session_user',
  ACCOUNTS: 'aura_bank_accounts',
  TRANSACTIONS: 'aura_bank_transactions',
  CARDS: 'aura_bank_cards',
  BENEFICIARIES: 'aura_bank_beneficiaries',
  USERS_LIST: 'aura_bank_registered_users',
};

export const BankingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistent login: only restored when "Save my details next time" (remember_me) was ticked
  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const isRemembered = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === 'true';
      if (isRemembered) {
        const saved = localStorage.getItem(STORAGE_KEYS.USER);
        if (saved) return JSON.parse(saved);
      }
      return null;
    } catch {
      return null;
    }
  });

  const [registeredUsers, setRegisteredUsers] = useState<UserSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS_LIST);
      if (saved) return JSON.parse(saved);
      return DEMO_PERSONAS.map((p) => p.user);
    } catch {
      return DEMO_PERSONAS.map((p) => p.user);
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

  const [cards] = useState<VirtualCard[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CARDS);
      return saved ? JSON.parse(saved) : DEMO_PERSONAS[0].cards;
    } catch {
      return DEMO_PERSONAS[0].cards;
    }
  });

  const [beneficiaries] = useState<Beneficiary[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BENEFICIARIES);
      return saved ? JSON.parse(saved) : INITIAL_BENEFICIARIES;
    } catch {
      return INITIAL_BENEFICIARIES;
    }
  });

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    try {
      const isRemembered = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === 'true';
      if (isRemembered) {
        const saved = localStorage.getItem(STORAGE_KEYS.USER);
        if (saved) {
          const parsed = JSON.parse(saved);
          return parsed.id === 'usr_admin' || parsed.email === 'admin';
        }
      }
      return false;
    } catch {
      return false;
    }
  });

  // Sync state to storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  const activeAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0] || null;
  const totalNetWorth = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  const saveUserSession = (newUser: UserSession, rememberMe: boolean = false) => {
    setUser(newUser);
    if (rememberMe) {
      localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      sessionStorage.removeItem(STORAGE_KEYS.SESSION_USER);
    } else {
      localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
      localStorage.removeItem(STORAGE_KEYS.USER);
      sessionStorage.setItem(STORAGE_KEYS.SESSION_USER, JSON.stringify(newUser));
    }
  };

  const loginAsPersona = (index: number, rememberMe: boolean = false) => {
    const persona = DEMO_PERSONAS[index] || DEMO_PERSONAS[0];
    saveUserSession(persona.user, rememberMe);
    setAccounts(persona.accounts);
    setSelectedAccountId(null);
  };

  const login = (email: string, _password?: string, rememberMe: boolean = false): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = (_password || '').trim();

    // Dedicated Administrator Login
    const isAdminEmail =
      cleanEmail === 'admin' ||
      cleanEmail === 'admin@aura.bank' ||
      cleanEmail === 'admin@admin.com';

    if (isAdminEmail) {
      if (cleanPass.toLowerCase() === 'admin') {
        const adminUser: UserSession = {
          id: 'usr_admin',
          name: 'System Administrator',
          email: 'admin',
          company: 'Executive Banking Administration',
          tier: 'Commercial Executive',
          avatarInitials: 'AD',
          memberSince: 'System Root',
          phone: '+1 (800) 555-0100',
          twoFactorEnabled: true,
        };
        setIsAdminMode(true);
        saveUserSession(adminUser, rememberMe);
        return true;
      }
      return false; // Invalid admin password
    }

    const matchedPersona = DEMO_PERSONAS.find(
      (p) => p.user.email.toLowerCase() === cleanEmail
    );
    if (matchedPersona) {
      setIsAdminMode(false);
      saveUserSession(matchedPersona.user, rememberMe);
      setAccounts(matchedPersona.accounts);
      return true;
    }

    const matchedRegistered = registeredUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (matchedRegistered) {
      saveUserSession(matchedRegistered, rememberMe);
      return true;
    }

    // Create new profile for client email
    const name = email.split('@')[0].replace(/[._]/g, ' ');
    const initials =
      name
        .split(' ')
        .map((n) => n[0]?.toUpperCase())
        .join('')
        .slice(0, 2) || 'US';

    const newUser: UserSession = {
      id: `usr_${Date.now()}`,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email,
      company: 'Enterprise Commercial Client',
      tier: 'Commercial Executive',
      avatarInitials: initials,
      memberSince: 'October 2026',
      phone: '+1 (800) 555-0199',
      twoFactorEnabled: true,
    };

    setRegisteredUsers((prev) => [newUser, ...prev]);
    saveUserSession(newUser, rememberMe);
    return true;
  };

  const register = (
    name: string,
    email: string,
    company: string,
    rememberMe: boolean = false
  ) => {
    const initials =
      name
        .split(' ')
        .map((n) => n[0]?.toUpperCase())
        .join('')
        .slice(0, 2) || 'AV';

    const newUser: UserSession = {
      id: `usr_${Date.now()}`,
      name,
      email,
      company: company || 'Commercial Entity',
      tier: 'Premier Corporate',
      avatarInitials: initials,
      memberSince: 'October 2026',
      phone: '+1 (800) 555-0199',
      twoFactorEnabled: true,
    };

    const newAccounts: Account[] = [
      {
        id: `acc_chk_${Date.now()}`,
        name: 'Primary Operating Checking',
        accountNumber: '•••• ' + Math.floor(1000 + Math.random() * 9000),
        fullAccountNumber: '021000' + Math.floor(100000 + Math.random() * 900000),
        routingNumber: '021000021',
        type: 'checking',
        balance: 100000.0,
        currency: 'USD',
        dailyWithdrawalLimit: 100000,
        withdrawnToday: 0,
      },
    ];

    setRegisteredUsers((prev) => [newUser, ...prev]);
    setAccounts(newAccounts);
    saveUserSession(newUser, rememberMe);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
    localStorage.removeItem(STORAGE_KEYS.USER);
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_USER);
    setUser(null);
    setIsAdminMode(false);
  };

  // Admin capabilities
  const updateUserDetails = (userId: string, data: Partial<UserSession>) => {
    setRegisteredUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...data } : u))
    );
    if (user && user.id === userId) {
      const updated = { ...user, ...data };
      setUser(updated);
      const isRemembered = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === 'true';
      if (isRemembered) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      } else {
        sessionStorage.setItem(STORAGE_KEYS.SESSION_USER, JSON.stringify(updated));
      }
    }
  };

  const deleteUser = (userId: string): boolean => {
    if (userId === 'usr_admin') {
      return false;
    }
    setRegisteredUsers((prev) => prev.filter((u) => u.id !== userId));
    return true;
  };

  const updateAccountDetails = (accountId: string, data: Partial<Account>) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === accountId ? { ...a, ...data } : a))
    );
  };

  const setAccountBalance = (accountId: string, newBalance: number) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === accountId ? { ...a, balance: Number(newBalance) } : a))
    );
  };

  const updateTransaction = (transactionId: string, data: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === transactionId ? { ...t, ...data } : t))
    );
  };

  const addTransaction = (data: Omit<Transaction, 'id'>): Transaction => {
    const newTxn: Transaction = {
      ...data,
      id: `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };
    setTransactions((prev) => [newTxn, ...prev]);
    return newTxn;
  };

  const deleteTransaction = (transactionId: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== transactionId));
  };

  const deposit = ({
    accountId,
    amount,
    fundingMethod,
    memo,
  }: DepositParams) => {
    const target = accounts.find((a) => a.id === accountId) || accounts[0];
    if (!target) return { success: false, message: 'Account not found' };

    const txn: Transaction = {
      id: `txn_dep_${Date.now()}`,
      accountId: target.id,
      type: 'deposit',
      amount: Math.abs(amount),
      category: 'Income & Deposits',
      counterparty: fundingMethod || 'Institutional Fedwire Deposit',
      timestamp: new Date().toISOString(),
      status: 'cleared',
      referenceId: `DEP-${Math.floor(100000 + Math.random() * 900000)}`,
      memo: memo || 'Deposit Funds',
      fundingMethod,
    };

    setAccounts((prev) =>
      prev.map((a) =>
        a.id === target.id ? { ...a, balance: a.balance + Math.abs(amount) } : a
      )
    );
    setTransactions((prev) => [txn, ...prev]);

    return { success: true, message: 'Deposit completed successfully', transaction: txn };
  };

  const withdraw = ({
    accountId,
    amount,
    destination,
    memo,
  }: WithdrawParams) => {
    const target = accounts.find((a) => a.id === accountId) || accounts[0];
    if (!target) return { success: false, message: 'Account not found' };

    if (target.balance < amount) {
      return { success: false, message: 'Insufficient funds available in selected account' };
    }

    const txn: Transaction = {
      id: `txn_wd_${Date.now()}`,
      accountId: target.id,
      type: 'withdrawal',
      amount: -Math.abs(amount),
      category: 'Operations',
      counterparty: destination,
      timestamp: new Date().toISOString(),
      status: 'cleared',
      referenceId: `WTH-${Math.floor(100000 + Math.random() * 900000)}`,
      memo: memo || 'Authorized Withdrawal',
      fundingMethod: 'Wire Disbursement',
    };

    setAccounts((prev) =>
      prev.map((a) =>
        a.id === target.id ? { ...a, balance: a.balance - Math.abs(amount) } : a
      )
    );
    setTransactions((prev) => [txn, ...prev]);

    return { success: true, message: 'Withdrawal completed', transaction: txn };
  };

  const transferInternal = ({
    fromAccountId,
    toAccountId,
    amount,
    memo,
  }: InternalTransferParams) => {
    const fromAcct = accounts.find((a) => a.id === fromAccountId);
    const toAcct = accounts.find((a) => a.id === toAccountId);

    if (!fromAcct || !toAcct) return { success: false, message: 'Invalid accounts' };
    if (fromAcct.balance < amount) return { success: false, message: 'Insufficient funds' };

    setAccounts((prev) =>
      prev.map((a) => {
        if (a.id === fromAccountId) return { ...a, balance: a.balance - amount };
        if (a.id === toAccountId) return { ...a, balance: a.balance + amount };
        return a;
      })
    );

    const nowStr = new Date().toISOString();
    const txnOut: Transaction = {
      id: `txn_tf_out_${Date.now()}`,
      accountId: fromAccountId,
      type: 'transfer',
      amount: -amount,
      category: 'Wire Transfers',
      counterparty: `Transfer to ${toAcct.name}`,
      timestamp: nowStr,
      status: 'cleared',
      referenceId: `TRF-${Math.floor(100000 + Math.random() * 900000)}`,
      memo: memo || 'Internal Account Transfer',
      destinationAccount: toAcct.name,
    };

    const txnIn: Transaction = {
      id: `txn_tf_in_${Date.now()}`,
      accountId: toAccountId,
      type: 'deposit',
      amount,
      category: 'Income & Deposits',
      counterparty: `Transfer from ${fromAcct.name}`,
      timestamp: nowStr,
      status: 'cleared',
      referenceId: `TRF-${Math.floor(100000 + Math.random() * 900000)}`,
      memo: memo || 'Internal Account Transfer',
      destinationAccount: toAcct.name,
    };

    setTransactions((prev) => [txnOut, txnIn, ...prev]);
    return { success: true, message: 'Internal transfer completed' };
  };

  const resetToDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
    localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.USERS_LIST);
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_USER);

    setUser(null);
    setRegisteredUsers(DEMO_PERSONAS.map((p) => p.user));
    setAccounts(DEMO_PERSONAS[0].accounts);
    setTransactions(INITIAL_TRANSACTIONS);
    setIsAdminMode(false);
  };

  // Compute 30-day metrics
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const monthlyInflow = transactions
    .filter((t) => t.amount > 0 && new Date(t.timestamp) >= thirtyDaysAgo)
    .reduce((acc, t) => acc + t.amount, 0);
  const monthlyOutflow = transactions
    .filter((t) => t.amount < 0 && new Date(t.timestamp) >= thirtyDaysAgo)
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const transferWire = () => ({ success: true, message: 'Wire transfer processed' });
  const issueCard = () => (cards[0] || ({} as VirtualCard));
  const toggleCardFreeze = () => {};
  const updateCardLimit = () => {};
  const addBeneficiary = (b: any) => ({ ...b, id: `ben_${Date.now()}` });

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
        registeredUsers,
        isAdminMode,
        setIsAdminMode,
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
        updateUserDetails,
        deleteUser,
        updateAccountDetails,
        setAccountBalance,
        updateTransaction,
        addTransaction,
        deleteTransaction,
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
