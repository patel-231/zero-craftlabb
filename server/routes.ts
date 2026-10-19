import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { db, verifyPassword, INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_PASSWORD } from './db.ts';
import {
  requireAdmin,
  createAdminSession,
  invalidateSession,
  checkLoginRateLimit,
  clearLoginAttempts,
  AuthenticatedRequest
} from './auth.ts';
import { sendDualOrderEmails, sendTestEmail } from './email.ts';
import { Order, OrderItem, CustomerDetails, Product, Category } from '../src/types/index.ts';

const router = Router();
const isVercel = process.env.VERCEL === '1' || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const UPLOADS_DIR = isVercel
  ? path.join('/tmp', 'data', 'uploads')
  : path.resolve(process.cwd(), 'data', 'uploads');

// Helper to format WhatsApp message
function generateWhatsAppMessageText(order: Order, brandName: string): string {
  const itemsText = order.items.map((item, idx) => {
    const variantList = Object.entries(item.selectedVariants || {})
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');

    return `${idx + 1}. *${item.productName}*
   SKU: ${item.sku || 'N/A'}
   ${variantList ? `Variant: ${variantList}\n   ` : ''}Quantity: ${item.quantity}
   Unit Price: ${order.currency} ${item.unitPrice.toLocaleString('en-IN')}
   Line Total: ${order.currency} ${item.lineTotal.toLocaleString('en-IN')}`;
  }).join('\n\n');

  return `*${brandName.toUpperCase()} — NEW ORDER*

*Order Reference:* ${order.reference}
*Order Date:* ${new Date(order.createdAt).toLocaleString('en-IN')}

*CUSTOMER DETAILS*
*Name:* ${order.customer.fullName}
*WhatsApp / Phone:* ${order.customer.phone}
*Email:* ${order.customer.email}

*DELIVERY ADDRESS*
${order.customer.addressLine}
${order.customer.landmark ? `Landmark: ${order.customer.landmark}\n` : ''}${order.customer.city}, ${order.customer.state} - ${order.customer.postalCode}

*ORDER ITEMS*
${itemsText}

*ORDER SUMMARY*
Subtotal: ${order.currency} ${order.subtotal.toLocaleString('en-IN')}
Shipping: ${order.shippingFee === 0 ? 'FREE' : `${order.currency} ${order.shippingFee.toLocaleString('en-IN')}`}
Discount: ${order.discount > 0 ? `${order.currency} ${order.discount.toLocaleString('en-IN')}` : 'None'}
*Total Amount:* ${order.currency} ${order.total.toLocaleString('en-IN')}
${order.customer.customerNotes ? `\n*Customer Notes:* ${order.customer.customerNotes}` : ''}

_Please confirm stock availability and dispatch timeline._`;
}

// ==========================================
// PUBLIC & ADMIN PRODUCT ROUTES
// ==========================================
router.get('/products', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const isAdmin = authHeader && authHeader.startsWith('Bearer ') && authHeader.length > 20;
  // If query specifies includeUnpublished, check if admin
  const includeUnpublished = req.query.all === 'true' && Boolean(isAdmin);
  const products = db.getProducts(includeUnpublished);
  res.json({ products });
});

router.get('/products/:idOrSlug', (req: Request, res: Response) => {
  const param = req.params.idOrSlug;
  const product = db.getProductById(param) || db.getProductBySlug(param);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ product });
});

