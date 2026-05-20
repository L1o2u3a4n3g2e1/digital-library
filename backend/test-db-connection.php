<?php
/**
 * Database Connection Test Script
 * Tests connection to MySQL via MySQLi
 */

// Load environment variables
require_once __DIR__ . '/../vendor/autoload.php';
$dotenv = \Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

echo "=====================================\n";
echo "   DATABASE CONNECTION TEST\n";
echo "=====================================\n\n";

// Get credentials from .env
$host = $_ENV['DB_HOST'] ?? 'localhost';
$user = $_ENV['DB_USER'] ?? 'root';
$password = $_ENV['DB_PASSWORD'] ?? '';
$database = $_ENV['DB_NAME'] ?? 'multilingual_library';

echo "Attempting to connect to:\n";
echo "  Host:     $host\n";
echo "  User:     $user\n";
echo "  Database: $database\n\n";

// Test connection
$conn = new mysqli($host, $user, $password);

if ($conn->connect_error) {
    echo "❌ CONNECTION FAILED\n";
    echo "Error: " . $conn->connect_error . "\n";
    exit(1);
}

echo "✓ Connected to MySQL Server\n\n";

// Check if database exists
$result = $conn->query("SHOW DATABASES LIKE '$database'");

if ($result->num_rows == 0) {
    echo "⚠️  Database '$database' does not exist\n";
    echo "Creating database...\n\n";

    if ($conn->query("CREATE DATABASE IF NOT EXISTS `$database` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")) {
        echo "✓ Database created successfully\n\n";
    } else {
        echo "❌ Failed to create database: " . $conn->error . "\n";
        exit(1);
    }
} else {
    echo "✓ Database '$database' exists\n\n";
}

// Select database
if (!$conn->select_db($database)) {
    echo "❌ Failed to select database: " . $conn->error . "\n";
    exit(1);
}

echo "✓ Selected database: $database\n\n";

// Check tables
echo "Checking existing tables:\n";
$result = $conn->query("SHOW TABLES");

if ($result->num_rows == 0) {
    echo "⚠️  No tables found in database\n";
    echo "You need to import: multilingual_library_schema.sql\n";
} else {
    echo "✓ Found " . $result->num_rows . " tables:\n";
    while ($row = $result->fetch_array()) {
        echo "  - " . $row[0] . "\n";
    }
}

echo "\n=====================================\n";
echo "  ✓ DATABASE CONNECTION SUCCESSFUL\n";
echo "=====================================\n";

// Check specific tables we need
echo "\nChecking new tables for registration system:\n";

$tables_to_check = [
    'users' => 'User accounts',
    'notification_preferences' => 'Notification settings',
    'email_logs' => 'Email delivery logs',
    'sms_logs' => 'SMS delivery logs'
];

foreach ($tables_to_check as $table => $description) {
    $result = $conn->query("SHOW TABLES LIKE '$table'");
    if ($result->num_rows > 0) {
        echo "  ✓ $table - $description\n";
    } else {
        echo "  ⚠️  $table - NOT FOUND (needs migration)\n";
    }
}

echo "\n";

// Close connection
$conn->close();

echo "✓ Connection test complete!\n";
echo "\nNext steps:\n";
echo "1. If tables are missing, run the migration SQL scripts\n";
echo "2. Update your frontend to call the API endpoints\n";
echo "3. Start the PHP server: php -S localhost:8000 backend/index.php\n";
?>
