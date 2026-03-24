-- Insert additional dummy events for Lost Boys Club
-- This script adds more events with proper relationships to bands and venues

-- Insert additional venues first
INSERT INTO `venues` (`id`, `name`, `address`, `capacity`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(2, 'The Underground Basement', '456 Punk Avenue, Quezon City, Philippines', 150, 'Dark, intimate basement venue perfect for underground shows', 1, NOW(), NOW()),
(3, 'Rooftop Rebellion', '789 Skyline Drive, Makati, Philippines', 300, 'Open-air rooftop venue with city views', 1, NOW(), NOW()),
(4, 'The Garage', '321 Industrial Road, Pasig, Philippines', 250, 'Converted garage space with raw punk atmosphere', 1, NOW(), NOW()),
(5, 'Neon Nights Club', '656 Electric Street, Mandaluyong, Philippines', 180, 'Neon-lit club with retro synthwave vibes', 1, NOW(), NOW());

-- Insert additional events
INSERT INTO `events` (`id`, `title`, `description`, `event_date`, `venue_id`, `base_price`, `total_tickets`, `available_tickets`, `poster_image_url`, `is_active`, `created_at`, `updated_at`) VALUES
(4, 'Punk Rock Revolution', 'A night of pure punk rock energy featuring the best local punk bands', '2026-04-05 20:00:00', 2, 280.00, 120, 120, 'punk-revolution.jpg', 1, NOW(), NOW()),
(5, 'Synthwave Dreams Festival', 'Retro-futuristic electronic music festival with neon visuals', '2026-04-12 22:00:00', 3, 450.00, 250, 250, 'synthwave-festival.jpg', 1, NOW(), NOW()),
(6, 'Indie Showcase Night', 'Showcase of emerging indie talent from the local scene', '2026-04-19 19:00:00', 4, 220.00, 180, 180, 'indie-showcase.jpg', 1, NOW(), NOW()),
(7, 'Alternative Rock Explosion', 'High-energy alternative rock performances', '2026-04-26 21:00:00', 5, 350.00, 200, 200, 'alt-rock-explosion.jpg', 1, NOW(), NOW()),
(8, 'Gothic Night Special', 'Dark and moody gothic rock performances', '2026-05-03 20:30:00', 2, 300.00, 100, 100, 'gothic-night.jpg', 1, NOW(), NOW()),
(9, 'Electronic Music Experience', 'Cutting-edge electronic music and visual effects', '2026-05-10 23:00:00', 5, 400.00, 150, 150, 'electronic-exp.jpg', 1, NOW(), NOW()),
(10, 'Retro Rewind Party', 'Throwback to the 80s and 90s with retro hits', '2026-05-17 20:00:00', 3, 320.00, 200, 200, 'retro-rewind.jpg', 1, NOW(), NOW()),
(11, 'Metal Mayhem', 'Heavy metal and hard rock extravaganza', '2026-05-24 19:30:00', 4, 380.00, 160, 160, 'metal-mayhem.jpg', 1, NOW(), NOW()),
(12, 'Acoustic Sessions', 'Intimate acoustic performances by local artists', '2026-05-31 18:00:00', 2, 180.00, 80, 80, 'acoustic-sessions.jpg', 1, NOW(), NOW()),
(13, 'Summer Music Festival', 'All-day outdoor music festival with multiple stages', '2026-06-07 12:00:00', 3, 550.00, 500, 500, 'summer-fest.jpg', 1, NOW(), NOW()),
(14, 'Jazz Fusion Night', 'Jazz and rock fusion experimental performances', '2026-06-14 20:00:00', 5, 280.00, 120, 120, 'jazz-fusion.jpg', 1, NOW(), NOW()),
(15, 'Battle of the Bands', 'Local bands compete for the ultimate title', '2026-06-21 18:00:00', 4, 150.00, 300, 300, 'battle-bands.jpg', 1, NOW(), NOW()),
(16, 'Punk vs Pop', 'Genre-bending night featuring punk and pop collaborations', '2026-06-28 20:30:00', 2, 250.00, 100, 100, 'punk-vs-pop.jpg', 1, NOW(), NOW()),
(17, 'Electronic Dance Marathon', '6-hour non-stop electronic dance party', '2026-07-05 22:00:00', 5, 420.00, 400, 400, 'dance-marathon.jpg', 1, NOW(), NOW()),
(18, 'Rock Legends Tribute', 'Tribute performances to rock legends', '2026-07-12 20:00:00', 3, 380.00, 250, 250, 'rock-tribute.jpg', 1, NOW(), NOW()),
(19, 'New Wave Revival', 'New wave and post-punk revival night', '2026-07-19 21:00:00', 4, 300.00, 150, 150, 'new-wave-revival.jpg', 1, NOW(), NOW()),
(20, 'Underground Showcase', 'Raw underground performances from emerging artists', '2026-07-26 19:00:00', 2, 200.00, 80, 80, 'underground-show.jpg', 1, NOW(), NOW());

-- Insert event-band relationships
INSERT INTO `event_bands` (`id`, `event_id`, `band_id`, `is_headliner`, `performance_order`) VALUES
-- Event 4: Punk Rock Revolution
(4, 4, 1, 1, 0),
(5, 4, 2, 0, 1),
(6, 4, 3, 0, 2),

-- Event 5: Synthwave Dreams Festival
(7, 5, 2, 1, 0),
(8, 5, 1, 0, 1),

-- Event 6: Indie Showcase Night
(9, 6, 3, 1, 0),
(10, 6, 1, 0, 1),

-- Event 7: Alternative Rock Explosion
(11, 7, 1, 1, 0),
(12, 7, 3, 0, 1),

-- Event 8: Gothic Night Special
(13, 8, 2, 1, 0),
(14, 8, 3, 0, 1),

-- Event 9: Electronic Music Experience
(15, 9, 1, 0, 0),
(16, 9, 2, 1, 1),
(17, 9, 3, 0, 2),

-- Event 10: Retro Rewind Party
(18, 10, 1, 1, 0),
(19, 10, 2, 0, 1),

-- Event 11: Metal Mayhem
(20, 11, 3, 1, 0),
(21, 11, 1, 0, 1),

-- Event 12: Acoustic Sessions
(22, 12, 1, 1, 0),
(23, 12, 2, 0, 1),

-- Event 13: Summer Music Festival
(24, 13, 1, 0, 0),
(25, 13, 2, 0, 1),
(26, 13, 3, 1, 2),

-- Event 14: Jazz Fusion Night
(27, 14, 2, 1, 0),
(28, 14, 3, 0, 1),

-- Event 15: Battle of the Bands
(29, 15, 1, 0, 0),
(30, 15, 2, 0, 1),
(31, 15, 3, 0, 2),

-- Event 16: Punk vs Pop
(32, 16, 1, 0, 0),
(33, 16, 2, 1, 1),

-- Event 17: Electronic Dance Marathon
(34, 17, 1, 0, 0),
(35, 17, 2, 1, 1),
(36, 17, 3, 0, 2),

-- Event 18: Rock Legends Tribute
(37, 18, 3, 1, 0),
(38, 18, 1, 0, 1),

-- Event 19: New Wave Revival
(39, 19, 2, 1, 0),
(40, 19, 1, 0, 1),

-- Event 20: Underground Showcase
(41, 20, 1, 0, 0),
(42, 20, 3, 1, 1);

-- Update some events to have limited availability for testing
UPDATE `events` SET `available_tickets` = 20 WHERE `id` = 4;
UPDATE `events` SET `available_tickets` = 10 WHERE `id` = 8;
UPDATE `events` SET `available_tickets` = 5 WHERE `id` = 12;
UPDATE `events` SET `available_tickets` = 15 WHERE `id` = 16;
UPDATE `events` SET `available_tickets` = 25 WHERE `id` = 20;
