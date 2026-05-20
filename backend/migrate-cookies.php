<?php
/**
 * Cookie System Migration via Web
 * Access at: http://localhost:8000/backend/migrate-cookies.php
 */

require_once __DIR__ . '/../vendor/autoload.php';

// Load environment
$dotenv = \Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// Create connection directly
$conn = new mysqli(
    $_ENV['DB_HOST'] ?? 'localhost',
    $_ENV['DB_USER'] ?? 'root',
    $_ENV['DB_PASSWORD'] ?? '',
    $_ENV['DB_NAME'] ?? 'multilingual_library'
);

if ($conn->connect_error) {
    die(json_encode(['error' => 'Connection failed: ' . $conn->connect_error], JSON_PRETTY_PRINT));
}

echo "<h2>Cookie System Migration</h2>";
echo "<pre>";

// Migration SQL statements
$statements = [
    // Add columns to users table
    "ALTER TABLE `users` ADD COLUMN `preferences` JSON NULL COMMENT 'User preferences (theme, language, etc.)', ADD COLUMN `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",

    // Create remember_me_tokens table
    "CREATE TABLE IF NOT EXISTS `remember_me_tokens` (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    // Create csrf_tokens table
    "CREATE TABLE IF NOT EXISTS `csrf_tokens` (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    // Create cookie_sessions table
    "CREATE TABLE IF NOT EXISTS `cookie_sessions` (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
];

$success = 0;
$failed = 0;

foreach ($statements as $i => $statement) {
    echo "Running statement " . ($i + 1) . "...\n";

    if ($conn->multi_query($statement)) {
        do {
            if ($result = $conn->store_result()) {
                $result->free();
            }
        } while ($conn->more_results() && $conn->next_result());

        echo "✓ Statement " . ($i + 1) . " succeeded\n";
        $success++;
    } else {
        echo "✗ Statement " . ($i + 1) . " failed: " . $conn->error . "\n";
        $failed++;
    }
    echo "\n";
}

// Try to create cleanup event
echo "Creating cleanup event...\n";
$eventSql = "CREATE EVENT IF NOT EXISTS `cleanup_expired_tokens`
ON SCHEDULE EVERY 1 HOUR
DO BEGIN
    DELETE FROM `remember_me_tokens` WHERE `expires_at` < NOW();
    DELETE FROM `csrf_tokens` WHERE `expires_at` < NOW();
    DELETE FROM `cookie_sessions` WHERE `expires_at` < NOW();
END";

if ($conn->query($eventSql)) {
    echo "✓ Cleanup event created\n";
    $success++;
} else {
    echo "⚠ Cleanup event creation skipped (may already exist): " . $conn->error . "\n";
}

$conn->close();

echo "\n========================================\n";
echo "MIGRATION COMPLETE\n";
echo "========================================\n";
echo "✓ Successful: $success\n";
echo "✗ Failed: $failed\n";

if ($failed === 0) {
    echo "\n✓ Cookie system successfully installed!\n";
} else {
    echo "\n⚠ Some operations failed. Please check manually.\n";
}

echo "</pre>";
?>
