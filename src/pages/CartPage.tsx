import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, MessageSquare, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart, getCartItemKey } from '../context/CartContext.tsx';
import { useSettings } from '../context/SettingsContext.tsx';

export const CartPage: React.FC = () => {
  const {
    items,
    updateQuantity,
    removeFromCart,
    subtotal,
    shippingFee,
    totalAmount,
    isFreeShipping,
    freeShippingRemaining,
  } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const currency = settings?.commerce?.currencySymbol || '₹';
  const freeThreshold = settings?.commerce?.freeShippingThreshold || 1499;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-white border border-[#E7E3D8] text-zinc-400 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={36} />
        </div>
        <h1 className="text-3xl font-extrabold text-[#17191F]">Your Shopping Bag is Empty</h1>
        <p className="text-sm text-zinc-500 mt-2 max-w-md mx-auto mb-8">
          You haven't selected any automotive art or handcrafted pieces yet.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#17191F] text-white font-bold text-sm hover:bg-[#5B5FEF] transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Explore Catalog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
      <h1 className="text-3xl font-extrabold text-[#17191F] mb-8">Shopping Bag</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Free Shipping Alert */}
          <div className="p-4 bg-white rounded-2xl border border-[#E7E3D8]">
            <div className="flex justify-between items-center text-xs font-bold mb-2">
              <span>
                {isFreeShipping
                  ? '🎉 Free Standard Delivery Unlocked!'
                  : `Add ${currency}${freeShippingRemaining} more for FREE Delivery`}
              </span>
              <span className="text-zinc-500 font-mono">
                {Math.min(100, Math.round((subtotal / freeThreshold) * 100))}%
              </span>
            </div>
            <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${isFreeShipping ? 'bg-[#25D366]' : 'bg-[#5B5FEF]'}`}
                style={{ width: `${Math.min(100, (subtotal / freeThreshold) * 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E7E3D8] divide-y divide-[#E7E3D8] overflow-hidden">
            {items.map((item) => {
              const key = getCartItemKey(item.productId, item.selectedVariants);
              return (
                <div key={key} className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5">
                  <img
                    src={item.product.primaryImage || '/placeholder.png'}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded-xl bg-zinc-100 shrink-0 border border-zinc-200"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <Link
                          to={`/product/${item.product.slug}`}
                          className="font-bold text-base text-[#17191F] hover:text-[#5B5FEF] transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          onClick={() => removeFromCart(key)}
                          className="text-zinc-400 hover:text-red-500 p-1 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                        <div className="text-xs text-zinc-500 mt-1 flex flex-wrap gap-2">
                          {Object.entries(item.selectedVariants).map(([k, v]) => (
                            <span key={k} className="bg-[#F7F5F0] px-2 py-0.5 rounded-md border border-[#E7E3D8]">
                              {k}: <strong>{v}</strong>
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="text-xs text-zinc-400 mt-1">
                        Unit Price: {currency}{item.unitPrice.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#F7F5F0]">
                      <div className="flex items-center border border-[#E7E3D8] rounded-xl bg-[#F7F5F0]">
                        <button
                          onClick={() => updateQuantity(key, item.quantity - 1)}
                          className="p-2 text-zinc-600 hover:text-black transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center text-xs font-bold text-[#17191F]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(key, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="p-2 text-zinc-600 hover:text-black transition-colors disabled:opacity-40"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <span className="text-base font-extrabold text-[#17191F]">
                        {currency}{item.lineTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-[#5B5FEF] transition-colors pt-2"
          >
            <ArrowLeft size={14} />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-2xl border border-[#E7E3D8] p-6 space-y-6">
          <h2 className="text-lg font-extrabold text-[#17191F] border-b border-[#E7E3D8] pb-4">
            Order Summary
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal</span>
              <span className="font-bold text-[#17191F]">{currency}{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Shipping Charge</span>
              <span className="font-bold text-[#17191F]">
                {shippingFee === 0 ? <span className="text-[#25D366]">FREE</span> : `${currency}${shippingFee}`}
              </span>
            </div>
            <div className="pt-3 border-t border-[#E7E3D8] flex justify-between text-lg font-extrabold text-[#17191F]">
              <span>Estimated Total</span>
              <span className="text-[#5B5FEF]">{currency}{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => navigate('/checkout?channel=whatsapp')}
              className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] text-[#17191F] font-bold text-sm hover:bg-[#20ba59] transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageSquare size={18} />
              <span>Checkout via WhatsApp</span>
            </button>

            <button
              onClick={() => navigate('/checkout?channel=standard')}
              className="w-full py-3.5 px-4 rounded-xl bg-[#17191F] text-white font-bold text-sm hover:bg-[#5B5FEF] transition-all flex items-center justify-center gap-2"
            >
              <span>Standard Order Checkout</span>
              <ArrowRight size={18} />
            </button>
          </div>

          <div className="text-[11px] text-zinc-400 space-y-1 text-center">
            <p>✓ All pieces handcrafted in India</p>
            <p>✓ Express insured delivery with live tracking</p>
            <p>✓ No online payment gateway required</p>
          </div>
        </div>
      </div>
    </div>
  );
};
