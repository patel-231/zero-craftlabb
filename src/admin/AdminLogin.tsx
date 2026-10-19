import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldAlert,
  ArrowRight,
  Loader2,
  KeyRound,
  HelpCircle,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { api, authStorage } from '../services/api.ts';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoverySuccess, setRecoverySuccess] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in with valid token, redirect to dashboard or original target page
    const token = authStorage.getToken();
    if (token) {
      api.getAdminMe()
        .then(() => {
          const redirect = new URLSearchParams(window.location.search).get('redirect') || '/admin';
          navigate(redirect, { replace: true });
        })
        .catch(() => authStorage.clearToken());
    }
  }, [navigate]);

  const handleFillCredentials = () => {
    setEmail('admin@zerocraftlabb.com');
    setPassword('9094.zero.craftlabb@231');
    setRecoverySuccess('Credentials auto-filled! Click "Sign In to Console" below.');
    setTimeout(() => setRecoverySuccess(null), 4000);
  };

  const handleResetPassword = async () => {
    setIsResetting(true);
    setRecoverySuccess(null);
    setErrorMessage(null);
    try {
      const res = await api.resetDefaultPassword();
      setEmail(res.email);
      setPassword(res.defaultPassword);
      setRecoverySuccess('Password reset successfully to CraftLabb@2026!Secure and auto-filled.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset password.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both administrator email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.login(email.trim(), password);
      const redirect = new URLSearchParams(window.location.search).get('redirect') || '/admin';
      navigate(redirect, { replace: true });
    } catch (err: any) {
      console.error('Login failed:', err);
      setErrorMessage(err.message || 'Invalid administrator credentials. Access denied.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#17191F] flex items-center justify-center p-4 selection:bg-[#5B5FEF] selection:text-white">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-[#1F222B] border border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#5B5FEF]/20 text-[#5B5FEF] flex items-center justify-center mx-auto mb-4 border border-[#5B5FEF]/30">
              <Lock size={22} />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Zero Craftlabb Portal
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Private Administrative &amp; Order Management Console
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-start gap-3">
              <ShieldAlert size={18} className="text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Administrator Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none focus:border-[#5B5FEF] placeholder:text-zinc-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none focus:border-[#5B5FEF] placeholder:text-zinc-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1"
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all ${
                isSubmitting
                  ? 'bg-zinc-700 text-zinc-400 cursor-wait'
                  : 'bg-[#5B5FEF] hover:bg-[#4d51df] shadow-lg shadow-[#5B5FEF]/30'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Console</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Recovery & Credentials Helper */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowRecovery(!showRecovery)}
                className="w-full text-center text-xs text-zinc-400 hover:text-zinc-200 flex items-center justify-center gap-1.5 py-1.5 transition-colors"
              >
                <HelpCircle size={14} className="text-[#5B5FEF]" />
                <span>Forgot Email or Password? / Login Help</span>
              </button>

              {recoverySuccess && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>{recoverySuccess}</span>
                </div>
              )}

              {showRecovery && (
                <div className="mt-3 p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-zinc-300 tracking-wider flex items-center gap-1.5">
                      <KeyRound size={14} className="text-[#5B5FEF]" /> Admin Credentials
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">
                      Active
                    </span>
                  </div>

                  <div className="space-y-1.5 font-mono text-xs bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80 text-zinc-300">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500">Email:</span>
                      <span className="text-white select-all font-semibold">admin@zerocraftlabb.com</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500">Also accepts:</span>
                      <span className="text-zinc-400 select-all font-semibold">ompatel787877@gmail.com</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500">Password:</span>
                      <span className="text-emerald-400 select-all font-bold">9094.zero.craftlabb@231</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-zinc-500">Fallback Pass:</span>
                      <span className="text-zinc-400 select-all font-mono">CraftLabb@2026!Secure</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleFillCredentials}
                      className="py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Auto-fill Credentials</span>
                    </button>
                    <button
                      type="button"
                      disabled={isResetting}
                      onClick={handleResetPassword}
                      className="py-2 px-3 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <RotateCcw size={12} className={isResetting ? 'animate-spin' : ''} />
                      <span>{isResetting ? 'Resetting...' : 'Reset to Default'}</span>
                    </button>
                  </div>

                  <p className="text-[10px] text-zinc-500 leading-tight">
                    Tip: You can also change the password at any time inside <strong className="text-zinc-400">Admin Settings</strong>.
                  </p>
                </div>
              )}
            </div>
          </form>

          {/* Notice */}
          <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Protected administrative area. All access attempts and administrative modifications are cryptographically signed and audited.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
