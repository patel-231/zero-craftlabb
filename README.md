# 🏎️ Zero Craftlabb — Premium Automotive & Art E-Commerce

Official, production-grade e-commerce platform for **Zero Craftlabb**, featuring precision laser-cut automotive wall art, Formula 1 racing circuits, CNC-machined automotive accessories, architectural wooden décor, and festive handmade crafts.

Built with **React 19, TypeScript, Vite, Express, and Tailwind CSS**. Features integrated **WhatsApp 1-Click Ordering**, **Automated Brevo Dual Transactional Emails**, dynamic category management, real-time inventory tracking, and a secure private admin portal.

---

## ⚡ Quick Deployment Guide: GitHub &rarr; Vercel

### Step 1: Push This Code to Your GitHub Repository
Run these commands in your project terminal:
```bash
# 1. Initialize git (if not already done)
git init

# 2. Add all files to staging
git add .

# 3. Commit your changes
git commit -m "Zero Craftlabb initial production release"

# 4. Link to your GitHub repository (replace with your repo URL)
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git

# 5. Push to GitHub
git push -u origin main
```

---

### Step 2: Deploy to Vercel in 1-Click
1. Open the [Vercel Dashboard](https://vercel.com/new).
2. Click **"Import Project"** and select your GitHub repository.
3. Vercel automatically detects the project framework settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add your configuration:
   | Variable | Value | Description |
   |---|---|---|
   | `BREVO_API_KEY` | `xkeysib-...` | *(Recommended)* Your Brevo API key for automated emails |
   | `BREVO_SENDER_EMAIL` | `ompatel787877@gmail.com` | Your verified sender email in Brevo |
   | `BREVO_SENDER_NAME` | `Zero Craftlabb` | Sender name shown in customer inbox |
   | `ADMIN_INITIAL_PASSWORD` | `CraftLabb@2026!Secure` | Initial admin master password |
5. Click **Deploy**! Vercel will build the frontend into static assets and automatically mount `/api` as high-performance Serverless functions.

---

## ✉️ Automated Dual-Email System with Brevo

Every order placed on the website (both **WhatsApp Orders** and **Direct Email Orders**) triggers an automated dual-dispatch:

1. **Customer Order Receipt**:
   - Sends a luxury HTML email directly to the customer's email address.
   - Includes full order reference (e.g. `ZC-20261017-XXXX`), itemized list with chosen sizes/finishes, prices in Indian Rupees (`₹`), delivery address, customer notes, and next dispatch steps.
   - Direct button to WhatsApp the workshop for quick support.

2. **Store Owner Alert (`ompatel787877@gmail.com`)**:
   - Sends an instant high-priority notification to your business inbox.
   - Includes customer's full delivery details, phone number, and a **1-click direct WhatsApp button** to start a chat with the customer immediately.

### Two Ways to Add Your Brevo API Key:
- **Option A (In Admin UI — No Redeploy Needed)**:
  1. Visit `/admin/settings` on your deployed site.
  2. Scroll down to **"Automated Order Emails & Brevo API Setup"**.
  3. Paste your Brevo API key (starts with `xkeysib-`) and verified sender email.
  4. Click **Save All Settings**.
  5. Use the **Test Email Delivery** box on that page to send a live test to your email!

- **Option B (In Vercel Environment Variables)**:
  1. Go to your project on Vercel &rarr; **Settings** &rarr; **Environment Variables**.
  2. Add `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, and `BREVO_SENDER_NAME`.
  3. Redeploy or promote a new commit.

---

## 🔐 Private Admin Portal

The administrative dashboard is completely private (no public links or headers on the customer storefront):

- **URL**: `https://your-domain.vercel.app/admin` *(or `http://localhost:3000/admin` locally)*
- **Admin Email**: `admin@zerocraftlabb.com`
- **Initial Password**: `CraftLabb@2026!Secure`

### Admin Features:
- **Catalog Management**: Add, edit, duplicate, set variants (e.g., Size: A3/A2, Finish: Matte Black/Brushed Titanium), adjust stock, and upload images.
- **Dynamic Categories**: Create new categories (e.g. *Desk Collectibles*, *Keychains*) on the fly; they appear in the navigation and have dedicated category pages automatically.
- **Order Pipeline**: Track orders with statuses (`new`, `processing`, `shipped`, `delivered`, `cancelled`), view customer address & notes, click to WhatsApp the customer, and re-send confirmation emails.
- **Live Settings**: Change brand name, logo, WhatsApp phone number, announcement bar banner, shipping fee (`₹99`), and free shipping threshold (`₹1,499`).
- **Security & Access**: Update your admin password anytime with secure PBKDF2 SHA-512 encryption.

---

## 💻 Local Development

To run the full-stack server on your local machine:

```bash
# 1. Install dependencies
npm install

# 2. Start the development server (runs full-stack on port 3000)
npm run dev

# 3. Open in browser
http://localhost:3000
```

---

## 📁 Project Architecture

```
├── api/
│   └── index.ts          # Vercel Serverless Function entry point
├── data/
│   └── store.json        # Persistent catalog, orders, and website settings
├── public/
│   ├── favicon.svg       # Brand favicon
│   └── logo.svg          # Precision vector brand logo
├── server/
│   ├── auth.ts           # Admin session management & PBKDF2 hashing
│   ├── db.ts             # Storage engine with Vercel serverless /tmp support
│   ├── email.ts          # Brevo transactional dual-email engine & HTML templates
│   └── routes.ts         # REST API for products, categories, orders, and settings
├── src/
│   ├── admin/            # Protected admin portal views (/admin/*)
│   ├── components/       # Storefront UI (Header, Footer, ProductCard, CartDrawer)
│   ├── context/          # React contexts (CartContext, SettingsContext)
│   ├── pages/            # Public storefront pages (Home, Shop, ProductDetail, Checkout, Success)
│   ├── services/         # Client-side API service
│   ├── types/            # TypeScript interfaces & domain models
│   ├── App.tsx           # React router routes
│   └── main.tsx          # React DOM entry point
├── database.sql          # Exportable PostgreSQL / Supabase relational schema
├── package.json          # Dependencies, engines, and npm scripts
├── vercel.json           # Vercel deployment and rewrite routing rules
└── vite.config.ts        # Vite configuration with Tailwind CSS plugin
```
