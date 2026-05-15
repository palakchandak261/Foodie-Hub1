# 🍕 Foodie Hub — Full-Stack Food Ordering System

A complete food ordering web application built with **Node.js**, **Express**, **MySQL**, and **EJS**. Foodie Hub lets users browse restaurants, manage a cart, place orders, track deliveries on a live map, earn reward points, and redeem gift coupons — all wrapped in a polished, responsive UI.

---

## 🌐 Live Demo

> Deployed on Render — [https://foodie-hub.onrender.com](https://foodie-hub.onrender.com)

---

## ✨ Features

### 🍽️ Core
- Browse restaurants and menus with search
- Add items to cart, update quantities, remove items
- Secure checkout with delivery address
- Minimum order validation (₹100)

### 💳 Payments
- Cash on Delivery (COD)
- UPI payment option
- QR code scan & pay

### 🎟️ Coupons & Discounts
- **Scratch card gift coupons** — animated golden scratch effect, unique codes generated per user, 7-day expiry
- **SAVE5** — 5% off on any order
- **FIRST10** — 10% off for first-time users (auto-applied)
- Live coupon validation at checkout with instant discount preview
- Each coupon usable only once

### ⭐ Reward Points
- Earn points equal to your order total (₹350 order = 350 points)
- Accumulate 1000 points → unlock **₹50 OFF** on next order
- Progress bar shown on checkout and profile page
- Points reset by 1000 after redemption, cycle repeats

### 📍 Live Order Tracking
- Real-time map using **Leaflet.js + OpenStreetMap** (no API key needed)
- Blue pulsing dot = your GPS location
- 🛵 Rider emoji animating toward you over 30 seconds
- Orange dashed route line shrinking as rider approaches
- Falls back to geocoding delivery address if GPS is denied
- Visual order status stepper (Confirmed → Preparing → On the Way → Delivered)

### 📦 Order Management
- Order history with stats (total orders, total spent, total saved)
- Filter orders by status (Placed / Preparing / On the Way / Delivered / Cancelled)
- Color-coded order cards with coupon chips and points earned

### 👤 User Accounts
- Signup / Login with bcrypt password hashing
- Session-based authentication
- Profile page with reward progress bar
- Role-based access (customer / admin)

### 🛠️ Admin Panel
- View all orders
- Update order status (triggers real-time tracking update)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express 5 |
| Templating | EJS + express-ejs-layouts |
| Database | MySQL 2 (connection pool) |
| Auth | express-session, bcryptjs |
| Map | Leaflet.js + OpenStreetMap |
| Styling | Bootstrap 5.3, custom CSS |
| Fonts | Poppins, Playfair Display |
| Icons | Bootstrap Icons, Font Awesome |

---

## 📁 Project Structure

```
Foodie-Hub/
├── public/
│   ├── css/style.css
│   └── images/
├── views/
│   ├── partials/        # header, footer, navbar
│   ├── layout.ejs
│   ├── home.ejs
│   ├── restaurants.ejs
│   ├── menu.ejs
│   ├── cart.ejs
│   ├── checkout.ejs
│   ├── track-order.ejs
│   ├── myOrders.ejs
│   ├── gift-coupons.ejs
│   ├── profile.ejs
│   ├── success.ejs
│   └── admin.ejs
├── server.js            # all routes & logic
├── schema.sql           # database schema + seed data
├── .env                 # environment variables (not committed)
├── package.json
└── README.md
```

---

## 🚀 Getting Started (Local)

### Prerequisites
- Node.js v18+
- MySQL 8+

### 1. Clone the repo
```bash
git clone https://github.com/palakchandak261/Foodie-Hub1.git
cd Foodie-Hub1
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up the database
```bash
# Create the database
mysql -u root -p -e "CREATE DATABASE food_ordering_system;"

# Import schema and seed data
mysql -u root -p food_ordering_system < schema.sql
```

### 4. Configure environment variables
Create a `.env` file in the root:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=food_ordering_system
SESSION_SECRET=your_secret_key
PORT=3000
MAPBOX_API_KEY=        # optional, not required (uses OpenStreetMap)
```

### 5. Start the server
```bash
npm start
```

Visit **http://localhost:3000**

---

## ☁️ Deployment (Render + Railway)

### Database — Railway (free MySQL)
1. Go to [railway.app](https://railway.app) → New Project → MySQL
2. Copy the connection credentials from the Connect tab
3. Run your `schema.sql` in the Railway query console

### Server — Render (free Node.js hosting)
1. Go to [render.com](https://render.com) → New Web Service
2. Connect your GitHub repo
3. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Add environment variables (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, SESSION_SECRET, PORT)
5. Deploy — your app will be live at `https://your-app.onrender.com`

---

## 🔑 Default Accounts (from seed data)

| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | admin1234 |
| Customer | rahul@example.com | rahulop |

---

## 📸 Screenshots

> Add screenshots here after deployment

---

## 👩‍💻 Author

**Palak Chandak**
- GitHub: [@palakchandak261](https://github.com/palakchandak261)

---

## 📄 License

ISC License — see [LICENSE](LICENSE) for details.
