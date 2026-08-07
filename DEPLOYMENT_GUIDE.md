# 🚀 Foodie Hub - Complete Deployment Guide

## ✅ What's Been Done

### 1. **Real Razorpay Payment Gateway Integrated**
- ✅ Same payment system used by Swiggy, Zomato, Amazon Pay
- ✅ Supports: Cards, UPI, NetBanking, Wallets, EMI, International Cards
- ✅ Server-side order creation
- ✅ HMAC SHA256 signature verification (fraud prevention)
- ✅ Webhook support for payment status updates
- ✅ Database migration completed

### 2. **Database Setup**
- ✅ Connected to Aiven MySQL cloud database
- ✅ All tables created (users, orders, restaurants, menu_items, etc.)
- ✅ Razorpay columns added to orders table
- ✅ Indexes added for fast payment lookups

### 3. **Environment Configuration**
- ✅ `.env` file created with your database credentials
- ✅ Ready for Razorpay API keys

---

## 🔑 Get Razorpay API Keys (Required)

### Step 1: Create Razorpay Account
1. Visit [https://razorpay.com/](https://razorpay.com/)
2. Click **Sign Up** (Free)
3. Enter business details

### Step 2: Get Test Keys (For Development)
1. Login to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Make sure you're in **Test Mode** (toggle in top-left)
3. Go to **Settings** → **API Keys**
4. Click **Generate Test Key**
5. You'll see:
   - **Key ID**: `rzp_test_xxxxxxxxxx`
   - **Key Secret**: `xxxxxxxxxxxxxxxxx` (click to reveal)

### Step 3: Update .env File
Open `D:\foodie hub\Foodie-Hub1\.env` and replace:

```env
RAZORPAY_KEY_ID=rzp_test_YOUR_ACTUAL_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_ACTUAL_SECRET_KEY_HERE
```

---

## 🧪 Test the Payment Gateway

### 1. Start Server
```bash
cd "D:\foodie hub\Foodie-Hub1"
npm start
```

Server runs at: **http://localhost:3000**

### 2. Login/Signup
- Create a new account or use existing credentials
- Browse restaurants and add items to cart

### 3. Checkout
- Click **Checkout**
- Select **💳 Card / UPI / Netbanking** payment option
- You'll see the Razorpay badge with all accepted methods

### 4. Test Payment

#### Test Cards (Always Use These in Test Mode):
| Card Type | Number | CVV | Expiry | Result |
|-----------|--------|-----|--------|--------|
| **Success** | `4111 1111 1111 1111` | `123` | `12/28` | ✅ Payment succeeds |
| **Failure** | `4000 0000 0000 0002` | `123` | `12/28` | ❌ Payment fails |

#### Test UPI:
- **Success**: `success@razorpay`
- **Failure**: `failure@razorpay`

#### Test NetBanking:
- Choose any bank
- Username: `success` / Password: `success`

---


## 💳 Payment Flow (How It Works)

```
User selects "Card / UPI / Netbanking"
           ↓
Click "Confirm & Place Order"
           ↓
Server creates Razorpay order (with amount in paise)
           ↓
Razorpay checkout popup opens in browser
           ↓
User enters payment details
           ↓
Razorpay processes payment
           ↓
Server verifies HMAC SHA256 signature
           ↓
Order saved to Aiven MySQL database
    (razorpay_payment_id, razorpay_order_id stored)
           ↓
Success page with order ID + 🎉 reward points
```

---

## 🌐 Going Live (Production)

### 1. Complete KYC on Razorpay Dashboard
- Business documents
- Bank account details

### 2. Get Live Keys
- Switch to **Live Mode** in dashboard
- Go to Settings → API Keys → Generate Live Key

### 3. Update .env
```env
RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY
RAZORPAY_KEY_SECRET=YOUR_LIVE_SECRET
NODE_ENV=production
```

### 4. Setup Webhook (Recommended)
1. Dashboard → Webhooks → Add New
2. URL: `https://yourdomain.com/razorpay-webhook`
3. Events: `payment.captured`, `payment.failed`
4. Add secret to `.env`:
   ```env
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
   ```

---

## 📁 Project Structure

```
Foodie-Hub1/
├── server.js              ← Main app + Razorpay routes
├── .env                   ← Your credentials (DO NOT commit)
├── .env.example           ← Template for env vars
├── run_migration.js       ← DB migration script
├── razorpay_migration.sql ← SQL migration file
├── RAZORPAY_SETUP.md      ← Razorpay setup guide
├── DEPLOYMENT_GUIDE.md    ← This file
├── package.json           ← Dependencies (incl. razorpay@2.9.8)
├── views/
│   ├── checkout.ejs       ← Checkout with Razorpay option
│   ├── success.ejs        ← Success page with payment method badge
│   └── ...
└── public/
    └── css/style.css
```

---

## 🔒 Security Checklist
- ✅ API keys stored in `.env` (not in code)
- ✅ `.env` is in `.gitignore` (never committed to GitHub)
- ✅ Payment signature verified server-side before placing order
- ✅ HTTPS enforced in production
- ✅ Database uses SSL connection (Aiven requires it)

---

**Your app is live at: http://localhost:3000** 🍕
