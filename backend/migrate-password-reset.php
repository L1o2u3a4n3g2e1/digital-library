<?php
/**
 * Password Reset Migration Runner
 * Add password reset columns to users table
 */

require_once __DIR__ . '/../vendor/autoload.php';
$dotenv = \Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

echo "<h2>Password Reset Migration</h2>";
echo "<pre>";

$conn = new mysqli(
    $_ENV['DB_HOST'] ?? 'localhost',
    $_ENV['DB_USER'] ?? 'root',
    $_ENV['DB_PASSWORD'] ?? '',
    $_ENV['DB_NAME'] ?? 'multilingual_library'
);

if ($conn->connect_error) {
    die(json_encode(['error' => 'Connection failed: ' . $conn->connect_error], JSON_PRETTY_PRINT));
}

echo "Running password reset migration...\n\n";

$statements = [
    // Add password reset columns
    "ALTER TABLE `users` ADD COLUMN `password_reset_token` VARCHAR(255) NULL COMMENT 'Password reset verification code', ADD COLUMN `password_reset_expiry` DATETIME NULL COMMENT 'Password reset code expiry time'",

    // Add indexes
    "ALTER TABLE `users` ADD INDEX `idx_password_reset_token` (`password_reset_token`), ADD INDEX `idx_password_reset_expiry` (`password_reset_expiry`)"
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

$conn->close();

echo "========================================\n";
echo "MIGRATION COMPLETE\n";
echo "========================================\n";
echo "✓ Successful: $success\n";
echo "✗ Failed: $failed\n";

if ($failed === 0) {
    echo "\n✓ Password reset system successfully installed!\n";
    echo "\nNew features:\n";
    echo "- POST /api/auth/forgot-password\n";
    echo "- POST /api/auth/reset-password\n";
} else {
    echo "\n⚠ Some operations failed. Please check manually.\n";
}

echo "</pre>";
?>
