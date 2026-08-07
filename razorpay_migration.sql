-- Migration: Add Razorpay payment fields to orders table
-- Run this after initial schema setup

USE food_ordering_system;

-- Add Razorpay payment tracking columns
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(100) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(100) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending';

-- Add index for faster payment lookups
ALTER TABLE orders 
ADD INDEX idx_razorpay_payment (razorpay_payment_id),
ADD INDEX idx_razorpay_order (razorpay_order_id);

-- Update existing payment_method ENUM to include RAZORPAY
ALTER TABLE orders 
MODIFY COLUMN payment_method ENUM('COD','UPI','QR','RAZORPAY') DEFAULT 'COD';

-- Create gift_coupons table if not exists (for coupon integration)
CREATE TABLE IF NOT EXISTS gift_coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  discount_type ENUM('FLAT', 'PERCENT') NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  is_scratched BOOLEAN DEFAULT 0,
  is_used BOOLEAN DEFAULT 0,
  expires_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create order_tracking table if not exists
CREATE TABLE IF NOT EXISTS order_tracking (
  tracking_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL UNIQUE,
  status ENUM('Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled') DEFAULT 'Placed',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- Create reviews table if not exists
CREATE TABLE IF NOT EXISTS reviews (
  review_id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Add rewards columns to users table if not exists
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS rewards INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS bonus_eligible BOOLEAN DEFAULT 0,
ADD COLUMN IF NOT EXISTS bonus_used BOOLEAN DEFAULT 0;

-- Add coupon_code and discount to orders if not exists
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS discount DECIMAL(10,2) DEFAULT 0;

-- Add image_url to menu_items if not exists
ALTER TABLE menu_items
ADD COLUMN IF NOT EXISTS image_url VARCHAR(255) DEFAULT NULL;

SELECT 'Razorpay migration completed successfully!' AS Status;
