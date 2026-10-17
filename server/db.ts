import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { Product, Category, Order, WebsiteSettings, AdminUser } from '../src/types/index.ts';

dotenv.config();

const isVercel = process.env.VERCEL === '1' || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const BUNDLED_DATA_DIR = path.resolve(process.cwd(), 'data');
const BUNDLED_DB_FILE = path.join(BUNDLED_DATA_DIR, 'store.json');

const ACTIVE_DATA_DIR = isVercel ? path.join('/tmp', 'data') : BUNDLED_DATA_DIR;
const ACTIVE_DB_FILE = path.join(ACTIVE_DATA_DIR, 'store.json');

export interface DatabaseSchema {
  products: Product[];
  categories: Category[];
  orders: Order[];
  settings: WebsiteSettings;
  admins: (AdminUser & { passwordHash: string; salt: string })[];
  auditLogs: { id: string; timestamp: string; action: string; details: string; user?: string }[];
}

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const currentSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, currentSalt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt: currentSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const check = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(check, 'hex'), Buffer.from(hash, 'hex'));
  } catch {
    return false;
  }
}

// Initial Initial Admin Password (can be changed in the admin panel)
export const INITIAL_ADMIN_EMAIL = 'admin@zerocraftlabb.com';
export const INITIAL_ADMIN_PASSWORD = process.env.ADMIN_INITIAL_PASSWORD || 'CraftLabb@2026!Secure';

