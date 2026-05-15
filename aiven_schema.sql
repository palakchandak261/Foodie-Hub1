-- ============================================================
-- Foodie Hub - Clean schema for Aiven MySQL (defaultdb)
-- Run this entire file in Aiven Query Editor
-- ============================================================

-- USERS
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('customer','admin','delivery_agent','restaurant_owner') DEFAULT 'customer',
  address TEXT,
  rewards INT DEFAULT 0,
  bonus_eligible TINYINT(1) DEFAULT 0,
  bonus_used TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RESTAURANTS
CREATE TABLE IF NOT EXISTS restaurants (
  restaurant_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  address VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  rating DECIMAL(2,1) DEFAULT 0.0
);

-- MENU ITEMS
CREATE TABLE IF NOT EXISTS menu_items (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  description VARCHAR(255),
  category ENUM('veg','non-veg','beverage','dessert') NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(255),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  restaurant_id INT,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(20) DEFAULT 'COD',
  coupon_code VARCHAR(50),
  discount DECIMAL(10,2) DEFAULT 0,
  address TEXT,
  order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id)
);

-- ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  order_item_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  item_id INT NOT NULL,
  quantity INT NOT NULL,
  price_each DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES menu_items(item_id)
);

-- ORDER TRACKING
CREATE TABLE IF NOT EXISTS order_tracking (
  tracking_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  status VARCHAR(50) DEFAULT 'Placed',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- GIFT COUPONS
CREATE TABLE IF NOT EXISTS gift_coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  code VARCHAR(30) NOT NULL,
  discount_type ENUM('FLAT','PERCENT') NOT NULL DEFAULT 'FLAT',
  discount_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_scratched TINYINT(1) DEFAULT 0,
  is_used TINYINT(1) DEFAULT 0,
  expires_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  review_id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- DELIVERY AGENTS
CREATE TABLE IF NOT EXISTS delivery_agents (
  agent_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE,
  is_available BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Admin user (password: admin1234)
INSERT IGNORE INTO users (name, email, password, phone, role, address, rewards) VALUES
('Admin', 'admin@foodiehub.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9000000000', 'admin', 'Delhi', 0);

-- Restaurants
INSERT IGNORE INTO restaurants (restaurant_id, name, address, phone, rating) VALUES
(1, 'Spice Hub',    'Andheri, Mumbai',  '9988776655', 4.5),
(2, 'Pizza Palace', 'Baner, Pune',      '8877665544', 4.2),
(3, 'Burger Bay',   'Kothrud, Pune',    '7766554433', 4.3),
(4, 'Chinese Wok',  'Koregaon, Pune',   '9900112233', 4.1),
(5, 'Sweet Treats', 'Viman Nagar, Pune','9811223344', 4.4);

-- Menu Items
INSERT IGNORE INTO menu_items (restaurant_id, name, description, category, price, image_url) VALUES
(1, 'Paneer Butter Masala', 'Creamy paneer curry',        'veg',     250.00, '/images/butter-chicken.jpeg'),
(1, 'Chicken Biryani',      'Aromatic rice & chicken',    'non-veg', 300.00, '/images/chicken-biryani.jpeg'),
(1, 'Dal Makhani',          'Slow cooked black lentils',  'veg',     220.00, '/images/biryani.jpeg'),
(1, 'Butter Naan',          'Soft tandoor bread',         'veg',      60.00, '/images/butter-naan.jpeg'),
(1, 'Gulab Jamun',          'Sweet milk dumplings',       'dessert',  80.00, '/images/basundi.jpeg'),

(2, 'Margherita Pizza',     'Classic cheese & tomato',    'veg',     200.00, '/images/cheese-burst-pizza.jpeg'),
(2, 'BBQ Chicken Pizza',    'Smoky BBQ chicken',          'non-veg', 350.00, '/images/bbq-chicken-pizza.jpeg'),
(2, 'Cheese Garlic Bread',  'Toasted with cheese',        'veg',     120.00, '/images/cheese-garlic-bread.jpeg'),
(2, 'Cold Coffee',          'Chilled coffee drink',       'beverage', 120.00, '/images/chocolate-shake.jpeg'),
(2, 'Brownie',              'Warm chocolate brownie',     'dessert',  90.00, '/images/brownie.jpeg'),

(3, 'Veggie Burger',        'Loaded veg patty',           'veg',     150.00, '/images/chicken-burger.jpeg'),
(3, 'Chicken Burger',       'Crispy chicken patty',       'non-veg', 180.00, '/images/chicken-burger.jpeg'),
(3, 'Chocolate Shake',      'Thick & creamy',             'beverage', 140.00, '/images/chocolate-shake.jpeg'),
(3, 'French Fries',         'Crispy golden fries',        'veg',      80.00, '/images/aloo-tikki-chaat.jpeg'),

(4, 'Chicken Manchurian',   'Indo-Chinese classic',       'non-veg', 220.00, '/images/chicken-manchurian.jpeg'),
(4, 'Chilli Paneer',        'Spicy paneer stir fry',      'veg',     200.00, '/images/chilli-paneer.jpeg'),
(4, 'Chicken Fried Rice',   'Wok tossed rice',            'non-veg', 180.00, '/images/chicken-biryani.jpeg'),
(4, 'Veg Noodles',          'Stir fried noodles',         'veg',     160.00, '/images/chicken-pasta.jpeg'),

(5, 'Chocolate Lava Cake',  'Warm molten center',         'dessert', 120.00, '/images/chocolate-lava-cake.jpeg'),
(5, 'Basundi',              'Rich condensed milk dessert','dessert',  90.00, '/images/basundi.jpeg'),
(5, 'Apple Pie',            'Classic baked pie',          'dessert', 110.00, '/images/apple-pie.jpeg');
