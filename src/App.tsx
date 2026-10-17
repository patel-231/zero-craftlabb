import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';

// Public Storefront Pages
import { HomePage } from './pages/HomePage.tsx';
import { ShopPage } from './pages/ShopPage.tsx';
import { CategoryPage } from './pages/CategoryPage.tsx';
import { ProductDetailPage } from './pages/ProductDetailPage.tsx';
import { CartPage } from './pages/CartPage.tsx';
import { CheckoutPage } from './pages/CheckoutPage.tsx';
import { OrderSuccessPage } from './pages/OrderSuccessPage.tsx';
import {
  AboutPage,
  ContactPage,
  ShippingPolicyPage,
  ReturnsPolicyPage,
  PrivacyPolicyPage,
  TermsPage,
} from './pages/PolicyPages.tsx';

// Private Admin Console Pages
import { AdminLayout } from './admin/AdminLayout.tsx';
import { AdminLogin } from './admin/AdminLogin.tsx';
import { AdminDashboard } from './admin/AdminDashboard.tsx';
import { AdminProducts } from './admin/AdminProducts.tsx';
import { AdminCategories } from './admin/AdminCategories.tsx';
import { AdminOrders } from './admin/AdminOrders.tsx';
import { AdminSettings } from './admin/AdminSettings.tsx';
import { AdminSecurity } from './admin/AdminSecurity.tsx';

// Public Storefront Shell
const StorefrontLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#17191F]">
      <Header />
      <CartDrawer />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <SettingsProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Storefront Routes */}
            <Route element={<StorefrontLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/product/:slug" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
              <Route path="/returns-policy" element={<ReturnsPolicyPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />
            </Route>

            {/* Admin Authentication Route */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Private Admin Console Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="settings/security" element={<AdminSecurity />} />
            </Route>

            {/* Fallback 404 Route */}
            <Route
              path="*"
              element={
                <div className="min-h-screen bg-[#F7F5F0] flex flex-col items-center justify-center p-4 text-center">
                  <h1 className="text-4xl font-extrabold text-[#17191F] mb-2">404</h1>
                  <p className="text-sm text-zinc-500 mb-6">The requested page does not exist.</p>
                  <a
                    href="/"
                    className="px-6 py-2.5 rounded-xl bg-[#17191F] text-white text-xs font-bold hover:bg-[#5B5FEF] transition-colors"
                  >
                    Return to Storefront
                  </a>
                </div>
              }
            />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </SettingsProvider>
  );
}
