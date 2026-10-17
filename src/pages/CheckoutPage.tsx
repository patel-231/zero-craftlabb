import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  MessageSquare,
  Mail,
  ShieldCheck,
  Truck,
  ArrowRight,
  AlertCircle,
  Loader2,
  ChevronLeft
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useSettings } from '../context/SettingsContext.tsx';
import { CustomerDetails, OrderChannel } from '../types/index.ts';
import { api } from '../services/api.ts';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi NCR', 'Chandigarh', 'Jammu and Kashmir'
];

export const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { items, subtotal, shippingFee, totalAmount, clearCart } = useCart();
  const { settings } = useSettings();

  const [channel, setChannel] = useState<OrderChannel>(
    searchParams.get('channel') === 'email' ? 'email' : 'whatsapp'
  );

  const [formData, setFormData] = useState<CustomerDetails>({
    fullName: '',
    phone: '',
    email: '',
    addressLine: '',
    landmark: '',
    city: '',
    state: 'Karnataka',
    postalCode: '',
    alternatePhone: '',
    customerNotes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  const currency = settings?.commerce?.currencySymbol || '₹';

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      newErrors.phone = 'Valid 10-digit mobile / WhatsApp number required';
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      newErrors.email = 'Valid email address is required';
    }

    if (!formData.addressLine.trim() || formData.addressLine.trim().length < 5) {
      newErrors.addressLine = 'Full street address is required for courier dispatch';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    const cleanPin = formData.postalCode.replace(/[^0-9]/g, '');
    if (!cleanPin || cleanPin.length !== 6) {
      newErrors.postalCode = 'Valid 6-digit Indian PIN code required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setServerError(null);

    if (!validateForm()) {
      window.scrollTo({ top: 150, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customer: formData,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          selectedVariants: i.selectedVariants,
        })),
        channel,
      };

      const result = await api.submitOrder(orderPayload);

      // Successfully saved on server!
      // Clear the local shopping bag
      clearCart();

      if (channel === 'whatsapp' && result.whatsAppUrl) {
        // Open WhatsApp click-to-chat in new window
        window.open(result.whatsAppUrl, '_blank', 'noopener,noreferrer');
      }

      // Navigate to order success screen with order reference
      navigate(`/order-success/${result.order.reference || result.order.id}`);
    } catch (err: any) {
      console.error('Order submission failed:', err);
      setServerError(err.message || 'Failed to place order. Please check item stock and retry.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
      <Link
        to="/cart"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-[#17191F] mb-6 transition-colors"
      >
        <ChevronLeft size={16} />
        <span>Return to Shopping Bag</span>
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#17191F]">Finalize Your Order</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Provide your shipping details. Your order will be confirmed directly via WhatsApp or Email.
        </p>
      </div>

      {serverError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 text-sm">
          <AlertCircle size={20} className="shrink-0 text-red-600 mt-0.5" />
          <div>
            <span className="font-bold block">Could not submit order:</span>
            <span>{serverError}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 2 Cols: Customer & Shipping Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Step 1: Ordering Method Selection */}
          <div className="bg-white rounded-2xl border border-[#E7E3D8] p-6">
            <h2 className="text-base font-extrabold text-[#17191F] mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#17191F] text-white text-xs flex items-center justify-center">1</span>
              <span>Select Ordering Method</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                className={`relative flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  channel === 'whatsapp'
                    ? 'border-[#25D366] bg-[#25D366]/5'
                    : 'border-[#E7E3D8] hover:border-zinc-300'
                }`}
              >
                <input
                  type="radio"
                  name="orderChannel"
                  value="whatsapp"
                  checked={channel === 'whatsapp'}
                  onChange={() => setChannel('whatsapp')}
                  className="mt-1 text-[#25D366] focus:ring-[#25D366]"
                />
                <div className="ml-3">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-[#17191F]">
                    <MessageSquare size={16} className="text-[#25D366]" />
                    <span>Order on WhatsApp (Recommended)</span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                    Saves your order and opens WhatsApp with your pre-formatted order summary ready to send to our team.
                  </p>
                </div>
              </label>

              <label
                className={`relative flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  channel === 'email'
                    ? 'border-[#5B5FEF] bg-[#5B5FEF]/5'
                    : 'border-[#E7E3D8] hover:border-zinc-300'
                }`}
              >
                <input
                  type="radio"
                  name="orderChannel"
                  value="email"
                  checked={channel === 'email'}
                  onChange={() => setChannel('email')}
                  className="mt-1 text-[#5B5FEF] focus:ring-[#5B5FEF]"
                />
                <div className="ml-3">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-[#17191F]">
                    <Mail size={16} className="text-[#5B5FEF]" />
                    <span>Place Order via Email</span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                    Saves order and dispatches full details to our workshop order email for verification.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Step 2: Contact & Shipping Form */}
          <div className="bg-white rounded-2xl border border-[#E7E3D8] p-6 space-y-6">
            <h2 className="text-base font-extrabold text-[#17191F] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#17191F] text-white text-xs flex items-center justify-center">2</span>
              <span>Contact &amp; Delivery Address</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Vikram Mehta"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-[#F7F5F0] focus:outline-none ${
                    errors.fullName ? 'border-red-500 bg-red-50' : 'border-[#E7E3D8] focus:border-[#5B5FEF]'
                  }`}
                />
                {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
              </div>

              {/* Phone / WhatsApp */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  WhatsApp / Mobile Number *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="98765 43210"
                    className={`w-full pl-12 pr-4 py-2.5 rounded-xl border text-sm bg-[#F7F5F0] focus:outline-none ${
                      errors.phone ? 'border-red-500 bg-red-50' : 'border-[#E7E3D8] focus:border-[#5B5FEF]'
                    }`}
                  />
                </div>
                {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="vikram@example.com"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-[#F7F5F0] focus:outline-none ${
                    errors.email ? 'border-red-500 bg-red-50' : 'border-[#E7E3D8] focus:border-[#5B5FEF]'
                  }`}
                />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </div>

              {/* Street Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Complete Delivery Address *
                </label>
                <textarea
                  rows={3}
                  value={formData.addressLine}
                  onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                  placeholder="Flat/House No., Building Name, Street, Area"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-[#F7F5F0] focus:outline-none ${
                    errors.addressLine ? 'border-red-500 bg-red-50' : 'border-[#E7E3D8] focus:border-[#5B5FEF]'
                  }`}
                />
                {errors.addressLine && <p className="text-xs text-red-600 mt-1">{errors.addressLine}</p>}
              </div>

              {/* Landmark */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  placeholder="Near Metro Station / Landmark"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E7E3D8] text-sm bg-[#F7F5F0] focus:outline-none focus:border-[#5B5FEF]"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Bengaluru"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-[#F7F5F0] focus:outline-none ${
                    errors.city ? 'border-red-500 bg-red-50' : 'border-[#E7E3D8] focus:border-[#5B5FEF]'
                  }`}
                />
                {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  State *
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E7E3D8] text-sm bg-[#F7F5F0] focus:outline-none focus:border-[#5B5FEF]"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* PIN Code */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  PIN Code *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  placeholder="560001"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-[#F7F5F0] focus:outline-none ${
                    errors.postalCode ? 'border-red-500 bg-red-50' : 'border-[#E7E3D8] focus:border-[#5B5FEF]'
                  }`}
                />
                {errors.postalCode && <p className="text-xs text-red-600 mt-1">{errors.postalCode}</p>}
              </div>

              {/* Customer Notes */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Order Notes / Special Requests (Optional)
                </label>
                <input
                  type="text"
                  value={formData.customerNotes}
                  onChange={(e) => setFormData({ ...formData, customerNotes: e.target.value })}
                  placeholder="e.g., Please ensure extra protective packaging for transit"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E7E3D8] text-sm bg-[#F7F5F0] focus:outline-none focus:border-[#5B5FEF]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Summary & Submit Action */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E7E3D8] p-6 space-y-4">
            <h2 className="text-base font-extrabold text-[#17191F] border-b border-[#E7E3D8] pb-3">
              Order Review ({items.reduce((s, i) => s + i.quantity, 0)} items)
            </h2>

            {/* Compact Item list */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3 text-xs">
                  <img
                    src={item.product.primaryImage || '/placeholder.png'}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover rounded-lg bg-zinc-100 border border-zinc-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-[#17191F] block truncate">{item.product.name}</span>
                    <span className="text-zinc-500">Qty: {item.quantity}</span>
                    <span className="font-bold text-[#17191F] block mt-0.5">
                      {currency}{item.lineTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-4 border-t border-[#E7E3D8] space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span className="font-bold text-[#17191F]">{currency}{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Shipping</span>
                <span className="font-bold text-[#17191F]">
                  {shippingFee === 0 ? <span className="text-[#25D366]">FREE</span> : `${currency}${shippingFee}`}
                </span>
              </div>
              <div className="pt-3 border-t border-[#E7E3D8] flex justify-between text-base font-extrabold text-[#17191F]">
                <span>Total Due</span>
                <span className="text-[#5B5FEF]">{currency}{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Important Notice Regarding WhatsApp Sending */}
            {channel === 'whatsapp' && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 leading-relaxed">
                <strong>How WhatsApp Ordering Works:</strong> Clicking the button will save your order in our database and open WhatsApp with your order message pre-filled. You must press <strong>Send</strong> in WhatsApp to dispatch it to our team.
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 px-6 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md ${
                isSubmitting
                  ? 'bg-zinc-300 text-zinc-500 cursor-wait'
                  : channel === 'whatsapp'
                  ? 'bg-[#25D366] text-[#17191F] hover:bg-[#20ba59]'
                  : 'bg-[#17191F] text-white hover:bg-[#5B5FEF]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Saving &amp; Processing Order...</span>
                </>
              ) : channel === 'whatsapp' ? (
                <>
                  <MessageSquare size={19} />
                  <span>Submit &amp; Send on WhatsApp</span>
                </>
              ) : (
                <>
                  <Mail size={19} />
                  <span>Place Order via Email</span>
                </>
              )}
            </button>

            <div className="text-[11px] text-zinc-400 text-center space-y-1 pt-1">
              <p>🔒 Data encrypted and processed securely.</p>
              <p>No card or payment gateway details needed now.</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
