-- Lost Boys Club Ticket Reservation System Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS lost_boys_club;
USE lost_boys_club;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bands table
CREATE TABLE IF NOT EXISTS bands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    genre VARCHAR(100),
    facebook_url VARCHAR(255),
    spotify_embed_url VARCHAR(255),
    is_lbc_band BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Venues table
CREATE TABLE IF NOT EXISTS venues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    capacity INT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Events/Gigs table
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATETIME NOT NULL,
    venue_id INT NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    total_tickets INT NOT NULL,
    available_tickets INT NOT NULL,
    poster_image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE RESTRICT
);

-- Event bands relationship (many-to-many)
CREATE TABLE IF NOT EXISTS event_bands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    band_id INT NOT NULL,
    is_headliner BOOLEAN DEFAULT FALSE,
    performance_order INT DEFAULT 0,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (band_id) REFERENCES bands(id) ON DELETE CASCADE,
    UNIQUE KEY unique_event_band (event_id, band_id)
);

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    total_price DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'rejected', 'completed') DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    payment_date DATETIME,
    receipt_image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Band photos table
CREATE TABLE IF NOT EXISTS band_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    band_id INT NOT NULL,
    photo_url VARCHAR(255) NOT NULL,
    caption VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (band_id) REFERENCES bands(id) ON DELETE CASCADE
);

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password, first_name, last_name, is_active, email_verified) 
VALUES ('admin@lostboysclub.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', TRUE, TRUE)
ON DUPLICATE KEY UPDATE email = email;

-- Insert sample venue
INSERT INTO venues (name, address, capacity, description) 
VALUES ('Lost Boys Club Main Stage', '123 Music Street, Manila, Philippines', 200, 'Our intimate main stage where the magic happens')
ON DUPLICATE KEY UPDATE name = name;

-- Insert sample bands
INSERT INTO `bands` (`id`, `name`, `description`, `band_image`, `genre`, `facebook_url`, `spotify_embed_url`, `is_lbc_band`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Secret Menu', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', '', 'Pop Punk', 'https://www.facebook.com/secretmenumusic', NULL, 1, 1, '2026-03-04 19:28:54', '2026-03-04 19:58:10'),
(2, 'Erl, the Bird', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', '', 'Pop Punk', 'https://www.facebook.com/erlthebird', NULL, 1, 1, '2026-03-04 19:28:54', '2026-03-04 19:59:07'),
(3, 'Pop Drunk Punk', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', '', 'Pop Punk', 'https://www.facebook.com/popdrunkpunk', NULL, 1, 1, '2026-03-04 19:28:54', '2026-03-04 20:00:33');
ON DUPLICATE KEY UPDATE name = name;

-- Insert sample events
INSERT INTO events (title, description, event_date, venue_id, base_price, total_tickets, available_tickets) VALUES
('Midnight Echoes Live', 'An unforgettable night with Midnight Echoes featuring their latest album', '2026-03-15 20:00:00', 1, 350.00, 150, 150),
('Neon Dreams Retro Night', 'Step back in time with Neon Dreams synthwave experience', '2026-03-22 21:00:00', 1, 400.00, 120, 120),
('Velvet Underground Intimate Session', 'Get up close and personal with Velvet Underground', '2026-03-29 20:30:00', 1, 300.00, 100, 100)
ON DUPLICATE KEY UPDATE title = title;

-- Link bands to events
INSERT INTO event_bands (event_id, band_id, is_headliner) VALUES
(1, 1, TRUE),
(2, 2, TRUE),
(3, 3, TRUE)
ON DUPLICATE KEY UPDATE event_id = event_id;
