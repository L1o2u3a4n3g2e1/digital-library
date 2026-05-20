<?php
/**
 * Test SMS with Basic Authentication
 */

require_once __DIR__ . '/vendor/autoload.php';
$dotenv = \Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

echo "=== TESTING WITH BASIC AUTH ===\n";

$username = 'sandbox';  // For sandbox mode
$apiKey = $_ENV['AT_API_KEY'];
$phone = '+250782580868';
$message = 'Digital Library test code: 654321';

// For Africa's Talking: Basic auth uses username:apikey
$basicAuth = base64_encode($username . ':' . $apiKey);

echo "Username: $username\n";
echo "API Key (first 20 chars): " . substr($apiKey, 0, 20) . "...\n";
echo "Basic Auth (first 30 chars): " . substr($basicAuth, 0, 30) . "...\n\n";

$payload = [
    'username' => $username,
    'to' => $phone,
    'message' => $message,
];

$curl = curl_init('https://api.africastalking.com/version1/messaging');
curl_setopt_array($curl, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 20,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_HTTPHEADER => [
        'Accept: application/json',
        'Content-Type: application/x-www-form-urlencoded',
        'Authorization: Basic ' . $basicAuth,  // Basic auth format
    ],
    CURLOPT_POSTFIELDS => http_build_query($payload),
]);

$response = curl_exec($curl);
$statusCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
$curlError = curl_error($curl);
curl_close($curl);

echo "Status: $statusCode\n";
echo "cURL Error: " . ($curlError ?: 'None') . "\n\n";

if ($statusCode == 200 || $statusCode == 201) {
    echo "✅ SUCCESS! SMS API responded positively\n";
} else {
    echo "Response:\n";
    var_dump(json_decode($response, true));
}
?>
