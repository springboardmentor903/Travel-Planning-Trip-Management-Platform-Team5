import React, { useState } from 'react';
import { LogIn, UserPlus, Shield, UserCheck, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, demoLogin } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'TRAVELER' | 'GROUP_ADMIN'>('TRAVELER');
  const [travelType, setTravelType] = useState('Adventure & Culture');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        await register({
          name,
          email,
          password,
          role,
          travelType,
          phone,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string) => {
    try {
      setLoading(true);
      await demoLogin(demoEmail);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative my-8 text-slate-800 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 text-xl font-bold p-1 cursor-pointer"
        >
          &times;
        </button>

        {/* Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6 border border-slate-200/80">
          <button
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              tab === 'login' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              tab === 'register' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register
          </button>
        </div>

        {/* Quick Demo Sign In Section */}
        <div className="mb-5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            1-Click Demo Accounts
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('alex@traveler.com')}
              className="flex flex-col text-left p-2.5 rounded-xl bg-white hover:bg-slate-100/70 border border-slate-200 text-xs transition-all hover:border-slate-300 cursor-pointer shadow-xs"
            >
              <span className="font-bold text-slate-900">Alex Johnson</span>
              <span className="text-[10px] text-sky-600 font-semibold">Role: Traveler</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('elena@traveler.com')}
              className="flex flex-col text-left p-2.5 rounded-xl bg-white hover:bg-slate-100/70 border border-slate-200 text-xs transition-all hover:border-slate-300 cursor-pointer shadow-xs"
            >
              <span className="font-bold text-slate-900">Elena Rostova</span>
              <span className="text-[10px] text-indigo-600 font-semibold">Role: Group Admin</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {tab === 'register' && (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Gonzalez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-sky-500 focus:bg-white cursor-pointer"
                  >
                    <option value="TRAVELER">Traveler</option>
                    <option value="GROUP_ADMIN">Group Admin</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Travel Style</label>
                  <input
                    type="text"
                    placeholder="e.g. Backpacking"
                    value={travelType}
                    onChange={(e) => setTravelType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Email Address *</label>
            <input
              type="email"
              required
              placeholder="you@traveler.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Password *</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500 focus:bg-white"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Processing...' : tab === 'login' ? 'Sign In & Explore' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
