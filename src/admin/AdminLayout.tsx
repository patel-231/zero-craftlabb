import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Sliders,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { api, authStorage } from '../services/api.ts';
import { AdminUser } from '../types/index.ts';

export const AdminLayout: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = authStorage.getToken();
    if (!token) {
      const redirect = encodeURIComponent(location.pathname + location.search);
      navigate(`/admin/login?redirect=${redirect}`, { replace: true });
      return;
    }

    // If currentUser is already loaded, skip re-verification on route switch
    if (currentUser) {
      setLoading(false);
      return;
    }

    api.getAdminMe()
      .then((res) => {
        setCurrentUser(res.user);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Admin session invalid:', err);
        authStorage.clearToken();
        const redirect = encodeURIComponent(location.pathname + location.search);
        navigate(`/admin/login?redirect=${redirect}`, { replace: true });
      });
  }, [navigate, location.pathname, location.search, currentUser]);

  const handleLogout = async () => {
    await api.logout();
    navigate('/admin/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#17191F] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-zinc-700 border-t-[#5B5FEF] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs text-zinc-400 font-mono tracking-wider">VERIFYING SECURE SESSION...</p>
        </div>
      </div>
    );
  }

  const navLinks = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Categories', path: '/admin/categories', icon: Layers },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Website Settings', path: '/admin/settings', icon: Sliders },
    { label: 'Security & Access', path: '/admin/settings/security', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[#F4F2EB] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#17191F] text-zinc-300 flex-col shrink-0 border-r border-zinc-800">
        {/* Brand Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <div className="font-extrabold text-white text-base tracking-tight flex items-center gap-1.5">
              <span>ZERO CRAFTLABB</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#FF7547] block mt-0.5">
              Management Portal
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navLinks.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#5B5FEF] text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Admin Footer & Logout */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between mb-3">
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-white block truncate">{currentUser?.email}</span>
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider">{currentUser?.role}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white hover:bg-red-900/40 hover:border-red-800 border border-zinc-700 text-xs font-bold transition-colors"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 transition-colors"
              title="Open Live Public Storefront"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Body */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-[#E7E3D8] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-zinc-600 hover:bg-zinc-100"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
              <span>Admin</span>
              <ChevronRight size={13} />
              <span className="text-[#17191F] font-bold">
                {navLinks.find((l) => (l.exact ? location.pathname === l.path : location.pathname.startsWith(l.path)))?.label || 'Portal'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#5B5FEF] hover:underline"
            >
              <span>View Storefront</span>
              <ExternalLink size={13} />
            </a>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Operational" />
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/60 flex">
            <div className="w-64 bg-[#17191F] text-white flex flex-col p-4 h-full">
              <div className="flex justify-between items-center pb-4 border-b border-zinc-800 mb-4">
                <span className="font-extrabold text-sm">ZERO CRAFTLABB</span>
                <button onClick={() => setMobileSidebarOpen(false)} className="text-zinc-400 p-1">
                  <X size={20} />
                </button>
              </div>
              <nav className="space-y-1 flex-1">
                {navLinks.map((item) => {
                  const isActive = item.exact
                    ? location.pathname === item.path
                    : location.pathname.startsWith(item.path);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold ${
                        isActive ? 'bg-[#5B5FEF] text-white' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-zinc-800 text-xs font-bold text-zinc-300 mt-auto"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
            <div className="flex-1" onClick={() => setMobileSidebarOpen(false)} />
          </div>
        )}

        {/* View Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <Outlet context={{ currentUser, setCurrentUser }} />
        </main>
      </div>
    </div>
  );
};
