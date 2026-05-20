-- =====================================================
-- DATABASE MIGRATION
-- Add tables for registration and notification system
-- =====================================================

USE `multilingual_library`;

-- =====================================================
-- 1. ALTER USERS TABLE - Add registration fields
-- =====================================================

-- Add all new columns in one statement
ALTER TABLE `users`
ADD COLUMN `phone_number` VARCHAR(20) NULL AFTER `email`,
ADD COLUMN `is_guest` TINYINT(1) NOT NULL DEFAULT 0,
ADD COLUMN `is_verified` TINYINT(1) NOT NULL DEFAULT 0,
ADD COLUMN `verification_token` VARCHAR(255) NULL,
ADD COLUMN `verification_token_expiry` DATETIME NULL,
ADD COLUMN `last_login` DATETIME NULL,
MODIFY COLUMN `email` VARCHAR(150) NULL,
MODIFY COLUMN `password` VARCHAR(255) NULL;

-- =====================================================
-- 2. CREATE NOTIFICATION PREFERENCES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS `notification_preferences` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `email_notifications` TINYINT(1) NOT NULL DEFAULT 1,
  `sms_notifications` TINYINT(1) NOT NULL DEFAULT 0,
  `notification_frequency` ENUM('instant', 'daily', 'weekly') DEFAULT 'instant',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_notification_prefs` (`user_id`),
  CONSTRAINT `fk_notification_preferences_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. ENHANCE NOTIFICATIONS TABLE
-- =====================================================

ALTER TABLE `notifications`
ADD COLUMN `notification_type` ENUM('registration', 'welcome', 'activity', 'system') DEFAULT 'activity' AFTER `message`,
ADD COLUMN `sent_via` ENUM('email', 'sms', 'in_app') DEFAULT 'in_app' AFTER `notification_type`,
ADD COLUMN `recipient_phone` VARCHAR(20) NULL AFTER `sent_via`,
ADD COLUMN `sent_at` DATETIME NULL AFTER `recipient_phone`,
ADD COLUMN `delivery_status` ENUM('pending', 'sent', 'failed', 'bounced') DEFAULT 'pending' AFTER `sent_at`;

-- =====================================================
-- 4. CREATE EMAIL LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS `email_logs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NULL,
  `recipient_email` VARCHAR(255) NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `body` LONGTEXT NOT NULL,
  `status` ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
  `error_message` TEXT NULL,
  `sent_at` DATETIME NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email_logs_user_id` (`user_id`),
  KEY `idx_email_logs_status` (`status`),
  KEY `idx_email_logs_created_at` (`created_at`),
  CONSTRAINT `fk_email_logs_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. CREATE SMS LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS `sms_logs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NULL,
  `recipient_phone` VARCHAR(20) NOT NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('pending', 'sent', 'failed', 'delivered') DEFAULT 'pending',
  `error_message` TEXT NULL,
  `sent_at` DATETIME NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sms_logs_user_id` (`user_id`),
  KEY `idx_sms_logs_status` (`status`),
  KEY `idx_sms_logs_created_at` (`created_at`),
  CONSTRAINT `fk_sms_logs_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- MIGRATION SUMMARY
-- =====================================================

-- ✓ Added phone_number to users
-- ✓ Added is_guest to users
-- ✓ Added is_verified to users
-- ✓ Added verification_token to users
-- ✓ Added verification_token_expiry to users
-- ✓ Added last_login to users
-- ✓ Made email nullable for guests
-- ✓ Made password nullable for guests
-- ✓ Created notification_preferences table
-- ✓ Enhanced notifications table
-- ✓ Created email_logs table
-- ✓ Created sms_logs table

-- =====================================================
