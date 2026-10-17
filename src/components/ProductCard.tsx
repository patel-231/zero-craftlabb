import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Product } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';
import { useSettings } from '../context/SettingsContext.tsx';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { settings } = useSettings();

  const currency = settings?.commerce?.currencySymbol || '₹';
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  const currentPrice = product.salePrice ?? product.price;
  const isOutOfStock = product.stock <= 0 || !product.isAvailable;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    // If product has variants, navigate to detail page to pick variant, or pick first option
    if (product.variants && product.variants.length > 0) {
      const defaultVariants: Record<string, string> = {};
      product.variants.forEach((v) => {
        if (v.options && v.options.length > 0) {
          defaultVariants[v.name] = v.options[0].label;
        }
      });
      addToCart(product, 1, defaultVariants);
    } else {
      addToCart(product, 1);
    }
  };

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-[#E7E3D8] overflow-hidden hover:border-[#5B5FEF]/40 hover:shadow-md transition-all duration-200">
      {/* Product Image Container */}
      <Link to={`/product/${product.slug}`} className="relative aspect-4/3 bg-[#F1EDE4] overflow-hidden block">
        <img
          src={product.primaryImage || (product.images && product.images[0]) || '/placeholder.png'}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isBestseller && (
            <span className="bg-[#FF7547] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full tracking-wider uppercase">
              Bestseller
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-[#5B5FEF] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full tracking-wider uppercase">
              New
            </span>
          )}
          {hasDiscount && (
            <span className="bg-[#17191F] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-[#17191F]/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white text-[#17191F] font-bold text-xs uppercase tracking-wider px-3 py-1.5 rounded-lg shadow">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Product Information */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {product.categoryName && (
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
            {product.categoryName}
          </span>
        )}

        <Link
          to={`/product/${product.slug}`}
          className="font-bold text-base text-[#17191F] group-hover:text-[#5B5FEF] transition-colors line-clamp-1 mb-1.5"
        >
          {product.name}
        </Link>

        <p className="text-xs text-zinc-500 line-clamp-2 mb-3 leading-relaxed">
          {product.shortDescription}
        </p>

        {/* Variants indication */}
        {product.variants && product.variants.length > 0 && (
          <div className="text-[11px] text-[#5B5FEF] font-medium mb-3">
            {product.variants.map((v) => `${v.options.length} ${v.name.toLowerCase()}s`).join(' • ')}
          </div>
        )}

        {/* Price & Action Row */}
        <div className="mt-auto pt-3 border-t border-[#F1EDE4] flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-extrabold text-[#17191F]">
              {currency}{currentPrice.toLocaleString('en-IN')}
            </span>
            {hasDiscount && (
              <span className="text-xs text-zinc-400 line-through">
                {currency}{product.price.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`p-2.5 rounded-xl flex items-center justify-center transition-colors ${
              isOutOfStock
                ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                : 'bg-[#17191F] text-white hover:bg-[#5B5FEF]'
            }`}
            aria-label={`Add ${product.name} to bag`}
            title={isOutOfStock ? 'Sold out' : 'Add to bag'}
          >
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
