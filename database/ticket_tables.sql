-- Ticket Purchase Tables for Lost Boys Club

-- Table for ticket purchases
CREATE TABLE `ticket_purchases` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `purchase_date` datetime NOT NULL DEFAULT current_timestamp(),
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `account_name` varchar(255) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `receipt_image_url` varchar(255) DEFAULT NULL,
  `status` enum('pending','confirmed','rejected','completed') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table for generated tickets (after confirmation)
CREATE TABLE `tickets` (
  `id` int(11) NOT NULL,
  `purchase_id` int(11) NOT NULL,
  `ticket_number` varchar(50) NOT NULL,
  `qr_code` varchar(255) DEFAULT NULL,
  `event_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `ticket_holder_name` varchar(255) NOT NULL,
  `ticket_holder_phone` varchar(20) NOT NULL,
  `status` enum('active','used','cancelled') DEFAULT 'active',
  `issued_date` datetime NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add indexes
ALTER TABLE `ticket_purchases`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `event_id` (`event_id`),
  ADD KEY `purchase_date` (`purchase_date`),
  ADD KEY `status` (`status`);

ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_id` (`purchase_id`),
  ADD KEY `event_id` (`event_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `ticket_number` (`ticket_number`),
  ADD KEY `status` (`status`);

-- Add foreign key constraints
ALTER TABLE `ticket_purchases`
  ADD CONSTRAINT `ticket_purchases_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ticket_purchases_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;

ALTER TABLE `tickets`
  ADD CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`purchase_id`) REFERENCES `ticket_purchases` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tickets_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tickets_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

-- Add auto increment
ALTER TABLE `ticket_purchases`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

ALTER TABLE `tickets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1000;
