<?php
/**
 * Cookie System Verification Script
 * Checks if all files and database tables are in place
 */

echo "<h1>Cookie System Verification</h1>\n";
echo "<pre style='background: #f5f5f5; padding: 20px; font-family: monospace;'>\n";

$checks = [
    'Files' => [
        'backend/services/CookieService.php' => 'Cookie management service',
        'backend/services/PreferenceService.php' => 'User preferences service',
        'backend/controllers/PreferenceController.php' => 'Preferences API controller',
        'backend/helpers/csrf.php' => 'CSRF validation helper',
        'backend/migrate-cookies.php' => 'Migration runner',
        'database/migrations/002_add_cookie_system.sql' => 'Database migration',
    ],
    'Database Connection' => [],
    'Database Tables' => [
        'remember_me_tokens' => 'Remember-me token storage',
        'csrf_tokens' => 'CSRF token storage',
        'cookie_sessions' => 'Session tracking',
    ],
    'Database Columns' => [
        'users.preferences' => 'User preferences JSON',
        'users.updated_at' => 'Last update timestamp',
    ]
];

$passed = 0;
$failed = 0;
$total = 0;

// Check files
echo "═══════════════════════════════════════════\n";
echo "1. FILE CHECKS\n";
echo "═══════════════════════════════════════════\n";

foreach ($checks['Files'] as $file => $description) {
    $total++;
    if (file_exists($file)) {
        echo "✓ $file\n";
        echo "  → $description\n";
        $passed++;
    } else {
        echo "✗ $file (MISSING)\n";
        echo "  → $description\n";
        $failed++;
    }
}

// Check database
echo "\n═══════════════════════════════════════════\n";
echo "2. DATABASE CONNECTION\n";
echo "═══════════════════════════════════════════\n";

require_once __DIR__ . '/vendor/autoload.php';
$dotenv = \Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$dbHost = $_ENV['DB_HOST'] ?? 'localhost';
$dbUser = $_ENV['DB_USER'] ?? 'root';
$dbPass = $_ENV['DB_PASSWORD'] ?? '';
$dbName = $_ENV['DB_NAME'] ?? 'multilingual_library';

$conn = @new mysqli($dbHost, $dbUser, $dbPass, $dbName);

$total++;
if ($conn->connect_error) {
    echo "✗ Database Connection Failed\n";
    echo "  Error: " . $conn->connect_error . "\n";
    echo "  Host: $dbHost, User: $dbUser, Database: $dbName\n";
    $failed++;
    echo "\n" . str_repeat("─", 50) . "\n";
    echo "Please ensure MySQL is running and credentials are correct.\n";
    echo "</pre></body></html>";
    exit;
} else {
    echo "✓ Database Connected\n";
    echo "  Host: $dbHost\n";
    echo "  Database: $dbName\n";
    $passed++;
}

// Check tables
echo "\n═══════════════════════════════════════════\n";
echo "3. DATABASE TABLES\n";
echo "═══════════════════════════════════════════\n";

foreach ($checks['Database Tables'] as $table => $description) {
    $total++;
    $result = $conn->query("SHOW TABLES LIKE '$table'");
    if ($result && $result->num_rows > 0) {
        echo "✓ Table: $table\n";
        echo "  → $description\n";
        $passed++;
    } else {
        echo "✗ Table: $table (NOT FOUND)\n";
        echo "  → $description\n";
        $failed++;
    }
}

// Check columns
echo "\n═══════════════════════════════════════════\n";
echo "4. DATABASE COLUMNS\n";
echo "═══════════════════════════════════════════\n";

foreach ($checks['Database Columns'] as $columnPath => $description) {
    $total++;
    list($table, $column) = explode('.', $columnPath);
    $result = $conn->query("SHOW COLUMNS FROM `$table` LIKE '$column'");
    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        echo "✓ Column: $columnPath\n";
        echo "  → $description\n";
        echo "  → Type: " . $row['Type'] . "\n";
        $passed++;
    } else {
        echo "✗ Column: $columnPath (NOT FOUND)\n";
        echo "  → $description\n";
        $failed++;
    }
}

// Check events
echo "\n═══════════════════════════════════════════\n";
echo "5. DATABASE EVENTS\n";
echo "═══════════════════════════════════════════\n";

$total++;
$result = $conn->query("SHOW EVENTS LIKE 'cleanup_expired_tokens'");
if ($result && $result->num_rows > 0) {
    echo "✓ Event: cleanup_expired_tokens\n";
    echo "  → Hourly cleanup of expired tokens\n";
    $passed++;
} else {
    echo "⚠ Event: cleanup_expired_tokens (Optional)\n";
    echo "  → Hourly cleanup not configured, but not required\n";
    // Don't count as failure, it's optional
}

// Summary
echo "\n═══════════════════════════════════════════\n";
echo "SUMMARY\n";
echo "═══════════════════════════════════════════\n";

$percentage = ($passed / $total) * 100;
echo "Passed: $passed/$total (" . round($percentage, 1) . "%)\n";
echo "Failed: $failed\n\n";

if ($failed === 0) {
    echo "✓ ALL CHECKS PASSED!\n";
    echo "\nThe cookie system is ready to use.\n";
    echo "\nNext steps:\n";
    echo "1. Access migration at: /backend/migrate-cookies.php\n";
    echo "2. Test login/preferences endpoints\n";
    echo "3. See COOKIE_SYSTEM_SETUP.md for documentation\n";
    echo "4. See COOKIE_SYSTEM_TEST.md for testing guide\n";
} else {
    echo "✗ SOME CHECKS FAILED\n";
    echo "\nPlease fix the issues above:\n";
    echo "1. Create missing files\n";
    echo "2. Run database migration\n";
    echo "3. Check database connection\n";
}

$conn->close();
?>
</pre>

<style>
body { font-family: Arial, sans-serif; margin: 20px; }
h1 { color: #333; }
pre {
    background: #f5f5f5;
    padding: 20px;
    border-radius: 8px;
    overflow-x: auto;
}
</style>
