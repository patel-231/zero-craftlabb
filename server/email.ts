import { Order, WebsiteSettings } from '../src/types/index.ts';

export interface DualEmailSendResult {
  success: boolean;
  provider: 'brevo' | 'none';
  customerEmailSent: boolean;
  businessEmailSent: boolean;
  error?: string;
  details?: string;
}

// ==========================================
// EMAIL HTML BUILDERS
// ==========================================

export function generateCustomerConfirmationHtml(order: Order, settings: WebsiteSettings): string {
  const currency = settings.commerce.currencySymbol || '₹';
  const cleanPhone = settings.contact.whatsappNumber.replace(/[^0-9]/g, '');

  const itemsRows = order.items.map((item) => {
    const variantStr = Object.entries(item.selectedVariants || {})
      .map(([k, v]) => `${k}: <strong>${v}</strong>`)
      .join(' | ');

    return `
      <tr style="border-bottom: 1px solid #ECE8DE;">
        <td style="padding: 14px 8px; vertical-align: top;">
          <strong style="color: #17191F; font-size: 14px;">${item.productName}</strong>
          ${item.sku ? `<br><span style="font-size: 11px; color: #71717A; font-family: monospace;">SKU: ${item.sku}</span>` : ''}
          ${variantStr ? `<br><span style="font-size: 12px; color: #5B5FEF;">${variantStr}</span>` : ''}
        </td>
        <td style="padding: 14px 8px; text-align: center; font-size: 14px; font-weight: 600; color: #17191F; vertical-align: top;">
          ${item.quantity}
        </td>
        <td style="padding: 14px 8px; text-align: right; font-size: 14px; color: #17191F; vertical-align: top;">
          ${currency}${item.unitPrice.toLocaleString('en-IN')}
        </td>
        <td style="padding: 14px 8px; text-align: right; font-size: 14px; font-weight: 700; color: #17191F; vertical-align: top;">
          ${currency}${item.lineTotal.toLocaleString('en-IN')}
        </td>
      </tr>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Zero Craftlabb Order Confirmation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F7F5F0; margin: 0; padding: 24px; color: #17191F;">
  <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #E7E3D8;">
    
    <!-- Header -->
    <div style="background-color: #17191F; padding: 32px 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: -0.5px; font-weight: 800;">
        ${settings.brand.name.toUpperCase()}
      </h1>
      <p style="color: #FF7547; margin: 6px 0 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
        ✨ Order Confirmation &amp; Workshop Notice
      </p>
    </div>

    <div style="padding: 28px 24px;">
      <!-- Welcome Message -->
      <p style="font-size: 16px; margin: 0 0 16px; color: #17191F;">
        Hello <strong>${order.customer.fullName}</strong>,
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #52525B; margin: 0 0 24px;">
        Thank you for choosing <strong>${settings.brand.name}</strong>. Your order has been securely recorded in our system. Each piece is individually crafted, hand-finished, and protected for transit across India.
      </p>

      <!-- Order Reference Card -->
      <div style="background-color: #F7F5F0; border-radius: 12px; padding: 18px; margin-bottom: 24px; border: 1px solid #E7E3D8; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="font-size: 11px; color: #71717A; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Order Reference</span>
          <p style="margin: 4px 0 0; font-size: 20px; font-weight: 800; color: #5B5FEF; font-family: monospace;">${order.reference}</p>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 11px; color: #71717A; text-transform: uppercase; font-weight: 700;">Order Channel</span>
          <p style="margin: 4px 0 0; font-size: 13px; font-weight: 700; color: #17191F; text-transform: uppercase;">${order.channel}</p>
        </div>
      </div>

      <!-- Items Table -->
      <h3 style="font-size: 14px; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #17191F; border-bottom: 2px solid #17191F; padding-bottom: 8px;">
        Ordered Items
      </h3>
      <table style="width: 100%; border-collapse: collapse; text-align: left; margin-bottom: 24px;">
        <thead>
          <tr style="border-bottom: 1px solid #E7E3D8; font-size: 11px; text-transform: uppercase; color: #71717A;">
            <th style="padding: 8px 8px 12px;">Product</th>
            <th style="padding: 8px 8px 12px; text-align: center;">Qty</th>
            <th style="padding: 8px 8px 12px; text-align: right;">Price</th>
            <th style="padding: 8px 8px 12px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <!-- Summary Box -->
      <div style="background: #FAFAF9; border-radius: 12px; padding: 16px; margin-bottom: 28px; border: 1px solid #E7E3D8;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: #52525B;">
          <span>Subtotal:</span>
          <span style="font-weight: 600; color: #17191F;">${currency}${order.subtotal.toLocaleString('en-IN')}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: #52525B;">
          <span>Shipping:</span>
          <span style="font-weight: 600; color: #17191F;">${order.shippingFee === 0 ? '<strong style="color: #25D366;">FREE</strong>' : `${currency}${order.shippingFee}`}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px solid #E7E3D8; font-size: 16px; font-weight: 800; color: #17191F;">
          <span>Final Total:</span>
          <span style="color: #5B5FEF;">${currency}${order.total.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <!-- Delivery Address -->
      <div style="background-color: #F7F5F0; border-radius: 12px; padding: 18px; margin-bottom: 28px; border: 1px solid #E7E3D8;">
        <h4 style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; color: #71717A; letter-spacing: 0.5px;">
          Shipping Address
        </h4>
        <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #17191F;">
          <strong>${order.customer.fullName}</strong><br>
          ${order.customer.addressLine}${order.customer.landmark ? ', ' + order.customer.landmark : ''}<br>
          ${order.customer.city}, ${order.customer.state} - <strong>${order.customer.postalCode}</strong><br>
          Phone: ${order.customer.phone}
        </p>
        ${order.customer.customerNotes ? `<p style="margin: 10px 0 0; font-size: 13px; color: #B45309; background: #FEF3C7; padding: 8px; border-radius: 6px;"><strong>Note:</strong> ${order.customer.customerNotes}</p>` : ''}
      </div>

      <!-- What Happens Next -->
      <div style="border-left: 3px solid #5B5FEF; padding-left: 14px; margin-bottom: 28px;">
        <h4 style="margin: 0 0 6px; font-size: 13px; font-weight: 700; color: #17191F; text-transform: uppercase;">
          What Happens Next?
        </h4>
        <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #52525B;">
          1. Our workshop team reviews your specifications and prepares precision cutting &amp; polishing.<br>
          2. We will reach out via WhatsApp (${settings.contact.displayPhone}) to confirm dispatch details.<br>
          3. Your parcel will be shipped with express tracking directly to your door within 4-6 business days.
        </p>
      </div>

      <!-- WhatsApp Direct Contact CTA -->
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="https://wa.me/${cleanPhone}?text=Hi%20Zero%20Craftlabb%2C%20regarding%20my%20order%20${order.reference}"
           style="display: inline-block; background-color: #25D366; color: #17191F; font-weight: 700; font-size: 13px; text-decoration: none; padding: 12px 24px; border-radius: 10px;">
           💬 Chat With Us on WhatsApp
        </a>
      </div>

      <!-- Footer Info -->
      <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #ECE8DE; font-size: 12px; color: #71717A; text-align: center; line-height: 1.5;">
        <p style="margin: 0 0 4px;"><strong>${settings.brand.name}</strong> • ${settings.brand.tagline}</p>
        <p style="margin: 0 0 4px;">${settings.contact.address}</p>
        <p style="margin: 0;">WhatsApp: ${settings.contact.displayPhone} | Email: ${settings.contact.publicContactEmail}</p>
      </div>

    </div>
  </div>
</body>
</html>
  `;
}

export function generateBusinessNotificationHtml(order: Order, settings: WebsiteSettings): string {
  const currency = settings.commerce.currencySymbol || '₹';
  const cleanPhone = order.customer.phone.replace(/[^0-9]/g, '');

  const itemsRows = order.items.map((item, idx) => {
    const variantStr = Object.entries(item.selectedVariants || {})
      .map(([k, v]) => `${k}: <strong>${v}</strong>`)
      .join(', ');

    return `
      <tr style="border-bottom: 1px solid #eaeaea;">
        <td style="padding: 10px 8px; font-size: 13px; color: #17191F;">
          <strong>${idx + 1}. ${item.productName}</strong>
          ${item.sku ? `<br><span style="font-size: 11px; color: #71717A;">SKU: ${item.sku}</span>` : ''}
          ${variantStr ? `<br><span style="font-size: 12px; color: #5B5FEF;">${variantStr}</span>` : ''}
        </td>
        <td style="padding: 10px 8px; text-align: center; font-size: 13px; font-weight: 600;">${item.quantity}</td>
        <td style="padding: 10px 8px; text-align: right; font-size: 13px;">${currency}${item.unitPrice.toLocaleString('en-IN')}</td>
        <td style="padding: 10px 8px; text-align: right; font-size: 13px; font-weight: 700;">${currency}${item.lineTotal.toLocaleString('en-IN')}</td>
      </tr>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Zero Craftlabb Order [${order.reference}]</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F4F2EB; margin: 0; padding: 20px; color: #17191F;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #E7E3D8; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
    
    <div style="background-color: #17191F; padding: 24px; text-align: center;">
      <span style="background: #FF7547; color: #ffffff; font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 3px 8px; rounded: 4px; letter-spacing: 1px;">
        NEW ${order.channel.toUpperCase()} ORDER
      </span>
      <h1 style="color: #ffffff; margin: 8px 0 0; font-size: 20px;">
        Ref: ${order.reference}
      </h1>
    </div>

    <div style="padding: 24px;">
      <!-- Customer Card -->
      <div style="background-color: #F7F5F0; border-radius: 8px; padding: 16px; margin-bottom: 20px; border: 1px solid #E7E3D8;">
        <h3 style="margin: 0 0 10px; font-size: 13px; text-transform: uppercase; color: #52525B;">Customer Contact</h3>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Name:</strong> ${order.customer.fullName}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Phone / WhatsApp:</strong> ${order.customer.phone}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Email:</strong> ${order.customer.email}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Delivery Address:</strong> ${order.customer.addressLine}, ${order.customer.landmark ? order.customer.landmark + ', ' : ''}${order.customer.city}, ${order.customer.state} - ${order.customer.postalCode}</p>
        ${order.customer.customerNotes ? `<p style="margin: 8px 0 0; font-size: 13px; background: #FFFBEB; padding: 8px; border-radius: 6px; color: #92400E;"><strong>Notes:</strong> ${order.customer.customerNotes}</p>` : ''}
        
        <div style="margin-top: 14px;">
          <a href="https://wa.me/${cleanPhone}?text=Hi%20${encodeURIComponent(order.customer.fullName)}%2C%20thank%20you%20for%20your%20Zero%20Craftlabb%20order%20${order.reference}!"
             style="display: inline-block; background: #25D366; color: #17191F; font-size: 12px; font-weight: 700; text-decoration: none; padding: 8px 16px; border-radius: 8px;">
             📱 Direct WhatsApp Customer
          </a>
        </div>
      </div>

      <!-- Items -->
      <h3 style="margin: 0 0 10px; font-size: 13px; text-transform: uppercase; color: #52525B;">Order Breakdown</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="border-bottom: 1px solid #E7E3D8; font-size: 11px; text-transform: uppercase; color: #71717A;">
            <th style="padding: 6px 8px; text-align: left;">Item</th>
            <th style="padding: 6px 8px; text-align: center;">Qty</th>
            <th style="padding: 6px 8px; text-align: right;">Unit</th>
            <th style="padding: 6px 8px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <!-- Totals -->
      <div style="border-top: 2px solid #17191F; padding-top: 10px; margin-left: auto; width: 220px; font-size: 13px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>Subtotal:</span>
          <strong>${currency}${order.subtotal.toLocaleString('en-IN')}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>Shipping:</span>
          <strong>${order.shippingFee === 0 ? 'FREE' : `${currency}${order.shippingFee}`}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: 800; color: #5B5FEF; border-top: 1px solid #ddd; padding-top: 6px;">
          <span>Total:</span>
          <span>${currency}${order.total.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div style="margin-top: 28px; text-align: center;">
        <p style="font-size: 11px; color: #71717A;">
          This order is recorded in your Zero Craftlabb database. Log in to your protected Admin Portal to update the fulfillment status.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

// ==========================================
// BREVO & RESEND DISPATCHERS
// ==========================================

async function sendViaBrevo(params: {
  apiKey: string;
  sender: { name: string; email: string };
  to: { name: string; email: string }[];
  subject: string;
  htmlContent: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': params.apiKey,
      },
      body: JSON.stringify({
        sender: params.sender,
        to: params.to,
        subject: params.subject,
        htmlContent: params.htmlContent,
      }),
    });

    const data = await res.json();
    if (res.ok && (data.messageId || data.messageIds)) {
      return {
        success: true,
        messageId: data.messageId || data.messageIds?.[0],
      };
    } else {
      return {
        success: false,
        error: data.message || JSON.stringify(data),
      };
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network failure connecting to Brevo API',
    };
  }
}

// ==========================================
// MASTER DUAL DISPATCH FUNCTION (BREVO API)
// ==========================================

export async function sendDualOrderEmails(
  order: Order,
  settings: WebsiteSettings
): Promise<DualEmailSendResult> {
  // Check Brevo credentials (from settings first, then multiple env var aliases)
  const rawBrevoApiKey =
    settings.emailConfig?.brevoApiKey ||
    process.env.BREVO_API_KEY ||
    process.env.VITE_BREVO_API_KEY ||
    process.env.BREVO_KEY ||
    process.env.BREVO_APIKEY ||
    process.env.SENDINBLUE_API_KEY ||
    '';
  const brevoApiKey = rawBrevoApiKey.trim().replace(/^["']|["']$/g, '');

  const brevoSenderEmail = (
    settings.emailConfig?.brevoSenderEmail ||
    process.env.BREVO_SENDER_EMAIL ||
    process.env.BREVO_FROM_EMAIL ||
    settings.contact.businessOrderEmail ||
    'orders@zerocraftlabb.com'
  ).trim().replace(/^["']|["']$/g, '');

  const brevoSenderName = (
    settings.emailConfig?.brevoSenderName ||
    process.env.BREVO_SENDER_NAME ||
    process.env.BREVO_FROM_NAME ||
    settings.brand.name ||
    'Zero Craftlabb'
  ).trim().replace(/^["']|["']$/g, '');

  const businessEmail = settings.contact.businessOrderEmail;
  const customerEmail = order.customer.email;

  // If Brevo API key is available
  if (brevoApiKey) {
    const customerHtml = generateCustomerConfirmationHtml(order, settings);
    const businessHtml = generateBusinessNotificationHtml(order, settings);

    // Dispatch 1: To Customer
    const custRes = await sendViaBrevo({
      apiKey: brevoApiKey,
      sender: { name: brevoSenderName, email: brevoSenderEmail },
      to: [{ name: order.customer.fullName, email: customerEmail }],
      subject: `✨ Order Confirmation: ${order.reference} — ${settings.brand.name}`,
      htmlContent: customerHtml,
    });

    // Dispatch 2: To Business Owner (even if ordered via WhatsApp!)
    const bizRes = await sendViaBrevo({
      apiKey: brevoApiKey,
      sender: { name: `${settings.brand.name} Orders`, email: brevoSenderEmail },
      to: [{ name: 'Store Owner', email: businessEmail }],
      subject: `🚨 [${order.channel.toUpperCase()} ORDER] ${order.reference} - ${order.customer.fullName} (${settings.commerce.currencySymbol}${order.total})`,
      htmlContent: businessHtml,
    });

    const anySuccess = custRes.success || bizRes.success;
    const errors: string[] = [];
    if (!custRes.success) errors.push(`Customer email: ${custRes.error}`);
    if (!bizRes.success) errors.push(`Business email: ${bizRes.error}`);

    return {
      success: anySuccess,
      provider: 'brevo',
      customerEmailSent: custRes.success,
      businessEmailSent: bizRes.success,
      error: errors.length > 0 ? errors.join(' | ') : undefined,
    };
  }

  // No Brevo API key configured
  console.log(`[Email Service] Brevo API key not configured yet. Order ${order.reference} logged.`);
  return {
    success: false,
    provider: 'none',
    customerEmailSent: false,
    businessEmailSent: false,
    error: 'Brevo API key is not configured. Add your Brevo API key in Admin Settings or Vercel Environment Variables (BREVO_API_KEY).',
  };
}

// ==========================================
// TEST EMAIL DISPATCH
// ==========================================

export async function sendTestEmail(
  targetEmail: string,
  settings: WebsiteSettings
): Promise<{ success: boolean; provider: string; message?: string; error?: string }> {
  const rawBrevoApiKey =
    settings.emailConfig?.brevoApiKey ||
    process.env.BREVO_API_KEY ||
    process.env.VITE_BREVO_API_KEY ||
    process.env.BREVO_KEY ||
    process.env.BREVO_APIKEY ||
    process.env.SENDINBLUE_API_KEY ||
    '';
  const brevoApiKey = rawBrevoApiKey.trim().replace(/^["']|["']$/g, '');

  const brevoSenderEmail = (
    settings.emailConfig?.brevoSenderEmail ||
    process.env.BREVO_SENDER_EMAIL ||
    process.env.BREVO_FROM_EMAIL ||
    settings.contact.businessOrderEmail ||
    'orders@zerocraftlabb.com'
  ).trim().replace(/^["']|["']$/g, '');

  const brevoSenderName = (
    settings.emailConfig?.brevoSenderName ||
    process.env.BREVO_SENDER_NAME ||
    process.env.BREVO_FROM_NAME ||
    settings.brand.name ||
    'Zero Craftlabb'
  ).trim().replace(/^["']|["']$/g, '');

  if (brevoApiKey) {
    const res = await sendViaBrevo({
      apiKey: brevoApiKey,
      sender: { name: brevoSenderName, email: brevoSenderEmail },
      to: [{ name: 'Test Recipient', email: targetEmail }],
      subject: `✅ Brevo API Test Successful — ${settings.brand.name}`,
      htmlContent: `
        <div style="font-family: sans-serif; padding: 20px; background: #F7F5F0; color: #17191F;">
          <div style="max-width: 500px; margin: 0 auto; background: white; padding: 24px; border-radius: 12px; border: 1px solid #E7E3D8;">
            <h2 style="color: #25D366; margin-top: 0;">🎉 Brevo Email Integration Operational!</h2>
            <p>Your Brevo API key is working perfectly for <strong>${settings.brand.name}</strong>.</p>
            <p style="font-size: 13px; color: #52525B;">
              Whenever a customer places an order via WhatsApp or Email, automated confirmation emails will now be delivered to both the customer and your business email (${settings.contact.businessOrderEmail}).
            </p>
          </div>
        </div>
      `,
    });

    return {
      success: res.success,
      provider: 'Brevo',
      message: res.success ? `Test email dispatched to ${targetEmail} via Brevo!` : undefined,
      error: res.error,
    };
  }

  return {
    success: false,
    provider: 'none',
    error: 'No Brevo API key configured yet. Please enter your Brevo API key (starts with xkeysib-) and click Save Settings.',
  };
}
