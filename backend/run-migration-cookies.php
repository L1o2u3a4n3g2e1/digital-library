<?php
/**
 * Cookie System Migration Runner
 * Executes the cookie system migration
 */

// Load environment variables
require_once __DIR__ . '/../vendor/autoload.php';
$dotenv = \Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

echo "=====================================\n";
echo "   COOKIE SYSTEM MIGRATION\n";
echo "=====================================\n\n";

// Load database class
require_once __DIR__ . '/config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();

    echo "✓ Connected to database\n\n";

    // Read migration file
    $migrationFile = __DIR__ . '/../database/migrations/002_add_cookie_system.sql';
    $sql = file_get_contents($migrationFile);

    // Split by semicolon
    $statements = array_filter(
        array_map('trim', preg_split('/;(?=\s|$)/', $sql)),
        fn($s) => !empty($s) && !str_starts_with(trim($s), '--')
    );

    echo "Running " . count($statements) . " migration statements...\n\n";

    $successCount = 0;
    $errorCount = 0;

    foreach ($statements as $i => $statement) {
        if (empty(trim($statement))) continue;

        $statement = trim($statement);
        $shortStatement = strlen($statement) > 60 ? substr($statement, 0, 60) . '...' : $statement;

        if ($conn->multi_query($statement)) {
            // Process results
            do {
                if ($result = $conn->store_result()) {
                    $result->free();
                }
            } while ($conn->more_results() && $conn->next_result());

            echo "✓ Statement " . ($i + 1) . ": " . $shortStatement . "\n";
            $successCount++;
        } else {
            echo "✗ Statement " . ($i + 1) . " failed:\n";
            echo "  Error: " . $conn->error . "\n";
            echo "  Query: " . $shortStatement . "\n\n";
            $errorCount++;
        }
    }

    echo "\n=====================================\n";
    echo "MIGRATION RESULTS\n";
    echo "=====================================\n";
    echo "✓ Successful: $successCount\n";
    echo "✗ Failed: $errorCount\n\n";

    if ($errorCount === 0) {
        echo "✓ Cookie system migration completed successfully!\n";
        echo "\nNew tables created:\n";
        echo "  - remember_me_tokens\n";
        echo "  - csrf_tokens\n";
        echo "  - cookie_sessions\n";
        echo "\nNew columns added to users:\n";
        echo "  - preferences (JSON)\n";
        echo "  - updated_at (TIMESTAMP)\n";
        echo "\nCleanup event created to remove expired tokens hourly\n";
    } else {
        echo "⚠ Some statements failed. Check database for partial changes.\n";
        exit(1);
    }

    $db->close();

} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n";
?>
