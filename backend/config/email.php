<?php
/**
 * Email Configuration
 * Gmail SMTP Setup for PHPMailer
 */

return [
    'host' => $_ENV['MAIL_HOST'] ?? 'smtp.gmail.com',
    'port' => $_ENV['MAIL_PORT'] ?? 587,
    'username' => $_ENV['MAIL_USERNAME'] ?? 'your-email@gmail.com',
    'password' => $_ENV['MAIL_PASSWORD'] ?? 'your-app-password',
    'from' => $_ENV['MAIL_FROM'] ?? 'noreply@digitallibrary.com',
    'from_name' => $_ENV['MAIL_FROM_NAME'] ?? 'Digital Library',
    'encryption' => 'tls', // PHPMailer::ENCRYPTION_STARTTLS
    'debug' => $_ENV['APP_DEBUG'] ?? false,
];
?>
