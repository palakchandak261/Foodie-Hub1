require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const flash = require("connect-flash");
const expressLayouts = require("express-ejs-layouts");

const app = express();

// =============================
// Middleware Setup
// =============================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(flash());

app.use(
  session({
    key: "foodiehub.sid",
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Render uses HTTP internally
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);


// expose session & flash to views
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.title = "Food Ordering System";
  res.locals.message = req.flash("error");
  next();
});

app.use(expressLayouts);
app.set("layout", "layout");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/bootstrap", express.static(path.join(__dirname, "node_modules/bootstrap/dist")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// =============================
// Database Connection
// =============================
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false } // VERY IMPORTANT for Render
});

console.log("✅ MySQL pool created");

const MySQLStore = require("express-mysql-session")(session);

const sessionStore = new MySQLStore(
  {
    expiration: 1000 * 60 * 60 * 24, // 1 day
    createDatabaseTable: true,
  },
  db
);


// =============================
// Auth Helpers
// =============================
function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.session.user || req.session.user.role !== role) {
      return res.status(403).render("error", { message: "Access denied." });
    }
    next();
  };
}
function computeCouponDiscount(total, couponCode, isFirstOrder) {
  let discount = 0;
  let couponApplied = null;

  const code = (couponCode || "").toString().trim().toUpperCase();

  if (code === "SAVE5") {
    // 5% off
    discount = total * 0.05;
    couponApplied = "SAVE5";
  } else if (code === "FIRST10" && isFirstOrder) {
    discount = total * 0.10;
    couponApplied = "FIRST10";
  }

  // if no coupon given and first order, auto-apply FIRST10
  if (!couponApplied && isFirstOrder) {
    discount = total * 0.10;
    couponApplied = "FIRST10 (Auto Applied)";
  }

  // bounds & rounding
  discount = Math.min(discount, total);
  discount = Number(discount.toFixed(2));

  return { discount, couponApplied };
}

// =============================
// ROUTES
// =============================
// =============================
// GIFT COUPONS PAGE
// =============================
app.get("/gift-coupons", requireLogin, async (req, res) => {
  const userId = req.session.user.user_id;

  const [coupons] = await db.query(
    "SELECT * FROM gift_coupons WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );

  res.render("gift-coupons", { coupons });
});

app.post("/gift-coupons/scratch", requireLogin, async (req, res) => {
  const userId = req.session.user.user_id;

  const rewards = [
    { code: "GIFT50", discount: 50 },
    { code: "GIFT100", discount: 100 },
    { code: "SAVE5", discount: 0 }
  ];

  const reward = rewards[Math.floor(Math.random() * rewards.length)];

  await db.query(
    `INSERT INTO gift_coupons (user_id, code, discount, is_scratched)
     VALUES (?, ?, ?, 1)`,
    [userId, reward.code, reward.discount]
  );

  res.json(reward);
});

app.get("/", (req, res) => res.redirect("/restaurants"));
app.get("/home", (req, res) => res.render("home"));
// 🔍 Global food search (Home Page)
app.get("/api/search-items", async (req, res) => {
  try {
    const q = `%${req.query.q || ""}%`;

    const [items] = await db.query(
      `SELECT 
         m.item_id,
         m.name,
         m.price,
         m.image_url,
         r.name AS restaurant_name,
         r.restaurant_id
       FROM menu_items m
       JOIN restaurants r ON m.restaurant_id = r.restaurant_id
       WHERE m.name LIKE ?
       LIMIT 20`,
      [q]
    );

    res.json(items);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json([]);
  }
});

// =============================
// RESTAURANTS LIST PAGE
// =============================
app.get("/restaurants", requireLogin, async (req, res) => {
  try {
    const [restaurants] = await db.query("SELECT * FROM restaurants");
    res.render("restaurants", { restaurants });
  } catch (err) {
    console.error("Restaurants load error:", err);
    res.status(500).render("error", { message: "Failed to load restaurants" });
  }
});

// Restaurant menu (with reviews)
app.get("/restaurants/:id/menu", requireLogin, async (req, res) => {
  try {
    const restaurantId = req.params.id;
    const [restaurantRows] = await db.query("SELECT * FROM restaurants WHERE restaurant_id = ?", [restaurantId]);
    if (!restaurantRows.length) return res.status(404).render("error", { message: "Restaurant not found" });

    const [menu] = await db.query("SELECT * FROM menu_items WHERE restaurant_id = ?", [restaurantId]);
    const [reviews] = await db.query(
      "SELECT r.*, u.name AS user_name FROM reviews r JOIN users u ON r.user_id = u.user_id WHERE r.restaurant_id = ? ORDER BY r.created_at DESC",
      [restaurantId]
    );

    const avgRating = reviews.length ? (reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length).toFixed(1) : "No ratings yet";

    res.render("menu", { restaurant: restaurantRows[0], menu, reviews, avgRating });
  } catch (err) {
    console.error("Menu Load Error:", err);
    res.status(500).render("error", { message: "Failed to load menu" });
  }
});

// Submit review
app.post("/restaurants/:id/review", requireLogin, async (req, res) => {
  const restaurantId = req.params.id;
  const userId = req.session.user.user_id;
  const { rating, comment } = req.body;
  try {
    await db.query("INSERT INTO reviews (restaurant_id, user_id, rating, comment) VALUES (?, ?, ?, ?)", [restaurantId, userId, rating, comment]);
    res.redirect(`/restaurants/${restaurantId}/menu`);
  } catch (err) {
    console.error("Review Error:", err);
    res.status(500).render("error", { message: "Failed to submit review" });
  }
});

// =============================
// AUTH (signup / login / logout)
// =============================
app.get("/signup", (req, res) => res.render("signup"));
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    await db.query("INSERT INTO users (name, email, password, role, rewards, phone, address) VALUES (?, ?, ?, 'customer', 0, ?, ?)", [
      name,
      email,
      hashed,
      phone || null,
      address || null,
    ]);
    res.redirect("/login");
  } catch (err) {
    console.error("Signup Error:", err);
    req.flash("error", "Signup failed. Try again.");
    res.redirect("/signup");
  }
});

