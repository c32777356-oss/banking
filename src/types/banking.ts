export type AccountType = 'checking' | 'savings' | 'treasury';

export interface Account {
  id: string;
  userId?: string;
  name: string;
  accountNumber: string; // e.g. "•••• 4892"
  fullAccountNumber: string;
  routingNumber: string;
  type: AccountType;
  balance: number; // in USD
  currency: 'USD';
  apy?: number; // e.g. 4.85 for 4.85%
  dailyWithdrawalLimit: number; // e.g. 50000
  withdrawnToday: number;
}

export type TransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'card_spend';
export type TransactionStatus = 'completed' | 'cleared' | 'pending';

export type SpendingCategory =
  | 'Income & Deposits'
  | 'Operations'
  | 'Payroll & Benefits'
  | 'Software & Cloud'
  | 'Travel & Logistics'
  | 'Wire Transfers'
  | 'Treasury & Yield'
  | 'General Business';

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number; // positive = credit/deposit, negative = debit/withdrawal
  category: SpendingCategory;
  counterparty: string;
  timestamp: string; // ISO format
  status: TransactionStatus;
  referenceId: string;
  memo?: string;
  fundingMethod?: string;
  destinationAccount?: string;
}

export interface VirtualCard {
  id: string;
  accountId: string;
  cardholderName: string;
  cardName: string;
  last4: string;
  fullPan: string;
  expiry: string;
  cvv: string;
  monthlyLimit: number;
  currentSpend: number;
  isFrozen: boolean;
  network: 'Visa' | 'Mastercard';
  cardTier: 'Signature Corporate' | 'Private Reserve' | 'Commercial Black';
}

export interface Beneficiary {
  id: string;
  name: string;
  bankName: string;
  routingNumber: string;
  accountNumber: string;
  type: 'Domestic Wire' | 'ACH Transfer';
  lastUsed?: string;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  company?: string;
  tier: 'Premier Corporate' | 'Private Wealth' | 'Commercial Executive';
  avatarInitials: string;
  memberSince: string;
  phone: string;
  twoFactorEnabled: boolean;
}
