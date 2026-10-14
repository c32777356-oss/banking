# Aura Bank — Institutional & Retail Banking Platform

Aura Bank is a high-grade, precision-crafted digital banking platform designed for institutional and private wealth clients as well as modern retail users. It delivers real-time USD balance management, instant deposits, compliance-checked withdrawals, internal/external transfers, customizable virtual debit cards, categorized financial analytics, and transaction statement exports.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed during clarification and will govern the product architecture:
> - **Banking Suite Scope**: Full suite enabled — incorporating Deposits, Withdrawals, Wire/ACH Transfers, Virtual Card Management, Spending Category Analytics, and Statement Downloads.
> - **Visual Identity**: High-contrast modern FinTech aesthetic using deep slate tones (`#090D16`), cool neutral structural surfaces (`#111827`, `#1F2937`), emerald status accents (`#10B981`), and strict tabular numerals for financial figures.
> - **Account Handling**: Hybrid authentication supporting pre-seeded demo personas (e.g. Executive Corporate Account, Premier Wealth Client) for immediate exploration alongside custom email/password registration with persistent client-side encrypted session storage.

---

## 1. Overview & Core Concept

- **What It Does**: Aura Bank offers a digital banking portal where authenticated users manage multi-tier USD accounts (Main Checking, High-Yield Reserve, Business Treasury). Users can deposit funds via ACH/Card simulation, request withdrawals with daily threshold validation, transfer capital to verified external beneficiaries, issue and freeze virtual cards, track categorical monthly spend, and generate printable PDF-styled statements.
- **Target Audience / Persona**: Private wealth individuals, corporate finance managers, and modern professionals requiring a reliable, transparent, and aesthetically refined interface to handle USD capital flows.
- **Key Value**: Delivers the tactile confidence of institutional Swiss banking paired with the fluid velocity of contemporary FinTech (Stripe, Mercury, Brex), free from decorative gimmicks and built with robust validation.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Authentication & Session Onboarding**:
   - Clean login and registration portal featuring a toggle for 1-click Quick Demo Persona access ("Alexander Vance - Premier Corporate", "Elena Rostova - Private Treasury").
   - Instant authentication initializes the secure session, sets the active ledger, and hydrates account balances.
2. **Executive Overview Dashboard**:
   - Total Net Worth banner in USD with tabular digits and dynamic 30-day percentage delta.
   - Quick Action bar: Deposit, Withdraw, Transfer, New Card.
   - Live account balance breakdown (Checking, Treasury Savings, Vault).
   - Recent transaction ledger with search, category filtering, and status details.
3. **Fund Management (Deposit & Withdraw)**:
   - **Deposit**: Select destination account, choose funding method (Instant Bank ACH, Wire, Debit), specify USD amount with quick-chip suggestions ($500, $2,500, $10,000), review fees ($0.00), and execute with instant balance update.
   - **Withdrawal**: Destination routing (External Linked Checking, Domestic Wire), daily limit validation ($50,000/day limit check with remaining allowance indicator), memo notes, and transaction receipt generation.
4. **Wire & Peer Transfers**:
   - Transfer between internal sub-accounts (zero latency) or initiate outgoing wire transfers with routing and account number verification.
5. **Virtual Card Studio**:
   - Issue virtual Visa/Mastercard debit cards linked to specific sub-accounts.
   - Dynamic card controls: Set monthly spending limits, toggle online transaction lock, reveal/hide CVV with secure timeout, and freeze/unfreeze cards.
6. **Analytics & Budget Intelligence**:
   - Category spend distribution (Payroll, Operations, Travel, Software, Logistics).
   - Monthly cash flow comparison (Inflow vs. Outflow) with visual bar breakdowns.
7. **Statement Export & Audit**:
   - Date range selector (Last 30 Days, Q1, Year-to-Date).
   - Printable, formal bank statement layout formatted for PDF download/printing.

### Visual Identity & Theme

- **Aesthetic Direction**: High-trust FinTech and private institutional banking. Deep dark slate backdrop with crisp borders, subtle glass elevations, and restrained emerald green signals.
- **Color Palette & Mood (60-30-10 Rule)**:
  - *60% Neutral Canvas*: `#090D16` (deep obsidian slate) with subtle radial ambient glow.
  - *30% Structural Surfaces*: `#111827` (card base), `#1F2937` (active surfaces), hairline dividers `#374151` / `rgba(255,255,255,0.08)`.
  - *10% High-Intent Accents*: Emerald `#10B981` (primary CTA and positive credit flows), Cyan `#06B6D4` (secondary metrics), Crimson `#EF4444` (debits/withdrawals).
- **Typography & Hierarchy (2+1 Rule)**:
  - *Display / Brand*: `Plus Jakarta Sans` or `Manrope` for sharp, authoritative section titles and brand wordmark.
  - *Body Prose*: `DM Sans` / `Plus Jakarta Sans` for clean, highly legible form fields and instructions.
  - *Tabular Numbers*: Tabular numerals (`font-mono tabular-nums`) across all balance headers, account numbers, routing tags, and transaction ledgers to guarantee vertical decimal alignment.
