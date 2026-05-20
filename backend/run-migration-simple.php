<?php
/**
 * Simple Database Migration Runner
 * Executes SQL migration files directly
 */

// Load environment variables
require_once __DIR__ . '/../vendor/autoload.php';
$dotenv = \Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

echo "\n=====================================\n";
echo "   DATABASE MIGRATION RUNNER\n";
echo "=====================================\n\n";

// Get database credentials
$host = $_ENV['DB_HOST'] ?? 'localhost';
$user = $_ENV['DB_USER'] ?? 'root';
$password = $_ENV['DB_PASSWORD'] ?? '';
$database = $_ENV['DB_NAME'] ?? 'multilingual_library';

// Connect to database
$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) {
    echo "❌ Connection failed: " . $conn->connect_error . "\n";
    exit(1);
}

echo "✓ Connected to database: $database\n\n";

// Get migration file
$migrationFile = $argv[1] ?? __DIR__ . '/../database/migrations/001_add_registration_tables.sql';

if (!file_exists($migrationFile)) {
    echo "❌ Migration file not found: $migrationFile\n";
    exit(1);
}

echo "Executing migration: " . basename($migrationFile) . "\n\n";

// Read and execute the SQL file
$sql = file_get_contents($migrationFile);

// Use multi-query to execute all statements
if ($conn->multi_query($sql)) {
    $success = true;
    $count = 0;

    do {
        $count++;
        if ($result = $conn->store_result()) {
            while ($row = $result->fetch_assoc()) {
                // Display results if any
            }
            $result->free();
        } else {
            // Statement executed successfully
        }

        if ($conn->more_results()) {
            $conn->next_result();
        } else {
            break;
        }
    } while (true);

    echo "✓ Successfully executed migration\n\n";
} else {
    echo "❌ Migration failed: " . $conn->error . "\n";
    exit(1);
}

// Verify results
echo "=====================================\n";
echo "   VERIFICATION\n";
echo "=====================================\n\n";

echo "New tables created:\n";
$tables = ['notification_preferences', 'email_logs', 'sms_logs'];
foreach ($tables as $table) {
    $result = $conn->query("SHOW TABLES LIKE '$table'");
    if ($result && $result->num_rows > 0) {
        echo "  ✓ $table\n";
    } else {
        echo "  ❌ $table - NOT FOUND\n";
    }
}

echo "\nUsers table columns:\n";
$result = $conn->query("DESC users");
$columns = [];
while ($row = $result->fetch_assoc()) {
    $columns[] = $row['Field'];
}

$newColumns = [
    'phone_number', 'is_guest', 'is_verified',
    'verification_token', 'verification_token_expiry', 'last_login'
];

foreach ($newColumns as $col) {
    if (in_array($col, $columns)) {
        echo "  ✓ $col\n";
    } else {
        echo "  ❌ $col\n";
    }
}

echo "\n✓ MIGRATION COMPLETED!\n\n";

$conn->close();
?>
