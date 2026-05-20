<?php
/**
 * Simple SMTP Test
 * Directly reads .env and tests connection
 */

$envFile = __DIR__ . '/.env';
$env = [];

if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Skip comments
        if (strpos($line, '#') === 0) continue;

        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $env[trim($key)] = trim($value, ' "\'');
        }
    }
}

echo "=== Gmail SMTP Connection Test ===\n\n";
echo "Host: " . ($env['MAIL_HOST'] ?? 'NOT SET') . "\n";
echo "Port: " . ($env['MAIL_PORT'] ?? 'NOT SET') . "\n";
echo "Username: " . ($env['MAIL_USERNAME'] ?? 'NOT SET') . "\n";
echo "Password: " . (isset($env['MAIL_PASSWORD']) ? '[SET - ' . strlen($env['MAIL_PASSWORD']) . ' chars]' : '[NOT SET]') . "\n";
echo "Encryption: tls\n\n";

require __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$mail = new PHPMailer(true);

try {
    echo "Attempting SMTP connection...\n";

    $mail->isSMTP();
    $mail->Host = $env['MAIL_HOST'] ?? '';
    $mail->SMTPAuth = true;
    $mail->Username = $env['MAIL_USERNAME'] ?? '';
    $mail->Password = $env['MAIL_PASSWORD'] ?? '';
    $mail->SMTPSecure = 'tls';
    $mail->Port = (int)($env['MAIL_PORT'] ?? 587);
    $mail->SMTPDebug = 2;
    $mail->Debugoutput = 'echo';

    $mail->smtpConnect();
    echo "\n✓ SMTP Connection SUCCESSFUL!\n";
    $mail->smtpClose();

} catch (Exception $e) {
    echo "\n✗ SMTP Connection FAILED!\n";
    echo "Error: " . $e->getMessage() . "\n";
}
?>