app.get("/login", (req, res) => res.render("login"));
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (!rows.length) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/login");
    }
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/login");
    }
    req.session.user = user;
    res.redirect("/restaurants");
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).render("error", { message: "Login failed" });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

// =============================
// CART
// =============================
app.post("/cart/add/:id", requireLogin, async (req, res) => {
  try {
    const itemId = Number(req.params.id);
    const quantity = Number(req.body.quantity) || 1;
    const restaurantId = Number(req.body.restaurantId) || null;

    if (!req.session.cart) req.session.cart = [];
    const existing = req.session.cart.find((c) => c.itemId === itemId);
    if (existing) existing.quantity += quantity;
    else req.session.cart.push({ itemId, quantity, restaurantId });

    res.redirect("/cart");
  } catch (err) {
    console.error("Cart add error:", err);
    res.status(500).render("error", { message: "Failed to add to cart" });
  }
});

app.get("/cart", requireLogin, async (req, res) => {
  try {
    const cart = req.session.cart || [];
    if (!cart.length) return res.render("cart", { cartItems: [], totalAmount: 0 });

    const ids = cart.map((c) => c.itemId);
    const [items] = await db.query(`SELECT * FROM menu_items WHERE item_id IN (${ids.map(() => "?").join(",")})`, ids);

    const cartItems = cart.map((ci) => {
      const item = items.find((it) => it.item_id === ci.itemId) || {};
      return { ...ci, name: item.name || "Unknown", price: Number(item.price || 0) };
    });

    const totalAmount = cartItems.reduce((s, it) => s + it.price * it.quantity, 0);
    res.render("cart", { cartItems, totalAmount });
  } catch (err) {
    console.error("Cart Error:", err);
    res.status(500).render("error", { message: "Failed to load cart" });
  }
});

app.get("/cart/remove/:id", requireLogin, (req, res) => {
  const id = Number(req.params.id);
  req.session.cart = (req.session.cart || []).filter((c) => c.itemId !== id);
  res.redirect("/cart");
});

