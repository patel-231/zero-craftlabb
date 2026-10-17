import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ArrowRight, MessageSquare, ShoppingBag } from 'lucide-react';
import { useCart, getCartItemKey } from '../context/CartContext.tsx';
import { useSettings } from '../context/SettingsContext.tsx';

export const CartDrawer: React.FC = () => {
  const {
    items,
    updateQuantity,
    removeFromCart,
    subtotal,
    shippingFee,
    totalAmount,
    isFreeShipping,
    freeShippingRemaining,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
  } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();

  if (!isCartDrawerOpen) return null;

  const currency = settings?.commerce?.currencySymbol || '₹';
  const freeThreshold = settings?.commerce?.freeShippingThreshold || 1499;
  const progressPercent = Math.min(100, Math.round((subtotal / freeThreshold) * 100));

  const handleCheckout = (channel: 'whatsapp' | 'standard' = 'standard') => {
    setIsCartDrawerOpen(false);
    navigate(`/checkout?channel=${channel}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dimmed backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-[#E7E3D8]">
          {/* Drawer Header */}
          <div className="p-5 border-b border-[#E7E3D8] flex items-center justify-between bg-[#F7F5F0]">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-[#5B5FEF]" />
              <h2 className="font-bold text-lg text-[#17191F]">Your Shopping Bag</h2>
              <span className="text-xs bg-[#17191F] text-white px-2 py-0.5 rounded-full font-bold">
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-2 text-zinc-400 hover:text-[#17191F] rounded-lg transition-colors"
              aria-label="Close cart"
            >
              <X size={20} />
            </button>
          </div>

          {/* Free Shipping Progress Meter */}
          <div className="p-4 bg-zinc-50 border-b border-[#E7E3D8]">
            <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
              <span>
                {isFreeShipping
                  ? '🎉 Free Standard Delivery Unlocked!'
                  : `Add ${currency}${freeShippingRemaining} more for FREE Delivery`}
              </span>
              <span className="text-zinc-500 font-mono">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${isFreeShipping ? 'bg-[#25D366]' : 'bg-[#5B5FEF]'}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#E7E3D8]">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#F7F5F0] text-zinc-400 flex items-center justify-center mb-4">
                  <ShoppingBag size={28} />
                </div>
                <h3 className="font-bold text-lg text-[#17191F]">Your bag is empty</h3>
                <p className="text-sm text-zinc-500 mt-1 max-w-xs mb-6">
                  Discover handcrafted automotive art, racing silhouettes, and wooden masterpieces.
                </p>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    navigate('/shop');
                  }}
                  className="px-6 py-2.5 bg-[#17191F] text-white font-bold text-sm rounded-xl hover:bg-[#5B5FEF] transition-colors"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              items.map((item) => {
                const key = getCartItemKey(item.productId, item.selectedVariants);
                return (
                  <div key={key} className="py-4 flex gap-4">
                    <img
                      src={item.product.primaryImage || '/placeholder.png'}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-xl bg-zinc-100 shrink-0 border border-zinc-200"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <Link
                            to={`/product/${item.product.slug}`}
                            onClick={() => setIsCartDrawerOpen(false)}
                            className="font-bold text-sm text-[#17191F] hover:text-[#5B5FEF] transition-colors line-clamp-1"
                          >
                            {item.product.name}
                          </Link>
                          <button
                            onClick={() => removeFromCart(key)}
                            className="text-zinc-400 hover:text-red-500 p-1 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                          <div className="text-xs text-zinc-500 mt-0.5">
                            {Object.entries(item.selectedVariants)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(' | ')}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-[#E7E3D8] rounded-lg bg-[#F7F5F0]">
                          <button
                            onClick={() => updateQuantity(key, item.quantity - 1)}
                            className="p-1.5 text-zinc-600 hover:text-black transition-colors"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-[#17191F]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(key, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="p-1.5 text-zinc-600 hover:text-black transition-colors disabled:opacity-40"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="font-extrabold text-sm text-[#17191F]">
                            {currency}{item.lineTotal.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer with Actions */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[#E7E3D8] bg-[#F7F5F0] space-y-3">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#17191F]">
                    {currency}{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-[#17191F]">
                    {shippingFee === 0 ? (
                      <span className="text-[#25D366] font-bold">FREE</span>
                    ) : (
                      `${currency}${shippingFee}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-[#17191F] pt-2 border-t border-[#E7E3D8]">
                  <span>Total Amount</span>
                  <span className="text-[#5B5FEF]">
                    {currency}{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Order Actions */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => handleCheckout('whatsapp')}
                  className="w-full py-3 px-4 rounded-xl bg-[#25D366] text-[#17191F] font-bold text-sm hover:bg-[#20ba59] transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageSquare size={18} />
                  <span>Quick Order via WhatsApp</span>
                </button>

                <button
                  onClick={() => handleCheckout('standard')}
                  className="w-full py-3 px-4 rounded-xl bg-[#17191F] text-white font-bold text-sm hover:bg-[#5B5FEF] transition-all flex items-center justify-center gap-2"
                >
                  <span>Proceed to Full Checkout</span>
                  <ArrowRight size={18} />
                </button>
              </div>

              <p className="text-[11px] text-zinc-400 text-center pt-1">
                Prices and stock verified with server at checkout. No online payment gateway required.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
