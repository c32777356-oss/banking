import React, { useState } from 'react';
import {
  Building2,
  Check,
  CheckCircle2,
  DollarSign,
  Edit2,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Sliders,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react';
import { useBanking } from '../../context/BankingContext';
import { Account, SpendingCategory, Transaction, TransactionStatus, TransactionType, UserSession } from '../../types/banking';

interface AdminPanelProps {
  onExit: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onExit }) => {
  const {
    user,
    registeredUsers,
    accounts,
    transactions,
    updateUserDetails,
    deleteUser,
    updateAccountDetails,
    setAccountBalance,
    updateTransaction,
    addTransaction,
    deleteTransaction,
    totalNetWorth,
    purgeSiteData,
  } = useBanking();

  const [confirmPurge, setConfirmPurge] = useState(false);

  const [activeTab, setActiveTab] = useState<'users' | 'accounts' | 'transactions'>('users');
  const [searchQuery, setSearchQuery] = useState('');

  // Quick Balance Editor state
  const [quickBalanceAccId, setQuickBalanceAccId] = useState<string>(accounts[0]?.id || '');
  const [quickBalanceVal, setQuickBalanceVal] = useState<string>('35000');
  const [balanceFeedback, setBalanceFeedback] = useState<string | null>(null);
  const [inlineEditingAccId, setInlineEditingAccId] = useState<string | null>(null);
  const [inlineBalanceVal, setInlineBalanceVal] = useState<number>(0);

  // User management state
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<UserSession | null>(null);
  const [userFeedback, setUserFeedback] = useState<string | null>(null);

  // Editing User state
  const [editingUser, setEditingUser] = useState<UserSession | null>(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    company: '',
    tier: '',
    phone: '',
  });

  // Editing Account state
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [accountForm, setAccountForm] = useState({
    name: '',
    balance: 0,
    accountNumber: '',
    fullAccountNumber: '',
    routingNumber: '',
  });

  // Editing Transaction state
  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null);
  const [txnForm, setTxnForm] = useState({
    counterparty: '',
    amount: 0,
    type: 'deposit' as TransactionType,
    category: 'Income & Deposits' as SpendingCategory,
    status: 'cleared' as TransactionStatus,
    memo: '',
    timestamp: '',
  });

  // Adding New Transaction state
  const [isAddingTxn, setIsAddingTxn] = useState(false);
  const [newTxnForm, setNewTxnForm] = useState({
    counterparty: '',
    amount: 1000,
    type: 'deposit' as TransactionType,
    category: 'Income & Deposits' as SpendingCategory,
    status: 'cleared' as TransactionStatus,
    memo: '',
  });

  // User edit handlers
  const handleStartEditUser = (u: UserSession) => {
    setEditingUser(u);
    setUserForm({
      name: u.name,
      email: u.email,
      company: u.company || '',
      tier: u.tier,
      phone: u.phone || '',
    });
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    updateUserDetails(editingUser.id, {
      name: userForm.name,
      email: userForm.email,
      company: userForm.company,
      tier: userForm.tier as any,
      phone: userForm.phone,
    });
    setEditingUser(null);
  };

  // Account edit handlers
  const handleStartEditAccount = (a: Account) => {
    setEditingAccount(a);
    setAccountForm({
      name: a.name,
      balance: a.balance,
      accountNumber: a.accountNumber,
      fullAccountNumber: a.fullAccountNumber,
      routingNumber: a.routingNumber,
    });
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;
    updateAccountDetails(editingAccount.id, {
      name: accountForm.name,
      balance: Number(accountForm.balance),
      accountNumber: accountForm.accountNumber,
      fullAccountNumber: accountForm.fullAccountNumber,
      routingNumber: accountForm.routingNumber,
    });
    setEditingAccount(null);
  };

  // Transaction edit handlers
  const handleStartEditTxn = (t: Transaction) => {
    setEditingTxn(t);
    setTxnForm({
      counterparty: t.counterparty,
      amount: t.amount,
      type: t.type,
      category: t.category,
      status: t.status,
      memo: t.memo || '',
      timestamp: t.timestamp,
    });
  };

  const handleSaveTxn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTxn) return;
    updateTransaction(editingTxn.id, {
      counterparty: txnForm.counterparty,
      amount: Number(txnForm.amount),
      type: txnForm.type,
      category: txnForm.category,
      status: txnForm.status,
      memo: txnForm.memo,
      timestamp: txnForm.timestamp,
    });
    setEditingTxn(null);
  };

  // Add Transaction handler
  const handleCreateTxn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTxnForm.counterparty) return;
    const targetAccount = accounts[0];
    const amountVal =
      newTxnForm.type === 'deposit'
        ? Math.abs(Number(newTxnForm.amount))
        : -Math.abs(Number(newTxnForm.amount));

    addTransaction({
      accountId: targetAccount?.id || 'acc_01',
      counterparty: newTxnForm.counterparty,
      amount: amountVal,
      type: newTxnForm.type,
      category: newTxnForm.category,
      status: newTxnForm.status,
      memo: newTxnForm.memo || 'Admin Adjust Ledger',
      referenceId: `ADM-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString(),
      fundingMethod: 'Direct Ledger Adjustment',
    });

    setIsAddingTxn(false);
    setNewTxnForm({
      counterparty: '',
      amount: 1000,
      type: 'deposit',
      category: 'Income & Deposits',
      status: 'cleared',
      memo: '',
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Admin Notice Banner */}
      <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/90 via-blue-50/60 to-white p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-600/20">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900">
                Administration Console
              </h1>
              <span className="text-[10px] font-bold font-mono uppercase bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                Admin Mode Active
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Live database state editor: Modify registered users, configure balances, and audit transaction history
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => setConfirmPurge(true)}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Purge Site Data
          </button>
          <button
            onClick={onExit}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            Exit Admin Console
          </button>
        </div>
      </div>

      {/* Overview Stat Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-[11px] font-mono text-slate-500 uppercase">Registered Clients</span>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">{registeredUsers.length}</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-[11px] font-mono text-slate-500 uppercase">Active Accounts</span>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">{accounts.length}</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-[11px] font-mono text-slate-500 uppercase">Combined USD Assets</span>
          <p className="text-xl font-bold font-mono text-blue-700 mt-1">
            ${totalNetWorth.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-[11px] font-mono text-slate-500 uppercase">Ledger Entries</span>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">{transactions.length}</p>
        </div>
      </div>

      {/* Main Admin Tabbed Box */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Navigation Tabs */}
        <div className="border-b border-slate-200 bg-slate-50/70 p-2 sm:p-3 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'users'
                ? 'bg-white text-indigo-700 shadow-xs border border-indigo-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Registered Users ({registeredUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('accounts')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'accounts'
                ? 'bg-white text-indigo-700 shadow-xs border border-indigo-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Accounts & Balances</span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'transactions'
                ? 'bg-white text-indigo-700 shadow-xs border border-indigo-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Transaction Ledger ({transactions.length})</span>
          </button>
        </div>

        {/* Tab 1: Users Editor */}
        {activeTab === 'users' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Registered Client Accounts</h3>
                <p className="text-xs text-slate-500">Edit legal entity credentials, names, emails, and member tiers</p>
              </div>
            </div>

            {userFeedback && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{userFeedback}</span>
              </div>
            )}

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="py-3 px-4 font-semibold">User Details</th>
                    <th className="py-3 px-4 font-semibold">Entity / Company</th>
                    <th className="py-3 px-4 font-semibold">Contact Email</th>
                    <th className="py-3 px-4 font-semibold">Authorized Phone</th>
                    <th className="py-3 px-4 font-semibold">Tier</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {registeredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-blue-100 text-blue-700 font-bold font-mono text-[11px] flex items-center justify-center">
                            {u.avatarInitials || 'US'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{u.name}</p>
                            <span className="text-[10px] text-slate-400 font-mono">{u.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{u.company || '—'}</td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{u.email}</td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{u.phone}</td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                          {u.tier}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setActiveTab('accounts');
                              setQuickBalanceAccId(accounts[0]?.id || '');
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors border border-blue-200"
                          >
                            Edit Balance
                          </button>
                          <button
                            onClick={() => handleStartEditUser(u)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-colors"
                          >
                            Edit Details
                          </button>
                          {u.id !== 'usr_admin' ? (
                            <button
                              onClick={() => setConfirmDeleteUser(u)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title={`Delete user ${u.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="p-1.5 text-slate-300 cursor-not-allowed" title="System admin cannot be deleted">
                              <Shield className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Accounts & Balance Editor */}
        {activeTab === 'accounts' && (
          <div className="p-4 sm:p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Account Balances & Routing Parameters</h3>
              <p className="text-xs text-slate-500">Directly set or modify USD balances, full account numbers, and routing numbers</p>
            </div>

            {/* Quick Balance Adjustment Bar */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-blue-50/60 to-slate-50 border border-indigo-200 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs sm:text-sm">
                  <DollarSign className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Admin Fast Balance Override</span>
                </div>
                <span className="text-[11px] text-indigo-700 font-mono">
                  Current Net Worth: ${totalNetWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {balanceFeedback && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{balanceFeedback}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                <div className="sm:col-span-4">
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Target Account</label>
                  <select
                    value={quickBalanceAccId || accounts[0]?.id || ''}
                    onChange={(e) => setQuickBalanceAccId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-1 focus:ring-indigo-600"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} (${a.balance.toLocaleString('en-US', { maximumFractionDigits: 0 })})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-5">
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">New USD Balance Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-mono font-bold text-slate-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={quickBalanceVal}
                      onChange={(e) => setQuickBalanceVal(e.target.value)}
                      placeholder="e.g. 35000"
                      className="w-full pl-7 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-mono font-bold focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3 flex sm:self-end">
                  <button
                    onClick={() => {
                      const targetId = quickBalanceAccId || accounts[0]?.id;
                      if (!targetId) return;
                      const amount = parseFloat(quickBalanceVal) || 0;
                      setAccountBalance(targetId, amount);
                      const targetAcc = accounts.find((a) => a.id === targetId);
                      setBalanceFeedback(`Set ${targetAcc?.name || 'account'} balance to $${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
                      setTimeout(() => setBalanceFeedback(null), 4000);
                    }}
                    className="w-full py-2 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] rounded-lg transition-all shadow-xs min-h-[34px] flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply Balance</span>
                  </button>
                </div>
              </div>

              {/* 1-Click Preset Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">Quick Presets:</span>
                {[10000, 35000, 50000, 100000, 250000, 500000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setQuickBalanceVal(preset.toString());
                      const targetId = quickBalanceAccId || accounts[0]?.id;
                      if (targetId) {
                        setAccountBalance(targetId, preset);
                        const targetAcc = accounts.find((a) => a.id === targetId);
                        setBalanceFeedback(`Set ${targetAcc?.name || 'account'} balance to $${preset.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
                        setTimeout(() => setBalanceFeedback(null), 4000);
                      }
                    }}
                    className="px-2.5 py-1 text-[11px] font-mono font-semibold bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md transition-colors shadow-2xs"
                  >
                    ${preset >= 1000 ? `${preset / 1000}k` : preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accounts.map((acc) => {
                const isInline = inlineEditingAccId === acc.id;
                return (
                  <div
                    key={acc.id}
                    className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{acc.name}</h4>
                        <p className="text-xs text-slate-400 font-mono">ID: {acc.id}</p>
                      </div>
                      <button
                        onClick={() => handleStartEditAccount(acc)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Full Details</span>
                      </button>
                    </div>

                    <div className="p-3.5 rounded-lg bg-blue-50/50 border border-blue-100 space-y-2.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium">Available Balance (USD):</span>
                        {isInline ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              step="0.01"
                              value={inlineBalanceVal}
                              onChange={(e) => setInlineBalanceVal(parseFloat(e.target.value) || 0)}
                              className="w-28 px-2 py-1 text-xs font-mono font-bold bg-white border border-indigo-300 rounded text-slate-900"
                            />
                            <button
                              onClick={() => {
                                setAccountBalance(acc.id, inlineBalanceVal);
                                setInlineEditingAccId(null);
                                setBalanceFeedback(`Updated ${acc.name} balance to $${inlineBalanceVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
                                setTimeout(() => setBalanceFeedback(null), 4000);
                              }}
                              className="p-1 text-emerald-600 hover:text-emerald-800 bg-emerald-50 rounded"
                              title="Save balance"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setInlineEditingAccId(null)}
                              className="p-1 text-slate-400 hover:text-slate-600"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-base font-bold text-blue-700">
                              ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <button
                              onClick={() => {
                                setInlineEditingAccId(acc.id);
                                setInlineBalanceVal(acc.balance);
                              }}
                              className="px-2 py-0.5 text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 transition-colors"
                            >
                              Change
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Account Number:</span>
                        <span className="font-mono font-semibold text-slate-800">{acc.fullAccountNumber}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Routing Number:</span>
                        <span className="font-mono font-semibold text-slate-800">{acc.routingNumber}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Transaction Ledger Editor */}
        {activeTab === 'transactions' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Transaction History Ledger</h3>
                <p className="text-xs text-slate-500">Add, edit, or remove cleared deposits, transfers, and disbursements</p>
              </div>

              <button
                onClick={() => setIsAddingTxn(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs shrink-0 self-start sm:self-center"
              >
                <Plus className="w-4 h-4" />
                <span>Inject Custom Transaction</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold">Counterparty</th>
                    <th className="py-3 px-4 font-semibold">Type</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold">Amount (USD)</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((t) => {
                    const isCredit = t.amount > 0;
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {new Date(t.timestamp).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {t.counterparty}
                          {t.memo && <span className="block text-[10px] text-slate-400 font-mono font-normal">{t.memo}</span>}
                        </td>
                        <td className="py-3 px-4 capitalize text-slate-600">{t.type}</td>
                        <td className="py-3 px-4 text-slate-600">{t.category}</td>
                        <td className="py-3 px-4 font-mono font-bold">
                          <span className={isCredit ? 'text-blue-700' : 'text-slate-800'}>
                            {isCredit ? '+' : '-'}${Math.abs(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 capitalize">
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => handleStartEditTxn(t)}
                            className="p-1 hover:text-indigo-600 text-slate-400 transition-colors"
                            title="Edit Transaction"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteTransaction(t.id)}
                            className="p-1 hover:text-red-600 text-slate-400 transition-colors"
                            title="Delete Transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Edit User Modal Dialog */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setEditingUser(null)} />
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Edit Client Account Details</h3>
              <button onClick={() => setEditingUser(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Legal Full Name</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company / Commercial Entity</label>
                <input
                  type="text"
                  value={userForm.company}
                  onChange={(e) => setUserForm({ ...userForm, company: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Authorized Phone</label>
                <input
                  type="text"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Membership Tier</label>
                <input
                  type="text"
                  value={userForm.tier}
                  onChange={(e) => setUserForm({ ...userForm, tier: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-2">
                {editingUser.id !== 'usr_admin' && (
                  <button
                    type="button"
                    onClick={() => {
                      const u = editingUser;
                      setEditingUser(null);
                      setConfirmDeleteUser(u);
                    }}
                    className="py-2 px-3 rounded-lg border border-red-200 text-red-600 font-semibold hover:bg-red-50 text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete User</span>
                  </button>
                )}
                <div className="flex items-center gap-2 flex-1 justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="py-2 px-3.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-4 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Account & Balance Modal */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setEditingAccount(null)} />
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Edit Account & Balance</h3>
              <button onClick={() => setEditingAccount(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Display Name</label>
                <input
                  type="text"
                  value={accountForm.name}
                  onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Available USD Balance (Direct Override)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-mono text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={accountForm.balance}
                    onChange={(e) => setAccountForm({ ...accountForm, balance: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-7 pr-3 py-2 border border-indigo-300 rounded-lg text-slate-900 font-mono font-bold text-sm bg-indigo-50/30"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Account Number</label>
                <input
                  type="text"
                  value={accountForm.fullAccountNumber}
                  onChange={(e) => {
                    const full = e.target.value;
                    const masked = full.length > 4 ? `•••• ${full.slice(-4)}` : full;
                    setAccountForm({ ...accountForm, fullAccountNumber: full, accountNumber: masked });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Routing Number</label>
                <input
                  type="text"
                  value={accountForm.routingNumber}
                  onChange={(e) => setAccountForm({ ...accountForm, routingNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="flex-1 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                >
                  Save Account Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {editingTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setEditingTxn(null)} />
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Edit Transaction Entry</h3>
              <button onClick={() => setEditingTxn(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTxn} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Counterparty / Description</label>
                <input
                  type="text"
                  value={txnForm.counterparty}
                  onChange={(e) => setTxnForm({ ...txnForm, counterparty: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount in USD (Negative for Debit)</label>
                <input
                  type="number"
                  step="0.01"
                  value={txnForm.amount}
                  onChange={(e) => setTxnForm({ ...txnForm, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={txnForm.type}
                    onChange={(e) => setTxnForm({ ...txnForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="deposit">Deposit</option>
                    <option value="withdrawal">Withdrawal</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={txnForm.status}
                    onChange={(e) => setTxnForm({ ...txnForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="cleared">Cleared</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Memo / Audit Tag</label>
                <input
                  type="text"
                  value={txnForm.memo}
                  onChange={(e) => setTxnForm({ ...txnForm, memo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTxn(null)}
                  className="flex-1 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Transaction Modal */}
      {isAddingTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setIsAddingTxn(false)} />
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Inject Custom Transaction</h3>
              <button onClick={() => setIsAddingTxn(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTxn} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Counterparty / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Federal Reserve Bank Settlement"
                  value={newTxnForm.counterparty}
                  onChange={(e) => setNewTxnForm({ ...newTxnForm, counterparty: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newTxnForm.amount}
                  onChange={(e) => setNewTxnForm({ ...newTxnForm, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Transaction Type</label>
                  <select
                    value={newTxnForm.type}
                    onChange={(e) => setNewTxnForm({ ...newTxnForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="deposit">Deposit (+)</option>
                    <option value="withdrawal">Withdrawal (-)</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={newTxnForm.status}
                    onChange={(e) => setNewTxnForm({ ...newTxnForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="cleared">Cleared</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Audit Memo</label>
                <input
                  type="text"
                  placeholder="e.g. Treasury Liquidity Transfer"
                  value={newTxnForm.memo}
                  onChange={(e) => setNewTxnForm({ ...newTxnForm, memo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingTxn(false)}
                  className="flex-1 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                >
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {confirmDeleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setConfirmDeleteUser(null)}
          />
          <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 z-10 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-bold text-slate-900 text-base">Delete User Account</h3>
              <p className="text-xs text-slate-600">
                Are you sure you want to permanently delete user <span className="font-semibold text-slate-900 font-mono">"{confirmDeleteUser.name}"</span>?
              </p>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-left text-[11px] text-slate-600 space-y-1 font-mono">
                <div><span className="text-slate-400">Email:</span> {confirmDeleteUser.email}</div>
                <div><span className="text-slate-400">ID:</span> {confirmDeleteUser.id}</div>
                {confirmDeleteUser.company && <div><span className="text-slate-400">Entity:</span> {confirmDeleteUser.company}</div>}
              </div>
              <p className="text-[11px] text-red-600 font-medium pt-1">
                This action cannot be undone. All credentials for this user will be removed.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteUser(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const userName = confirmDeleteUser.name;
                  deleteUser(confirmDeleteUser.id);
                  setConfirmDeleteUser(null);
                  setUserFeedback(`Client account "${userName}" has been successfully deleted.`);
                  setTimeout(() => setUserFeedback(null), 4000);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-semibold text-xs transition-all shadow-xs"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Purge All Site Data Confirmation Modal */}
      {confirmPurge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setConfirmPurge(false)}
          />
          <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 z-10 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-bold text-slate-900 text-base">Purge Entire Site Data</h3>
              <p className="text-xs text-slate-600">
                Are you sure you want to purge all site data and reset to a clean slate?
              </p>
              <p className="text-[11px] text-red-600 font-medium pt-1">
                This will erase all local accounts, registered users, transactions, and session data permanently.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmPurge(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  purgeSiteData();
                  setConfirmPurge(false);
                  onExit();
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-semibold text-xs transition-all shadow-xs"
              >
                Purge All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
