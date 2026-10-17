import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ShieldAlert, ArrowRight, Loader2 } from 'lucide-react';
import { api, authStorage } from '../services/api.ts';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in with valid token, redirect to dashboard
    const token = authStorage.getToken();
    if (token) {
      api.getAdminMe()
        .then(() => navigate('/admin', { replace: true }))
        .catch(() => authStorage.clearToken());
    }
  }, [navigate]);

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
      navigate('/admin', { replace: true });
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