// =============================
// CHECKOUT (GET page)
// =============================
app.get("/checkout", requireLogin, async (req, res) => {
  try {
    const cart = req.session.cart || [];
    if (!cart.length) {
      return res.render("error", { message: "Your cart is empty!" });
    }

    const ids = cart.map(c => c.itemId);
    const [menuRows] = await db.query(
      `SELECT item_id, name, price FROM menu_items 
       WHERE item_id IN (${ids.map(() => "?").join(",")})`,
      ids
    );

    const cartItems = cart.map(ci => {
      const m = menuRows.find(r => r.item_id === ci.itemId) || {};
      return {
        itemId: ci.itemId,
        name: m.name || "Unknown",
        price: Number(m.price || 0),
        quantity: ci.quantity
      };
    });

    let totalAmount = cartItems.reduce(
      (s, it) => s + it.price * it.quantity, 0
    );

    // rewards + bonus
    const [[user]] = await db.query(
      "SELECT rewards, bonus_eligible, bonus_used FROM users WHERE user_id = ?",
      [req.session.user.user_id]
    );

    const rewardPoints = Number(user.rewards || 0);
    const bonusAvailable = user.bonus_eligible === 1 && user.bonus_used === 0;

    // first order check
    const [[o]] = await db.query(
      "SELECT COUNT(*) AS count FROM orders WHERE user_id = ?",
      [req.session.user.user_id]
    );

    const isFirstOrder = o.count === 0;

    let discount = 0;
    let discountMsg = "";

    if (isFirstOrder) {
      discount = Number((totalAmount * 0.1).toFixed(2));
      totalAmount -= discount;
      discountMsg = "🎉 10% OFF on your first order!";
    }

    res.render("checkout", {
      title: "Checkout",
      cartItems,
      totalAmount: totalAmount.toFixed(2),
      rewardPoints,
      bonusAvailable,
      showQR: req.query.qr === "1",
      discount: discount.toFixed(2),
      discountMsg,
      isFirstOrder
    });

  } catch (err) {
    console.error("Checkout GET Error:", err);
    res.status(500).render("error", { message: "Failed to load checkout page." });
  }
});


// =============================
// CHECKOUT (POST)
// =============================
app.post("/checkout", requireLogin, async (req, res) => {
  try {
    const paymentMethod = String(req.body.paymentMethod || "COD");

    if (paymentMethod === "QR") {
      return res.redirect("/checkout?qr=1");
    }

    const userId = req.session.user.user_id;
    const couponCode = String(req.body.couponCode || "").trim().toUpperCase();
    const cart = req.session.cart || [];

    if (!cart.length) {
      return res.render("error", { message: "Cart empty!" });
    }

    // -----------------------------
    // Calculate total
    // -----------------------------
    let originalTotal = 0;
    const items = [];

    for (const ci of cart) {
      const [[row]] = await db.query(
        "SELECT name, price FROM menu_items WHERE item_id = ?",
        [ci.itemId]
      );

      const price = Number(row.price || 0);
      originalTotal += price * ci.quantity;

      items.push({
        name: row.name,
        quantity: ci.quantity,
        price
      });

      ci.price = price;
    }

    originalTotal = Number(originalTotal.toFixed(2));
    if (originalTotal < 100) {
  return res.render("error", {
    message: "Minimum order amount should be ₹100 to place an order."
  });
}

    const [[gift]] = await db.query(
  "SELECT * FROM gift_coupons WHERE user_id = ? AND is_used = 0 LIMIT 1",
  [userId]
);

let giftDiscount = 0;

 if (gift) {
  giftDiscount = gift.discount;
  await db.query(
    "UPDATE gift_coupons SET is_used = 1 WHERE id = ?",
    [gift.id]
  );
}

    // -----------------------------
    // First order check
    // -----------------------------
    const [[prev]] = await db.query(
      "SELECT COUNT(*) AS cnt FROM orders WHERE user_id = ?",
      [userId]
    );
    const isFirstOrder = prev.cnt === 0;

    const { discount, couponApplied } =
      computeCouponDiscount(originalTotal, couponCode, isFirstOrder);

    // -----------------------------
    // Bonus logic (₹100 for 1000 points)
    // -----------------------------
    let bonusDiscount = 0;

    const [[user]] = await db.query(
      "SELECT rewards, bonus_eligible, bonus_used FROM users WHERE user_id = ?",
      [userId]
    );

    if (user.bonus_eligible && !user.bonus_used) {
      bonusDiscount = 100;
    }

    // -----------------------------
    // Final amount
    // -----------------------------
    let finalAmount = originalTotal - discount - bonusDiscount - giftDiscount;
    if (finalAmount < 0) finalAmount = 0;
    finalAmount = Number(finalAmount.toFixed(2));

    const earnedPoints = Math.floor(finalAmount);

    // -----------------------------
    // Update rewards
    // -----------------------------
    if (bonusDiscount === 100) {
      await db.query(
        `UPDATE users 
         SET rewards = rewards - 1000 + ?, bonus_used = 1 
         WHERE user_id = ?`,
        [earnedPoints, userId]
      );
    } else {
      await db.query(
        `UPDATE users 
         SET rewards = rewards + ? 
         WHERE user_id = ?`,
        [earnedPoints, userId]
      );
    }

    // Unlock future bonus
    const [[after]] = await db.query(
      "SELECT rewards, bonus_eligible FROM users WHERE user_id = ?",
      [userId]
    );

    if (after.rewards >= 1000 && !after.bonus_eligible) {
      await db.query(
        "UPDATE users SET bonus_eligible = 1 WHERE user_id = ?",
        [userId]
      );
    }

    // -----------------------------
    // Create order
    // -----------------------------
    const [orderRes] = await db.query(
      `INSERT INTO orders 
       (user_id, restaurant_id, total_amount, payment_method, coupon_code, discount)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        cart[0].restaurantId || null,
        finalAmount,
        paymentMethod,
        couponApplied || null,
        discount + bonusDiscount
      ]
    );

    const orderId = orderRes.insertId;

    for (const ci of cart) {
      await db.query(
        `INSERT INTO order_items 
         (order_id, item_id, quantity, price_each)
         VALUES (?, ?, ?, ?)`,
        [orderId, ci.itemId, ci.quantity, ci.price]
      );
    }

    await db.query(
      "INSERT INTO order_tracking (order_id, status) VALUES (?, 'Placed')",
      [orderId]
    );

    // Clear cart
    req.session.cart = [];

    // -----------------------------
    // SUCCESS PAGE (SAFE VARIABLES)
    // -----------------------------
    return res.render("success", {
      orderId,
      items,
      originalTotal: originalTotal.toFixed(2),
      couponApplied: couponApplied || null,
      discountAmount: (discount + bonusDiscount).toFixed(2),
      redeemAmount: "0.00",
      rewardPointsRedeemed: 0,
      rewardPointsEarned: earnedPoints,
      totalAmount: finalAmount.toFixed(2),
      paymentMethod
    });

  } catch (err) {
    console.error("Checkout POST Error:", err);
    res.status(500).render("error", { message: "Checkout failed!" });
  }
});


// =============================
// Orders / tracking / profile / admin
// =============================
app.get("/myOrders", requireLogin, async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, r.name AS restaurant_name FROM orders o
       LEFT JOIN restaurants r ON o.restaurant_id = r.restaurant_id
       WHERE o.user_id = ? ORDER BY o.order_time DESC`,
      [req.session.user.user_id]
    );
    res.render("myOrders", { orders });
  } catch (err) {
    console.error("MyOrders error:", err);
    res.status(500).render("error", { message: "Failed to fetch orders" });
  }
});

