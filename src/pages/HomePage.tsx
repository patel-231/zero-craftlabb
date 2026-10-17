import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Wrench, Package, MessageSquare, Flame } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.tsx';
import { ProductCard } from '../components/ProductCard.tsx';
import { Product } from '../types/index.ts';
import { api } from '../services/api.ts';

export const HomePage: React.FC = () => {
  const { settings, categories } = useSettings();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestsellerProducts, setBestsellerProducts] = useState<Product[]>([]);
  const [newArrivalProducts, setNewArrivalProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProducts().then((res) => {
      const prods = res.products;
      setFeaturedProducts(prods.filter((p) => p.isFeatured));
      setBestsellerProducts(prods.filter((p) => p.isBestseller));
      setNewArrivalProducts(prods.filter((p) => p.isNewArrival));
      setLoading(false);
    }).catch((err) => {
      console.error('Failed to load products:', err);
      setLoading(false);
    });
  }, []);

  const visibleCategories = categories.filter((c) => c.isVisible);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative bg-[#17191F] text-white overflow-hidden py-20 sm:py-28 lg:py-36">
        {/* Background Image with Ambient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={
              settings?.hero?.backgroundImageUrl ||
              'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1920&q=80'
            }
            alt="Zero Craftlabb Automotive Art"
            className="w-full h-full object-cover object-center opacity-30 scale-102 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-linear-to-r from-[#17191F] via-[#17191F]/90 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#FF7547] text-xs font-bold uppercase tracking-widest mb-6 border border-white/15">
              <Sparkles size={14} />
              <span>Precision Crafted in India</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
              {settings?.hero?.title || 'Automotive Precision Meets Master Craftsmanship'}
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed mb-8">
              {settings?.hero?.subtitle ||
                'From iconic race track wall silhouettes to hand-carved festive brass decor, bring engineering passion and artisanal soul into your space.'}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to={settings?.hero?.ctaPrimaryLink || '/shop'}
                className="px-7 py-3.5 rounded-xl bg-[#5B5FEF] text-white font-bold text-sm sm:text-base hover:bg-[#4d51df] transition-all flex items-center gap-2 shadow-lg shadow-[#5B5FEF]/30"
              >
                <span>{settings?.hero?.ctaPrimaryText || 'Explore Catalog'}</span>
                <ArrowRight size={18} />
              </Link>

              {settings?.contact?.whatsappNumber && (
                <a
                  href={`https://wa.me/${settings.contact.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hi%20Zero%20Craftlabb%2C%20I%20would%20like%20to%20explore%20your%20custom%20products`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-xl bg-white/10 backdrop-blur-md text-white border border-white/20 font-bold text-sm sm:text-base hover:bg-white hover:text-[#17191F] transition-all flex items-center gap-2"
                >
                  <MessageSquare size={18} className="text-[#25D366]" />
                  <span>Order on WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#5B5FEF]">
              Curated Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17191F] mt-1">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-sm font-bold text-[#17191F] hover:text-[#5B5FEF] flex items-center gap-1.5 transition-colors"
          >
            <span>View All Products</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleCategories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden bg-white border border-[#E7E3D8] hover:border-[#5B5FEF] transition-all duration-200 flex flex-col"
            >
              <div className="aspect-4/3 overflow-hidden bg-[#F1EDE4]">
                <img
                  src={cat.coverImage || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-lg text-[#17191F] group-hover:text-[#5B5FEF] transition-colors mb-1">
                  {cat.name}
                </h3>
                <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed mb-4">
                  {cat.description}
                </p>
                <div className="mt-auto text-xs font-bold text-[#FF7547] flex items-center gap-1">
                  <span>Browse Collection</span>
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bestseller Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF7547]">
              <Flame size={15} />
              <span>Customer Favorites</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17191F] mt-1">
              Bestselling Creations
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-sm font-bold text-[#17191F] hover:text-[#5B5FEF] flex items-center gap-1.5 transition-colors"
          >
            <span>See More</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-[#E7E3D8]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestsellerProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* How Ordering Works (Transparent, Trust-Building Workflow) */}
      <section className="bg-white border-y border-[#E7E3D8] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5B5FEF]">
              Frictionless Commerce
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17191F] mt-1">
              Direct Ordering via WhatsApp &amp; Email
            </h2>
            <p className="text-sm text-zinc-500 mt-2">
              No complicated gateways or mandatory accounts. Handcrafted directly from our workshop to your address.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-[#F7F5F0] border border-[#E7E3D8]">
              <div className="w-12 h-12 rounded-xl bg-[#17191F] text-white flex items-center justify-center font-bold text-lg mb-4">
                1
              </div>
              <h3 className="font-bold text-base text-[#17191F] mb-1">Pick Your Items</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Choose your favorite automotive art, sizes, finish variants, and add to bag.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-[#F7F5F0] border border-[#E7E3D8]">
              <div className="w-12 h-12 rounded-xl bg-[#5B5FEF] text-white flex items-center justify-center font-bold text-lg mb-4">
                2
              </div>
              <h3 className="font-bold text-base text-[#17191F] mb-1">Enter Address</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Provide your delivery address and contact details on our simple checkout form.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-[#F7F5F0] border border-[#E7E3D8]">
              <div className="w-12 h-12 rounded-xl bg-[#25D366] text-[#17191F] flex items-center justify-center font-bold text-lg mb-4">
                3
              </div>
              <h3 className="font-bold text-base text-[#17191F] mb-1">Send on WhatsApp</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Click to open WhatsApp with your pre-formatted order summary and tap Send.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-[#F7F5F0] border border-[#E7E3D8]">
              <div className="w-12 h-12 rounded-xl bg-[#FF7547] text-white flex items-center justify-center font-bold text-lg mb-4">
                4
              </div>
              <h3 className="font-bold text-base text-[#17191F] mb-1">Direct Confirmation</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                We confirm production, dispatch with express courier, and share tracking details.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      {newArrivalProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#5B5FEF]">
                Fresh Off The Bench
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17191F] mt-1">
                New Arrivals
              </h2>
            </div>
            <Link
              to="/shop"
              className="text-sm font-bold text-[#17191F] hover:text-[#5B5FEF] flex items-center gap-1.5 transition-colors"
            >
              <span>Explore All</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivalProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Brand Craftsmanship Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#17191F] rounded-3xl p-8 sm:p-12 lg:p-16 text-white grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#FF7547]">
              The Zero Craftlabb Standard
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-2 mb-4 leading-tight">
              Where Engineering Passion Meets Handcrafted Soul
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed mb-6">
              Every curve of our race track silhouettes and classic car profiles is computer-vectored with 0.1mm tolerance, then precision laser-cut and hand-finished. Our wooden decor and brass diyas honor traditional artisan techniques.
            </p>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="font-extrabold text-white text-base block mb-0.5">Aerospace Grade</span>
                <span className="text-zinc-400">Cast acrylics &amp; CNC aluminium</span>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="font-extrabold text-white text-base block mb-0.5">Heritage Brass</span>
                <span className="text-zinc-400">Authentic sand-cast Indian brass</span>
              </div>
            </div>
          </div>
          <div className="relative aspect-4/3 rounded-2xl overflow-hidden border border-zinc-800">
            <img
              src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1000&q=80"
              alt="Craftsmanship workshop"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