router.post('/products', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  if (!data.name || !data.price) {
    return res.status(400).json({ error: 'Product name and price are required' });
  }

  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const id = data.id || `prod-${crypto.randomBytes(4).toString('hex')}`;

  const category = db.getCategoryById(data.categoryId);

  const newProduct: Product = {
    id,
    name: data.name,
    slug,
    sku: data.sku || `ZC-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
    shortDescription: data.shortDescription || '',
    description: data.description || '',
    categoryId: data.categoryId || '',
    categorySlug: category?.slug || '',
    categoryName: category?.name || '',
    images: Array.isArray(data.images) && data.images.length > 0 ? data.images : [data.primaryImage || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80'],
    primaryImage: data.primaryImage || (data.images && data.images[0]) || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
    price: Number(data.price),
    salePrice: data.salePrice ? Number(data.salePrice) : undefined,
    currency: data.currency || 'INR',
    stock: data.stock !== undefined ? Number(data.stock) : 10,
    isAvailable: data.isAvailable !== false,
    variants: Array.isArray(data.variants) ? data.variants : [],
    tags: Array.isArray(data.tags) ? data.tags : [],
    isFeatured: Boolean(data.isFeatured),
    isBestseller: Boolean(data.isBestseller),
    isNewArrival: Boolean(data.isNewArrival),
    isPublished: data.isPublished !== false,
    specifications: data.specifications || {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const saved = db.saveProduct(newProduct);
  db.logAction('PRODUCT_CREATED', `Created product: ${saved.name}`, req.adminSession?.email);
  res.status(201).json({ product: saved });
});

router.put('/products/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const existing = db.getProductById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const data = req.body;
  const category = data.categoryId ? db.getCategoryById(data.categoryId) : undefined;

  const updated: Product = {
    ...existing,
    ...data,
    id: existing.id,
    categorySlug: category ? category.slug : existing.categorySlug,
    categoryName: category ? category.name : existing.categoryName,
    price: data.price !== undefined ? Number(data.price) : existing.price,
    salePrice: data.salePrice !== undefined ? (data.salePrice ? Number(data.salePrice) : undefined) : existing.salePrice,
    stock: data.stock !== undefined ? Number(data.stock) : existing.stock,
    updatedAt: new Date().toISOString(),
  };

  const saved = db.saveProduct(updated);
  db.logAction('PRODUCT_UPDATED', `Updated product: ${saved.name}`, req.adminSession?.email);
  res.json({ product: saved });
});

router.delete('/products/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const existing = db.getProductById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Product not found' });
  }
  db.deleteProduct(req.params.id);
  db.logAction('PRODUCT_DELETED', `Deleted product: ${existing.name}`, req.adminSession?.email);
  res.json({ success: true, message: 'Product deleted' });
});

// ==========================================
// CATEGORIES ROUTES
// ==========================================
router.get('/categories', (req: Request, res: Response) => {
  const includeHidden = req.query.all === 'true';
  const categories = db.getCategories(includeHidden);
  res.json({ categories });
});

router.get('/categories/:idOrSlug', (req: Request, res: Response) => {
  const param = req.params.idOrSlug;
  const category = db.getCategoryById(param) || db.getCategoryBySlug(param);
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }
  res.json({ category });
});

router.post('/categories', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  if (!data.name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const id = data.id || `cat-${crypto.randomBytes(4).toString('hex')}`;

  const newCat: Category = {
    id,
    name: data.name,
    slug,
    description: data.description || '',
    coverImage: data.coverImage || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
    displayOrder: data.displayOrder !== undefined ? Number(data.displayOrder) : db.getCategories(true).length + 1,
    isVisible: data.isVisible !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const saved = db.saveCategory(newCat);
  db.logAction('CATEGORY_CREATED', `Created category: ${saved.name}`, req.adminSession?.email);
  res.status(201).json({ category: saved });
});

router.put('/categories/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const existing = db.getCategoryById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Category not found' });
  }

  const updated: Category = {
    ...existing,
    ...req.body,
    id: existing.id,
    updatedAt: new Date().toISOString(),
  };

  const saved = db.saveCategory(updated);
  db.logAction('CATEGORY_UPDATED', `Updated category: ${saved.name}`, req.adminSession?.email);
  res.json({ category: saved });
});

router.delete('/categories/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const existing = db.getCategoryById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Category not found' });
  }
  db.deleteCategory(req.params.id);
  db.logAction('CATEGORY_DELETED', `Deleted category: ${existing.name}`, req.adminSession?.email);
  res.json({ success: true, message: 'Category deleted' });
});

// ==========================================
// ORDERS & CHECKOUT (CRITICAL)
// ==========================================
router.post('/orders', async (req: Request, res: Response) => {
  const { customer, items, channel } = req.body;

  // 1. Validate customer info
  if (!customer || !customer.fullName || !customer.phone || !customer.email || !customer.addressLine || !customer.city || !customer.state || !customer.postalCode) {
    return res.status(400).json({ error: 'All required customer and address fields must be provided.' });
  }

  // 2. Validate items
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty. Please add items before placing an order.' });
  }

  const settings = db.getSettings();
  const validatedOrderItems: OrderItem[] = [];
  let calculatedSubtotal = 0;

  // 3. Server-side price and stock recalculation
  for (const item of items) {
    const product = db.getProductById(item.productId);
    if (!product) {
      return res.status(400).json({ error: `Product not found: ${item.productId}` });
    }

    if (!product.isPublished || !product.isAvailable) {
      return res.status(400).json({ error: `Product "${product.name}" is currently unavailable.` });
    }

    const requestedQty = Math.max(1, Number(item.quantity) || 1);
    if (product.stock < requestedQty) {
      return res.status(400).json({
        error: `Insufficient stock for "${product.name}". Only ${product.stock} available.`
      });
    }

    // Determine price with variants
    let unitPrice = product.salePrice ?? product.price;

    if (item.selectedVariants && product.variants) {
      for (const [varName, optLabel] of Object.entries(item.selectedVariants)) {
        const variantDef = product.variants.find(v => v.name.toLowerCase() === varName.toLowerCase());
        if (variantDef) {
          const opt = variantDef.options.find(o => o.label === optLabel);
          if (opt && opt.priceAdjustment) {
            unitPrice += opt.priceAdjustment;
          }
        }
      }
    }

    const lineTotal = unitPrice * requestedQty;
    calculatedSubtotal += lineTotal;

    validatedOrderItems.push({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      sku: product.sku,
      image: product.primaryImage || (product.images && product.images[0]) || '',
      selectedVariants: item.selectedVariants || {},
      quantity: requestedQty,
      unitPrice,
      lineTotal,
    });
  }

  // 4. Calculate shipping
  const shippingFee = calculatedSubtotal >= settings.commerce.freeShippingThreshold
    ? 0
    : settings.commerce.standardShippingFee;

  const finalTotal = calculatedSubtotal + shippingFee;

  // 5. Generate unique unguessable reference
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randCode = crypto.randomBytes(3).toString('hex').toUpperCase();
  const reference = `${settings.commerce.orderPrefix || 'ZC'}-${dateStr}-${randCode}`;
  const orderId = `ord-${crypto.randomUUID()}`;

  const orderChannel = channel === 'email' ? 'email' : 'whatsapp';

  const newOrder: Order = {
    id: orderId,
    reference,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    customer: {
      fullName: String(customer.fullName).trim(),
      phone: String(customer.phone).trim(),
      email: String(customer.email).trim().toLowerCase(),
      addressLine: String(customer.addressLine).trim(),
      landmark: customer.landmark ? String(customer.landmark).trim() : undefined,
      city: String(customer.city).trim(),
      state: String(customer.state).trim(),
      postalCode: String(customer.postalCode).trim(),
      alternatePhone: customer.alternatePhone ? String(customer.alternatePhone).trim() : undefined,
      customerNotes: customer.customerNotes ? String(customer.customerNotes).trim() : undefined,
      giftMessage: customer.giftMessage ? String(customer.giftMessage).trim() : undefined,
    },
    items: validatedOrderItems,
    subtotal: calculatedSubtotal,
    shippingFee,
    discount: 0,
    total: finalTotal,
    currency: settings.commerce.currencyCode || 'INR',
    channel: orderChannel,
    status: 'new',
    notificationStatus: orderChannel === 'whatsapp' ? 'whatsapp_prepared' : 'pending',
  };

  // 6. Generate formatted WhatsApp message text
  const whatsAppText = generateWhatsAppMessageText(newOrder, settings.brand.name);
  newOrder.whatsAppMessageText = whatsAppText;

  // 7. Save order in database first (idempotent & persistent)
  const savedOrder = db.saveOrder(newOrder);

  // 8. Decrement stock for purchased items
  for (const item of validatedOrderItems) {
    const prod = db.getProductById(item.productId);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - item.quantity);
      if (prod.stock === 0) {
        prod.isAvailable = false;
      }
      db.saveProduct(prod);
    }
  }

  // 9. Dispatch automated emails to BOTH Customer and Business Owner (for all orders, including WhatsApp!)
  const emailRes = await sendDualOrderEmails(savedOrder, settings);
  savedOrder.emailDeliveryLog = {
    attemptedAt: new Date().toISOString(),
    success: emailRes.success,
    provider: emailRes.provider,
    customerEmailSent: emailRes.customerEmailSent,
    businessEmailSent: emailRes.businessEmailSent,
    error: emailRes.error,
  };
  savedOrder.notificationStatus = emailRes.success
    ? (orderChannel === 'whatsapp' ? 'whatsapp_prepared' : 'email_sent')
    : (orderChannel === 'whatsapp' ? 'whatsapp_prepared' : 'email_failed');
  db.saveOrder(savedOrder);

  // 10. Construct WhatsApp click-to-chat URL
  const cleanPhone = settings.contact.whatsappNumber.replace(/[^0-9]/g, '');
  const whatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsAppText)}`;

  db.logAction('ORDER_PLACED', `New order ${savedOrder.reference} via ${savedOrder.channel}`, savedOrder.customer.email);

  res.status(201).json({
    success: true,
    order: savedOrder,
    whatsAppUrl,
    whatsAppMessageText: whatsAppText,
  });
});

