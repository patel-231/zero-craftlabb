-- =====================================================================
-- ZERO CRAFTLABB — RELATIONAL POSTGRESQL / SUPABASE DATABASE SCHEMA
-- =====================================================================

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_image TEXT,
  banner_image TEXT,
  display_order INT DEFAULT 1,
  is_visible BOOLEAN DEFAULT TRUE,
  parent_category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  short_description TEXT,
  description TEXT,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  category_slug TEXT,
  category_name TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  primary_image TEXT,
  price NUMERIC(10, 2) NOT NULL,
  sale_price NUMERIC(10, 2),
  currency TEXT DEFAULT 'INR',
  stock INT DEFAULT 10,
  is_available BOOLEAN DEFAULT TRUE,
  variants JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  is_featured BOOLEAN DEFAULT FALSE,
  is_bestseller BOOLEAN DEFAULT FALSE,
  is_new_arrival BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  specifications JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  customer_full_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  customer_landmark TEXT,
  customer_city TEXT NOT NULL,
  customer_state TEXT NOT NULL,
  customer_postal_code TEXT NOT NULL,
  customer_alternate_phone TEXT,
  customer_notes TEXT,
  items JSONB NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  shipping_fee NUMERIC(10, 2) DEFAULT 0,
  discount NUMERIC(10, 2) DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  channel TEXT NOT NULL, -- 'whatsapp' | 'email'
  status TEXT DEFAULT 'new', -- 'new' | 'awaiting_confirmation' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  notification_status TEXT DEFAULT 'pending',
  internal_notes TEXT,
  whatsapp_message_text TEXT,
  email_delivery_log JSONB
);

-- 4. Website Settings Table
CREATE TABLE IF NOT EXISTS website_settings (
  id TEXT PRIMARY KEY DEFAULT 'current',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Administrators Table
CREATE TABLE IF NOT EXISTS administrators (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  role TEXT DEFAULT 'superadmin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- 6. Audit Trail Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  user_email TEXT
);

-- Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_published ON products(is_published);
CREATE INDEX IF NOT EXISTS idx_orders_reference ON orders(reference);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