app.get("/track-order/:orderId", requireLogin, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT o.order_id, o.total_amount, o.payment_method, t.status, t.updated_at
       FROM orders o LEFT JOIN order_tracking t ON o.order_id = t.order_id
       WHERE o.order_id = ?`,
      [req.params.orderId]
    );

    if (!rows.length) return res.render("track-order", { notFound: true });

    const [items] = await db.query(
      `SELECT mi.name, oi.quantity, oi.price_each FROM order_items oi
       JOIN menu_items mi ON oi.item_id = mi.item_id WHERE oi.order_id = ?`,
      [req.params.orderId]
    );

    res.render("track-order", { order: { ...rows[0], items }, notFound: false });
  } catch (err) {
    console.error("Track order error:", err);
    res.status(500).render("error", { message: "Failed to load tracking info" });
  }
});

app.get("/profile", requireLogin, async (req, res) => {
  try {
    const [uRows] = await db.query("SELECT * FROM users WHERE user_id = ?", [req.session.user.user_id]);
    res.render("profile", { user: uRows[0] });
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).render("error", { message: "Failed to load profile" });
  }
});

app.get("/admin", requireRole("admin"), async (req, res) => {
  try {
    const [orders] = await db.query("SELECT * FROM orders ORDER BY order_time DESC");
    res.render("admin-orders", { orders });
  } catch (err) {
    console.error("Admin orders error:", err);
    res.status(500).render("error", { message: "Failed to load admin orders" });
  }
});

app.post("/admin/update-status/:id", requireRole("admin"), async (req, res) => {
  try {
    await db.query("UPDATE order_tracking SET status = ? WHERE order_id = ?", [req.body.status, req.params.id]);
    res.redirect("/admin");
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).render("error", { message: "Failed to update status" });
  }
});

// 404
app.use((req, res) => res.status(404).render("error", { message: "Page not found" }));

// start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));


