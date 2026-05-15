# 🍕 Foodie Hub — Full-Stack Food Ordering System

> A complete food ordering web application built with **Node.js**, **Express**, **MySQL**, and **EJS**. Browse restaurants, manage your cart, place orders, track deliveries on a live map, earn reward points, and redeem scratch-card gift coupons — all in a polished, responsive UI.

<div align="center">

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-foodiehub--ib7u.onrender.com-ff5e0e?style=for-the-badge)](https://foodiehub-ib7u.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-palakchandak261-181717?style=for-the-badge&logo=github)](https://github.com/palakchandak261/Foodie-Hub1)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql)](https://mysql.com)

</div>

---

## 📸 Screenshots

### 🏠 Home Page
![Home Page](https://raw.githubusercontent.com/palakchandak261/Foodie-Hub1/main/public/images/screenshots/home.png)

> Clean landing page with food category showcase and global search

### 🍽️ Menu Page
![Menu Page](https://raw.githubusercontent.com/palakchandak261/Foodie-Hub1/main/public/images/screenshots/menu.png)

> Browse restaurant menu with uniform image cards, live search, and add-to-cart

### 🎁 Scratch & Win Coupons
![Gift Coupons](https://raw.githubusercontent.com/palakchandak261/Foodie-Hub1/main/public/images/screenshots/coupons.png)

> Animated golden scratch cards revealing unique discount codes with 7-day expiry

### 💳 Checkout
![Checkout](https://raw.githubusercontent.com/palakchandak261/Foodie-Hub1/main/public/images/screenshots/checkout.png)

> Smart checkout with live coupon validation, reward points progress bar, and multiple payment options

---

## ✨ Features

### 🍽️ Core Ordering
- Browse restaurants with ratings and search
- Explore menus with category filter and live search
- Add to cart, update quantities, remove items
- Minimum order validation (₹100)

### 💳 Payments
- Cash on Delivery (COD)
- UPI (PhonePe / GPay / Paytm)
- QR Code scan & pay

### 🎟️ Coupons & Discounts
| Code | Discount | Condition |
|---|---|---|
| `SAVE5` | 5% off | Any order |
| `FIRST10` | 10% off | First order only |
| `GIFTxxxxx` | Flat/% off | Scratch card (7-day expiry, single use) |

- **Animated scratch cards** — golden texture, drag to scratch, auto-reveals at 45% scratched
- Live coupon validation at checkout with instant discount preview
- Each coupon usable **once only**

### ⭐ Reward Points
- Earn points = order total (₹350 order → 350 points)
- Accumulate **1000 points** → unlock **₹50 OFF** on next order
- Progress bar on checkout and profile page
- Points reset by 1000 after redemption, cycle repeats

### 📍 Live Order Tracking
- Real-time map using **Leaflet.js + OpenStreetMap** (no API key needed)
- 🔵 Pulsing blue dot = your GPS location
- 🛵 Rider animating toward you over 30 seconds
- Orange dashed route line shrinking as rider approaches
- Visual stepper: Confirmed → Preparing → On the Way → Delivered

### 📦 Order History
- Stats: total orders, total spent, total saved
- Filter by status (Placed / Preparing / On the Way / Delivered / Cancelled)
- Color-coded cards with coupon chips and points earned per order

### 👤 User Accounts
- Signup / Login with bcrypt password hashing
- Session-based authentication
- Profile page with reward progress bar
- Role-based access (customer / admin)

### 🛠️ Admin Panel
- View all orders
- Update order status

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express 5 |
| Templating | EJS + express-ejs-layouts |
| Database | MySQL 8 (Aiven cloud) |
| Auth | express-session, bcryptjs |
| Map | Leaflet.js + OpenStreetMap |
| Styling | Bootstrap 5.3, custom CSS |
| Fonts | Poppins, Playfair Display |
| Icons | Bootstrap Icons, Font Awesome |
| Hosting | Render (server) + Aiven (MySQL) |

---

## 📁 Project Structure

```
Foodie-Hub/
├── public/
│   ├── css/style.css
│   └── images/          # 120+ food & restaurant images
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
├── server.js            # all routes & business logic
├── schema.sql           # database schema
├── aiven_schema.sql     # production-ready schema for Aiven
├── render.yaml          # Render deployment config
├── .env                 # environment variables (not committed)
└── package.json
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
mysql -u root -p -e "CREATE DATABASE food_ordering_system;"
mysql -u root -p food_ordering_system < schema.sql
```

### 4. Configure environment variables
Create a `.env` file in the root:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=food_ordering_system
DB_PORT=3306
SESSION_SECRET=your_secret_key
PORT=3000
```

### 5. Start the server
```bash
npm start
```

Visit **http://localhost:3000**

---

## ☁️ Deployment

This project is deployed using:

| Service | Purpose | Link |
|---|---|---|
| **Render** | Node.js hosting (free tier) | [render.com](https://render.com) |
| **Aiven** | MySQL database (free tier) | [aiven.io](https://aiven.io) |

### Deploy your own

1. Fork this repo
2. Create a free MySQL on [Aiven](https://aiven.io) → import `aiven_schema.sql`
3. Create a Web Service on [Render](https://render.com) → connect your fork
4. Add environment variables in Render dashboard:

```
DB_HOST      = your-aiven-host.aivencloud.com
DB_USER      = avnadmin
DB_PASSWORD  = your_aiven_password
DB_NAME      = defaultdb
DB_PORT      = your_aiven_port
SESSION_SECRET = any_random_string
PORT         = 10000
```

---

## 🔑 Default Login

| Role | Email | Password |
|---|---|---|
| Admin | admin@foodiehub.com | (set during signup) |

> Register a new account at `/signup` to get started as a customer.

---

## 👩‍💻 Author

**Palak Chandak**

[![GitHub](https://img.shields.io/badge/GitHub-palakchandak261-181717?style=flat&logo=github)](https://github.com/palakchandak261)

---

## 📄 License

ISC License — see [LICENSE](LICENSE) for details.
