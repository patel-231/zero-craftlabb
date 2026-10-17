import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, X, RefreshCw } from 'lucide-react';
import { ProductCard } from '../components/ProductCard.tsx';
import { Product } from '../types/index.ts';
import { useSettings } from '../context/SettingsContext.tsx';
import { api } from '../services/api.ts';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories, settings } = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    const querySearch = searchParams.get('search');
    if (querySearch !== null) {
      setSearchTerm(querySearch);
    }
    const queryCategory = searchParams.get('category');
    if (queryCategory) {
      setSelectedCategory(queryCategory);
    }
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    api.getProducts().then((res) => {
      setProducts(res.products);
      setLoading(false);
    }).catch((err) => {
      console.error('Failed to load products:', err);
      setLoading(false);
    });
  }, []);

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search term filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = p.name.toLowerCase().includes(query);
        const matchDesc = p.description.toLowerCase().includes(query) || p.shortDescription.toLowerCase().includes(query);
        const matchTag = p.tags && p.tags.some((t) => t.toLowerCase().includes(query));
        const matchSku = p.sku && p.sku.toLowerCase().includes(query);
        if (!matchName && !matchDesc && !matchTag && !matchSku) return false;
      }

      // Category filter
      if (selectedCategory !== 'all') {
        if (p.categoryId !== selectedCategory && p.categorySlug !== selectedCategory) {
          return false;
        }
      }

      // In stock filter
      if (inStockOnly && (p.stock <= 0 || !p.isAvailable)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') {
        const priceA = a.salePrice ?? a.price;
        const priceB = b.salePrice ?? b.price;
        return priceA - priceB;
      }
      if (sortBy === 'price-high') {
        const priceA = a.salePrice ?? a.price;
        const priceB = b.salePrice ?? b.price;
        return priceB - priceA;
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'bestseller') {
        return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
      }
      // default featured
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [products, searchTerm, selectedCategory, sortBy, inStockOnly]);

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug);
    if (slug === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', slug);
    }
    setSearchParams(searchParams);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('featured');
    setInStockOnly(false);
    setSearchParams({});
  };

  const visibleCategories = categories.filter((c) => c.isVisible);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
      {/* Page Title & Breadcrumb */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#17191F]">
          Browse Entire Catalog
        </h1>
        <p className="text-sm text-zinc-500 mt-2">
          Discover all handcrafted automotive silhouettes, precision garage accessories, and wooden decor.
        </p>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        <button
          onClick={() => handleCategorySelect('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            selectedCategory === 'all'
              ? 'bg-[#17191F] text-white shadow-sm'
              : 'bg-white text-zinc-600 border border-[#E7E3D8] hover:border-zinc-400'
          }`}
        >
          All Collections ({products.length})
        </button>
        {visibleCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategorySelect(cat.slug)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              selectedCategory === cat.slug || selectedCategory === cat.id
                ? 'bg-[#5B5FEF] text-white shadow-sm'
                : 'bg-white text-zinc-600 border border-[#E7E3D8] hover:border-zinc-400'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E7E3D8] p-4 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, SKU, car model..."
            className="w-full pl-10 pr-10 py-2.5 bg-[#F7F5F0] border border-[#E7E3D8] rounded-xl text-sm focus:outline-none focus:border-[#5B5FEF]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Sorting & Filter Options */}
        <div className="flex flex-wrap items-center gap-3">
          {/* In stock toggle */}
          <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 cursor-pointer select-none bg-[#F7F5F0] px-3 py-2 rounded-xl border border-[#E7E3D8]">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded text-[#5B5FEF] focus:ring-[#5B5FEF]"
            />
            <span>In Stock Only</span>
          </label>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 bg-[#F7F5F0] px-3 py-1.5 rounded-xl border border-[#E7E3D8]">
            <span className="text-xs font-medium text-zinc-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#17191F] focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="bestseller">Bestsellers</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          {(searchTerm || selectedCategory !== 'all' || inStockOnly) && (
            <button
              onClick={handleClearFilters}
              className="px-3 py-2 text-xs font-bold text-[#FF7547] hover:underline flex items-center gap-1"
            >
              <RefreshCw size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Product Grid / Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-[#E7E3D8]" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E7E3D8] p-12 text-center max-w-lg mx-auto my-8">
          <div className="w-16 h-16 rounded-full bg-[#F7F5F0] text-zinc-400 flex items-center justify-center mx-auto mb-4">
            <Search size={28} />
          </div>
          <h3 className="font-extrabold text-xl text-[#17191F]">No products match your criteria</h3>
          <p className="text-sm text-zinc-500 mt-2 mb-6">
            Try adjusting your search terms or clearing active filters to browse the full catalog.
          </p>
          <button
            onClick={handleClearFilters}
            className="px-6 py-2.5 bg-[#17191F] text-white font-bold text-sm rounded-xl hover:bg-[#5B5FEF] transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div>
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
