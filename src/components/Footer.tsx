import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Mail, MapPin, ShieldCheck, Truck, RefreshCw, Heart } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.tsx';

export const Footer: React.FC = () => {
  const { settings, categories } = useSettings();
  const visibleCategories = categories.filter((c) => c.isVisible);

  return (
    <footer className="bg-[#17191F] text-[#F7F5F0] pt-16 pb-12 border-t border-zinc-800">
      {/* Value Proposition Ticker */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 pb-12 border-b border-zinc-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="w-12 h-12 rounded-full bg-[#5B5FEF]/20 text-[#5B5FEF] flex items-center justify-center shrink-0">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Pan-India Express Delivery</h4>
              <p className="text-xs text-zinc-400 mt-0.5">Free delivery across India on orders over ₹1,499.</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="w-12 h-12 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center shrink-0">
              <MessageSquare size={24} />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Direct WhatsApp &amp; Email</h4>
              <p className="text-xs text-zinc-400 mt-0.5">Place orders directly with personal confirmation.</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="w-12 h-12 rounded-full bg-[#FF7547]/20 text-[#FF7547] flex items-center justify-center shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Artisanal Quality Guarantee</h4>
              <p className="text-xs text-zinc-400 mt-0.5">Precision cut &amp; handcrafted with aerospace materials.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <img
                src={settings?.brand?.logoUrl || '/logo.svg'}
                alt={settings?.brand?.name || 'Zero Craftlabb'}
                className="h-10 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
              {settings?.brand?.tagline ||
                'Precision automotive art, bespoke laser-cut racing silhouettes, fine woodwork, and authentic handmade creations.'}
            </p>
            <div className="pt-2 text-xs text-zinc-400 space-y-2">
              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="text-[#5B5FEF] shrink-0 mt-0.5" />
                <span>{settings?.contact?.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={16} className="text-[#FF7547] shrink-0" />
                <a href={`mailto:${settings?.contact?.publicContactEmail}`} className="hover:text-white transition-colors">
                  {settings?.contact?.publicContactEmail}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageSquare size={16} className="text-[#25D366] shrink-0" />
                <a
                  href={`https://wa.me/${settings?.contact?.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp: {settings?.contact?.displayPhone}
                </a>
              </div>
            </div>
          </div>

          {/* Catalog Collections */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Collections</h4>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              <li>
                <Link to="/shop" className="hover:text-[#5B5FEF] transition-colors">
                  Shop All Products
                </Link>
              </li>
              {visibleCategories.map((c) => (
                <li key={c.id}>
                  <Link to={`/category/${c.slug}`} className="hover:text-[#5B5FEF] transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links & Brand */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Brand &amp; Story</h4>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              <li>
                <Link to="/about" className="hover:text-[#5B5FEF] transition-colors">
                  About Zero Craftlabb
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#5B5FEF] transition-colors">
                  Contact &amp; Custom Orders
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-[#5B5FEF] transition-colors">
                  Shipping &amp; Tracking
                </Link>
              </li>
              <li>
                <Link to="/returns-policy" className="hover:text-[#5B5FEF] transition-colors">
                  Returns &amp; Cancellations
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies & Ordering */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Customer Care</h4>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              <li>
                <Link to="/privacy-policy" className="hover:text-[#5B5FEF] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[#5B5FEF] transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li className="pt-2">
                <a
                  href={`https://wa.me/${settings?.contact?.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hi%20Zero%20Craftlabb%2C%20I%20have%20an%20inquiry%20regarding%20products`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-[#17191F] text-xs font-bold hover:bg-[#20ba59] transition-colors"
                >
                  <MessageSquare size={13} />
                  <span>Chat on WhatsApp</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-800 text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            &copy; {new Date().getFullYear()} {settings?.brand?.name || 'Zero Craftlabb'}. All rights reserved. Made with pride in India.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="hover:text-zinc-400">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-zinc-400">
              Terms
            </Link>
            <Link to="/shipping-policy" className="hover:text-zinc-400">
              Shipping
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
