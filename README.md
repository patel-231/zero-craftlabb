# Zero Craftlabb — Premium E-Commerce Website

Official e-commerce platform for **Zero Craftlabb**, featuring precision automotive wall art, racing silhouettes, machined automotive accessories, architectural wooden décor, and festive handmade crafts.

Built with React 19, TypeScript, Express, Vite, and Tailwind CSS. Features direct **WhatsApp Click-to-Chat ordering** and **Transactional Email ordering** without mandatory third-party payment gateways.

---

## 🚀 Key Features

- **Public Storefront**: Clean, modern, vibrant 2D visual hierarchy with Zero Craftlabb brand palette.
- **Zero 3D Policy**: Fast, responsive 2D product photography, smooth CSS transitions, and interactive 2D zoom viewer.
- **WhatsApp Ordering**: Customer fills delivery details, order is saved in the database, and pre-formatted order message opens directly in WhatsApp with the business phone number.
- **Email Ordering**: Direct transactional notification sent to the business email and customer confirmation.
- **Private Admin Console (`/admin`)**:
  - Completely hidden from public storefront (no public links or headers).
  - Product catalog manager: create, edit, duplicate, set variants (size, finish), prices, stock, and upload photos.
  - Dynamic Category manager: create any new category (e.g. Desk Accessories, Collectibles) without touching code.
  - Order Processing: live order statuses (`new`, `awaiting_confirmation`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`), internal admin notes, direct WhatsApp link to customer, and email resend.
  - Complete Content & Brand Control: logo replacement, business WhatsApp number, announcement bar text & toggle, shipping charges, free shipping threshold, and policies.
  - Security & Password Management: secure password change with PBKDF2 SHA-512 hashing and audit logs.

---

## 🔐 Initial Administrator Credentials

The admin portal is accessible exclusively at:
```
https://your-domain.com/admin
```
*(or `http://localhost:3000/admin` locally)*

- **Admin Email**: `admin@zerocraftlabb.com`
- **Initial Password**: `CraftLabb@2026!Secure`

> **Security First**: Upon first login, navigate to **Security & Access** (`/admin/settings/security`) to update your password.

---

## 🛠️ Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the full-stack server (runs on port 3000):
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser.

---

## 📦 Deployment via GitHub & Vercel

### Step 1: Push to GitHub
1. Initialize git (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Zero Craftlabb e-commerce platform"
   ```
2. Create a repository on [GitHub](https://github.com/new).
3. Link and push:
   ```bash
   git remote add origin https://github.com/your-username/zero-craftlabb.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy on Vercel
1. Go to [Vercel Dashboard](https://vercel.com) and click **"Add New Project"**.
2. Select your `zero-craftlabb` GitHub repository.
3. In **Build & Output Settings**:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. In **Environment Variables**, add:
   - `ADMIN_INITIAL_PASSWORD`: Your chosen master password
   - `BREVO_API_KEY`: *(Optional)* Your Brevo API key for automated emails (or configure via Admin Settings)
   - `BREVO_SENDER_EMAIL`: *(Optional)* Your verified sender email
5. Click **Deploy**. Vercel will build and deploy the application.

---

## ✉️ Brevo Automated Dual-Email System

Every order (both WhatsApp orders and Email orders) automatically sends:
1. **To the Customer**: A branded order confirmation receipt with ordered items, variants, totals, address, and what to expect next.
2. **To the Store Owner (`ompatel787877@gmail.com`)**: Full order notification with customer contact details and a direct "WhatsApp Customer" button.

### How to configure Brevo in 3 minutes:
1. Sign up for free at [Brevo.com](https://app.brevo.com) (includes 300 free emails per day).
2. Go to **Account (top right) &rarr; SMTP &amp; API &rarr; API Keys**.
3. Click **Generate a new API key**, give it a name like `ZeroCraftlabb`, and copy the key (`xkeysib-...`).
4. In your Zero Craftlabb Admin Console, go to **Website Settings** (`/admin/settings`).
5. Scroll to **Automated Order Emails &amp; Brevo API Setup**, paste your key, and click **Save All Settings**.
6. Use the built-in **Send Test Email** tool to test it immediately!

---

## 📱 WhatsApp Business Number Configuration

To direct incoming orders to your actual WhatsApp Business number:
1. Sign in to `/admin`.
2. Go to **Website Settings** (`/admin/settings`).
3. Under **WhatsApp & Communication Channels**, enter your phone number with country code without `+` or spaces (e.g. `919876543210` for India).
4. Click **Save All Settings**.
5. All future click-to-chat links will immediately route to your phone number.

---

## 🗄️ Database & Managed Storage

- **Local / Default Store**: Stored persistently in `/data/store.json` with atomic writes.
- **Relational PostgreSQL / Supabase Schema**: An exportable migration script is provided in `database.sql` for connecting to Supabase, Neon, or Cloud SQL.
