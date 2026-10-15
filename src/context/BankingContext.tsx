import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DEMO_PERSONAS, INITIAL_BENEFICIARIES, INITIAL_TRANSACTIONS } from '../data/mockData';
import { Account, Beneficiary, Transaction, UserSession, VirtualCard } from '../types/banking';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { doc, setDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';

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
  LAST_ACTIVITY: 'aura_bank_last_activity',
  ACCOUNTS: 'aura_bank_accounts',
  TRANSACTIONS: 'aura_bank_transactions',
  CARDS: 'aura_bank_cards',
  BENEFICIARIES: 'aura_bank_beneficiaries',
  USERS_LIST: 'aura_bank_registered_users',
};

export const BankingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistent login: restored when "Save my details next time" was ticked, with 1hr inactivity expiration
  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const isRemembered = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === 'true';
      if (isRemembered) {
        const lastActivityStr = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
        const now = Date.now();
        const ONE_HOUR = 60 * 60 * 1000;
        if (lastActivityStr) {
          const lastActivity = parseInt(lastActivityStr, 10);
          if (now - lastActivity > ONE_HOUR) {
            localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
            localStorage.removeItem(STORAGE_KEYS.USER);
            localStorage.removeItem(STORAGE_KEYS.LAST_ACTIVITY);
            return null;
          }
        }
        const saved = localStorage.getItem(STORAGE_KEYS.USER);
        if (saved) {
          localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, now.toString());
          return JSON.parse(saved);
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const [registeredUsers, setRegisteredUsers] = useState<UserSession[]>(() => {
    try {
      const deletedIdsJson = localStorage.getItem('aura_bank_deleted_users');
      const deletedUserIds: string[] = deletedIdsJson ? JSON.parse(deletedIdsJson) : [];
      const deletedUserSet = new Set(deletedUserIds);

      const saved = localStorage.getItem(STORAGE_KEYS.USERS_LIST);
      const demoUsers = DEMO_PERSONAS.map((p) => p.user);
      let usersToLoad = demoUsers;
      if (saved) {
        const parsed: UserSession[] = JSON.parse(saved);
        const userMap = new Map<string, UserSession>();
        [...demoUsers, ...parsed].forEach((u) => userMap.set(u.id, u));
        usersToLoad = Array.from(userMap.values());
      }
      return usersToLoad.filter((u) => !deletedUserSet.has(u.id));
    } catch {
      return DEMO_PERSONAS.map((p) => p.user);
    }
  });

  const [allAccounts, setAllAccounts] = useState<Account[]>(() => {
    try {
      const deletedIdsJson = localStorage.getItem('aura_bank_deleted_users');
      const deletedUserIds: string[] = deletedIdsJson ? JSON.parse(deletedIdsJson) : [];
      const deletedUserSet = new Set(deletedUserIds);

      const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      const defaultAccounts = DEMO_PERSONAS.flatMap((p) =>
        p.accounts.map((a) => ({ ...a, userId: a.userId || p.user.id }))
      );
      let accountsToLoad: Account[] = defaultAccounts;
      if (saved) {
        const parsed: Account[] = JSON.parse(saved);
        const accountMap = new Map<string, Account>();
        [...defaultAccounts, ...parsed].forEach((a) => accountMap.set(a.id, a));
        accountsToLoad = Array.from(accountMap.values()) as Account[];
      }
      return accountsToLoad.filter((a) => !a.userId || !deletedUserSet.has(a.userId));
    } catch {
      return DEMO_PERSONAS.flatMap((p) =>
        p.accounts.map((a) => ({ ...a, userId: a.userId || p.user.id }))
      );
    }
  });

  const [allTransactions, setAllTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) return JSON.parse(saved);
      return INITIAL_TRANSACTIONS;
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
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(allAccounts));
  }, [allAccounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(allTransactions));
  }, [allTransactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  // 1-hour inactivity timeout for persistent login sessions
  useEffect(() => {
    if (!user) return;
    const isRemembered = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === 'true';
    if (!isRemembered) return;

    const ONE_HOUR = 60 * 60 * 1000;

    const updateActivity = () => {
      localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
    };

    if (!localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY)) {
      updateActivity();
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    const handleActivity = () => {
      updateActivity();
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    const interval = setInterval(() => {
      const lastActivityStr = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
      if (lastActivityStr) {
        const lastActivity = parseInt(lastActivityStr, 10);
        if (Date.now() - lastActivity > ONE_HOUR) {
          logout();
        }
      }
    }, 30000);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(interval);
    };
  }, [user]);

  // Fetch Firestore data on mount and respect deleted user IDs
  useEffect(() => {
    async function fetchFirestoreData() {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const firestoreUsers: UserSession[] = [];
        usersSnap.forEach((d) => {
          firestoreUsers.push(d.data() as UserSession);
        });

        const accountsSnap = await getDocs(collection(db, 'accounts'));
        const firestoreAccounts: Account[] = [];
        accountsSnap.forEach((d) => {
          firestoreAccounts.push(d.data() as Account);
        });

        const txnSnap = await getDocs(collection(db, 'transactions'));
        const firestoreTxns: Transaction[] = [];
        txnSnap.forEach((d) => {
          firestoreTxns.push(d.data() as Transaction);
        });

        const deletedIdsJson = localStorage.getItem('aura_bank_deleted_users');
        const deletedUserIds: string[] = deletedIdsJson ? JSON.parse(deletedIdsJson) : [];
        const deletedUserSet = new Set(deletedUserIds);

        if (firestoreUsers.length > 0) {
          const userMap = new Map<string, UserSession>();
          DEMO_PERSONAS.map((p) => p.user).forEach((u) => {
            if (!deletedUserSet.has(u.id)) userMap.set(u.id, u);
          });
          firestoreUsers.forEach((u) => {
            if (!deletedUserSet.has(u.id)) userMap.set(u.id, u);
          });
          setRegisteredUsers(Array.from(userMap.values()));
        }

        if (firestoreAccounts.length > 0) {
          const accMap = new Map<string, Account>();
          DEMO_PERSONAS.flatMap((p) =>
            p.accounts.map((a) => ({ ...a, userId: a.userId || p.user.id }))
          ).forEach((a) => {
            if (a.userId && !deletedUserSet.has(a.userId)) accMap.set(a.id, a);
          });
          firestoreAccounts.forEach((a) => {
            if (a.userId && !deletedUserSet.has(a.userId)) accMap.set(a.id, a);
          });
          setAllAccounts(Array.from(accMap.values()));
        }

        if (firestoreTxns.length > 0) {
          setAllTransactions(firestoreTxns);
        }
      } catch (err) {
        console.error('Failed to fetch Firestore data on mount:', err);
      }
    }
    fetchFirestoreData();
  }, []);

  const isAdmin = user?.id === 'usr_admin' || isAdminMode;

  // Compute accounts:
  // Admin sees all accounts. Regular users see their own accounts.
  // Requirement: "new accounts should be zero, clean, no transactions"
  const accounts: Account[] = useMemo(() => {
    if (isAdmin) {
      return allAccounts;
    }
    if (!user) {
      return [];
    }
    const userAccs = allAccounts.filter((a) => a.userId === user.id);
    if (userAccs.length > 0) {
      return userAccs;
    }
    // Match Jeffrery Charles Hiatt
    if (user.id === 'usr_hiatt_01' || user.email === 'j.hiatt@usagrantfunding.org') {
      const hiattAcc = allAccounts.find((a) => a.id === 'acc_chk_01');
      if (hiattAcc) return [hiattAcc];
    }
    // Brand new user fallback: clean zero-balance account
    const cleanZeroAccount: Account = {
      id: `acc_usr_${user.id}`,
      userId: user.id,
      name: 'Primary Commercial Checking',
      accountNumber: '•••• ' + (user.id.slice(-4) || '4892'),
      fullAccountNumber: '021000' + (user.id.slice(-6) || '892401'),
      routingNumber: '021000021',
      type: 'checking',
      balance: 0.0, // EXACTLY 0.00
      currency: 'USD',
      dailyWithdrawalLimit: 25000,
      withdrawnToday: 0,
    };
    return [cleanZeroAccount];
  }, [isAdmin, user, allAccounts]);

  // Compute transactions:
  // Admin sees all transactions. Regular users see only their own accounts' transactions.
  // For any new account with no activity, returns [] (clean, zero transactions).
  const transactions: Transaction[] = useMemo(() => {
    if (isAdmin) {
      return allTransactions;
    }
    if (!user || accounts.length === 0) {
      return [];
    }
    const userAccountIds = new Set(accounts.map((a) => a.id));
    return allTransactions.filter((t) => userAccountIds.has(t.accountId));
  }, [isAdmin, user, accounts, allTransactions]);

  const activeAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0] || null;
  const totalNetWorth = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  const saveUserSession = (newUser: UserSession, rememberMe: boolean = false) => {
    setUser(newUser);
    const now = Date.now();
    if (rememberMe) {
      localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, now.toString());
      sessionStorage.removeItem(STORAGE_KEYS.SESSION_USER);
    } else {
      localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.LAST_ACTIVITY);
      sessionStorage.setItem(STORAGE_KEYS.SESSION_USER, JSON.stringify(newUser));
    }
  };

  const loginAsPersona = (index: number, rememberMe: boolean = false) => {
    const persona = DEMO_PERSONAS[index] || DEMO_PERSONAS[0];
    saveUserSession(persona.user, rememberMe);
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
      return true;
    }

    const matchedRegistered = registeredUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (matchedRegistered) {
      setIsAdminMode(false);
      saveUserSession(matchedRegistered, rememberMe);
      return true;
    }

    // Only registered accounts or demo personas can sign in
    return false;
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

    const newUserId = `usr_${Date.now()}`;
    const newUser: UserSession = {
      id: newUserId,
      name,
      email,
      company: company || 'USA Grant Recipient',
      tier: 'Commercial Executive',
      avatarInitials: initials,
      memberSince: 'October 2026',
      phone: '+1 (800) 555-0199',
      twoFactorEnabled: true,
    };

    // Requirement: "new accounts should be zero, clean, no transactions"
    const newAccount: Account = {
      id: `acc_${newUserId}`,
      userId: newUserId,
      name: 'Primary Commercial Checking',
      accountNumber: '•••• ' + Math.floor(1000 + Math.random() * 9000),
      fullAccountNumber: '021000' + Math.floor(100000 + Math.random() * 900000),
      routingNumber: '021000021',
      type: 'checking',
      balance: 0.0, // EXACTLY 0.00: zero balance, clean
      currency: 'USD',
      dailyWithdrawalLimit: 25000,
      withdrawnToday: 0,
    };

    setRegisteredUsers((prev) => [newUser, ...prev]);
    setAllAccounts((prev) => [newAccount, ...prev]);
    // NOTE: Zero transactions! Clean slate!
    setIsAdminMode(false);
    saveUserSession(newUser, rememberMe);
    setDoc(doc(db, 'users', newUserId), newUser).catch((err) => handleFirestoreError(err, OperationType.CREATE, `users/${newUserId}`));
    setDoc(doc(db, 'accounts', newAccount.id), newAccount).catch((err) => handleFirestoreError(err, OperationType.CREATE, `accounts/${newAccount.id}`));
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.LAST_ACTIVITY);
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_USER);
    setUser(null);
    setIsAdminMode(false);
  };

  // Admin capabilities with Firestore persistence
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
    updateDoc(doc(db, 'users', userId), data).catch((err) => handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`));
  };

  const deleteUser = (userId: string): boolean => {
    if (userId === 'usr_admin') {
      return false;
    }
    const userAccountIds = new Set(
      allAccounts.filter((a) => a.userId === userId).map((a) => a.id)
    );

    try {
      const deletedIdsJson = localStorage.getItem('aura_bank_deleted_users');
      const deletedUserIds: string[] = deletedIdsJson ? JSON.parse(deletedIdsJson) : [];
      if (!deletedUserIds.includes(userId)) {
        deletedUserIds.push(userId);
        localStorage.setItem('aura_bank_deleted_users', JSON.stringify(deletedUserIds));
      }

      const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS_LIST);
      if (savedUsers) {
        const parsedUsers: UserSession[] = JSON.parse(savedUsers);
        const filteredUsers = parsedUsers.filter((u) => u.id !== userId);
        localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(filteredUsers));
      }

      const savedAccounts = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      if (savedAccounts) {
        const parsedAccounts: Account[] = JSON.parse(savedAccounts);
        const filteredAccounts = parsedAccounts.filter((a) => a.userId !== userId);
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(filteredAccounts));
      }
    } catch {}

    setRegisteredUsers((prev) => prev.filter((u) => u.id !== userId));
    setAllAccounts((prev) => prev.filter((a) => a.userId !== userId));
    setAllTransactions((prev) => prev.filter((t) => !userAccountIds.has(t.accountId)));

    deleteDoc(doc(db, 'users', userId)).catch((err) => handleFirestoreError(err, OperationType.DELETE, `users/${userId}`));
    userAccountIds.forEach((accId) => {
      deleteDoc(doc(db, 'accounts', accId)).catch((err) => handleFirestoreError(err, OperationType.DELETE, `accounts/${accId}`));
    });
    return true;
  };

  const updateAccountDetails = (accountId: string, data: Partial<Account>) => {
    setAllAccounts((prev) =>
      prev.map((a) => (a.id === accountId ? { ...a, ...data } : a))
    );
    updateDoc(doc(db, 'accounts', accountId), data).catch((err) => handleFirestoreError(err, OperationType.UPDATE, `accounts/${accountId}`));
  };

  const setAccountBalance = (accountId: string, newBalance: number) => {
    const balNum = Number(newBalance);
    setAllAccounts((prev) =>
      prev.map((a) => (a.id === accountId ? { ...a, balance: balNum } : a))
    );
    updateDoc(doc(db, 'accounts', accountId), { balance: balNum }).catch((err) => handleFirestoreError(err, OperationType.UPDATE, `accounts/${accountId}`));
  };

  const updateTransaction = (transactionId: string, data: Partial<Transaction>) => {
    setAllTransactions((prev) =>
      prev.map((t) => (t.id === transactionId ? { ...t, ...data } : t))
    );
    updateDoc(doc(db, 'transactions', transactionId), data).catch((err) => handleFirestoreError(err, OperationType.UPDATE, `transactions/${transactionId}`));
  };

  const addTransaction = (data: Omit<Transaction, 'id'>): Transaction => {
    const newTxn: Transaction = {
      ...data,
      id: `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };
    setAllTransactions((prev) => [newTxn, ...prev]);
    setDoc(doc(db, 'transactions', newTxn.id), newTxn).catch((err) => handleFirestoreError(err, OperationType.CREATE, `transactions/${newTxn.id}`));
    return newTxn;
  };

  const deleteTransaction = (transactionId: string) => {
    setAllTransactions((prev) => prev.filter((t) => t.id !== transactionId));
    deleteDoc(doc(db, 'transactions', transactionId)).catch((err) => handleFirestoreError(err, OperationType.DELETE, `transactions/${transactionId}`));
  };

  const deposit = ({
    accountId,
    amount,
    fundingMethod,
    memo,
  }: DepositParams) => {
    const target = accounts.find((a) => a.id === accountId) || accounts[0];
    if (!target) return { success: false, message: 'Account not found' };

    const newBal = target.balance + Math.abs(amount);
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

    setAllAccounts((prev) =>
      prev.map((a) =>
        a.id === target.id ? { ...a, balance: newBal } : a
      )
    );
    setAllTransactions((prev) => [txn, ...prev]);

    updateDoc(doc(db, 'accounts', target.id), { balance: newBal }).catch((err) => handleFirestoreError(err, OperationType.UPDATE, `accounts/${target.id}`));
    setDoc(doc(db, 'transactions', txn.id), txn).catch((err) => handleFirestoreError(err, OperationType.CREATE, `transactions/${txn.id}`));

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

    const newBal = target.balance - Math.abs(amount);
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

    setAllAccounts((prev) =>
      prev.map((a) =>
        a.id === target.id ? { ...a, balance: newBal } : a
      )
    );
    setAllTransactions((prev) => [txn, ...prev]);

    updateDoc(doc(db, 'accounts', target.id), { balance: newBal }).catch((err) => handleFirestoreError(err, OperationType.UPDATE, `accounts/${target.id}`));
    setDoc(doc(db, 'transactions', txn.id), txn).catch((err) => handleFirestoreError(err, OperationType.CREATE, `transactions/${txn.id}`));

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

    const fromNewBal = fromAcct.balance - amount;
    const toNewBal = toAcct.balance + amount;

    setAllAccounts((prev) =>
      prev.map((a) => {
        if (a.id === fromAccountId) return { ...a, balance: fromNewBal };
        if (a.id === toAccountId) return { ...a, balance: toNewBal };
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

    setAllTransactions((prev) => [txnOut, txnIn, ...prev]);

    updateDoc(doc(db, 'accounts', fromAccountId), { balance: fromNewBal }).catch((err) => handleFirestoreError(err, OperationType.UPDATE, `accounts/${fromAccountId}`));
    updateDoc(doc(db, 'accounts', toAccountId), { balance: toNewBal }).catch((err) => handleFirestoreError(err, OperationType.UPDATE, `accounts/${toAccountId}`));
    setDoc(doc(db, 'transactions', txnOut.id), txnOut).catch((err) => handleFirestoreError(err, OperationType.CREATE, `transactions/${txnOut.id}`));
    setDoc(doc(db, 'transactions', txnIn.id), txnIn).catch((err) => handleFirestoreError(err, OperationType.CREATE, `transactions/${txnIn.id}`));

    return { success: true, message: 'Internal transfer completed' };
  };

  const resetToDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
    localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.USERS_LIST);
    localStorage.removeItem('aura_bank_deleted_users');
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_USER);

    setUser(null);
    setRegisteredUsers(DEMO_PERSONAS.map((p) => p.user));
    setAllAccounts(
      DEMO_PERSONAS.flatMap((p) =>
        p.accounts.map((a) => ({ ...a, userId: a.userId || p.user.id }))
      )
    );
    setAllTransactions(INITIAL_TRANSACTIONS);
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