- **Zero-Pill Discipline**: Metadata (categories, dates, transaction types) rendered as clean, unboxed text separated by subtle bullets (`·`). Filter controls use authentic segmented buttons (`<button>`) rather than static candy capsules.
- **Top Bar Contract**:
  - Zone 1: `Aura Bank` wordmark + institutional seal mark.
  - Zone 2: Single-line navigation links (`Overview`, `Accounts`, `Transfers`, `Cards`, `Analytics`).
  - Zone 3: Active User profile badge with quick sign-out and deposit action button.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Client-Side Persistent Reactive Ledger**:
  - *Chosen Approach*: Use a TypeScript reactive state store backed by `localStorage` persistence, pre-seeded with rich realistic transaction history for demo personas.
  - *Why*: Allows instant, zero-latency deposits, withdrawals, transfers, and card creations that immediately reflect in charts, balances, and statements without fragile network timeouts.
  - *Alternatives Considered*: Pure in-memory state (resets on reload, frustrating for testing) vs full backend database (heavyweight for a frontend-driven banking demo).
- **Decision 2: Form Validation & Security Safeguards**:
  - *Chosen Approach*: Enforce real-world banking invariants (prevent overdrafts, validate minimum deposit of $1.00, check daily withdrawal limits, validate ABA routing numbers).
  - *Why*: Gives users the genuine feeling of a Tier-1 financial institution rather than a simple counter app.
- **Decision 3: Dedicated Action Drawers / Modals**:
  - *Chosen Approach*: Smooth, accessible modal dialogs for Deposit, Withdraw, and Transfer with clear step-by-step confirmation summaries before balance mutation.
  - *Why*: Prevents accidental submits and mirrors enterprise banking approval flows.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                              AURA BANK UI                              │
├────────────────────────────────────────────────────────────────────────┤
│  Top Navigation (Brand · Nav Items · User Persona Switcher · Sign Out) │
├────────────────────────────┬───────────────────────────────────────────┤
│          SIDEBAR           │              MAIN VIEWPORT                │
│  - Total Balance Card      │  [Overview]                               │
│  - Sub-Accounts List       │   ├─ Hero Metrics (Net Worth, In/Outflow) │
│    · Premier Checking      │   ├─ Quick Action Hub (Deposit/Withdraw)  │
│    · High-Yield Vault      │   ├─ Spending Breakdown & Cash Flow Chart │
│    · Corporate Treasury    │   └─ Transaction Ledger with Filters      │
│  - Quick Navigation        │  [Transfers & Wire Desk]                  │
│  - Security Status Indicator│  [Virtual Card Manager]                  │
│                            │  [Statements & Compliance Reports]        │
├────────────────────────────┴───────────────────────────────────────────┤
│                   MODALS & INTERACTION OVERLAYS                        │
│   · Deposit Modal · Withdrawal Modal · Transfer Modal · New Card Modal  │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         BANKING CORE STORE                             │
│  - Active User Session (ID, Name, Email, Tier, Avatar)                 │
│  - Accounts Store (Checking, Savings, Treasury with USD balances)      │
│  - Transactions Store (Ledger records, timestamps, categories, memos) │
│  - Virtual Cards Store (PAN, CVV, Expiry, Limits, Status)              │
│  - LocalStorage Engine (Auto-sync, pre-seeded demo state, reset seed)  │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Models

```typescript
interface Account {
  id: string;
  name: string;
  accountNumber: string;
  routingNumber: string;
  type: 'checking' | 'savings' | 'treasury';
  balance: number; // in USD
  currency: 'USD';
  apy?: number;
}

interface Transaction {
  id: string;
  accountId: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'card_spend';
  amount: number; // positive or negative
  category: 'Income' | 'Operations' | 'Payroll' | 'Software' | 'Travel' | 'Wire' | 'Investment';
  counterparty: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'cleared';
  referenceId: string;
  memo?: string;
}

interface VirtualCard {
  id: string;
  accountId: string;
  cardholderName: string;
  last4: string;
  fullPan: string;
  expiry: string;
  cvv: string;
  monthlyLimit: number;
  currentSpend: number;
  isFrozen: boolean;
  network: 'Visa' | 'Mastercard';
}
```

### Interactive Verification Points

1. **Deposit Flow**: Adding funds increases the target account balance, updates total net worth, appends a green-labeled transaction to the ledger, and records the funding method.
2. **Withdrawal Flow**: Enforces that balance is sufficient; reduces the account balance; rejects amounts exceeding current available funds; deducts from daily allowance; creates a transaction record.
3. **Card Management**: Reveals/masks sensitive card details with click toggle, enforces monthly spending limits, and toggles freeze/active state in real time.
4. **Statement Generation**: Formats an official statement for selected dates with summary header, starting balance, total deposits, total withdrawals, ending balance, and itemized ledger.
