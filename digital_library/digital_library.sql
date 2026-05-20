-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 15, 2026 at 12:17 PM
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
-- Database: `digital_library`
--

-- --------------------------------------------------------

--
-- Table structure for table `books`
--

CREATE TABLE `books` (
  `book_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `author` varchar(200) DEFAULT 'Unknown',
  `category_id` int(11) DEFAULT NULL,
  `cover_image_url` varchar(255) DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `total_pages` int(11) DEFAULT 0,
  `is_user_uploaded` tinyint(1) DEFAULT 0,
  `uploaded_by` int(11) DEFAULT NULL,
  `download_count` int(11) DEFAULT 0,
  `view_count` int(11) DEFAULT 0,
  `upload_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `books`
--

INSERT INTO `books` (`book_id`, `title`, `author`, `category_id`, `cover_image_url`, `file_path`, `total_pages`, `is_user_uploaded`, `uploaded_by`, `download_count`, `view_count`, `upload_date`) VALUES
(1, 'How to Grow Beans', 'Farmer John', 1, '🌾', NULL, 3, 0, NULL, 0, 0, '2026-05-14 06:24:19'),
(2, 'Clean Water', 'Dr. Paul', 3, '💧', NULL, 3, 0, NULL, 0, 0, '2026-05-14 06:24:19'),
(3, 'Family Together', 'Maria Santos', 2, '👨‍👩‍👧', NULL, 2, 0, NULL, 0, 0, '2026-05-14 06:24:19'),
(4, 'Learning is Fun', 'Teacher Anna', 4, '📚', NULL, 3, 0, NULL, 0, 0, '2026-05-14 06:24:19'),
(5, 'The Great Gatsby', 'F. Scott Fitzgerald', 1, 'https://images.thalia.media/00/-/7848d7c49f824495941913c1c8a66f7d/the-great-gatsby-taschenbuch-f-scott-fitzgerald-englisch.jpeg', 'uploads/books/gatsby.txt', 0, 0, NULL, 0, 0, '2026-05-15 10:11:59'),
(6, 'Brief History of Time', 'Stephen Hawking', 2, 'https://m.media-amazon.com/images/I/91wb7uS+0fL._AC_UF1000,1000_QL80_.jpg', 'uploads/books/time.txt', 0, 0, NULL, 0, 0, '2026-05-15 10:11:59'),
(7, 'Amateka y\'u Rwanda', 'Alexis Kagame', 3, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfI3Yv8f-1o6O_k-L0P0zN-W5H86_E_R0wYA&s', 'uploads/books/rwanda_history.txt', 0, 0, NULL, 0, 0, '2026-05-15 10:11:59'),
(8, 'Mathematics for All', 'John Doe', 4, 'https://m.media-amazon.com/images/I/41-7LwA8SXL._AC_UF1000,1000_QL80_.jpg', 'uploads/books/math.txt', 0, 0, NULL, 0, 0, '2026-05-15 10:11:59'),
(9, 'Ikirunga cya Nyiragongo', 'Gasana Jean', 1, 'https://visitvirunga.org/wp-content/uploads/2020/07/nyiragongo.jpg', 'uploads/books/nyiragongo.txt', 0, 0, NULL, 0, 0, '2026-05-15 10:11:59');

-- --------------------------------------------------------

--
-- Table structure for table `book_content`
--

CREATE TABLE `book_content` (
  `content_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `page_number` int(11) NOT NULL,
  `language_code` varchar(5) NOT NULL,
  `page_text` text NOT NULL,
  `audio_url` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `book_content`
--

INSERT INTO `book_content` (`content_id`, `book_id`, `page_number`, `language_code`, `page_text`, `audio_url`) VALUES
(1, 1, 1, 'en', 'How to grow beans. First step: prepare the soil. Remove weeds, plow, and plant seeds in good soil.', NULL),
(2, 1, 2, 'en', 'Second step: plant the seeds. Put seeds in rows, cover with soil, and water immediately.', NULL),
(3, 1, 3, 'en', 'Third step: water and sunlight. Keep watering regularly. After 90 days, the beans are ready to harvest.', NULL),
(4, 2, 1, 'en', 'Clean water is life. Boil water before drinking to prevent diseases.', NULL),
(5, 2, 2, 'en', 'Water treatment methods: boil it, add chlorine, or expose to sunlight.', NULL),
(6, 2, 3, 'en', 'Keep water clean at home. Always wash hands with clean water.', NULL),
(7, 3, 1, 'en', 'A family that stays together. It\'s good to have a loving family.', NULL),
(8, 3, 2, 'en', 'Children and parents should have love and trust. Together, they can overcome all challenges.', NULL),
(9, 4, 1, 'en', 'Learning is good! It opens many doors. Do well in school and read books.', NULL),
(10, 4, 2, 'en', 'Reading helps you learn new things. Spend time reading every day.', NULL),
(11, 4, 3, 'en', 'The love of learning never ends. Keep learning always. Knowledge is power!', NULL),
(12, 1, 1, 'rw', 'Uburyo bwo guhinga ibishyimbo. Intego ya mbere: gutegura ubutaka. Ukurura ibyatsi, guhinga, no gutera imbuto mu butaka bwiza.', NULL),
(13, 1, 2, 'rw', 'Intego ya kabiri: tera imbuto mu butaka. Shyiramo imbuto mu murongo, uzipfukize n\'ubutaka, maze uhite utaha amazi.', NULL),
(14, 1, 3, 'rw', 'Intego ya gatatu: amazi n\'izuba. Komeza uha amazi buri gihe, kandi ureke izuba rirengere ku bimera. Nyuma y\'iminsi 90, ibishyimbo bira gukurwa.', NULL),
(15, 2, 1, 'rw', 'Amazi meza ni ubuzima. Tekesha amazi mbere yo kunywa.', NULL),
(16, 2, 2, 'rw', 'Uburyo bwo gutunganya amazi: uyatekesha, uyashyiramo chlorine, cyangwa ukayungurura mu zuba.', NULL),
(17, 2, 3, 'rw', 'Komeza uringanize amazi mu ngo. Jya ukaraba intoki n\'amazi meza.', NULL),
(18, 3, 1, 'rw', 'Umuryango wanyuze hamwe. Ni byiza kugira umuryango ukundana, ufashe ibyemezo hamwe, ukagira amahoro mu ngo.', NULL),
(19, 3, 2, 'rw', 'Bana n\'ababyeyi bagomba kugira urukundo n\'ubwuzu. Hamwe, bashobora gutsinda ibibazo byose.', NULL),
(20, 4, 1, 'rw', 'Kwiga ni ibyiza! Bifungura imiryango myinshi. Kora neza mu ishuri, usome ibitabo, kandi ujye ubaza ibibazo.', NULL),
(21, 4, 2, 'rw', 'Gusoma bituma umenya ibintu bishya. Ni byiza gutanga umwanya wo gusoma buri munsi, ndetse n\'iminota 15 gusa.', NULL),
(22, 4, 3, 'rw', 'Urukundo rwo kwiga ntirurangiza. Komeza wige buri gihe, kandi ujye ushaka ubumenyi bushya. Ubumenyi ni imbaraga!', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `category_id` int(11) NOT NULL,
  `name_en` varchar(100) NOT NULL,
  `name_rw` varchar(100) DEFAULT NULL,
  `icon_url` varchar(255) DEFAULT NULL,
  `color_hex` varchar(7) DEFAULT '#3B82F6'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`category_id`, `name_en`, `name_rw`, `icon_url`, `color_hex`) VALUES
(1, 'Farming', 'Ubuhinzi', '🌾', '#10B981'),
(2, 'Family', 'Umuryango', '👨‍👩‍👧', '#F59E0B'),
(3, 'Health', 'Ubuzima', '🏥', '#EF4444'),
(4, 'Education', 'Uburezi', '📖', '#3B82F6');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(100) DEFAULT 'Guest',
  `preferred_language` enum('rw','en') DEFAULT 'en',
  `session_token` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `preferred_language`, `session_token`, `created_at`) VALUES
(1, 'Guest', 'rw', 'fce4fd7c-16a4-4acd-a671-dd2836e80acf', '2026-05-14 06:29:25'),
(2, 'Guest', 'en', 'b6207498-e4c2-4eab-9773-e3f199fdf589', '2026-05-14 06:29:53'),
(3, 'Guest', 'rw', 'db66b2bc-ae8a-451c-b0fb-9a3182daf78e', '2026-05-14 06:36:19'),
(4, 'Guest', 'en', '7574bc3e-d521-4d10-ab1b-ecc0c6614194', '2026-05-14 06:36:22'),
(5, 'Guest', 'rw', '46d094de-d2af-451d-89ac-dacb45e0cb8c', '2026-05-14 06:40:34'),
(6, 'Guest', 'en', '0035040e-fd89-48da-a158-d71d00488135', '2026-05-14 06:41:04'),
(7, 'Guest', 'rw', '4dee5269-dee5-4e0e-89cd-0a5dc2d7c3ab', '2026-05-14 06:41:16'),
(8, 'Guest', 'en', '80a694eb-546b-4dfe-aed5-26f93aff47bd', '2026-05-15 05:35:07'),
(9, 'Guest', 'rw', '248d4c33-9996-42be-9940-7212f6d6b680', '2026-05-15 05:35:10'),
(10, 'Guest', 'en', '17ef6009-cc79-4522-8df6-3452671fee6e', '2026-05-15 05:35:17'),
(11, 'Guest', 'rw', '27f3c945-6dd1-487d-9823-403c71d21e02', '2026-05-15 05:35:27'),
(12, 'Guest', 'en', '3d9ff363-38ec-4027-befc-e82a8a2f3143', '2026-05-15 08:58:17'),
(13, 'Guest', 'rw', 'df4c3ff6-5979-4c1a-ae3f-c9ebb4d2e20c', '2026-05-15 09:01:40'),
(14, 'Guest', 'en', 'b189f3ab-8590-458c-967f-436daf310884', '2026-05-15 09:01:41'),
(15, 'Guest', 'rw', '9f40e85a-f3ea-49db-8b25-2f7ba3d3f312', '2026-05-15 09:01:42'),
(16, 'Guest', 'en', '1e01e57a-3d8b-4927-a767-5b70269a38a0', '2026-05-15 09:01:44'),
(17, 'Guest', 'rw', 'd11e4c9a-38fd-45dc-8be3-1e7d79beddd1', '2026-05-15 09:01:46'),
(18, 'Guest', 'en', '67616e06-9351-4dc4-9aed-0a7d0da715d1', '2026-05-15 09:01:49'),
(19, 'Guest', 'rw', '3bd2fd23-0bd8-436c-aeb2-951fb1e303b8', '2026-05-15 09:51:07'),
(20, 'Guest', 'rw', '32961b79-1918-4801-b2d4-6b3bb6eaa4c6', '2026-05-15 09:59:58'),
(21, 'Guest', 'en', 'c5c9febc-3c0f-434b-8e5f-30a4d0244a33', '2026-05-15 10:00:02'),
(22, 'Guest', 'rw', '14f05a2b-612e-4e4b-a97b-0f20dc3cc8f7', '2026-05-15 10:03:11'),
(23, 'Guest', 'en', '9291dfcf-62da-4ca1-81a7-816268e8a438', '2026-05-15 10:03:14'),
(24, 'Guest', 'rw', 'bb121adf-4050-40fa-9ea4-b2eb9c6416a1', '2026-05-15 10:07:56'),
(25, 'Guest', 'en', '758157bd-db3f-499b-b866-5471f74626ee', '2026-05-15 10:07:57'),
(26, 'Guest', 'rw', 'e818eae5-6cae-4448-bbad-28103d04c997', '2026-05-15 10:13:46'),
(27, 'Guest', 'en', '977a6f6a-0ba7-4dfd-bc68-f1db9459070b', '2026-05-15 10:13:47');

-- --------------------------------------------------------

--
-- Table structure for table `user_progress`
--

CREATE TABLE `user_progress` (
  `progress_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `last_page_read` int(11) DEFAULT 1,
  `last_accessed` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_progress`
--

INSERT INTO `user_progress` (`progress_id`, `user_id`, `book_id`, `last_page_read`, `last_accessed`) VALUES
(1, 19, 2, 3, '2026-05-15 09:51:17'),
(3, 21, 1, 2, '2026-05-15 10:01:57');

-- --------------------------------------------------------

--
-- Table structure for table `voice_logs`
--

CREATE TABLE `voice_logs` (
  `log_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `command_text` varchar(255) DEFAULT NULL,
  `recognized_action` varchar(50) DEFAULT NULL,
  `language` varchar(10) DEFAULT NULL,
  `audio_path` varchar(500) DEFAULT NULL,
  `success` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `books`
--
ALTER TABLE `books`
  ADD PRIMARY KEY (`book_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `book_content`
--
ALTER TABLE `book_content`
  ADD PRIMARY KEY (`content_id`),
  ADD UNIQUE KEY `unique_page_lang` (`book_id`,`page_number`,`language_code`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`category_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `user_progress`
--
ALTER TABLE `user_progress`
  ADD PRIMARY KEY (`progress_id`),
  ADD UNIQUE KEY `unique_user_book` (`user_id`,`book_id`),
  ADD KEY `book_id` (`book_id`);

--
-- Indexes for table `voice_logs`
--
ALTER TABLE `voice_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `books`
--
ALTER TABLE `books`
  MODIFY `book_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `book_content`
--
ALTER TABLE `book_content`
  MODIFY `content_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `user_progress`
--
ALTER TABLE `user_progress`
  MODIFY `progress_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `voice_logs`
--
ALTER TABLE `voice_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `books`
--
ALTER TABLE `books`
  ADD CONSTRAINT `books_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE SET NULL;

--
-- Constraints for table `book_content`
--
ALTER TABLE `book_content`
  ADD CONSTRAINT `book_content_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`) ON DELETE CASCADE;

--
-- Constraints for table `user_progress`
--
ALTER TABLE `user_progress`
  ADD CONSTRAINT `user_progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_progress_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`) ON DELETE CASCADE;

--
-- Constraints for table `voice_logs`
--
ALTER TABLE `voice_logs`
  ADD CONSTRAINT `voice_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
