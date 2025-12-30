-- Create DB
CREATE DATABASE IF NOT EXISTS food_ordering_system;
USE food_ordering_system;

-- USERS
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('customer','admin','delivery_agent') DEFAULT 'customer',
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RESTAURANTS
DROP TABLE IF EXISTS restaurants;
CREATE TABLE restaurants (
  restaurant_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  address VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  rating DECIMAL(2,1) DEFAULT 0.0
);

-- MENU ITEMS
DROP TABLE IF EXISTS menu_items;
CREATE TABLE menu_items (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  description VARCHAR(255),
  category ENUM('veg','non-veg','beverage','dessert') NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);

-- ORDERS
DROP TABLE IF EXISTS orders;

CREATE TABLE orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  restaurant_id INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,   -- ✅ correct column
  payment_method ENUM('COD','UPI') DEFAULT 'COD',
  status ENUM('ordered','accepted','out_for_delivery','delivered','cancelled') DEFAULT 'ordered',
  order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id)
);


-- ORDER ITEMS
DROP TABLE IF EXISTS order_items;
CREATE TABLE order_items (
  order_item_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  item_id INT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  price_each DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES menu_items(item_id)
);

-- DELIVERY AGENTS
DROP TABLE IF EXISTS delivery_agents;
CREATE TABLE delivery_agents (
  agent_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE,
  is_available BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- DELIVERY ASSIGNMENTS
DROP TABLE IF EXISTS delivery_assignments;
CREATE TABLE delivery_assignments (
  assignment_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNIQUE,
  agent_id INT,
  assigned_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delivery_time TIMESTAMP NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (agent_id) REFERENCES delivery_agents(agent_id)
);

-- Insert sample users
INSERT INTO users (name, email, password, phone, role, address) VALUES
('Admin', 'admin@example.com', 'admin1234', '9000000000', 'admin', 'Delhi'),
('Rahul Sharma', 'rahul@example.com', 'rahulop', '9876543210', 'customer', 'Mumbai'),
('Ramesh Kumar', 'ramesh@example.com', 'ramesh456', '9112233445', 'delivery_agent', 'Nagpur');

-- Restaurants
INSERT INTO restaurants (name, address, phone, rating) VALUES
('Spice Hub', 'Andheri, Mumbai', '9988776655', 4.5),
('Pizza Palace', 'Baner, Pune', '8877665544', 4.2),
('Burger Bay', 'Kothrud, Pune', '7766554433', 4.3);

-- Menu Items
INSERT INTO menu_items (restaurant_id, name, description, category, price) VALUES
(1, 'Paneer Butter Masala', 'Creamy paneer curry', 'veg', 250.00),
(1, 'Chicken Biryani', 'Aromatic rice & chicken', 'non-veg', 300.00),
(1, 'Gulab Jamun', 'Sweet dessert', 'dessert', 80.00),

(2, 'Margherita Pizza', 'Classic cheese & tomato', 'veg', 200.00),
(2, 'Pepperoni Pizza', 'Pepperoni & cheese', 'non-veg', 350.00),
(2, 'Cold Coffee', 'Chilled coffee drink', 'beverage', 120.00),

(3, 'Veggie Burger', 'Loaded veg patty', 'veg', 150.00),
(3, 'Chicken Burger', 'Crispy chicken patty', 'non-veg', 180.00),
(3, 'Chocolate Shake', 'Thick & creamy', 'beverage', 140.00);

ALTER TABLE users 
ADD COLUMN role ENUM('customer', 'admin', 'restaurant_owner') DEFAULT 'customer',
ADD COLUMN rewards INT DEFAULT 0;