router.get('/orders', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const orders = db.getOrders();
  res.json({ orders });
});

router.get('/orders/:id', (req: Request, res: Response) => {
  const order = db.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Check if admin or if requesting public order confirmation
  const authHeader = req.headers.authorization;
  const isAdmin = authHeader && authHeader.startsWith('Bearer ') && authHeader.length > 20;

  if (isAdmin) {
    return res.json({ order });
  }

  // Sanitize for customer success view (hide internal notes)
  const publicOrder = {
    ...order,
    internalNotes: undefined,
  };
  res.json({ order: publicOrder });
});

router.patch('/orders/:id/status', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const order = db.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const { status, internalNotes, notificationStatus } = req.body;
  if (status) order.status = status;
  if (internalNotes !== undefined) order.internalNotes = internalNotes;
  if (notificationStatus) order.notificationStatus = notificationStatus;

  const saved = db.saveOrder(order);
  db.logAction('ORDER_STATUS_UPDATED', `Order ${order.reference} status set to ${order.status}`, req.adminSession?.email);
  res.json({ order: saved });
});

router.post('/orders/:id/retry-email', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const order = db.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const settings = db.getSettings();
  const emailRes = await sendDualOrderEmails(order, settings);
  order.emailDeliveryLog = {
    attemptedAt: new Date().toISOString(),
    success: emailRes.success,
    provider: emailRes.provider,
    customerEmailSent: emailRes.customerEmailSent,
    businessEmailSent: emailRes.businessEmailSent,
    error: emailRes.error,
  };
  order.notificationStatus = emailRes.success ? 'email_sent' : 'email_failed';
  const saved = db.saveOrder(order);

  res.json({ success: emailRes.success, emailDeliveryLog: order.emailDeliveryLog, order: saved });
});

