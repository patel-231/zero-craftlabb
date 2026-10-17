import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Package } from 'lucide-react';
import { ProductCard } from '../components/ProductCard.tsx';
import { Product, Category } from '../types/index.ts';
import { api } from '../services/api.ts';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    Promise.all([api.getCategory(slug), api.getProducts()])
      .then(([catRes, prodRes]) => {
        setCategory(catRes.category);
        const matched = prodRes.products.filter(
          (p) => p.categoryId === catRes.category.id || p.categorySlug === catRes.category.slug
        );
        setProducts(matched);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching category:', err);
        setError('Category not found or unavailable');
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse">
        <div className="h-48 bg-zinc-200 rounded-3xl mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-80 bg-zinc-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-2xl font-bold text-[#17191F]">Collection Not Found</h2>
        <p className="text-sm text-zinc-500 mt-2 mb-6">
          The category you are looking for may have been moved or updated.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#17191F] text-white font-bold text-sm hover:bg-[#5B5FEF] transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Return to Shop All</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
      {/* Category Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-[#17191F] text-white mb-12 border border-zinc-800">
        {category.coverImage && (
          <div className="absolute inset-0">
            <img
              src={category.coverImage}
              alt={category.name}
              className="w-full h-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#17191F] via-[#17191F]/70 to-transparent" />
          </div>
        )}

        <div className="relative z-10 p-8 sm:p-12 lg:p-16 max-w-3xl">
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF7547] hover:underline mb-4 uppercase tracking-wider"
          >
            <ArrowLeft size={14} />
            <span>All Collections</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            {category.name}
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
            {category.description}
          </p>
          <div className="mt-6 text-xs text-zinc-400 font-mono">
            {products.length} {products.length === 1 ? 'Product Available' : 'Products Available'}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E7E3D8] p-12 text-center max-w-md mx-auto my-8">
          <div className="w-14 h-14 rounded-full bg-[#F7F5F0] text-zinc-400 flex items-center justify-center mx-auto mb-4">
            <Package size={24} />
          </div>
          <h3 className="font-bold text-lg text-[#17191F]">No products currently in this collection</h3>
          <p className="text-xs text-zinc-500 mt-1 mb-6">
            New handcrafted pieces are added frequently by our workshop.
          </p>
          <Link
            to="/shop"
            className="px-5 py-2.5 rounded-xl bg-[#17191F] text-white font-bold text-xs hover:bg-[#5B5FEF] transition-colors"
          >
            Browse Other Collections
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
