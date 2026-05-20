<?php
/**
 * Test different Africa's Talking API authentication formats
 */

require_once __DIR__ . '/vendor/autoload.php';
$dotenv = \Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$apiKey = $_ENV['AT_API_KEY'];
$phone = '+250782580868';
$message = 'Test SMS';

$payload = [
    'username' => 'sandbox',
    'to' => $phone,
    'message' => $message,
];

$tests = [
    [
        'name' => 'Header: X-API-Key',
        'headers' => [
            'Accept: application/json',
            'Content-Type: application/x-www-form-urlencoded',
            'X-API-Key: ' . $apiKey,
        ]
    ],
    [
        'name' => 'Header: api-key (lowercase)',
        'headers' => [
            'Accept: application/json',
            'Content-Type: application/x-www-form-urlencoded',
            'api-key: ' . $apiKey,
        ]
    ],
    [
        'name' => 'Header: Accept header only',
        'headers' => [
            'Accept: application/json',
            'Content-Type: application/x-www-form-urlencoded',
        ],
        'usernameInPayload' => true
    ],
];

foreach ($tests as $test) {
    echo "\n" . str_repeat("=", 60) . "\n";
    echo "Testing: {$test['name']}\n";
    echo str_repeat("=", 60) . "\n";

    $curl = curl_init('https://api.africastalking.com/version1/messaging');

    $headers = $test['headers'];
    if ($test['usernameInPayload'] ?? false) {
        // Keep payload as is
    }

    curl_setopt_array($curl, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_POSTFIELDS => http_build_query($payload),
    ]);

    $response = curl_exec($curl);
    $statusCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);

    echo "Status: $statusCode\n";

    if ($statusCode == 200 || $statusCode == 201) {
        echo "✅ SUCCESS!\n";
        echo "Response: " . json_encode(json_decode($response, true), JSON_PRETTY_PRINT) . "\n";
        break;
    } else {
        echo "Response: " . ($response ?: 'Empty') . "\n";
    }
}

echo "\n⚠️  If none of the above worked, the API key might be invalid.\n";
echo "Please verify your API key from: https://africastalking.com/app/settings/api\n";
?>
