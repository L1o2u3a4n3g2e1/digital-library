-- =====================================================
-- DATABASE MIGRATION
-- Add tables and columns for cookie system
-- =====================================================

USE `multilingual_library`;

-- =====================================================
-- 1. ALTER USERS TABLE - Add cookie system columns
-- =====================================================

ALTER TABLE `users`
ADD COLUMN `preferences` JSON NULL COMMENT 'User preferences (theme, language, etc.)',
ADD COLUMN `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- =====================================================
-- 2. CREATE REMEMBER_ME_TOKENS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS `remember_me_tokens` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `token_hash` VARCHAR(255) NOT NULL,
  `device_fingerprint` VARCHAR(255) NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` TEXT NULL,
  `expires_at` DATETIME NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_used_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_token_hash` (`token_hash`),
  KEY `idx_remember_me_user_id` (`user_id`),
  KEY `idx_remember_me_expires_at` (`expires_at`),
  CONSTRAINT `fk_remember_me_tokens_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. CREATE CSRF_TOKENS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS `csrf_tokens` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `token` VARCHAR(255) NOT NULL,
  `user_id` INT UNSIGNED NULL,
  `session_id` VARCHAR(255) NULL,
  `expires_at` DATETIME NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `used_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_csrf_token` (`token`),
  KEY `idx_csrf_tokens_user_id` (`user_id`),
  KEY `idx_csrf_tokens_expires_at` (`expires_at`),
  CONSTRAINT `fk_csrf_tokens_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. CREATE COOKIE_SESSIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS `cookie_sessions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `session_id` VARCHAR(255) NOT NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` VARCHAR(500) NULL,
  `device_type` ENUM('desktop', 'tablet', 'mobile') DEFAULT 'desktop',
  `expires_at` DATETIME NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_activity_at` DATETIME NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_session_id` (`session_id`),
  KEY `idx_cookie_sessions_user_id` (`user_id`),
  KEY `idx_cookie_sessions_expires_at` (`expires_at`),
  CONSTRAINT `fk_cookie_sessions_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. CREATE CLEANUP EVENT (Auto-delete expired tokens)
-- =====================================================

CREATE EVENT IF NOT EXISTS `cleanup_expired_tokens`
ON SCHEDULE EVERY 1 HOUR
DO
  BEGIN
    DELETE FROM `remember_me_tokens` WHERE `expires_at` < NOW();
    DELETE FROM `csrf_tokens` WHERE `expires_at` < NOW();
    DELETE FROM `cookie_sessions` WHERE `expires_at` < NOW();
  END;

-- =====================================================
-- MIGRATION SUMMARY
-- =====================================================

-- ✓ Added preferences column to users (JSON)
-- ✓ Added updated_at column to users
-- ✓ Created remember_me_tokens table
-- ✓ Created csrf_tokens table
-- ✓ Created cookie_sessions table
-- ✓ Created cleanup event for expired tokens

-- =====================================================
