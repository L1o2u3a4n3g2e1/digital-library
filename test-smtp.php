<?php
/**
 * SMTP Diagnostic Test
 * Tests Gmail SMTP connection with current credentials
 */

require __DIR__ . '/vendor/autoload.php';

// Load environment variables
$dotenv = \Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->safeLoad();

echo "=== Gmail SMTP Connection Test ===\n\n";
echo "Host: " . getenv('MAIL_HOST') . "\n";
echo "Port: " . getenv('MAIL_PORT') . "\n";
echo "Username: " . getenv('MAIL_USERNAME') . "\n";
echo "Password: " . (getenv('MAIL_PASSWORD') ? '[SET - ' . strlen(getenv('MAIL_PASSWORD')) . ' chars]' : '[NOT SET]') . "\n";
echo "Encryption: tls\n\n";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$mail = new PHPMailer(true);

try {
    echo "Attempting SMTP connection...\n";

    $mail->isSMTP();
    $mail->Host = getenv('MAIL_HOST');
    $mail->SMTPAuth = true;
    $mail->Username = getenv('MAIL_USERNAME');
    $mail->Password = getenv('MAIL_PASSWORD');
    $mail->SMTPSecure = 'tls';
    $mail->Port = (int)getenv('MAIL_PORT');
    $mail->SMTPDebug = 2;
    $mail->Debugoutput = 'echo';

    $mail->smtpConnect();
    echo "\n✓ SMTP Connection SUCCESSFUL!\n";
    $mail->smtpClose();

} catch (Exception $e) {
    echo "\n✗ SMTP Connection FAILED!\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "\nTroubleshooting:\n";
    echo "1. Verify app password is correct (15+ characters with spaces)\n";
    echo "2. Ensure Gmail account has 2FA enabled\n";
    echo "3. Check if app password was generated in Gmail account settings\n";
    echo "4. Ensure .env MAIL_PASSWORD is properly formatted\n";
}
?>
