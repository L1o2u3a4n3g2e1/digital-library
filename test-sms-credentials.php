<?php
/**
 * Test SMS Credentials
 */

require_once __DIR__ . '/vendor/autoload.php';
$dotenv = \Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

echo "=== SMS CONFIGURATION DEBUG ===\n";
echo "SMS_PROVIDER: " . ($_ENV['SMS_PROVIDER'] ?? 'NOT SET') . "\n";
echo "AT_ENV: " . ($_ENV['AT_ENV'] ?? 'NOT SET') . "\n";
echo "AT_USERNAME: " . ($_ENV['AT_USERNAME'] ?? 'NOT SET') . "\n";
echo "AT_API_KEY: " . (empty($_ENV['AT_API_KEY']) ? 'EMPTY' : substr($_ENV['AT_API_KEY'], 0, 20) . '...') . "\n";
echo "AT_API_KEY LENGTH: " . strlen($_ENV['AT_API_KEY'] ?? '') . "\n";
echo "AT_SENDER_ID: " . ($_ENV['AT_SENDER_ID'] ?? 'NOT SET') . "\n";
echo "APP_ENV: " . ($_ENV['APP_ENV'] ?? 'NOT SET') . "\n";

// Test Africa's Talking API
if (!empty($_ENV['AT_API_KEY'])) {
    echo "\n=== TESTING AFRICA'S TALKING API ===\n";

    $username = 'sandbox';
    $apiKey = $_ENV['AT_API_KEY'];
    $phone = '+250782580868';
    $message = 'Test message from Digital Library';

    $payload = [
        'username' => $username,
        'to' => $phone,
        'message' => $message,
    ];

    echo "Sending to: $phone\n";
    echo "Message: $message\n";

    $curl = curl_init('https://api.africastalking.com/version1/messaging');
    curl_setopt_array($curl, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_HTTPHEADER => [
            'Accept: application/json',
            'Content-Type: application/x-www-form-urlencoded',
            'apiKey: ' . $apiKey,
        ],
        CURLOPT_POSTFIELDS => http_build_query($payload),
    ]);

    $responseBody = curl_exec($curl);
    $statusCode = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
    curl_close($curl);

    echo "\nResponse Status: $statusCode\n";
    echo "Response Body:\n";
    echo json_encode(json_decode($responseBody, true), JSON_PRETTY_PRINT);
}
?>