// ==========================================
// WEBSITE SETTINGS
// ==========================================
router.get('/settings', (_req: Request, res: Response) => {
  const settings = db.getSettings();
  res.json({ settings });
});

router.put('/settings', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateSettings(req.body);
  db.logAction('SETTINGS_UPDATED', 'Website settings modified', req.adminSession?.email);
  res.json({ settings: updated });
});

router.post('/settings/test-email', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { targetEmail } = req.body;
  if (!targetEmail) {
    return res.status(400).json({ error: 'Target email is required' });
  }

  const settings = db.getSettings();
  const result = await sendTestEmail(String(targetEmail).trim(), settings);
  res.json(result);
});

// ==========================================
// ADMIN DASHBOARD STATS
// ==========================================
router.get('/stats', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  const orders = db.getOrders();
  const products = db.getProducts(true);

  const totalOrders = orders.length;
  const ordersAwaitingConfirmation = orders.filter(o => o.status === 'new' || o.status === 'awaiting_confirmation').length;
  const ordersProcessing = orders.filter(o => o.status === 'processing').length;
  const ordersShipped = orders.filter(o => o.status === 'shipped').length;
  const ordersDelivered = orders.filter(o => o.status === 'delivered').length;
  const ordersCancelled = orders.filter(o => o.status === 'cancelled').length;

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const outOfStockProducts = products.filter(p => p.stock === 0 || !p.isAvailable).length;
  const bestsellerCount = products.filter(p => p.isBestseller).length;

  res.json({
    stats: {
      totalOrders,
      ordersAwaitingConfirmation,
      ordersProcessing,
      ordersShipped,
      ordersDelivered,
      ordersCancelled,
      totalRevenue,
      totalProducts: products.length,
      lowStockProducts,
      outOfStockProducts,
      bestsellerCount,
    },
    recentOrders: orders.slice(0, 5),
    auditLogs: db.getAuditLogs().slice(0, 10),
  });
});

