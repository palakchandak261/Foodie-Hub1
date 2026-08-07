# 🚀 Razorpay Payment Gateway Integration Guide

## Overview
This project now includes a **production-ready Razorpay payment gateway** integration - the same payment system used by **Swiggy, Zomato, and other major Indian food delivery apps**.

## ✅ Supported Payment Methods

### Through Razorpay:
- 💳 **Credit/Debit Cards** - Visa, Mastercard, Amex, RuPay, Diners Club
- 📱 **UPI** - Google Pay, PhonePe, Paytm, BHIM UPI
- 🏦 **Net Banking** - All major banks (HDFC, ICICI, SBI, Axis, etc.)
- 💰 **Wallets** - Paytm, PhonePe, Mobikwik, Freecharge, Ola Money
- 💵 **EMI Options** - No-cost EMI on select cards
- 🌍 **International Cards** - Accept payments globally
- 💳 **Cardless EMI** - ZestMoney, ePayLater, FlexiPay

### Other Methods:
- 🚚 **Cash on Delivery (COD)**
- 📷 **QR Code Payments**

## 🔧 Setup Instructions

### Step 1: Install Dependencies
```bash
cd "D:\foodie hub\Foodie-Hub1"
npm install
```

### Step 2: Create Razorpay Account

1. Go to [https://razorpay.com/](https://razorpay.com/)
2. Click **Sign Up** and create a free account
3. Complete KYC verification (required for live mode)

### Step 3: Get API Keys

#### For Testing (Recommended First):
1. Login to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Switch to **Test Mode** (toggle in top-left corner)
3. Go to **Settings** → **API Keys**
4. Click **Generate Test Key**
5. Copy **Key ID** and **Key Secret**

#### For Production (After Testing):
1. Switch to **Live Mode** in dashboard
2. Complete business verification
3. Go to **Settings** → **API Keys**
4. Generate live keys

### Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env`:

```bash
copy .env.example .env
```

2. Edit `.env` and add your Razorpay keys:
```env
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_SECRET_KEY_HERE
```

### Step 5: Run Database Migration

Connect to your MySQL database and run:
```bash
mysql -u root -p food_ordering_system < razorpay_migration.sql
```

Or paste contents of `razorpay_migration.sql` in your MySQL client.

### Step 6: Start the Server
```bash
npm start
```

## 🧪 Testing Razorpay Payments

### Test Card Numbers:
| Card Type | Number | CVV | Expiry |
|-----------|--------|-----|--------|
| Visa (Success) | 4111 1111 1111 1111 | 123 | 12/28 |
| Mastercard | 5105 1051 0510 5100 | 123 | 12/28 |
| Failure Card | 4000 0000 0000 0002 | 123 | 12/28 |

### Test UPI:
- Use UPI ID: `success@razorpay` → Payment succeeds
- Use UPI ID: `failure@razorpay` → Payment fails

### Test Net Banking:
- Choose any bank → Use test credentials
- Username: `success` | Password: `success`

## 🔐 Security Features

- **HMAC SHA256 Signature Verification** - All payments verified server-side
- **PCI DSS Compliant** - Razorpay handles card data
- **Webhook Signature Verification** - Prevents fake webhook calls
- **HTTPS Only** - Production uses SSL
- **Environment Variables** - Keys never exposed in code

## 🌐 Webhook Setup (Optional but Recommended)

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/app/webhooks)
2. Click **Add New Webhook**
3. Enter your webhook URL: `https://yourdomain.com/razorpay-webhook`
4. Select events: `payment.captured`, `payment.failed`
5. Set a webhook secret and add it to `.env`:
   ```env
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
   ```

## 💡 Payment Flow (Like Swiggy/Zomato)

```
User selects "Card/UPI/Netbanking"
    ↓
Click "Confirm & Place Order"
    ↓
Server creates Razorpay order (server-side)
    ↓
Razorpay checkout popup opens
    ↓
User enters payment details
    ↓
Payment processed by Razorpay
    ↓
Server verifies signature (HMAC SHA256)
    ↓
Order saved to database
    ↓
Success page shown with order ID
```

## 📞 Support

- Razorpay Docs: https://razorpay.com/docs/
- Razorpay Dashboard: https://dashboard.razorpay.com/
- Test Dashboard: https://dashboard.razorpay.com/ (toggle to Test mode)
