<?php
/**
 * Test SMS with correct Africa's Talking format
 */

require_once __DIR__ . '/vendor/autoload.php';
$dotenv = \Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

echo "=== TESTING CORRECTED SMS ===\n";

$apiKey = $_ENV['AT_API_KEY'];
$phone = '+250782580868';
$message = 'Digital Library test code: 123456';

$payload = [
    'username' => 'sandbox',
    'to' => $phone,
    'message' => $message,
];

echo "Payload: " . json_encode($payload) . "\n";
echo "API Key (first 20 chars): " . substr($apiKey, 0, 20) . "...\n\n";

// Test with Authorization header instead
$curl = curl_init('https://api.africastalking.com/version1/messaging');
curl_setopt_array($curl, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 20,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_HTTPHEADER => [
        'Accept: application/json',
        'Content-Type: application/x-www-form-urlencoded',
        'Authorization: Bearer ' . $apiKey,  // Try Bearer token format
    ],
    CURLOPT_POSTFIELDS => http_build_query($payload),
    CURLOPT_VERBOSE => true,
]);

$response = curl_exec($curl);
$statusCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);

echo "Status: $statusCode\n";
echo "Response:\n";
echo json_encode(json_decode($response, true), JSON_PRETTY_PRINT) . "\n";

// Also try the apiKey format from SmsService
echo "\n=== TESTING WITH apiKey HEADER ===\n";

$curl2 = curl_init('https://api.africastalking.com/version1/messaging');
curl_setopt_array($curl2, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 20,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_HTTPHEADER => [
        'Accept: application/json',
        'Content-Type: application/x-www-form-urlencoded',
        'apiKey: ' . $apiKey,  // Original format
    ],
    CURLOPT_POSTFIELDS => http_build_query($payload),
]);

$response2 = curl_exec($curl2);
$statusCode2 = curl_getinfo($curl2, CURLINFO_HTTP_CODE);
curl_close($curl2);

echo "Status: $statusCode2\n";
echo "Response:\n";
echo json_encode(json_decode($response2, true), JSON_PRETTY_PRINT) . "\n";
?>
