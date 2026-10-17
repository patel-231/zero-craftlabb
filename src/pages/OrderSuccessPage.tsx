import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  MessageSquare,
  Copy,
  Check,
  Package,
  ArrowRight,
  Clock,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { Order } from '../types/index.ts';
import { useSettings } from '../context/SettingsContext.tsx';
import { api } from '../services/api.ts';

export const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { settings } = useSettings();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    api.getOrder(orderId)
      .then((res) => {
        setOrder(res.order);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load order:', err);
        setLoading(false);
      });
  }, [orderId]);

  const currency = settings?.commerce?.currencySymbol || '₹';

  const handleCopyOrderText = () => {
    if (!order?.whatsAppMessageText) return;
    navigator.clipboard.writeText(order.whatsAppMessageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const cleanPhone = settings?.contact?.whatsappNumber.replace(/[^0-9]/g, '') || '';
  const whatsAppUrl = order?.whatsAppMessageText
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(order.whatsAppMessageText)}`
    : `https://wa.me/${cleanPhone}`;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-pulse">
        <div className="w-16 h-16 bg-zinc-200 rounded-full mx-auto mb-4" />
        <div className="h-8 bg-zinc-200 rounded-lg w-1/2 mx-auto mb-2" />
        <div className="h-4 bg-zinc-200 rounded w-1/3 mx-auto" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-[#17191F]">Order Details Not Found</h2>
        <p className="text-sm text-zinc-500 mt-2 mb-6">
          We could not locate this order reference. Please check your link or contact support.
        </p>
        <Link
          to="/"
          className="px-6 py-2.5 bg-[#17191F] text-white font-bold text-sm rounded-xl hover:bg-[#5B5FEF] transition-colors"
        >
          Return to Storefront
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
      {/* Success Hero Badge */}
      <div className="bg-white rounded-3xl border border-[#E7E3D8] p-8 sm:p-10 text-center mb-8 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#25D366] flex items-center justify-center mx-auto mb-4 border border-emerald-200">
          <CheckCircle2 size={36} />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-[#5B5FEF]">
          Order Successfully Recorded
        </span>
        <h1 className="text-3xl font-extrabold text-[#17191F] mt-1 mb-2">
          Thank you, {order.customer.fullName}!
        </h1>
        <p className="text-sm text-zinc-500 max-w-md mx-auto mb-6">
          Your order has been safely saved in the Zero Craftlabb database with reference:
        </p>

        <div className="inline-block bg-[#F7F5F0] border border-[#E7E3D8] rounded-xl px-5 py-2.5 font-mono text-xl font-bold text-[#17191F] mb-6">
          {order.reference}
        </div>

        {/* WhatsApp Specific Callout */}
        {order.channel === 'whatsapp' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-left mb-6 max-w-xl mx-auto">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-amber-900">
                  Critical Step: Tap "Send" in WhatsApp
                </h4>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  WhatsApp click-to-chat links pre-fill the order message, but WhatsApp does not send it automatically. If the chat window did not open, click the button below to launch WhatsApp now.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#25D366] text-[#17191F] text-xs font-bold hover:bg-[#20ba59] transition-colors shadow-xs"
                  >
                    <MessageSquare size={14} />
                    <span>Open WhatsApp Chat</span>
                  </a>
                  <button
                    onClick={handleCopyOrderText}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 transition-colors"
                  >
                    {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    <span>{copied ? 'Copied to Clipboard!' : 'Copy Order Text'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Automatic Customer Email Notice */}
        <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 max-w-xl mx-auto text-left mb-6 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold">
            ✉️
          </div>
          <div>
            <span className="font-bold block text-sm">Automated Email Receipt Sent</span>
            <span className="text-zinc-600 mt-0.5 block leading-relaxed">
              We have automatically dispatched a full itemized receipt and workshop dispatch timeline to your email: <strong>{order.customer.email}</strong>.
            </span>
          </div>
        </div>

        {/* Timeline Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-left pt-4 border-t border-[#E7E3D8]">
          <div className="p-3 bg-[#F7F5F0] rounded-xl border border-[#E7E3D8]">
            <span className="text-zinc-400 block mb-0.5">Order Status</span>
            <span className="font-bold text-[#17191F] uppercase">{order.status.replace('_', ' ')}</span>
          </div>
          <div className="p-3 bg-[#F7F5F0] rounded-xl border border-[#E7E3D8]">
            <span className="text-zinc-400 block mb-0.5">Order Channel</span>
            <span className="font-bold text-[#17191F] uppercase">{order.channel}</span>
          </div>
          <div className="p-3 bg-[#F7F5F0] rounded-xl border border-[#E7E3D8]">
            <span className="text-zinc-400 block mb-0.5">Est. Dispatch</span>
            <span className="font-bold text-[#17191F]">2-3 Business Days</span>
          </div>
        </div>
      </div>

      {/* Order Itemized Summary */}
      <div className="bg-white rounded-3xl border border-[#E7E3D8] p-6 sm:p-8 space-y-6">
        <h3 className="font-extrabold text-lg text-[#17191F] border-b border-[#E7E3D8] pb-3">
          Order Summary
        </h3>

        <div className="divide-y divide-[#E7E3D8]">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-3 flex justify-between items-center text-sm">
              <div>
                <span className="font-bold text-[#17191F]">{item.productName}</span>
                {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                  <div className="text-xs text-zinc-500">
                    {Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(', ')}
                  </div>
                )}
                <div className="text-xs text-zinc-400">
                  Qty: {item.quantity} × {currency}{item.unitPrice.toLocaleString('en-IN')}
                </div>
              </div>
              <span className="font-bold text-[#17191F]">
                {currency}{item.lineTotal.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-[#E7E3D8] space-y-2 text-xs">
          <div className="flex justify-between text-zinc-600">
            <span>Subtotal</span>
            <span className="font-bold text-[#17191F]">{currency}{order.subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-zinc-600">
            <span>Shipping</span>
            <span className="font-bold text-[#17191F]">
              {order.shippingFee === 0 ? 'FREE' : `${currency}${order.shippingFee}`}
            </span>
          </div>
          <div className="pt-2 border-t border-[#E7E3D8] flex justify-between text-base font-extrabold text-[#17191F]">
            <span>Total Amount</span>
            <span className="text-[#5B5FEF]">{currency}{order.total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Delivery Address Recap */}
        <div className="pt-4 border-t border-[#E7E3D8] text-xs">
          <span className="font-bold uppercase text-zinc-400 block mb-1">Delivering To:</span>
          <p className="text-zinc-700 leading-relaxed">
            <strong>{order.customer.fullName}</strong> ({order.customer.phone})<br />
            {order.customer.addressLine}, {order.customer.landmark ? order.customer.landmark + ', ' : ''}
            {order.customer.city}, {order.customer.state} - {order.customer.postalCode}
          </p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#17191F] text-white font-bold text-sm hover:bg-[#5B5FEF] transition-colors"
        >
          <span>Continue Browsing Collections</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};
