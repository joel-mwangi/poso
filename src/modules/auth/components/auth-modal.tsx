import React, { useState } from 'react';
import { authService } from '../auth-service';
import {
  Store,
  UserPlus,
  LogIn,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  X,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register' | 'accept_invitation';
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'accept_invitation'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'register') {
        if (!name.trim() || !email.trim() || !password) {
          setError('Please provide your name, email, and password.');
          setIsLoading(false);
          return;
        }
        await authService.registerOwner(name.trim(), email.trim(), phone.trim());
      } else if (mode === 'login') {
        if (!email.trim() || !password) {
          setError('Please enter your email and password.');
          setIsLoading(false);
          return;
        }
        await authService.login(email.trim());
      } else if (mode === 'accept_invitation') {
        if (!email.trim() || !password) {
          setError('Please enter your invitation email and chosen password.');
          setIsLoading(false);
          return;
        }
        await authService.acceptInvitation(email.trim(), inviteCode);
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (type: 'owner' | 'staff' | 'new_owner') => {
    setIsLoading(true);
    await authService.switchDemoAccount(type);
    setIsLoading(false);
    onClose();
    if (onSuccess) onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Strip */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-800 text-white flex items-center justify-center font-black text-base shadow-xs">
              DF
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 tracking-tight">DukaFlow Access</h2>
              <p className="text-[11px] text-slate-500">Kenyan Retail Operating System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 p-1.5 mx-6 mt-4 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all text-center ${
              mode === 'register'
                ? 'bg-white text-teal-900 shadow-xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            New Owner
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all text-center ${
              mode === 'login'
                ? 'bg-white text-teal-900 shadow-xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('accept_invitation');
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all text-center ${
              mode === 'accept_invitation'
                ? 'bg-white text-teal-900 shadow-xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            Helper Invite
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
              {error}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. John Mwangi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 text-slate-900 text-xs font-medium"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {mode === 'accept_invitation' ? 'Invited Email Address *' : 'Email Address *'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="e.g. shopowner@dukaflow.ke"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 text-slate-900 text-xs font-medium"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kenyan Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  placeholder="e.g. 0712 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 text-slate-900 text-xs font-mono"
                />
              </div>
            </div>
          )}

          {mode === 'accept_invitation' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Invitation Code (Optional if using email link)
              </label>
              <input
                type="text"
                placeholder="e.g. INV-89241"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono uppercase text-xs"
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {mode === 'accept_invitation' ? 'Create Password *' : 'Password *'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 text-slate-900 text-xs font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span>Processing...</span>
            ) : mode === 'register' ? (
              <>
                <span>Continue to Shop Setup</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Log In to Workspace</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Activate Helper Account</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Previews */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Instant Demo Logins (No typing required)</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemo('owner')}
              className="px-3 py-2 bg-white border border-slate-200 hover:border-teal-600 hover:bg-teal-50/50 rounded-xl text-left transition-colors"
            >
              <span className="font-bold text-slate-800 block text-[11px]">Owner Account</span>
              <span className="text-[10px] text-slate-500 block">Mwangi (Mwangaza Duka)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('staff')}
              className="px-3 py-2 bg-white border border-slate-200 hover:border-teal-600 hover:bg-teal-50/50 rounded-xl text-left transition-colors"
            >
              <span className="font-bold text-slate-800 block text-[11px]">Helper / Cashier</span>
              <span className="text-[10px] text-slate-500 block">Joel G. (Kawangware)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
