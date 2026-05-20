-- =====================================================
-- DATABASE MIGRATION
-- Add columns for password reset functionality
-- =====================================================

USE `multilingual_library`;

-- =====================================================
-- 1. ALTER USERS TABLE - Add password reset columns
-- =====================================================

ALTER TABLE `users`
ADD COLUMN `password_reset_token` VARCHAR(255) NULL COMMENT 'Password reset verification code',
ADD COLUMN `password_reset_expiry` DATETIME NULL COMMENT 'Password reset code expiry time';

-- =====================================================
-- 2. CREATE INDEX FOR BETTER QUERY PERFORMANCE
-- =====================================================

ALTER TABLE `users`
ADD INDEX `idx_password_reset_token` (`password_reset_token`),
ADD INDEX `idx_password_reset_expiry` (`password_reset_expiry`);

-- =====================================================
-- MIGRATION SUMMARY
-- =====================================================

-- ✓ Added password_reset_token column to users
-- ✓ Added password_reset_expiry column to users
-- ✓ Added indexes for fast lookups

-- =====================================================
