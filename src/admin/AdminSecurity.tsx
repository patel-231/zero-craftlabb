import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, Key, Check, AlertCircle, History } from 'lucide-react';
import { api } from '../services/api.ts';
import { AdminUser } from '../types/index.ts';

export const AdminSecurity: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    api.getAdminMe().then((res) => setCurrentUser(res.user)).catch(console.error);
    api.getDashboardStats().then((res) => setAuditLogs(res.auditLogs || [])).catch(console.error);
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.changePassword(currentPassword, newPassword, confirmPassword);
      setSuccessMsg(res.message || 'Password successfully updated! Your next sign-in will require this new password.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // Refresh audit logs
      api.getDashboardStats().then((r) => setAuditLogs(r.auditLogs || []));
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not update password. Please verify your current password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17191F]">Security &amp; Administrator Account</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Manage administrator credentials, active session parameters, and cryptographic password updates.
        </p>
      </div>

      {/* Account Info Box */}
      <div className="bg-white rounded-2xl border border-[#E7E3D8] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Authenticated Identity</span>
          <h3 className="font-extrabold text-base text-[#17191F] mt-0.5">{currentUser?.email}</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Role: <strong className="text-[#5B5FEF] uppercase">{currentUser?.role}</strong> • Session valid
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1.5 self-start sm:self-auto">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>PBKDF2 SHA-512 Encrypted</span>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-2xl border border-[#E7E3D8] p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2 border-b border-[#E7E3D8] pb-4">
          <Key size={18} className="text-[#5B5FEF]" />
          <h2 className="text-base font-extrabold text-[#17191F]">Change Administrator Password</h2>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <Check size={16} className="text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold uppercase text-zinc-700 mb-1.5">
              Current Password *
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] text-sm focus:outline-none focus:border-[#5B5FEF]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-zinc-700 mb-1.5">
              New Password * (Min 8 characters)
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter strong new password"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] text-sm focus:outline-none focus:border-[#5B5FEF]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-zinc-700 mb-1.5">
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] text-sm focus:outline-none focus:border-[#5B5FEF]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-[#17191F] text-white font-bold text-xs hover:bg-[#5B5FEF] transition-colors"
          >
            {isSubmitting ? 'Updating Credentials...' : 'Update Password Securely'}
          </button>
        </form>
      </div>

      {/* Security Audit History */}
      <div className="bg-white rounded-2xl border border-[#E7E3D8] p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E7E3D8] pb-3">
          <History size={16} className="text-zinc-500" />
          <h2 className="text-sm font-extrabold text-[#17191F]">Administrative Audit Trail</h2>
        </div>

        {auditLogs.length === 0 ? (
          <div className="text-xs text-zinc-400">No recent security events logged.</div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-[#5B5FEF] mr-2">{log.action}</span>
                  <span className="text-zinc-700">{log.details}</span>
                  {log.user && <span className="text-zinc-400 ml-2">by {log.user}</span>}
                </div>
                <span className="text-zinc-400 font-mono text-[10px]">
                  {new Date(log.timestamp).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
