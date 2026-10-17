import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Package,
  AlertTriangle,
  TrendingUp,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRight,
  MessageSquare,
  Mail,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api.ts';
import { DashboardStats, Order } from '../types/index.ts';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    api.getDashboardStats()
      .then((res) => {
        setStats(res.stats);
        setRecentOrders(res.recentOrders);
        setAuditLogs(res.auditLogs || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load admin stats:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-zinc-200 rounded-lg w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-[#E7E3D8]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17191F]">Overview Dashboard</h1>
          <p className="text-xs text-zinc-500 mt-1">Live store metrics and real-time order processing stats.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-white border border-[#E7E3D8] hover:bg-zinc-50 text-zinc-600 transition-colors"
            title="Refresh statistics"
          >
            <RefreshCw size={16} />
          </button>
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#17191F] text-white text-xs font-bold hover:bg-[#5B5FEF] transition-colors"
          >
            <Plus size={15} />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-white rounded-2xl border border-[#E7E3D8] p-5">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-[#5B5FEF]/10 text-[#5B5FEF] flex items-center justify-center">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#17191F]">{stats?.totalOrders || 0}</div>
          <div className="text-xs text-zinc-500 mt-2 flex items-center gap-1">
            <span className="font-semibold text-emerald-600">{stats?.ordersDelivered || 0} Delivered</span>
            <span>•</span>
            <span>{stats?.ordersCancelled || 0} Cancelled</span>
          </div>
        </div>

        {/* Awaiting Confirmation */}
        <div className="bg-white rounded-2xl border border-[#E7E3D8] p-5">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Awaiting Confirmation</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#17191F]">{stats?.ordersAwaitingConfirmation || 0}</div>
          <div className="text-xs text-amber-600 mt-2 font-medium">
            Requires team verification on WhatsApp/Email
          </div>
        </div>

        {/* Total Confirmed Revenue */}
        <div className="bg-white rounded-2xl border border-[#E7E3D8] p-5">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#17191F]">
            ₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-zinc-500 mt-2">Active &amp; completed orders</div>
        </div>

        {/* Inventory Alert */}
        <div className="bg-white rounded-2xl border border-[#E7E3D8] p-5">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Inventory Health</span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-600 flex items-center justify-center">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#17191F]">{stats?.totalProducts || 0}</div>
          <div className="text-xs mt-2 flex items-center gap-1.5">
            <span className="text-amber-600 font-semibold">{stats?.lowStockProducts || 0} Low Stock</span>
            <span>•</span>
            <span className="text-red-600 font-semibold">{stats?.outOfStockProducts || 0} Out of Stock</span>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl border border-[#E7E3D8] overflow-hidden">
        <div className="p-5 border-b border-[#E7E3D8] flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-base text-[#17191F]">Recent Incoming Orders</h2>
            <p className="text-xs text-zinc-500">Orders placed through WhatsApp and Email</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-[#5B5FEF] hover:underline flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            No orders placed yet. As customers check out, orders will appear here in real time.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F5F0] border-b border-[#E7E3D8] text-zinc-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E3D8]">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#17191F]">
                      {ord.reference}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#17191F]">{ord.customer.fullName}</div>
                      <div className="text-zinc-500">{ord.customer.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        ord.channel === 'whatsapp'
                          ? 'bg-[#25D366]/10 text-[#075E54]'
                          : 'bg-[#5B5FEF]/10 text-[#5B5FEF]'
                      }`}>
                        {ord.channel === 'whatsapp' ? <MessageSquare size={12} /> : <Mail size={12} />}
                        <span className="capitalize">{ord.channel}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#17191F]">
                      ₹{ord.total.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        ord.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.status === 'shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : ord.status === 'processing'
                          ? 'bg-purple-100 text-purple-800'
                          : ord.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to="/admin/orders"
                        className="px-2.5 py-1 rounded-lg bg-[#17191F] text-white hover:bg-[#5B5FEF] font-bold transition-colors inline-block text-[11px]"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audit Log Snippet */}
      {auditLogs.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E7E3D8] p-5">
          <h3 className="font-extrabold text-sm text-[#17191F] mb-3">Recent System Events</h3>
          <div className="space-y-2">
            {auditLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="text-xs flex items-center justify-between py-1.5 border-b border-zinc-100 last:border-none">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-[#5B5FEF] bg-[#5B5FEF]/10 px-2 py-0.5 rounded">
                    {log.action}
                  </span>
                  <span className="text-zinc-700">{log.details}</span>
                </div>
                <span className="text-zinc-400 font-mono text-[10px]">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
