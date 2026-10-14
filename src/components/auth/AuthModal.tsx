import React, { useState } from 'react';
import { Building2, CheckCircle2, Lock, ShieldCheck, UserCheck } from 'lucide-react';
import { useBanking } from '../../context/BankingContext';
import { DEMO_PERSONAS } from '../../data/mockData';

export const AuthModal: React.FC = () => {
  const { login, loginAsPersona, register } = useBanking();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your corporate or personal email.');
      return;
    }
    login(email, password);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      setError('Please fill out all required legal account fields.');
      return;
    }
    register(fullName, email, company);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFD] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-blue-400/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Institutional Header */}
      <div className="text-center mb-8 relative z-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20 mb-4">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-sans">
          Aura Commercial Bank N.A.
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Institutional & Private Wealth Client Gateway
        </p>
      </div>

      {/* Main Auth Container */}
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-6 sm:p-8 relative z-10">
        {/* Quick Demo Access Bar */}
        <div className="mb-6 p-3.5 rounded-xl bg-blue-50/70 border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              1-Click Demo Profiles
            </span>
            <span className="text-[10px] text-blue-700 font-mono font-medium">Instant Pre-loaded USD</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {DEMO_PERSONAS.map((p, idx) => (
              <button
                key={p.user.id}
                onClick={() => loginAsPersona(idx)}
                type="button"
                className="w-full text-left p-2.5 rounded-lg bg-white hover:bg-blue-100/50 border border-blue-200/80 transition-all flex items-center justify-between group shadow-2xs"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {p.user.name}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {p.user.tier} · {p.user.company}
                  </p>
                </div>
                <span className="text-[11px] font-mono font-semibold text-blue-700 tabular-nums">
                  ${p.accounts.reduce((sum, a) => sum + a.balance, 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-[11px] text-slate-400 uppercase tracking-widest font-mono">
            Or Sign In With Credentials
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Tab switcher: Login vs Register */}
        <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
              mode === 'login' ? 'bg-white text-blue-700 shadow-xs font-semibold border border-slate-200/60' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Authorized Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
              mode === 'register' ? 'bg-white text-blue-700 shadow-xs font-semibold border border-slate-200/60' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Open New Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Client Corporate Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@enterprise.com"
                className="w-full px-3 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono shadow-2xs min-h-[44px]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Password / Security PIN</label>
                <span className="text-[10px] text-slate-500">Demo: Any password accepted</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono shadow-2xs min-h-[44px]"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] rounded-xl transition-all shadow-sm shadow-blue-600/20 min-h-[44px]"
            >
              Sign In to Banking Portal
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Legal Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Jordan Miller"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Business / Entity Name</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Miller Holdings LLC"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Corporate Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jordan@millerholdings.com"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono shadow-2xs"
              />
            </div>

            <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 text-blue-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Instant $100,000 USD Opening Checking Facility</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>$250,000 USD High-Yield Treasury Vault (4.95% APY)</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] rounded-md transition-all shadow-sm shadow-blue-600/20"
            >
              Initialize Accounts & Enter
            </button>
          </form>
        )}

        {/* Institutional Safeguards Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>FDIC Insured to $250k</span>
          </div>
          <span className="font-mono">Routing # 021000021</span>
          <span>TLS 1.3 Certified</span>
        </div>
      </div>
    </div>
  );
};
