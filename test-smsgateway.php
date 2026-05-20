<?php
/**
 * Test SMS Gateway Integration
 */

require_once __DIR__ . '/vendor/autoload.php';
$dotenv = \Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

echo "=== SMS GATEWAY TEST ===\n";
echo "Provider: " . ($_ENV['SMS_PROVIDER'] ?? 'NOT SET') . "\n";
echo "API Key: " . (empty($_ENV['SMSGATEWAY_API_KEY']) ? 'EMPTY' : substr($_ENV['SMSGATEWAY_API_KEY'], 0, 20) . '...') . "\n\n";

$apiKey = $_ENV['SMSGATEWAY_API_KEY'] ?? '';
$phone = '+250782580868';
$message = 'Digital Library verification code: 123456';

if (empty($apiKey)) {
    echo "❌ API Key is not set!\n";
    exit(1);
}

echo "Testing SMS Gateway API...\n";
echo "Phone: $phone\n";
echo "Message: $message\n\n";

$payload = [
    'phone_number' => $phone,
    'message' => $message,
];

$curl = curl_init('https://smsgateway.me/api/send');
curl_setopt_array($curl, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 20,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => 0,
    CURLOPT_HTTPHEADER => [
        'Accept: application/json',
        'Content-Type: application/json',
    ],
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_USERPWD => $apiKey . ':',
]);

$response = curl_exec($curl);
$statusCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
$curlError = curl_error($curl);
curl_close($curl);

echo "Status Code: $statusCode\n";

if ($curlError) {
    echo "cURL Error: $curlError\n";
} else {
    echo "✓ cURL request successful\n";
}

echo "\nResponse:\n";
$decoded = json_decode($response, true);
echo json_encode($decoded, JSON_PRETTY_PRINT) . "\n";

if ($statusCode === 200 || $statusCode === 201) {
    echo "\n✅ SUCCESS! SMS Gateway is working!\n";
} elseif ($statusCode === 400 || $statusCode === 401) {
    echo "\n❌ Authentication failed. Check your API key.\n";
} else {
    echo "\n⚠️  Unexpected response. Check the error above.\n";
}
?>
