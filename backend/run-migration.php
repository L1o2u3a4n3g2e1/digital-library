<?php
/**
 * Database Migration Runner
 * Executes SQL migration files
 */

// Load environment variables
require_once __DIR__ . '/../vendor/autoload.php';
$dotenv = \Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

echo "=====================================\n";
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

// Get migration file from command line or use default
$migrationFile = $argv[1] ?? __DIR__ . '/../database/migrations/001_add_registration_tables.sql';

if (!file_exists($migrationFile)) {
    echo "❌ Migration file not found: $migrationFile\n";
    exit(1);
}

echo "Running migration: " . basename($migrationFile) . "\n";
echo "File: $migrationFile\n\n";

// Read SQL file
$sql = file_get_contents($migrationFile);

// Split by semicolon to handle multiple statements
$statements = array_filter(
    array_map('trim', preg_split('/;(?=\s|$)/', $sql)),
    fn($s) => !empty($s) && !str_starts_with(trim($s), '--')
);

$successCount = 0;
$errorCount = 0;

echo "Executing " . count($statements) . " SQL statements:\n\n";

foreach ($statements as $index => $statement) {
    $statement = trim($statement);

    if (empty($statement)) {
        continue;
    }

    // Show what we're executing
    $shortStatement = substr($statement, 0, 60) . (strlen($statement) > 60 ? '...' : '');
    echo ($index + 1) . ". " . $shortStatement . "\n";

    // Execute statement
    if ($conn->query($statement)) {
        echo "   ✓ Success\n";
        $successCount++;
    } else {
        echo "   ❌ Error: " . $conn->error . "\n";
        $errorCount++;
    }
}

echo "\n=====================================\n";
echo "MIGRATION SUMMARY\n";
echo "=====================================\n";
echo "✓ Successful: $successCount\n";
echo "❌ Failed: $errorCount\n";

if ($errorCount === 0) {
    echo "\n✓ MIGRATION COMPLETED SUCCESSFULLY!\n";
} else {
    echo "\n❌ MIGRATION COMPLETED WITH ERRORS\n";
    exit(1);
}

echo "\n=====================================\n";
echo "VERIFICATION\n";
echo "=====================================\n";

// Verify new tables exist
$tables = [
    'notification_preferences' => 'Notification preferences',
    'email_logs' => 'Email delivery logs',
    'sms_logs' => 'SMS delivery logs'
];

echo "\nNew tables created:\n";
foreach ($tables as $table => $description) {
    $result = $conn->query("SHOW TABLES LIKE '$table'");
    if ($result->num_rows > 0) {
        echo "  ✓ $table - $description\n";
    } else {
        echo "  ❌ $table - NOT FOUND\n";
    }
}

// Verify users table was altered
echo "\nUsers table modifications:\n";

$result = $conn->query("DESC users");
$columns = [];
while ($row = $result->fetch_assoc()) {
    $columns[] = $row['Field'];
}

$newColumns = [
    'phone_number' => 'Phone number field',
    'is_guest' => 'Guest flag',
    'is_verified' => 'Verification status',
    'verification_token' => 'Verification token',
    'verification_token_expiry' => 'Token expiry time',
    'last_login' => 'Last login timestamp'
];

foreach ($newColumns as $col => $desc) {
    if (in_array($col, $columns)) {
        echo "  ✓ $col - $desc\n";
    } else {
        echo "  ❌ $col - NOT FOUND\n";
    }
}

echo "\n✓ Migration verification complete!\n\n";

$conn->close();
?>
