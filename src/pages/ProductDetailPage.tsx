import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  MessageSquare,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  ChevronRight,
  ZoomIn,
  X,
  Plus,
  Minus,
  Sparkles,
  Share2
} from 'lucide-react';
import { Product } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';
import { useSettings } from '../context/SettingsContext.tsx';
import { ProductCard } from '../components/ProductCard.tsx';
import { api } from '../services/api.ts';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { settings } = useSettings();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    api.getProduct(slug)
      .then((res) => {
        const prod = res.product;
        setProduct(prod);
        setActiveImageIndex(0);
        setQuantity(1);

        // Preselect first option of each variant
        const initialVariants: Record<string, string> = {};
        if (prod.variants && prod.variants.length > 0) {
          prod.variants.forEach((v) => {
            if (v.options && v.options.length > 0) {
              initialVariants[v.name] = v.options[0].label;
            }
          });
        }
        setSelectedVariants(initialVariants);

        // Fetch related products
        api.getProducts().then((pRes) => {
          const related = pRes.products.filter(
            (p) => p.id !== prod.id && (p.categoryId === prod.categoryId || p.categorySlug === prod.categorySlug)
          );
          setRelatedProducts(related.slice(0, 4));
        });

        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load product details:', err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-zinc-200 rounded-3xl" />
          <div className="space-y-6">
            <div className="h-10 bg-zinc-200 rounded-xl w-3/4" />
            <div className="h-6 bg-zinc-200 rounded-lg w-1/3" />
            <div className="h-24 bg-zinc-200 rounded-xl" />
            <div className="h-12 bg-zinc-200 rounded-xl w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-2xl font-bold text-[#17191F]">Product Not Found</h2>
        <p className="text-sm text-zinc-500 mt-2 mb-6">
          The item you are searching for might have been retired or moved.
        </p>
        <Link
          to="/shop"
          className="px-6 py-3 rounded-xl bg-[#17191F] text-white font-bold text-sm hover:bg-[#5B5FEF] transition-colors"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const currency = settings?.commerce?.currencySymbol || '₹';
  const isOutOfStock = product.stock <= 0 || !product.isAvailable;

  // Calculate price dynamically with variant adjustments
  let calculatedPrice = product.salePrice ?? product.price;
  if (product.variants) {
    for (const [varName, optLabel] of Object.entries(selectedVariants)) {
      const varDef = product.variants.find((v) => v.name.toLowerCase() === varName.toLowerCase());
      if (varDef) {
        const opt = varDef.options.find((o) => o.label === optLabel);
        if (opt?.priceAdjustment) {
          calculatedPrice += opt.priceAdjustment;
        }
      }
    }
  }

  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const originalPriceCalculated = product.price + (calculatedPrice - (product.salePrice ?? product.price));

  const allImages = product.images && product.images.length > 0
    ? product.images
    : [product.primaryImage || '/placeholder.png'];

  const currentImage = allImages[activeImageIndex] || allImages[0];

  const handleVariantSelect = (variantName: string, optionLabel: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantName]: optionLabel,
    }));
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedVariants);
  };

  const handleBuyNowWhatsApp = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedVariants);
    navigate('/checkout?channel=whatsapp');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500 mb-8 overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-[#17191F]">Home</Link>
        <ChevronRight size={13} />
        <Link to="/shop" className="hover:text-[#17191F]">Shop</Link>
        {product.categorySlug && (
          <>
            <ChevronRight size={13} />
            <Link to={`/category/${product.categorySlug}`} className="hover:text-[#17191F]">
              {product.categoryName || 'Collection'}
            </Link>
          </>
        )}
        <ChevronRight size={13} />
        <span className="text-[#17191F] font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 mb-20">
        {/* Left: 2D Image Gallery with Zoom */}
        <div className="space-y-4">
          <div className="relative aspect-4/3 sm:aspect-square bg-[#F1EDE4] rounded-3xl overflow-hidden border border-[#E7E3D8] group">
            <img
              src={currentImage}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-transform duration-300"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
              {product.isBestseller && (
                <span className="bg-[#FF7547] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Bestseller
                </span>
              )}
              {product.isNewArrival && (
                <span className="bg-[#5B5FEF] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  New Arrival
                </span>
              )}
            </div>

            {/* 2D Zoom Viewer Trigger */}
            <button
              onClick={() => setZoomModalOpen(true)}
              className="absolute bottom-4 right-4 p-2.5 rounded-full bg-white/90 text-[#17191F] hover:bg-[#17191F] hover:text-white shadow-md transition-all duration-200"
              title="Click to zoom image"
            >
              <ZoomIn size={18} />
            </button>
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-white ${
                    activeImageIndex === idx ? 'border-[#5B5FEF] shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Actions */}
        <div className="flex flex-col">
          <div className="border-b border-[#E7E3D8] pb-6 mb-6">
            <div className="flex justify-between items-start gap-4 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5B5FEF]">
                {product.categoryName || 'Automotive Art'}
              </span>
              <button
                onClick={handleShare}
                className="text-xs font-semibold text-zinc-500 hover:text-[#17191F] flex items-center gap-1 transition-colors"
              >
                <Share2 size={14} />
                <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#17191F] leading-tight mb-2">
              {product.name}
            </h1>

            {product.sku && (
              <div className="text-xs font-mono text-zinc-400 mb-4">
                SKU: {product.sku}
              </div>
            )}

            {/* Price section */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-[#17191F]">
                {currency}{calculatedPrice.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <span className="text-lg text-zinc-400 line-through">
                  {currency}{originalPriceCalculated.toLocaleString('en-IN')}
                </span>
              )}
              {hasDiscount && (
                <span className="text-xs font-bold bg-[#FF7547]/10 text-[#FF7547] px-2.5 py-0.5 rounded-full">
                  Save {currency}{(originalPriceCalculated - calculatedPrice).toLocaleString('en-IN')}
                </span>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
              <span>Inclusive of all taxes. Free shipping on orders over {currency}{settings?.commerce?.freeShippingThreshold || 1499}.</span>
            </div>
          </div>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-5 border-b border-[#E7E3D8] pb-6 mb-6">
              {product.variants.map((variant) => (
                <div key={variant.id}>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#17191F] mb-2">
                    {variant.name}: <span className="text-[#5B5FEF] font-semibold">{selectedVariants[variant.name]}</span>
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {variant.options.map((opt) => {
                      const isSelected = selectedVariants[variant.name] === opt.label;
                      return (
                        <button
                          key={opt.label}
                          onClick={() => handleVariantSelect(variant.name, opt.label)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-[#17191F] text-white shadow-sm ring-2 ring-[#17191F]'
                              : 'bg-white text-zinc-700 border border-[#E7E3D8] hover:border-zinc-400'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {opt.priceAdjustment && opt.priceAdjustment !== 0 && (
                            <span className="ml-1 opacity-80">
                              ({opt.priceAdjustment > 0 ? '+' : ''}{currency}{opt.priceAdjustment})
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stock & Quantity Control */}
          <div className="space-y-4 border-b border-[#E7E3D8] pb-6 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#17191F]">
                Quantity
              </span>
              <div>
                {isOutOfStock ? (
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                    Sold Out
                  </span>
                ) : product.stock <= 5 ? (
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full animate-pulse">
                    Hurry, only {product.stock} units left!
                  </span>
                ) : (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Check size={12} />
                    <span>In Stock (Handcrafted &amp; Ready to Ship)</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border border-[#E7E3D8] rounded-xl bg-white shadow-xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-3 text-zinc-600 hover:text-black disabled:opacity-30"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center text-sm font-extrabold text-[#17191F]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="p-3 text-zinc-600 hover:text-black disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="text-xs text-zinc-500">
                Total for {quantity} {quantity === 1 ? 'item' : 'items'}: <strong className="text-[#17191F] font-bold">{currency}{(calculatedPrice * quantity).toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full py-4 px-6 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md ${
                isOutOfStock
                  ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                  : 'bg-[#17191F] text-white hover:bg-[#5B5FEF]'
              }`}
            >
              <ShoppingBag size={20} />
              <span>{isOutOfStock ? 'Currently Unavailable' : 'Add to Shopping Bag'}</span>
            </button>

            {settings?.commerce?.enableWhatsAppOrders && (
              <button
                onClick={handleBuyNowWhatsApp}
                disabled={isOutOfStock}
                className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all border ${
                  isOutOfStock
                    ? 'border-zinc-200 text-zinc-400 cursor-not-allowed'
                    : 'bg-[#25D366] text-[#17191F] hover:bg-[#20ba59] border-[#25D366]'
                }`}
              >
                <MessageSquare size={19} />
                <span>Instant Order on WhatsApp</span>
              </button>
            )}
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white p-4 rounded-2xl border border-[#E7E3D8]">
            <div className="flex items-center gap-2.5">
              <Truck size={18} className="text-[#5B5FEF] shrink-0" />
              <span>Express Delivery across India</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={18} className="text-[#25D366] shrink-0" />
              <span>100% Genuine Artisan Quality</span>
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCcw size={18} className="text-[#FF7547] shrink-0" />
              <span>7-Day Return for Transit Damage</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Specifications Tabs */}
      <div className="bg-white rounded-3xl border border-[#E7E3D8] p-6 sm:p-10 mb-20">
        <h2 className="text-xl font-extrabold text-[#17191F] mb-4">Product Details &amp; Craft Description</h2>
        <div className="prose prose-sm max-w-none text-zinc-600 leading-relaxed space-y-4 mb-8">
          <p>{product.description}</p>
        </div>

        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="pt-6 border-t border-[#E7E3D8]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#17191F] mb-4">
              Material &amp; Technical Specifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(product.specifications).map(([key, val]) => (
                <div key={key} className="bg-[#F7F5F0] p-3.5 rounded-xl border border-[#E7E3D8]">
                  <span className="text-[11px] font-bold uppercase text-zinc-400 block mb-0.5">
                    {key}
                  </span>
                  <span className="text-sm font-semibold text-[#17191F]">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-extrabold text-[#17191F]">You May Also Appreciate</h2>
            <Link to="/shop" className="text-sm font-bold text-[#5B5FEF] hover:underline">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* 2D Zoom Viewer Modal */}
      {zoomModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <button
            onClick={() => setZoomModalOpen(false)}
            className="absolute top-6 right-6 p-3 text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close zoomed view"
          >
            <X size={24} />
          </button>
          <div className="max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl flex items-center justify-center">
            <img
              src={currentImage}
              alt={product.name}
              className="max-w-full max-h-[85vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
