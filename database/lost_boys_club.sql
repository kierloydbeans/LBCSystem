-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 24, 2026 at 04:10 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `lost_boys_club`
--

-- --------------------------------------------------------

--
-- Table structure for table `bands`
--

CREATE TABLE `bands` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `genre` varchar(100) DEFAULT NULL,
  `facebook_url` varchar(255) DEFAULT NULL,
  `spotify_embed_url` varchar(255) DEFAULT NULL,
  `is_lbc_band` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bands`
--

INSERT INTO `bands` (`id`, `name`, `description`, `genre`, `facebook_url`, `spotify_embed_url`, `is_lbc_band`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Secret Menu', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', 'Pop Punk', 'https://www.facebook.com/secretmenumusic', NULL, 1, 1, '2026-03-04 19:28:54', '2026-03-04 19:58:10'),
(2, 'Erl, the Bird', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', 'Pop Punk', 'https://www.facebook.com/erlthebird', NULL, 1, 1, '2026-03-04 19:28:54', '2026-03-04 19:59:07'),
(3, 'Pop Drunk Punk', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', 'Pop Punk', 'https://www.facebook.com/popdrunkpunk', NULL, 1, 1, '2026-03-04 19:28:54', '2026-03-04 20:00:33');

-- --------------------------------------------------------

--
-- Table structure for table `band_photos`
--

CREATE TABLE `band_photos` (
  `id` int(11) NOT NULL,
  `band_id` int(11) NOT NULL,
  `photo_url` varchar(255) NOT NULL,
  `caption` varchar(255) DEFAULT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `band_photos`
--

INSERT INTO `band_photos` (`id`, `band_id`, `photo_url`, `caption`, `is_primary`, `created_at`) VALUES
(1, 2, 'erl-the-bird.jpg', 'Erl , the Bird', 1, '2026-03-04 20:28:28'),
(2, 3, 'pop-drunk-punk.jpg', 'Pop Drunk Punk', 1, '2026-03-04 20:28:28'),
(3, 1, 'secret-menu.jpg', 'Secret Menu', 1, '2026-03-04 20:28:28');

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `event_date` datetime NOT NULL,
  `venue_id` int(11) NOT NULL,
  `base_price` decimal(10,2) NOT NULL,
  `total_tickets` int(11) NOT NULL,
  `available_tickets` int(11) NOT NULL,
  `poster_image_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id`, `title`, `description`, `event_date`, `venue_id`, `base_price`, `total_tickets`, `available_tickets`, `poster_image_url`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Midnight Echoes Live', 'An unforgettable night with Midnight Echoes featuring their latest album', '2026-03-15 20:00:00', 1, 350.00, 150, 150, NULL, 1, '2026-03-04 19:28:54', '2026-03-04 19:28:54'),
(2, 'Neon Dreams Retro Night', 'Step back in time with Neon Dreams synthwave experience', '2026-03-22 21:00:00', 1, 400.00, 120, 120, NULL, 1, '2026-03-04 19:28:54', '2026-03-04 19:28:54'),
(3, 'Velvet Underground Intimate Session', 'Get up close and personal with Velvet Underground', '2026-03-29 20:30:00', 1, 300.00, 100, 100, NULL, 1, '2026-03-04 19:28:54', '2026-03-04 19:28:54'),
(4, 'Punk Rock Revolution', 'A night of pure punk rock energy featuring the best local punk bands', '2026-04-05 20:00:00', 2, 280.00, 120, 20, 'punk-revolution.jpg', 1, '2026-03-24 14:56:18', '2026-03-24 14:56:18'),
(5, 'Synthwave Dreams Festival', 'Retro-futuristic electronic music festival with neon visuals', '2026-04-12 22:00:00', 3, 450.00, 250, 250, 'synthwave-festival.jpg', 1, '2026-03-24 14:56:18', '2026-03-24 14:56:18'),
(6, 'Indie Showcase Night', 'Showcase of emerging indie talent from the local scene', '2026-04-19 19:00:00', 4, 220.00, 180, 180, 'indie-showcase.jpg', 1, '2026-03-24 14:56:18', '2026-03-24 14:56:18'),
(7, 'Alternative Rock Explosion', 'High-energy alternative rock performances', '2026-04-26 21:00:00', 5, 350.00, 200, 200, 'alt-rock-explosion.jpg', 1, '2026-03-24 14:56:18', '2026-03-24 14:56:18'),
(8, 'Gothic Night Special', 'Dark and moody gothic rock performances', '2026-05-03 20:30:00', 2, 300.00, 100, 10, 'gothic-night.jpg', 1, '2026-03-24 14:56:18', '2026-03-24 14:56:18'),
(9, 'Electronic Music Experience', 'Cutting-edge electronic music and visual effects', '2026-05-10 23:00:00', 5, 400.00, 150, 150, 'electronic-exp.jpg', 1, '2026-03-24 14:56:18', '2026-03-24 14:56:18'),
(10, 'Retro Rewind Party', 'Throwback to the 80s and 90s with retro hits', '2026-05-17 20:00:00', 3, 320.00, 200, 200, 'retro-rewind.jpg', 1, '2026-03-24 14:56:18', '2026-03-24 14:56:18'),
(11, 'Metal Mayhem', 'Heavy metal and hard rock extravaganza', '2026-05-24 19:30:00', 4, 380.00, 160, 160, 'metal-mayhem.jpg', 1, '2026-03-24 14:56:18', '2026-03-24 14:56:18'),
(12, 'Acoustic Sessions', 'Intimate acoustic performances by local artists', '2026-05-31 18:00:00', 2, 180.00, 80, 5, 'acoustic-sessions.jpg', 1, '2026-03-24 14:56:18', '2026-03-24 14:56:18'),
(13, 'Summer Music Festival', 'All-day outdoor music festival with multiple stages', '2026-06-07 12:00:00', 3, 550.00, 500, 500, 'summer-fest.jpg', 1, '2026-03-24 14:56:18', '2026-03-24 14:56:18'),
(14, 'Jazz Fusion Night', 'Jazz and rock fusion experimental performances', '2026-06-14 20:00:00', 5, 280.00, 120, 120, 'jazz-fusion.jpg', 1, '2026-03-24 14:56:18', '2026-03-24 14:56:18'),
(15, 'Battle of the Bands', 'Local bands compete for the ultimate title', '2026-06-21 18:00:00', 4, 150.00, 300, 300, 'battle-bands.jpg', 1, '2026-03-24 14:56:18', '2026-03-24 14:56:18'),
(16, 'Punk vs Pop', 'Genre-bending night featuring punk and pop collaborations', '2026-06-28 20:30:00', 2, 250.00, 100, 15, 'punk-vs-pop.jpg', 1, '2026-03-24 14:56:18', '2026-03-24 14:56:18'),
(17, 'Electronic Dance Marathon', '6-hour non-stop electronic dance party', '2026-07-05 22:00:00', 5, 420.00, 400, 400, 'dance-marathon.jpg', 1, '2026-03-24 14:56:18', '2026-03-24 14:56:18'),
(18, 'Rock Legends Tribute', 'Tribute performances to rock legends', '2026-07-12 20:00:00', 3, 380.00, 250, 250, 'rock-tribute.jpg', 1, '2026-03-24 14:56:18', '2026-03-24 14:56:18'),
(19, 'New Wave Revival', 'New wave and post-punk revival night', '2026-07-19 21:00:00', 4, 300.00, 150, 150, 'new-wave-revival.jpg', 1, '2026-03-24 14:56:18', '2026-03-24 14:56:18'),
(20, 'Underground Showcase', 'Raw underground performances from emerging artists', '2026-07-26 19:00:00', 2, 200.00, 80, 25, 'underground-show.jpg', 1, '2026-03-24 14:56:18', '2026-03-24 14:56:18');

-- --------------------------------------------------------

--
-- Table structure for table `event_bands`
--

CREATE TABLE `event_bands` (
  `id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `band_id` int(11) NOT NULL,
  `is_headliner` tinyint(1) DEFAULT 0,
  `performance_order` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `event_bands`
