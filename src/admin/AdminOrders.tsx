import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  MessageSquare,
  Mail,
  Clock,
  CheckCircle,
  Truck,
  RotateCcw,
  Copy,
  Check,
  Send,
  Eye,
  X,
  AlertCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Order, OrderStatus } from '../types/index.ts';
import { api } from '../services/api.ts';

const STATUS_CONFIG: Record<OrderStatus, { label: string; badgeClass: string }> = {
  new: { label: 'New', badgeClass: 'bg-amber-100 text-amber-800' },
  awaiting_confirmation: { label: 'Awaiting Confirmation', badgeClass: 'bg-orange-100 text-orange-800' },
  confirmed: { label: 'Confirmed', badgeClass: 'bg-blue-100 text-blue-800' },
  processing: { label: 'Processing', badgeClass: 'bg-purple-100 text-purple-800' },
  shipped: { label: 'Shipped', badgeClass: 'bg-indigo-100 text-indigo-800' },
  delivered: { label: 'Delivered', badgeClass: 'bg-emerald-100 text-emerald-800' },
  cancelled: { label: 'Cancelled', badgeClass: 'bg-red-100 text-red-800' },
};

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');

  // Selected Order for Details View
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusEdit, setStatusEdit] = useState<OrderStatus>('new');
  const [notesEdit, setNotesEdit] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [retryStatus, setRetryStatus] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminOrders();
      setOrders(res.orders);
    } catch (err) {
      console.error('Failed to load orders in admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleOpenDetails = (ord: Order) => {
    setSelectedOrder(ord);
    setStatusEdit(ord.status);
    setNotesEdit(ord.internalNotes || '');
    setRetryStatus(null);
  };

  const handleUpdateStatusAndNotes = async () => {
    if (!selectedOrder) return;
    setIsUpdating(true);
    try {
      const res = await api.updateOrderStatus(selectedOrder.id, {
        status: statusEdit,
        internalNotes: notesEdit,
      });
      setSelectedOrder(res.order);
      setOrders((prev) => prev.map((o) => (o.id === res.order.id ? res.order : o)));
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRetryEmail = async () => {
    if (!selectedOrder) return;
    setRetryStatus('Attempting email dispatch...');
    try {
      const res = await api.retryOrderEmail(selectedOrder.id);
      setSelectedOrder(res.order);
      setOrders((prev) => prev.map((o) => (o.id === res.order.id ? res.order : o)));
      setRetryStatus(res.success ? 'Email dispatched successfully!' : `Email delivery issue: ${res.emailDeliveryLog?.error}`);
    } catch (err: any) {
      setRetryStatus(`Error: ${err.message}`);
    }
  };

  const handleCopyOrder = () => {
    if (!selectedOrder?.whatsAppMessageText) return;
    navigator.clipboard.writeText(selectedOrder.whatsAppMessageText);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (channelFilter !== 'all' && o.channel !== channelFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchRef = o.reference.toLowerCase().includes(q);
      const matchCust = o.customer.fullName.toLowerCase().includes(q);
      const matchPhone = o.customer.phone.includes(q);
      const matchEmail = o.customer.email.toLowerCase().includes(q);
      if (!matchRef && !matchCust && !matchPhone && !matchEmail) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17191F]">Order Management</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Track and process orders submitted via WhatsApp and transactional email.
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="p-2.5 rounded-xl bg-white border border-[#E7E3D8] hover:bg-zinc-50 text-zinc-600 transition-colors self-start sm:self-auto"
          title="Refresh orders list"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E7E3D8] p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ref, customer name, phone..."
            className="w-full pl-9 pr-4 py-2 bg-[#F7F5F0] border border-[#E7E3D8] rounded-xl text-xs focus:outline-none focus:border-[#5B5FEF]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-zinc-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#F7F5F0] border border-[#E7E3D8] px-3 py-2 rounded-xl text-xs font-bold text-[#17191F] focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="awaiting_confirmation">Awaiting Confirmation</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Channel Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-zinc-500 font-medium">Channel:</span>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="bg-[#F7F5F0] border border-[#E7E3D8] px-3 py-2 rounded-xl text-xs font-bold text-[#17191F] focus:outline-none"
            >
              <option value="all">All Channels</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-[#E7E3D8] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-400">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            No orders found matching filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F5F0] border-b border-[#E7E3D8] text-zinc-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E3D8]">
                {filteredOrders.map((ord) => {
                  const statusConf = STATUS_CONFIG[ord.status] || {
                    label: ord.status,
                    badgeClass: 'bg-zinc-100 text-zinc-700',
                  };

                  return (
                    <tr key={ord.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#17191F]">
                        {ord.reference}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-500 whitespace-nowrap">
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#17191F]">{ord.customer.fullName}</div>
                        <div className="text-zinc-500">{ord.customer.phone}</div>
                        <div className="text-[10px] text-zinc-400 truncate max-w-xs">{ord.customer.city}, {ord.customer.state}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-zinc-700">
                          {ord.items.length} {ord.items.length === 1 ? 'item' : 'items'}
                        </span>
                        <div className="text-[10px] text-zinc-400 truncate max-w-xs">
                          {ord.items.map((i) => i.productName).join(', ')}
                        </div>
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
                      <td className="py-3.5 px-4 font-extrabold text-[#17191F]">
                        ₹{ord.total.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${statusConf.badgeClass}`}>
                          {statusConf.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenDetails(ord)}
                          className="px-3 py-1.5 rounded-lg bg-[#17191F] text-white hover:bg-[#5B5FEF] font-bold text-[11px] transition-colors inline-flex items-center gap-1"
                        >
                          <Eye size={12} />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Slide-over / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#E7E3D8] w-full max-w-2xl my-8 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E7E3D8] flex items-center justify-between bg-[#F7F5F0]">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400">Order Management</span>
                <h2 className="font-extrabold text-xl text-[#17191F] font-mono">
                  {selectedOrder.reference}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-zinc-400 hover:text-black rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Customer Contact & Quick WhatsApp Action */}
              <div className="bg-[#F7F5F0] rounded-2xl p-4 border border-[#E7E3D8] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-extrabold text-sm text-[#17191F]">{selectedOrder.customer.fullName}</h3>
                  <div className="text-zinc-600 mt-0.5">
                    Phone: <strong>{selectedOrder.customer.phone}</strong> | Email: {selectedOrder.customer.email}
                  </div>
                  <div className="text-zinc-500 mt-1">
                    {selectedOrder.customer.addressLine}, {selectedOrder.customer.landmark ? selectedOrder.customer.landmark + ', ' : ''}
                    {selectedOrder.customer.city}, {selectedOrder.customer.state} - {selectedOrder.customer.postalCode}
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/${selectedOrder.customer.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(selectedOrder.customer.fullName)}%2C%20regarding%20your%20Zero%20Craftlabb%20order%20${selectedOrder.reference}%3A`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#25D366] text-[#17191F] font-bold text-xs hover:bg-[#20ba59] transition-colors"
                  >
                    <MessageSquare size={14} />
                    <span>WhatsApp Customer</span>
                  </a>
                </div>
              </div>

              {/* Status Update Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-[#E7E3D8]">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                    Update Order Status
                  </label>
                  <select
                    value={statusEdit}
                    onChange={(e) => setStatusEdit(e.target.value as OrderStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] font-bold text-xs text-[#17191F] focus:outline-none"
                  >
                    <option value="new">New</option>
                    <option value="awaiting_confirmation">Awaiting Confirmation</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                    Internal Admin Notes
                  </label>
                  <input
                    type="text"
                    value={notesEdit}
                    onChange={(e) => setNotesEdit(e.target.value)}
                    placeholder="e.g. Courier tracking AWB #123456"
                    className="w-full px-3 py-2 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] text-xs focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 flex justify-end">
                  <button
                    onClick={handleUpdateStatusAndNotes}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-[#17191F] text-white rounded-xl font-bold hover:bg-[#5B5FEF] transition-colors text-xs"
                  >
                    {isUpdating ? 'Saving Status...' : 'Apply Status Update'}
                  </button>
                </div>
              </div>

              {/* Ordered Items Table */}
              <div>
                <h4 className="font-extrabold text-sm text-[#17191F] mb-3">Order Items</h4>
                <div className="border border-[#E7E3D8] rounded-xl overflow-hidden divide-y divide-[#E7E3D8]">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-[#17191F] block">{item.productName}</span>
                        {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                          <span className="text-[11px] text-[#5B5FEF]">
                            {Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(', ')}
                          </span>
                        )}
                        <span className="text-zinc-400 block text-[10px]">
                          Qty: {item.quantity} × ₹{item.unitPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <span className="font-extrabold text-[#17191F]">
                        ₹{item.lineTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}

                  <div className="p-3 bg-[#F7F5F0] space-y-1">
                    <div className="flex justify-between text-zinc-600">
                      <span>Subtotal</span>
                      <span className="font-bold">₹{selectedOrder.subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-zinc-600">
                      <span>Shipping Fee</span>
                      <span className="font-bold">
                        {selectedOrder.shippingFee === 0 ? 'FREE' : `₹${selectedOrder.shippingFee}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-extrabold text-[#17191F] pt-1 border-t border-[#E7E3D8]">
                      <span>Final Order Total</span>
                      <span className="text-[#5B5FEF]">₹{selectedOrder.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Delivery Log & Retry Action */}
              <div className="p-4 bg-zinc-50 rounded-2xl border border-[#E7E3D8]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[#17191F]">Email Notification Status</span>
                  <button
                    onClick={handleRetryEmail}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5B5FEF] hover:underline"
                  >
                    <Send size={12} />
                    <span>Retry Send Email</span>
                  </button>
                </div>
                {selectedOrder.emailDeliveryLog ? (
                  <div className="text-[11px] text-zinc-600 space-y-1">
                    <div>
                      Provider: <strong className="uppercase text-[#5B5FEF]">{selectedOrder.emailDeliveryLog.provider || 'Brevo'}</strong> • {new Date(selectedOrder.emailDeliveryLog.attemptedAt).toLocaleString('en-IN')}
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedOrder.emailDeliveryLog.customerEmailSent ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-600'}`}>
                        {selectedOrder.emailDeliveryLog.customerEmailSent ? '✓ Customer Receipt Sent' : 'Customer Email: Pending/Failed'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedOrder.emailDeliveryLog.businessEmailSent ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-600'}`}>
                        {selectedOrder.emailDeliveryLog.businessEmailSent ? '✓ Business Alert Sent' : 'Business Email: Pending/Failed'}
                      </span>
                    </div>
                    {selectedOrder.emailDeliveryLog.error && (
                      <div className="text-zinc-500 mt-1 italic">{selectedOrder.emailDeliveryLog.error}</div>
                    )}
                  </div>
                ) : (
                  <div className="text-zinc-400 text-[11px]">No automated email triggered yet.</div>
                )}
                {retryStatus && <div className="mt-2 text-[11px] font-bold text-[#5B5FEF]">{retryStatus}</div>}
              </div>

              {/* Copy Order Payload */}
              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={handleCopyOrder}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-100 font-bold"
                >
                  {copiedRef ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copiedRef ? 'Order Text Copied' : 'Copy Full Order Message'}</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-zinc-200 text-zinc-700 rounded-xl font-bold hover:bg-zinc-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
