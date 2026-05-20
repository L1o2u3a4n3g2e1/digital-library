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
    die("Connection error: " . $conn->connect_error);
}

echo "Users table columns:\n";
$result = $conn->query("DESCRIBE users");
while ($row = $result->fetch_assoc()) {
    echo "  " . $row['Field'] . " (" . $row['Type'] . ")\n";
}

$conn->close();
?>