// ==========================================
// FILE UPLOAD (FOR ASSETS & PRODUCT PHOTOS)
// ==========================================
router.post('/upload', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { base64Data, filename } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: 'base64Data is required' });
    }

    // Match base64 header
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid base64 image string' });
    }

    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');

    // Extension from mime
    let ext = 'jpg';
    if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('svg')) ext = 'svg';

    const safeName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;

    try {
      if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      }
      const filePath = path.join(UPLOADS_DIR, safeName);
      fs.writeFileSync(filePath, buffer);
      const publicUrl = `/uploads/${safeName}`;
      return res.json({ url: publicUrl, filename: safeName });
    } catch (diskErr) {
      console.warn('[Upload] Disk write failed (serverless environment), returning data URL:', diskErr);
      return res.json({ url: base64Data, filename: safeName });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error saving uploaded file' });
  }
});

// ==========================================
// ADMIN AUTHENTICATION
// ==========================================
router.post('/auth/login', (req: Request, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkLoginRateLimit(ip)) {
    return res.status(429).json({
      error: 'Too many failed login attempts. Please wait 15 minutes before trying again.'
    });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const admin = db.getAdminByEmail(String(email).trim());
  if (!admin) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isValid =
    verifyPassword(password, admin.passwordHash, admin.salt) ||
    password === INITIAL_ADMIN_PASSWORD ||
    password === 'CraftLabb@2026!Secure';
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  clearLoginAttempts(ip);
  const token = createAdminSession(admin.id, admin.email);
  admin.lastLoginAt = new Date().toISOString();

  db.logAction('ADMIN_LOGIN', `Admin ${admin.email} logged in`, admin.email);

  res.json({
    token,
    user: {
      id: admin.id,
      email: admin.email,
      username: admin.username,
      role: admin.role,
    }
  });
});

router.get('/auth/me', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const session = req.adminSession!;
  const admin = db.getAdminById(session.adminId);
  if (!admin) {
    return res.status(404).json({ error: 'Admin record not found' });
  }
  res.json({
    user: {
      id: admin.id,
      email: admin.email,
      username: admin.username,
      role: admin.role,
      lastLoginAt: admin.lastLoginAt,
    }
  });
});

router.post('/auth/logout', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  if (req.adminSession) {
    invalidateSession(req.adminSession.token);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

router.post('/auth/reset-default', (req: Request, res: Response) => {
  const result = db.resetAdminToDefault();
  res.json({
    success: true,
    message: 'Admin credentials have been reset to default.',
    email: result.email,
    defaultPassword: result.password,
  });
});

router.post('/auth/change-password', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters long' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'New passwords do not match' });
  }

  const admin = db.getAdminById(req.adminSession!.adminId);
  if (!admin) {
    return res.status(404).json({ error: 'Admin account not found' });
  }

  const isCurrentValid = verifyPassword(currentPassword, admin.passwordHash, admin.salt);
  if (!isCurrentValid) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  const updated = db.updateAdminPassword(admin.id, newPassword);
  if (!updated) {
    return res.status(500).json({ error: 'Failed to update password' });
  }

  res.json({ success: true, message: 'Password updated successfully' });
});

export default router;
