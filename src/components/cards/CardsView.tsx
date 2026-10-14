import React, { useState } from 'react';
import {
  Check,
  CreditCard,
  Eye,
  EyeOff,
  Lock,
  Plus,
  Shield,
  Sliders,
  Snowflake,
  Trash2,
  Unlock,
  Zap,
} from 'lucide-react';
import { useBanking } from '../../context/BankingContext';
import { VirtualCard } from '../../types/banking';

export const CardsView: React.FC = () => {
  const { cards, accounts, issueCard, toggleCardFreeze, updateCardLimit, user } = useBanking();
  const [revealedCardId, setRevealedCardId] = useState<string | null>(null);
  const [copiedPan, setCopiedPan] = useState<string | null>(null);

  // Issue card modal state
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [newCardName, setNewCardName] = useState('Procurement & Travel');
  const [newCardAccountId, setNewCardAccountId] = useState(accounts[0]?.id || '');
  const [newCardLimit, setNewCardLimit] = useState('25000');
  const [newCardNetwork, setNewCardNetwork] = useState<'Visa' | 'Mastercard'>('Visa');
  const [newCardTier, setNewCardTier] = useState<'Signature Corporate' | 'Private Reserve' | 'Commercial Black'>('Signature Corporate');

  // Adjust limit modal
  const [editingCard, setEditingCard] = useState<VirtualCard | null>(null);
  const [editLimitValue, setEditLimitValue] = useState('');

  const toggleReveal = (cardId: string) => {
    if (revealedCardId === cardId) {
      setRevealedCardId(null);
    } else {
      setRevealedCardId(cardId);
      setTimeout(() => {
        setRevealedCardId((current) => (current === cardId ? null : current));
      }, 15000);
    }
  };

  const copyPan = (pan: string, cardId: string) => {
    const rawPan = pan.replace(/[^0-9]/g, '');
    navigator.clipboard.writeText(rawPan || '4242904281929042');
    setCopiedPan(cardId);
    setTimeout(() => setCopiedPan(null), 2000);
  };

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(newCardLimit);
    if (isNaN(limit) || limit <= 0) return;

    issueCard({
      accountId: newCardAccountId,
      cardName: newCardName,
      monthlyLimit: limit,
      network: newCardNetwork,
      cardTier: newCardTier,
    });

    setIsIssueModalOpen(false);
    setNewCardName('Procurement & Travel');
    setNewCardLimit('25000');
  };

  const handleUpdateLimitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;
    const limit = parseFloat(editLimitValue);
    if (!isNaN(limit) && limit > 0) {
      updateCardLimit(editingCard.id, limit);
      setEditingCard(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Commercial Virtual Cards
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Zero-liability corporate Visa & Mastercard debit facilities with granular controls
          </p>
        </div>
        <button
          onClick={() => setIsIssueModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Issue Virtual Card</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const isRevealed = revealedCardId === card.id;
          const isFrozen = card.isFrozen;
          const linkedAccount = accounts.find((a) => a.id === card.accountId);
          const percentUsed = Math.min(100, (card.currentSpend / card.monthlyLimit) * 100);

          return (
            <div
              key={card.id}
              className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-sm bg-white hover:shadow-md ${
                isFrozen ? 'border-cyan-300' : 'border-slate-200'
              }`}
            >
              {/* Frozen Banner */}
              {isFrozen && (
                <div className="bg-cyan-50 border-b border-cyan-200 px-4 py-1.5 flex items-center justify-between text-[11px] text-cyan-800">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Snowflake className="w-3.5 h-3.5 text-cyan-600" />
                    Card Temporarily Frozen
                  </span>
                  <span className="font-mono text-[10px]">Zero Transactions Allowed</span>
                </div>
              )}

              {/* Physical Card Representation in deep prestigious blue shades */}
              <div
                className={`p-6 relative text-white ${
                  card.network === 'Visa'
                    ? 'bg-gradient-to-br from-[#1E3A8A] via-[#1D4ED8] to-[#0F172A]'
                    : 'bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#2563EB]'
                }`}
              >
                {/* Background decorative texture */}
                <div className="absolute top-0 right-0 w-44 h-44 bg-blue-400/20 blur-2xl rounded-full pointer-events-none" />

                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-blue-200 font-mono font-medium">
                      Aura Bank Commercial
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5">{card.cardName}</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-white">
                    {card.network}
                  </span>
                </div>

                {/* EMV Chip Representation */}
                <div className="my-6 flex items-center justify-between relative z-10">
                  <div className="w-10 h-7 rounded bg-amber-400 border border-amber-300 flex items-center justify-center p-1 shadow-inner">
                    <div className="w-full h-full border border-amber-600/40 rounded-sm opacity-60 grid grid-cols-2 gap-0.5">
                      <div className="border-r border-amber-600/40"></div>
                      <div></div>
                    </div>
                  </div>
                  <span className="text-[10px] text-blue-200 uppercase font-mono">
                    {card.cardTier}
                  </span>
                </div>

                {/* PAN Number */}
                <div className="mb-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-mono font-semibold tracking-widest text-white tabular-nums">
                      {isRevealed ? card.fullPan : `•••• •••• •••• ${card.last4}`}
                    </span>
                    <button
                      onClick={() => toggleReveal(card.id)}
                      className="p-1 text-blue-200 hover:text-white transition-colors"
                      title={isRevealed ? 'Hide details' : 'Reveal details'}
                    >
                      {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Cardholder & Expiry & CVV */}
                <div className="flex items-end justify-between relative z-10 text-xs">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-blue-200 block">
                      Cardholder
                    </span>
                    <span className="font-mono text-white font-medium text-[11px] truncate max-w-[140px] block">
                      {card.cardholderName}
                    </span>
                  </div>

                  <div className="flex gap-4 font-mono text-[11px]">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-blue-200 block font-sans">
                        Expires
                      </span>
                      <span className="text-white">{card.expiry}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-blue-200 block font-sans">
                        CVV
                      </span>
                      <span className="text-white">{isRevealed ? card.cvv : '•••'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Spending Limit Progress & Controls */}
              <div className="p-5 bg-white space-y-3 border-t border-slate-100">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-500 font-medium">Monthly Spending Limit</span>
                    <span className="font-mono text-slate-800 font-semibold tabular-nums">
                      ${card.currentSpend.toLocaleString()} / ${card.monthlyLimit.toLocaleString()} USD
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        percentUsed > 80 ? 'bg-red-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${percentUsed}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Linked to: {linkedAccount?.name || 'Primary Checking'}
                  </p>
                </div>

                {/* Card Management Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => toggleCardFreeze(card.id)}
                    className={`flex-1 py-2.5 px-3 text-xs font-semibold rounded-xl border transition-colors flex items-center justify-center gap-1.5 min-h-[44px] ${
                      isFrozen
                        ? 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {isFrozen ? <Unlock className="w-4 h-4" /> : <Snowflake className="w-4 h-4" />}
                    <span>{isFrozen ? 'Unfreeze' : 'Freeze'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingCard(card);
                      setEditLimitValue(card.monthlyLimit.toString());
                    }}
                    className="p-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Adjust Limit"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => copyPan(card.fullPan, card.id)}
                    className="p-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Copy Card Number"
                  >
                    {copiedPan === card.id ? <Check className="w-4 h-4 text-blue-600" /> : <CreditCard className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Issue Card Modal */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsIssueModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-t-3xl sm:rounded-2xl border border-slate-200 bg-white shadow-2xl p-6 text-slate-900 z-10 max-h-[92vh] overflow-y-auto">
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto -mt-2 mb-3 sm:hidden" />
            <h3 className="text-base font-bold text-slate-900 mb-1">Issue New Virtual Debit Card</h3>
            <p className="text-xs text-slate-500 mb-4">
              Instantly provisions a zero-fee corporate card on the payment network
            </p>

            <form onSubmit={handleIssueSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Card Purpose / Name</label>
                <input
                  type="text"
                  value={newCardName}
                  onChange={(e) => setNewCardName(e.target.value)}
                  placeholder="e.g. AWS Cloud Infrastructure"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Funding Account</label>
                <select
                  value={newCardAccountId}
                  onChange={(e) => setNewCardAccountId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.accountNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Card Network</label>
                  <select
                    value={newCardNetwork}
                    onChange={(e) => setNewCardNetwork(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Visa">Visa Signature</option>
                    <option value="Mastercard">Mastercard World Elite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Monthly Limit (USD)</label>
                  <input
                    type="number"
                    value={newCardLimit}
                    onChange={(e) => setNewCardLimit(e.target.value)}
                    placeholder="25000"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Card Tier / Design</label>
                <select
                  value={newCardTier}
                  onChange={(e) => setNewCardTier(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="Signature Corporate">Signature Corporate (Titanium Blue)</option>
                  <option value="Commercial Black">Commercial Black (Deep Navy)</option>
                  <option value="Private Reserve">Private Reserve (Royal Blue)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="flex-1 py-2 text-xs font-medium rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20"
                >
                  Authorize & Issue Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Limit Modal */}
      {editingCard && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setEditingCard(null)} />
          <div className="relative w-full max-w-sm rounded-t-3xl sm:rounded-2xl border border-slate-200 bg-white shadow-2xl p-6 text-slate-900 z-10">
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto -mt-2 mb-3 sm:hidden" />
            <h3 className="text-sm font-bold text-slate-900 mb-1">Adjust Monthly Spending Cap</h3>
            <p className="text-xs text-slate-500 mb-4">{editingCard.cardName} (•••• {editingCard.last4})</p>

            <form onSubmit={handleUpdateLimitSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">New Monthly Limit (USD)</label>
                <input
                  type="number"
                  value={editLimitValue}
                  onChange={(e) => setEditLimitValue(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCard(null)}
                  className="flex-1 py-2 text-xs font-medium rounded border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Update Limit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
