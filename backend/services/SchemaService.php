<?php

class SchemaService {
    private $conn;

    public function __construct($database) {
        $this->conn = $database->getConnection();
    }

    public function ensureCoreSchema() {
        $this->ensureUsersTable();
        $this->ensureNotificationPreferencesTable();
        $this->ensureRememberMeTokensTable();
        $this->ensureCsrfTokensTable();
        $this->ensureCookieSessionsTable();
        $this->ensureEmailLogsTable();
        $this->ensureSmsLogsTable();
        $this->ensureUserActivityTable();
        $this->ensureUserMetricsTable();
    }

    private function ensureUsersTable() {
        $this->conn->query("
            CREATE TABLE IF NOT EXISTS `users` (
                `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
                `full_name` VARCHAR(150) NOT NULL,
                `email` VARCHAR(150) NULL,
                `password` VARCHAR(255) NULL,
                `phone_number` VARCHAR(20) NULL,
                `is_guest` TINYINT(1) NOT NULL DEFAULT 0,
                `is_verified` TINYINT(1) NOT NULL DEFAULT 0,
                `verification_token` VARCHAR(255) NULL,
                `verification_token_expiry` DATETIME NULL,
                `password_reset_token` VARCHAR(255) NULL,
                `password_reset_expiry` DATETIME NULL,
                `role` VARCHAR(50) NOT NULL DEFAULT 'client',
                `preferred_language` VARCHAR(10) NOT NULL DEFAULT 'en',
                `dark_mode` TINYINT(1) NOT NULL DEFAULT 0,
                `preferences` JSON NULL,
                `last_login` DATETIME NULL,
                `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (`id`),
                UNIQUE KEY `uniq_users_email` (`email`),
                UNIQUE KEY `uniq_users_phone` (`phone_number`),
                KEY `idx_users_verification_token` (`verification_token`),
                KEY `idx_users_password_reset_token` (`password_reset_token`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");

        $this->ensureColumn('users', 'phone_number', "ALTER TABLE `users` ADD COLUMN `phone_number` VARCHAR(20) NULL AFTER `email`");
        $this->ensureColumn('users', 'is_guest', "ALTER TABLE `users` ADD COLUMN `is_guest` TINYINT(1) NOT NULL DEFAULT 0 AFTER `phone_number`");
        $this->ensureColumn('users', 'is_verified', "ALTER TABLE `users` ADD COLUMN `is_verified` TINYINT(1) NOT NULL DEFAULT 0 AFTER `is_guest`");
        $this->ensureColumn('users', 'verification_token', "ALTER TABLE `users` ADD COLUMN `verification_token` VARCHAR(255) NULL AFTER `is_verified`");
        $this->ensureColumn('users', 'verification_token_expiry', "ALTER TABLE `users` ADD COLUMN `verification_token_expiry` DATETIME NULL AFTER `verification_token`");
        $this->ensureColumn('users', 'password_reset_token', "ALTER TABLE `users` ADD COLUMN `password_reset_token` VARCHAR(255) NULL AFTER `verification_token_expiry`");
        $this->ensureColumn('users', 'password_reset_expiry', "ALTER TABLE `users` ADD COLUMN `password_reset_expiry` DATETIME NULL AFTER `password_reset_token`");
        $this->ensureColumn('users', 'role', "ALTER TABLE `users` ADD COLUMN `role` VARCHAR(50) NOT NULL DEFAULT 'client' AFTER `password_reset_expiry`");
        $this->ensureColumn('users', 'preferred_language', "ALTER TABLE `users` ADD COLUMN `preferred_language` VARCHAR(10) NOT NULL DEFAULT 'en' AFTER `role`");
        $this->ensureColumn('users', 'dark_mode', "ALTER TABLE `users` ADD COLUMN `dark_mode` TINYINT(1) NOT NULL DEFAULT 0 AFTER `preferred_language`");
        $this->ensureColumn('users', 'preferences', "ALTER TABLE `users` ADD COLUMN `preferences` JSON NULL AFTER `dark_mode`");
        $this->ensureColumn('users', 'last_login', "ALTER TABLE `users` ADD COLUMN `last_login` DATETIME NULL AFTER `preferences`");
        $this->ensureColumn('users', 'updated_at', "ALTER TABLE `users` ADD COLUMN `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`");

        $this->ensureIndex('users', 'uniq_users_email', "ALTER TABLE `users` ADD UNIQUE KEY `uniq_users_email` (`email`)");
        $this->ensureIndex('users', 'uniq_users_phone', "ALTER TABLE `users` ADD UNIQUE KEY `uniq_users_phone` (`phone_number`)");
        $this->ensureIndex('users', 'idx_users_verification_token', "ALTER TABLE `users` ADD KEY `idx_users_verification_token` (`verification_token`)");
        $this->ensureIndex('users', 'idx_users_password_reset_token', "ALTER TABLE `users` ADD KEY `idx_users_password_reset_token` (`password_reset_token`)");
    }

    private function ensureNotificationPreferencesTable() {
        $this->conn->query("
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
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    }

    private function ensureRememberMeTokensTable() {
        $this->conn->query("
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
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    }

    private function ensureCsrfTokensTable() {
        $this->conn->query("
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
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    }

    private function ensureCookieSessionsTable() {
        $this->conn->query("
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
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    }

    private function ensureEmailLogsTable() {
        $this->conn->query("
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
                CONSTRAINT `fk_email_logs_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    }

    private function ensureSmsLogsTable() {
        $this->conn->query("
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
                CONSTRAINT `fk_sms_logs_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    }

    private function ensureUserActivityTable() {
        $this->conn->query("
            CREATE TABLE IF NOT EXISTS `user_activity` (
                `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
                `user_id` INT UNSIGNED NOT NULL,
                `activity_type` VARCHAR(100) NOT NULL,
                `details` LONGTEXT NULL,
                `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (`id`),
                KEY `idx_user_activity_user_id` (`user_id`),
                KEY `idx_user_activity_type` (`activity_type`),
                CONSTRAINT `fk_user_activity_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    }

    private function ensureUserMetricsTable() {
        $this->conn->query("
            CREATE TABLE IF NOT EXISTS `user_metrics` (
                `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
                `user_id` INT UNSIGNED NOT NULL,
                `metrics` LONGTEXT NOT NULL,
                `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (`id`),
                UNIQUE KEY `uniq_user_metrics_user_id` (`user_id`),
                CONSTRAINT `fk_user_metrics_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    }

    private function ensureColumn($table, $column, $statement) {
        $table = $this->conn->real_escape_string($table);
        $column = $this->conn->real_escape_string($column);
        $result = $this->conn->query("SHOW COLUMNS FROM `{$table}` LIKE '{$column}'");
        if ($result && $result->num_rows === 0) {
            $this->conn->query($statement);
        }
    }

    private function ensureIndex($table, $indexName, $statement) {
        $table = $this->conn->real_escape_string($table);
        $indexName = $this->conn->real_escape_string($indexName);
        $result = $this->conn->query("SHOW INDEX FROM `{$table}` WHERE Key_name = '{$indexName}'");
        if ($result && $result->num_rows === 0) {
            $this->conn->query($statement);
        }
    }
}