--

INSERT INTO `event_bands` (`id`, `event_id`, `band_id`, `is_headliner`, `performance_order`) VALUES
(1, 1, 1, 1, 0),
(2, 2, 2, 1, 0),
(3, 3, 3, 1, 0),
(4, 4, 1, 1, 0),
(5, 4, 2, 0, 1),
(6, 4, 3, 0, 2),
(7, 5, 2, 1, 0),
(8, 5, 1, 0, 1),
(9, 6, 3, 1, 0),
(10, 6, 1, 0, 1),
(11, 7, 1, 1, 0),
(12, 7, 3, 0, 1),
(13, 8, 2, 1, 0),
(14, 8, 3, 0, 1),
(15, 9, 1, 0, 0),
(16, 9, 2, 1, 1),
(17, 9, 3, 0, 2),
(18, 10, 1, 1, 0),
(19, 10, 2, 0, 1),
(20, 11, 3, 1, 0),
(21, 11, 1, 0, 1),
(22, 12, 1, 1, 0),
(23, 12, 2, 0, 1),
(24, 13, 1, 0, 0),
(25, 13, 2, 0, 1),
(26, 13, 3, 1, 2),
(27, 14, 2, 1, 0),
(28, 14, 3, 0, 1),
(29, 15, 1, 0, 0),
(30, 15, 2, 0, 1),
(31, 15, 3, 0, 2),
(32, 16, 1, 0, 0),
(33, 16, 2, 1, 1),
(34, 17, 1, 0, 0),
(35, 17, 2, 1, 1),
(36, 17, 3, 0, 2),
(37, 18, 3, 1, 0),
(38, 18, 1, 0, 1),
(39, 19, 2, 1, 0),
(40, 19, 1, 0, 1),
(41, 20, 1, 0, 0),
(42, 20, 3, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE `tickets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `ticket_number` varchar(50) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `total_price` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','rejected','completed') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_reference` varchar(255) DEFAULT NULL,
  `payment_date` datetime DEFAULT NULL,
  `receipt_image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `email_verified` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `first_name`, `last_name`, `phone`, `date_of_birth`, `is_active`, `email_verified`, `created_at`, `updated_at`, `last_login`) VALUES
(1, 'user@mail.com', '$2y$10$ZJ48M3D9urO45X6YneXU4ePgRmlZTMuSYv2U3WchPmVZN9xqWgjya', 'Test', 'User', NULL, NULL, 1, 1, '2026-03-04 19:28:54', '2026-03-24 14:40:32', '2026-03-24 14:40:32'),
(2, 'test@mail.com', '$2y$10$O.0SG394eoX2OHjwtoKVjuxfXTPm8ynaS4xgFAwwSL2obB0uMgfuO', 'Kier', 'Schofield', '09123456789', '2005-01-01', 1, 0, '2026-03-24 14:36:09', '2026-03-24 14:41:03', '2026-03-24 14:41:03');

-- --------------------------------------------------------

--
-- Table structure for table `user_sessions`
--

CREATE TABLE `user_sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `session_token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_sessions`
--

INSERT INTO `user_sessions` (`id`, `user_id`, `session_token`, `expires_at`, `created_at`) VALUES
(1, 1, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE3NzI3MzkwNzEsImlhdCI6MTc3MjY1MjY3MX0.tsYMirAYvvAFebEWAzrpx-o3M_taoW01G6mF_8jFoio', '2026-03-05 12:31:11', '2026-03-04 19:31:11'),
(2, 1, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE3NzI3Mzk1OTgsImlhdCI6MTc3MjY1MzE5OH0.ikT6TB7OiU6oq3ZCBr9GmZXvRSWWABMkU8wkEtZdy-A', '2026-03-05 12:39:58', '2026-03-04 19:39:58'),
(3, 1, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE3NzI3Mzk3ODAsImlhdCI6MTc3MjY1MzM4MH0.aEWfl838aDmzg9N3M-Xwfkn-YEYuW6Q-kJFbTePifCs', '2026-03-05 12:43:00', '2026-03-04 19:43:00'),
(7, 1, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE3NzI3NDI3MTYsImlhdCI6MTc3MjY1NjMxNn0.Eq1byZdMjzvxAIUzfRtrAwxL4qI09pS1YKJWkKc65IA', '2026-03-05 13:31:56', '2026-03-04 20:31:56'),
(8, 1, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE3NzI3NDI3OTEsImlhdCI6MTc3MjY1NjM5MX0.aCHDZby8TmmD3KVWoM58JqMuDk_XRUuCXTlxVIydqGE', '2026-03-05 13:33:11', '2026-03-04 20:33:11'),
(9, 1, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE3NzI3ODM1MTgsImlhdCI6MTc3MjY5NzExOH0.KzZvhjgcTMmMEB6ljH_j2UrzAxPJ8Ra2dXO5MSsYFMo', '2026-03-06 00:51:58', '2026-03-05 07:51:58'),
(10, 1, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE3NzI3OTM5MDYsImlhdCI6MTc3MjcwNzUwNn0.u6evoVBdNiqfTYppRHys291x04Gti9GEHSI1Q9hD5ss', '2026-03-06 03:45:06', '2026-03-05 10:45:06'),
(13, 1, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE3NzQ0NDg3MjUsImlhdCI6MTc3NDM2MjMyNX0.6QRbhjGya8A2dz5ROmWNXIXBor4uJVM1qngwd1_nDKw', '2026-03-25 07:25:25', '2026-03-24 14:25:25'),
(17, 2, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyLCJleHAiOjE3NzQ0NDk2NjMsImlhdCI6MTc3NDM2MzI2M30.MoJY4M5_p2ZDru93vzpXzdYSWx-xkhCP4gfWjAghV-0', '2026-03-25 07:41:03', '2026-03-24 14:41:03');

-- --------------------------------------------------------

--
-- Table structure for table `venues`
--

CREATE TABLE `venues` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `capacity` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `venues`
--

INSERT INTO `venues` (`id`, `name`, `address`, `capacity`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Lost Boys Club Main Stage', '123 Music Street, Manila, Philippines', 200, 'Our intimate main stage where the magic happens', 1, '2026-03-04 19:28:54', '2026-03-04 19:28:54'),
(2, 'The Underground Basement', '456 Punk Avenue, Quezon City, Philippines', 150, 'Dark, intimate basement venue perfect for underground shows', 1, '2026-03-24 14:56:18', '2026-03-24 14:56:18'),
(3, 'Rooftop Rebellion', '789 Skyline Drive, Makati, Philippines', 300, 'Open-air rooftop venue with city views', 1, '2026-03-24 14:56:18', '2026-03-24 14:56:18'),
(4, 'The Garage', '321 Industrial Road, Pasig, Philippines', 250, 'Converted garage space with raw punk atmosphere', 1, '2026-03-24 14:56:18', '2026-03-24 14:56:18'),
(5, 'Neon Nights Club', '656 Electric Street, Mandaluyong, Philippines', 180, 'Neon-lit club with retro synthwave vibes', 1, '2026-03-24 14:56:18', '2026-03-24 14:56:18');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bands`
--
ALTER TABLE `bands`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `band_photos`
--
ALTER TABLE `band_photos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `band_id` (`band_id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `venue_id` (`venue_id`);

--
-- Indexes for table `event_bands`
--
ALTER TABLE `event_bands`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_event_band` (`event_id`,`band_id`),
  ADD KEY `band_id` (`band_id`);

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ticket_number` (`ticket_number`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `event_id` (`event_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session_token` (`session_token`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `venues`
--
ALTER TABLE `venues`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bands`
--
ALTER TABLE `bands`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `band_photos`
--
ALTER TABLE `band_photos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `event_bands`
--
ALTER TABLE `event_bands`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `venues`
--
ALTER TABLE `venues`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `band_photos`
--
ALTER TABLE `band_photos`
  ADD CONSTRAINT `band_photos_ibfk_1` FOREIGN KEY (`band_id`) REFERENCES `bands` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_ibfk_1` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`);

--
-- Constraints for table `event_bands`
--
ALTER TABLE `event_bands`
  ADD CONSTRAINT `event_bands_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `event_bands_ibfk_2` FOREIGN KEY (`band_id`) REFERENCES `bands` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tickets`
--
ALTER TABLE `tickets`
  ADD CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tickets_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
