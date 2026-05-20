<?php
require 'vendor/autoload.php';
$dotenv = \Dotenv\Dotenv::createImmutable('.');
$dotenv->load();

$conn = new mysqli(
    $_ENV['DB_HOST'] ?? 'localhost',
    $_ENV['DB_USER'] ?? 'root',
    $_ENV['DB_PASSWORD'] ?? '',
    $_ENV['DB_NAME'] ?? 'multilingual_library'
);

if ($conn->connect_error) {
    echo "Connection failed: " . $conn->connect_error;
    exit(1);
}

// Check if password_reset columns exist
$result = $conn->query('DESCRIBE users');
$columns = [];
while ($row = $result->fetch_assoc()) {
    $columns[$row['Field']] = $row['Type'];
}

if (isset($columns['password_reset_token'])) {
    echo "Password reset migration: ALREADY APPLIED\n";
} else {
    echo "Password reset migration: NOT APPLIED\n";
}

$conn->close();
