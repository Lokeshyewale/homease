-- Create Database
CREATE DATABASE IF NOT EXISTS homease;
USE homease;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    token VARCHAR(255),
    otp VARCHAR(10),
    otp_expiry DATETIME,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone VARCHAR(20),
    street VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20)
);

-- Services Table
CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    image TEXT,
    price DOUBLE,
    description TEXT,
    category VARCHAR(255)
);

-- Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255),
    service_id VARCHAR(255),
    quantity INT
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(255),
    user_id VARCHAR(255),
    amount DOUBLE,
    shipping_cost DOUBLE,
    tax DOUBLE,
    discount DOUBLE,
    street VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    payment_id VARCHAR(255),
    payment_method VARCHAR(50),
    payment_status VARCHAR(50),
    payment_date DATETIME,
    tracking_status VARCHAR(50),
    created_at DATETIME,
    updated_at DATETIME,
    service_date VARCHAR(50),
    provider_id BIGINT,
    otp_service_start VARCHAR(4)
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_tbl_id BIGINT,
    service_id VARCHAR(255),
    name VARCHAR(255),
    price DOUBLE,
    quantity INT,
    image VARCHAR(255),
    FOREIGN KEY (order_tbl_id) REFERENCES orders(id)
);

-- Providers Table
CREATE TABLE IF NOT EXISTS providers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    category VARCHAR(255),
    experience_years INT,
    rating DOUBLE DEFAULT 0.0,
    is_approved BOOLEAN DEFAULT FALSE,
    is_online BOOLEAN DEFAULT FALSE
);

-- Note: The orders table should be updated to include provider_id and otp_service_start.
-- Since it's already created, we use ALTER TABLE.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS provider_id BIGINT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS otp_service_start VARCHAR(4);
