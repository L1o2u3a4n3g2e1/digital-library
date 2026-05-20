-- LSTM-Powered Multilingual Digital Library
-- COMPLETE AUTO-SETUP SCRIPT
-- Order: Database -> Tables -> Data

-- 1. Create and Select Database
CREATE DATABASE IF NOT EXISTS `digital_library`;
USE `digital_library`;

-- 2. Drop existing tables to ensure a clean setup
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `book_shares`;
DROP TABLE IF EXISTS `book_ratings`;
DROP TABLE IF EXISTS `user_purchases`;
DROP TABLE IF EXISTS `user_library`;
DROP TABLE IF EXISTS `book_content`;
DROP TABLE IF EXISTS `books`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- 3. Create Tables
-- --------------------------------------------------------
CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) DEFAULT NULL,
  `preferred_language` varchar(10) DEFAULT 'en',
  `session_token` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `categories` (
  `category_id` int(11) NOT NULL,
  `name_en` varchar(100) NOT NULL,
  `name_rw` varchar(100) NOT NULL,
  `icon_url` varchar(255) DEFAULT NULL,
  `color_hex` varchar(20) DEFAULT '#1A73E8',
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `books` (
  `book_id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `author` varchar(200) DEFAULT 'Unknown',
  `category_id` int(11) DEFAULT NULL,
  `cover_image_url` varchar(500) DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `total_pages` int(11) DEFAULT 1,
  `is_free` tinyint(1) NOT NULL DEFAULT 1,
  `price` decimal(8,2) NOT NULL DEFAULT 0.00,
  `is_user_uploaded` tinyint(1) NOT NULL DEFAULT 0,
  `uploaded_by` int(11) DEFAULT NULL,
  `view_count` int(11) DEFAULT 0,
  `download_count` int(11) DEFAULT 0,
  `upload_date` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`book_id`),
  CONSTRAINT `fk_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `book_content` (
  `content_id` int(11) NOT NULL AUTO_INCREMENT,
  `book_id` int(11) NOT NULL,
  `page_number` int(11) NOT NULL,
  `language_code` varchar(10) NOT NULL,
  `page_text` text DEFAULT NULL,
  `audio_path` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`content_id`),
  CONSTRAINT `fk_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `user_library` (
  `user_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `saved_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`user_id`, `book_id`),
  CONSTRAINT `fk_user_library_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_library_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `user_purchases` (
  `purchase_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `purchase_date` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`purchase_id`),
  CONSTRAINT `fk_user_purchases_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_purchases_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `book_ratings` (
  `rating_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `rating` tinyint(1) NOT NULL,
  `review` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`rating_id`),
  UNIQUE KEY `uniq_rating` (`user_id`, `book_id`),
  CONSTRAINT `fk_book_ratings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_book_ratings_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `book_shares` (
  `share_id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_user_id` int(11) NOT NULL,
  `recipient_user_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `shared_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`share_id`),
  CONSTRAINT `fk_book_shares_sender` FOREIGN KEY (`sender_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_book_shares_recipient` FOREIGN KEY (`recipient_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_book_shares_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Seed Data
-- --------------------------------------------------------

-- Categories
INSERT INTO `categories` (`category_id`, `name_en`, `name_rw`, `icon_url`, `color_hex`) VALUES
(1, 'Family', 'Umuryango', 'home-heart', '#FF6B6B'),
(2, 'Farming', 'Ubuhinzi', 'leaf', '#4CAF50'),
(3, 'Education', 'Uburezi', 'school', '#4285F4'),
(4, 'Divertisement', 'Imyidagaduro', 'controller-classic', '#FBBC05');

-- Books
INSERT INTO `books` (`title`, `author`, `category_id`, `cover_image_url`, `file_path`, `total_pages`, `is_free`, `price`, `is_user_uploaded`, `uploaded_by`) VALUES
('The Psychology of Persuasion', 'Robert Cialdini', 3, 'https://m.media-amazon.com/images/I/41-7LwA8SXL._AC_UF1000,1000_QL80_.jpg', '../books/The Psychology of Persuasion.pdf', 320, 0, 9.99, 0, NULL),
('The Alexander Book', 'Elizabeth Alexander', 1, 'https://m.media-amazon.com/images/I/61S+mXfN2nL._AC_UF1000,1000_QL80_.jpg', '../books/familly/Elizabeth_Alexander_Book-compressed.pdf', 200, 1, 0.00, 0, NULL),
('Sugar Beans Guide', 'Agriculture Dept', 2, 'https://m.media-amazon.com/images/I/91wb7uS+0fL._AC_UF1000,1000_QL80_.jpg', '../books/farming/sugar-beans-growers-guide.pdf', 12, 1, 0.00, 0, NULL),
('The Alchemist', 'Paulo Coelho', 4, 'https://m.media-amazon.com/images/I/51Z0nLAfLmL.jpg', 'uploads/books/alchemist.txt', 1, 0, 4.99, 0, NULL);

COMMIT;
