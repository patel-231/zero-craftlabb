import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, ChevronDown, MessageSquare } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.tsx';
import { useCart } from '../context/CartContext.tsx';

export const Header: React.FC = () => {
  const { settings, categories } = useSettings();
  const { totalItemsCount, setIsCartDrawerOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const visibleCategories = categories.filter((c) => c.isVisible);

  return (
    <header className="sticky top-0 z-40 bg-[#F7F5F0]/95 backdrop-blur-md border-b border-[#E7E3D8]">
      {/* Announcement Bar */}
      {settings?.announcement?.enabled && (
        <div className="bg-[#17191F] text-white py-2 px-4 text-xs md:text-sm text-center font-medium tracking-wide">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <span>{settings.announcement.text}</span>
            {settings.announcement.linkUrl && (
              <Link
                to={settings.announcement.linkUrl}
                className="underline hover:text-[#FF7547] transition-colors ml-1 font-semibold"
              >
                Shop Now &rarr;
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 text-[#17191F] hover:text-[#5B5FEF] transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <img
                src={settings?.brand?.logoUrl || '/logo.svg'}
                alt={settings?.brand?.name || 'Zero Craftlabb'}
                className="h-10 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
              />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link
              to="/"
              className="text-sm font-semibold text-[#17191F] hover:text-[#5B5FEF] transition-colors tracking-tight"
            >
              Home
            </Link>
            <Link
              to="/shop"
              className="text-sm font-semibold text-[#17191F] hover:text-[#5B5FEF] transition-colors tracking-tight"
            >
              Shop All
            </Link>

            {/* Dynamic Category Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setCategoryDropdownOpen(true)}
              onMouseLeave={() => setCategoryDropdownOpen(false)}
            >
              <button
                className="flex items-center gap-1 text-sm font-semibold text-[#17191F] hover:text-[#5B5FEF] transition-colors py-2"
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              >
                <span>Collections</span>
                <ChevronDown size={15} className={`transition-transform duration-200 ${categoryDropdownOpen ? 'rotate-180 text-[#5B5FEF]' : ''}`} />
              </button>

              {categoryDropdownOpen && (
                <div className="absolute top-full left-0 w-64 bg-white rounded-xl shadow-xl border border-[#E7E3D8] py-2 z-50">
                  {visibleCategories.length === 0 ? (
                    <div className="px-4 py-2 text-xs text-zinc-500">No collections available</div>
                  ) : (
                    visibleCategories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/category/${cat.slug}`}
                        className="block px-4 py-2.5 text-sm text-[#17191F] hover:bg-[#F7F5F0] hover:text-[#5B5FEF] font-medium transition-colors"
                        onClick={() => setCategoryDropdownOpen(false)}
                      >
                        {cat.name}
                      </Link>
                    ))
                  )}
                  <div className="border-t border-[#E7E3D8] mt-2 pt-2">
                    <Link
                      to="/shop"
                      className="block px-4 py-2 text-xs font-bold text-[#FF7547] hover:underline"
                      onClick={() => setCategoryDropdownOpen(false)}
                    >
                      Browse Entire Catalog &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/about"
              className="text-sm font-semibold text-[#17191F] hover:text-[#5B5FEF] transition-colors tracking-tight"
            >
              Craft &amp; Story
            </Link>
            <Link
              to="/contact"
              className="text-sm font-semibold text-[#17191F] hover:text-[#5B5FEF] transition-colors tracking-tight"
            >
              Contact
            </Link>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2.5 rounded-full hover:bg-[#EBE7DC] text-[#17191F] transition-colors"
              aria-label="Search Catalog"
            >
              <Search size={20} />
            </button>

            {/* Quick WhatsApp Ordering Link */}
            {settings?.contact?.whatsappNumber && (
              <a
                href={`https://wa.me/${settings.contact.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#25D366]/10 text-[#075E54] hover:bg-[#25D366]/20 transition-colors text-xs font-bold border border-[#25D366]/30"
                title="Chat with us on WhatsApp"
              >
                <MessageSquare size={14} className="text-[#25D366]" />
                <span>WhatsApp</span>
              </a>
            )}

            {/* Shopping Bag Trigger */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative p-2.5 rounded-full hover:bg-[#EBE7DC] text-[#17191F] transition-colors"
              aria-label="View Shopping Bag"
            >
              <ShoppingBag size={21} />
              {totalItemsCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-[#5B5FEF] text-white text-[11px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                  {totalItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar Overlay */}
      {searchOpen && (
        <div className="border-t border-[#E7E3D8] bg-white px-4 py-4 shadow-sm animate-fade-in">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search size={18} className="absolute left-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search automotive wall art, billet accessories, wooden decor..."
                className="w-full pl-11 pr-24 py-3 bg-[#F7F5F0] border border-[#E7E3D8] rounded-xl text-sm focus:outline-none focus:border-[#5B5FEF] focus:ring-1 focus:ring-[#5B5FEF]"
                autoFocus
              />
              <div className="absolute right-2 flex items-center gap-1">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#17191F] text-white text-xs font-semibold rounded-lg hover:bg-[#5B5FEF] transition-colors"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-600"
                >
                  <X size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E7E3D8] bg-[#F7F5F0] px-4 pt-4 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-[#17191F] hover:bg-white"
          >
            Home
          </Link>
          <Link
            to="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-[#17191F] hover:bg-white"
          >
            Shop All Catalog
          </Link>

          <div className="pt-2 border-t border-[#E7E3D8]">
            <div className="px-3 text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
              Categories
            </div>
            {visibleCategories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-[#17191F] hover:bg-white"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-[#E7E3D8]">
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-[#17191F] hover:bg-white"
            >
              Craft &amp; Brand Story
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-[#17191F] hover:bg-white"
            >
              Contact Us
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