const DEFAULT_SETTINGS: WebsiteSettings = {
  brand: {
    name: 'Zero Craftlabb',
    tagline: 'Precision Automotive Art & Handcrafted Creations',
    logoUrl: '/logo.svg',
    primaryColor: '#17191F',
    accentColor: '#5B5FEF',
  },
  contact: {
    whatsappNumber: '919876543210',
    displayPhone: '+91 98765 43210',
    businessOrderEmail: 'orders@zerocraftlabb.com',
    publicContactEmail: 'support@zerocraftlabb.com',
    address: 'Zero Craftlabb Studio, Industrial Arts Hub, Bengaluru, Karnataka, India',
    instagramUrl: 'https://instagram.com/zerocraftlabb',
  },
  announcement: {
    enabled: true,
    text: '✨ Handcrafted in India • Free shipping on orders over ₹1,499 • Easy WhatsApp & Email Ordering',
    linkUrl: '/shop',
  },
  hero: {
    title: 'Automotive Precision Meets Master Craftsmanship',
    subtitle: 'From iconic race track wall silhouettes to hand-carved festive brass decor, bring engineering passion and artisanal soul into your space.',
    ctaPrimaryText: 'Explore Catalog',
    ctaPrimaryLink: '/shop',
    ctaSecondaryText: 'Order via WhatsApp',
    ctaSecondaryLink: '/shop',
    backgroundImageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1920&q=80',
  },
  commerce: {
    currencySymbol: '₹',
    currencyCode: 'INR',
    freeShippingThreshold: 1499,
    standardShippingFee: 99,
    enableWhatsAppOrders: true,
    enableEmailOrders: true,
    allowInternationalOrders: false,
    orderPrefix: 'ZC',
  },
  policies: {
    shippingPolicy: 'We ship across all pin codes in India via express courier. Orders are handcrafted and dispatched within 2–3 business days. Delivery typically takes 4–6 business days.',
    returnsPolicy: 'Because our automotive wall art and wooden decor pieces are made to order, returns are accepted within 7 days of delivery only for damaged, defective, or incorrect items.',
    privacyPolicy: 'Zero Craftlabb respects your privacy. We only collect your contact and delivery details to fulfill your order and communicate updates. We never share or sell customer data.',
    termsAndConditions: 'By placing an order via WhatsApp or Email, you agree that final order confirmation, shipping cost calculations (if applicable), and tracking details will be communicated via direct business messaging.',
    aboutUsStory: 'Zero Craftlabb was born from an obsession with automotive aesthetics, high-grade metals, fine woodwork, and Indian festive craftsmanship. Every piece is designed and produced with meticulous care.',
  },
  seo: {
    siteTitle: 'Zero Craftlabb — Automotive Wall Art & Handcrafted Décor',
    metaDescription: 'Shop handcrafted automotive wall art, racing track silhouettes, brass accessories, wooden home decor, and festive diyas at Zero Craftlabb.',
  },
};

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-auto-art',
    name: 'Automotive Wall Art',
    slug: 'automotive-wall-art',
    description: 'Laser-cut acrylic silhouettes, formula track outlines, and precision metal automotive wall hangings.',
    coverImage: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
    displayOrder: 1,
    isVisible: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-auto-acc',
    name: 'Automotive Accessories',
    slug: 'automotive-accessories',
    description: 'Precision machined tire valve caps, piston paperweights, bespoke keychains, and dashboard idols.',
    coverImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    displayOrder: 2,
    isVisible: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-home-decor',
    name: 'Home & Wall Décor',
    slug: 'home-and-wall-decor',
    description: 'Architectural geometric clocks, handcrafted solid wood accents, and minimalist shelf decor.',
    coverImage: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    displayOrder: 3,
    isVisible: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-festive-craft',
    name: 'Festive & Handmade Products',
    slug: 'festive-and-handmade',
    description: 'Traditional handcrafted pure brass diyas, carved terracotta lamps, and artisanal festive gift sets.',
    coverImage: 'https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?auto=format&fit=crop&w=800&q=80',
    displayOrder: 4,
    isVisible: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-f1-tracks',
    name: 'Grand Prix Circuit Wall Art (Set of 6 Tracks)',
    slug: 'grand-prix-circuit-wall-art-set',
    sku: 'ZC-ART-GP06',
    shortDescription: 'Precision cut matte-black acrylic racing circuits including Monaco, Spa, Silverstone, and Monza.',
    description: 'Celebrate the pinnacle of motorsport with our precision laser-cut Formula circuit wall art set. Crafted from 5mm high-density matte cast acrylic with pre-mounted invisible wall float brackets for a striking 3D shadow drop effect on your wall.',
    categoryId: 'cat-auto-art',
    categorySlug: 'automotive-wall-art',
    categoryName: 'Automotive Wall Art',
    images: [
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80'
    ],
    primaryImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=80',
    price: 2499,
    salePrice: 1999,
    currency: 'INR',
    stock: 25,
    isAvailable: true,
    variants: [
      {
        id: 'var-size',
        name: 'Size',
        options: [
          { label: 'Medium (25cm each)', priceAdjustment: 0 },
          { label: 'Large (40cm each)', priceAdjustment: 800 }
        ]
      },
      {
        id: 'var-finish',
        name: 'Finish',
        options: [
          { label: 'Stealth Matte Black', priceAdjustment: 0 },
          { label: 'Brushed Titanium Grey', priceAdjustment: 200 }
        ]
      }
    ],
    tags: ['Automotive', 'F1', 'Wall Art', 'Bestseller'],
    isFeatured: true,
    isBestseller: true,
    isNewArrival: false,
    isPublished: true,
    specifications: {
      'Material': 'Cast Acrylic 5mm',
      'Finish': 'Matte Non-Glare',
      'Mounting': 'Invisible 3M VHB Wall Tabs Included',
      'Country of Origin': 'India'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-classic-porsche-silhouette',
    name: '911 Classic Profile Acrylic Wall Silhouette',
    slug: '911-classic-profile-acrylic-wall-silhouette',
    sku: 'ZC-ART-911SIL',
    shortDescription: 'Iconic aerodynamic side profile silhouette of the timeless 1974 sports coupe.',
    description: 'Clean, flowing silhouette capturing the legendary curves of the classic air-cooled coupe. Cut with aerospace-grade laser precision and chamfered edges to elevate any garage, studio, or living room.',
    categoryId: 'cat-auto-art',
    categorySlug: 'automotive-wall-art',
    categoryName: 'Automotive Wall Art',
    images: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1000&q=80'
    ],
    primaryImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80',
    price: 1799,
    salePrice: 1499,
    currency: 'INR',
    stock: 18,
    isAvailable: true,
    variants: [
      {
        id: 'var-length',
        name: 'Length',
        options: [
          { label: '60 cm Length', priceAdjustment: 0 },
          { label: '90 cm Length', priceAdjustment: 600 }
        ]
      }
    ],
    tags: ['Porsche', 'Silhouette', 'Car Art'],
    isFeatured: true,
    isBestseller: true,
    isNewArrival: true,
    isPublished: true,
    specifications: {
      'Material': 'Aviation grade acrylic',
      'Thickness': '4.5 mm',
      'Weight': '650g'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-machined-valve-caps',
    name: 'Billet Aluminium Knurled Tire Valve Stem Caps (Set of 4)',
    slug: 'billet-aluminium-knurled-tire-valve-caps',
    sku: 'ZC-ACC-VLV04',
    shortDescription: 'CNC machined aerospace aluminium with diamond knurling and airtight internal neoprene O-rings.',
    description: 'Ditch flimsy plastic tire caps for our CNC lathed solid billet aluminium valve caps. Feature deep diamond knurling for easy grip and premium internal rubber seal to prevent pressure leaks and corrosion.',
    categoryId: 'cat-auto-acc',
    categorySlug: 'automotive-accessories',
    categoryName: 'Automotive Accessories',
    images: [
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1000&q=80'
    ],
    primaryImage: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1000&q=80',
    price: 699,
    salePrice: 549,
    currency: 'INR',
    stock: 40,
    isAvailable: true,
    variants: [
      {
        id: 'var-color',
        name: 'Anodized Color',
        options: [
          { label: 'Electric Indigo Blue', priceAdjustment: 0 },
          { label: 'Satin Gunmetal', priceAdjustment: 0 },
          { label: 'Sunset Coral Red', priceAdjustment: 0 },
          { label: 'Raw Brushed Silver', priceAdjustment: 0 }
        ]
      }
    ],
    tags: ['Accessories', 'Aluminium', 'CNC', 'Car'],
    isFeatured: false,
    isBestseller: true,
    isNewArrival: false,
    isPublished: true,
    specifications: {
      'Fitment': 'Universal Schrader valve (All Cars, SUVs, Motorcycles)',
      'Material': '6061-T6 Billet Aluminium'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-wooden-geometric-clock',
    name: 'Kinetic Geometric Teakwood Wall Clock',
    slug: 'kinetic-geometric-teakwood-wall-clock',
    sku: 'ZC-DEC-CLK01',
    shortDescription: 'Hand-finished sustainable reclaimed teakwood with silent sweep Japanese quartz movement.',
    description: 'An architectural centerpiece for modern interiors. Constructed using precision radial wood joints and natural beeswax polish. No loud ticking—features an ultra-silent sweep quartz mechanism.',
    categoryId: 'cat-home-decor',
    categorySlug: 'home-and-wall-decor',
    categoryName: 'Home & Wall Décor',
    images: [
      'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80'
    ],
    primaryImage: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=1000&q=80',
    price: 2899,
    salePrice: 2499,
    currency: 'INR',
    stock: 12,
    isAvailable: true,
    variants: [
      {
        id: 'var-diameter',
        name: 'Diameter',
        options: [
          { label: '12-inch (30cm)', priceAdjustment: 0 },
          { label: '16-inch (40cm)', priceAdjustment: 700 }
        ]
      }
    ],
    tags: ['Wooden', 'Wall Clock', 'Minimalist', 'Home Decor'],
    isFeatured: true,
    isBestseller: false,
    isNewArrival: true,
    isPublished: true,
    specifications: {
      'Wood Type': 'Reclaimed Indian Teakwood',
      'Movement': 'Silent Sweep Quartz (AA battery operated)',
      'Warranty': '1 Year Movement Warranty'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-brass-carved-diya',
    name: 'Artisanal Hand-Carved Brass Peacock Diya (Pair)',
    slug: 'artisanal-hand-carved-brass-peacock-diya-pair',
    sku: 'ZC-FST-DIYA02',
    shortDescription: 'Solid cast brass oil lamps engraved by master artisans with traditional heritage motifs.',
    description: 'Handcrafted in brass using centuries-old sand-casting methods. Ideal for daily rituals, festive poojas, Diwali, and gifting. Heavyweight base prevents tilting while the antique golden lacquer prevents tarnishing.',
    categoryId: 'cat-festive-craft',
    categorySlug: 'festive-and-handmade',
    categoryName: 'Festive & Handmade Products',
    images: [
      'https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?auto=format&fit=crop&w=1000&q=80'
    ],
    primaryImage: 'https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?auto=format&fit=crop&w=1000&q=80',
    price: 1899,
    salePrice: 1599,
    currency: 'INR',
    stock: 30,
    isAvailable: true,
    variants: [
      {
        id: 'var-finish',
        name: 'Finish',
        options: [
          { label: 'Antique Vintage Brass', priceAdjustment: 0 },
          { label: 'Mirror Polished Gold', priceAdjustment: 100 }
        ]
      }
    ],
    tags: ['Handmade', 'Diya', 'Brass', 'Festive'],
    isFeatured: true,
    isBestseller: true,
    isNewArrival: false,
    isPublished: true,
    specifications: {
      'Material': '100% Solid Cast Brass',
      'Weight': '820 grams (Pair)',
      'Height': '14 cm each'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-engine-coasters',
    name: 'Mechanical Head Gasket Laser-Etched Coasters (Set of 4)',
    slug: 'mechanical-head-gasket-coasters-set-of-4',
    sku: 'ZC-ACC-CST04',
    shortDescription: 'Real brushed stainless steel coasters featuring laser-engraved cylinder bore blueprints.',
    description: 'Protect your coffee table or office desk with motorsport flair. Features non-slip cork base backing to prevent table scratches and absorb condensation.',
    categoryId: 'cat-auto-acc',
    categorySlug: 'automotive-accessories',
    categoryName: 'Automotive Accessories',
    images: [
      'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1000&q=80'
    ],
    primaryImage: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1000&q=80',
    price: 899,
    salePrice: 749,
    currency: 'INR',
    stock: 35,
    isAvailable: true,
    variants: [],
    tags: ['Coasters', 'Stainless Steel', 'Motorsport'],
    isFeatured: false,
    isBestseller: false,
    isNewArrival: true,
    isPublished: true,
    specifications: {
      'Material': 'Brushed Stainless Steel 304 with Natural Cork Underlay',
      'Diameter': '10 cm'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadData();
  }

  private ensureDataDir() {
    try {
      if (!fs.existsSync(ACTIVE_DATA_DIR)) {
        fs.mkdirSync(ACTIVE_DATA_DIR, { recursive: true });
      }
      const uploadsDir = path.join(ACTIVE_DATA_DIR, 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
    } catch (err) {
      console.warn('[Database] Filesystem read-only or permission warning (normal in serverless):', err);
    }
  }

  private loadData(): DatabaseSchema {
    // 1. Try reading active file (/tmp/data/store.json in Vercel or data/store.json locally)
    if (fs.existsSync(ACTIVE_DB_FILE)) {
      try {
        const raw = fs.readFileSync(ACTIVE_DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          products: parsed.products || DEFAULT_PRODUCTS,
          categories: parsed.categories || DEFAULT_CATEGORIES,
          orders: parsed.orders || [],
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
          admins: parsed.admins && parsed.admins.length > 0 ? parsed.admins : this.createInitialAdmins(),
          auditLogs: parsed.auditLogs || [],
        };
      } catch (err) {
        console.error('Error reading ACTIVE_DB_FILE, checking bundled repository store...', err);
      }
    }

    // 2. Try reading bundled data/store.json from git repository
    if (fs.existsSync(BUNDLED_DB_FILE)) {
      try {
        const raw = fs.readFileSync(BUNDLED_DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        const data: DatabaseSchema = {
          products: parsed.products || DEFAULT_PRODUCTS,
          categories: parsed.categories || DEFAULT_CATEGORIES,
          orders: parsed.orders || [],
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
          admins: parsed.admins && parsed.admins.length > 0 ? parsed.admins : this.createInitialAdmins(),
          auditLogs: parsed.auditLogs || [],
        };
        // Warm up active store if different
        if (ACTIVE_DB_FILE !== BUNDLED_DB_FILE) {
          this.saveData(data);
        }
        return data;
      } catch (err) {
        console.error('Error reading BUNDLED_DB_FILE, initializing defaults...', err);
      }
    }

    const initial: DatabaseSchema = {
      products: DEFAULT_PRODUCTS,
      categories: DEFAULT_CATEGORIES,
      orders: [],
      settings: DEFAULT_SETTINGS,
      admins: this.createInitialAdmins(),
      auditLogs: [{
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        action: 'DATABASE_INITIALIZED',
        details: 'Initial database created with Zero Craftlabb products and settings.'
      }],
    };
    this.saveData(initial);
    return initial;
  }

  private createInitialAdmins() {
    const { hash, salt } = hashPassword(INITIAL_ADMIN_PASSWORD);
    return [{
      id: 'admin-master',
      username: 'admin',
      email: INITIAL_ADMIN_EMAIL,
      role: 'superadmin' as const,
      passwordHash: hash,
      salt: salt,
      createdAt: new Date().toISOString(),
    }];
  }

  private saveData(dataToSave?: DatabaseSchema) {
    try {
      this.ensureDataDir();
      const data = dataToSave || this.data;
      const tempFile = `${ACTIVE_DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempFile, ACTIVE_DB_FILE);
    } catch (err) {
      console.warn('[Database] Could not write store.json to disk (filesystem may be read-only). In-memory state maintained.', err);
    }
  }

  // --- Products ---
  getProducts(includeUnpublished = false): Product[] {
    if (includeUnpublished) return [...this.data.products];
    return this.data.products.filter(p => p.isPublished);
  }

  getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  getProductBySlug(slug: string): Product | undefined {
    return this.data.products.find(p => p.slug === slug);
  }

  saveProduct(product: Product): Product {
    const existingIndex = this.data.products.findIndex(p => p.id === product.id);
    product.updatedAt = new Date().toISOString();
    if (existingIndex >= 0) {
      this.data.products[existingIndex] = product;
    } else {
      product.createdAt = product.createdAt || new Date().toISOString();
      this.data.products.unshift(product);
    }
    this.saveData();
    return product;
  }

  deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    if (this.data.products.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // --- Categories ---
  getCategories(includeHidden = false): Category[] {
    const cats = [...this.data.categories].sort((a, b) => a.displayOrder - b.displayOrder);
    if (includeHidden) return cats;
    return cats.filter(c => c.isVisible);
  }

  getCategoryById(id: string): Category | undefined {
    return this.data.categories.find(c => c.id === id);
  }

  getCategoryBySlug(slug: string): Category | undefined {
    return this.data.categories.find(c => c.slug === slug);
  }

  saveCategory(category: Category): Category {
    const existingIndex = this.data.categories.findIndex(c => c.id === category.id);
    category.updatedAt = new Date().toISOString();
    if (existingIndex >= 0) {
      this.data.categories[existingIndex] = category;
    } else {
      category.createdAt = category.createdAt || new Date().toISOString();
      this.data.categories.push(category);
    }
    this.saveData();
    return category;
  }

  deleteCategory(id: string): boolean {
    const initialLen = this.data.categories.length;
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    if (this.data.categories.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // --- Orders ---
  getOrders(): Order[] {
    return [...this.data.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id || o.reference === id);
  }

  saveOrder(order: Order): Order {
    const existingIndex = this.data.orders.findIndex(o => o.id === order.id);
    order.updatedAt = new Date().toISOString();
    if (existingIndex >= 0) {
      this.data.orders[existingIndex] = order;
    } else {
      order.createdAt = order.createdAt || new Date().toISOString();
      this.data.orders.unshift(order);
    }
    this.saveData();
    return order;
  }

  // --- Settings ---
  getSettings(): WebsiteSettings {
    return { ...this.data.settings };
  }

  updateSettings(newSettings: Partial<WebsiteSettings>): WebsiteSettings {
    this.data.settings = {
      ...this.data.settings,
      ...newSettings,
      brand: { ...this.data.settings.brand, ...(newSettings.brand || {}) },
      contact: { ...this.data.settings.contact, ...(newSettings.contact || {}) },
      announcement: { ...this.data.settings.announcement, ...(newSettings.announcement || {}) },
      hero: { ...this.data.settings.hero, ...(newSettings.hero || {}) },
      commerce: { ...this.data.settings.commerce, ...(newSettings.commerce || {}) },
      policies: { ...this.data.settings.policies, ...(newSettings.policies || {}) },
      seo: { ...this.data.settings.seo, ...(newSettings.seo || {}) },
    };
    this.saveData();
    return this.data.settings;
  }

  // --- Admin Auth ---
  getAdminByEmail(email: string) {
    return this.data.admins.find(a => a.email.toLowerCase() === email.toLowerCase());
  }

  getAdminById(id: string) {
    return this.data.admins.find(a => a.id === id);
  }

  updateAdminPassword(adminId: string, newPassword: string): boolean {
    const admin = this.data.admins.find(a => a.id === adminId);
    if (!admin) return false;
    const { hash, salt } = hashPassword(newPassword);
    admin.passwordHash = hash;
    admin.salt = salt;
    this.logAction('PASSWORD_CHANGED', `Admin ${admin.email} updated password`, admin.email);
    this.saveData();
    return true;
  }

  logAction(action: string, details: string, user?: string) {
    this.data.auditLogs.unshift({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      action,
      details,
      user
    });
    if (this.data.auditLogs.length > 200) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 200);
    }
    this.saveData();
  }

  getAuditLogs() {
    return [...this.data.auditLogs];
  }
}

export const db = new Database();
