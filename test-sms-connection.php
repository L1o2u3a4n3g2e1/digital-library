<?php
/**
 * Detailed SMS Connection Test
 */

require_once __DIR__ . '/vendor/autoload.php';
$dotenv = \Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

echo "=== NETWORK & CURL DEBUG ===\n";

// Check if curl is available
if (!extension_loaded('curl')) {
    echo "❌ CURL extension is NOT loaded!\n";
    exit(1);
}
echo "✓ CURL extension is loaded\n";

// Test basic connectivity
echo "\n=== TESTING CONNECTIVITY ===\n";

$url = 'https://api.africastalking.com/version1/messaging';
echo "Testing connection to: $url\n";

$curl = curl_init($url);
curl_setopt_array($curl, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 20,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => 0,
    CURLOPT_VERBOSE => true,
    CURLOPT_STDERR => $stderr = fopen('php://memory', 'w'),
    CURLOPT_HTTPHEADER => [
        'Accept: application/json',
        'Content-Type: application/x-www-form-urlencoded',
        'apiKey: ' . ($_ENV['AT_API_KEY'] ?? ''),
    ],
    CURLOPT_POSTFIELDS => http_build_query([
        'username' => 'sandbox',
        'to' => '+250782580868',
        'message' => 'Test',
    ]),
]);

$response = curl_exec($curl);
$curlError = curl_error($curl);
$curlErrno = curl_errno($curl);
$statusCode = curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

curl_close($curl);

echo "\nCURL Error Number: $curlErrno\n";
echo "CURL Error Message: " . ($curlError ?: 'None') . "\n";
echo "HTTP Status Code: $httpCode\n";
echo "Response Code: $statusCode\n";
echo "\nResponse Body:\n";
echo ($response ?: 'Empty response') . "\n";

rewind($stderr);
$debugOutput = stream_get_contents($stderr);
fclose($stderr);

echo "\n=== VERBOSE OUTPUT ===\n";
echo $debugOutput . "\n";

// Also test if we can reach any external API
echo "\n=== TESTING BASIC INTERNET ===\n";
$testCurl = curl_init('https://jsonplaceholder.typicode.com/posts/1');
curl_setopt($testCurl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($testCurl, CURLOPT_TIMEOUT, 5);
curl_setopt($testCurl, CURLOPT_SSL_VERIFYPEER, false);
$testResp = curl_exec($testCurl);
$testErr = curl_error($testCurl);
curl_close($testCurl);

if ($testResp) {
    echo "✓ Can reach external APIs\n";
} else {
    echo "❌ Cannot reach external APIs: $testErr\n";
    echo "Your server might not have internet access!\n";
}
?>
