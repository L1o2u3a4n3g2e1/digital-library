<?php
/**
 * Email Service
 * Handles sending emails via Gmail SMTP using PHPMailer
 */

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class EmailService {
    private $mail;
    private $config;

    public function __construct() {
        $this->config = require __DIR__ . '/../config/email.php';
        $this->initializeMail();
    }

    /**
     * Initialize PHPMailer with Gmail configuration
     */
    private function initializeMail() {
        $this->mail = new PHPMailer(true);

        try {
            // Server settings
            $this->mail->isSMTP();
            $this->mail->Host = $this->config['host'];
            $this->mail->SMTPAuth = true;
            $this->mail->Username = $this->config['username'];
            $this->mail->Password = $this->config['password'];
            $this->mail->SMTPSecure = $this->config['encryption'];
            $this->mail->Port = $this->config['port'];
            $this->mail->CharSet = 'UTF-8';
            $this->mail->Encoding = 'base64';

            // Default sender
            $this->mail->setFrom($this->config['from'], $this->config['from_name']);

            // Set debug level (disabled in production)
            $this->mail->SMTPDebug = 0;
            // Enable debug output to file if needed
            // $this->mail->Debugoutput = 'error_log';
        } catch (Exception $e) {
            Logger::error("PHPMailer initialization failed: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Send verification email with code
     */
    public function sendVerificationEmail($email, $userName, $verificationCode) {
        try {
            // Clear previous recipients
            $this->mail->clearAllRecipients();

            // Set recipient
            $this->mail->addAddress($email, $userName);

            // Set subject and body
            $this->mail->isHTML(true);
            $this->mail->Subject = 'Verify Your Email - Digital Library';

            // Create HTML body
            $body = $this->getVerificationEmailTemplate($userName, $verificationCode);
            $this->mail->Body = $body;
            $this->mail->AltBody = "Your verification code is: $verificationCode";

            // Send email
            if ($this->mail->send()) {
                $this->storeDevelopmentCopy('verification', $email, $this->mail->Subject, $verificationCode, 'sent');
                Logger::info("Verification email sent to: $email");
                return [
                    'success' => true,
                    'message' => 'Verification email sent',
                    'email' => $email
                ];
            } else {
                $this->storeDevelopmentCopy('verification', $email, $this->mail->Subject, $verificationCode, 'failed', $this->mail->ErrorInfo);
                Logger::error("Failed to send verification email to: $email", ['error' => $this->mail->ErrorInfo]);
                return [
                    'success' => false,
                    'message' => 'Failed to send email',
                    'error' => $this->mail->ErrorInfo
                ];
            }
        } catch (Exception $e) {
            $this->storeDevelopmentCopy('verification', $email, 'Verify Your Email - Digital Library', $verificationCode, 'failed', $e->getMessage());
            Logger::error("Exception in sendVerificationEmail: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Email sending error',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Send welcome email after verification
     */
    public function sendWelcomeEmail($email, $userName) {
        try {
            $this->mail->clearAllRecipients();
            $this->mail->addAddress($email, $userName);

            $this->mail->isHTML(true);
            $this->mail->Subject = 'Welcome to Digital Library!';

            $body = $this->getWelcomeEmailTemplate($userName);
            $this->mail->Body = $body;
            $this->mail->AltBody = "Welcome to Digital Library, $userName! Your account is now active.";

            if ($this->mail->send()) {
                $this->storeDevelopmentCopy('welcome', $email, $this->mail->Subject, null, 'sent');
                Logger::info("Welcome email sent to: $email");
                return ['success' => true, 'message' => 'Welcome email sent'];
            } else {
                $this->storeDevelopmentCopy('welcome', $email, $this->mail->Subject, null, 'failed', $this->mail->ErrorInfo);
                Logger::error("Failed to send welcome email to: $email");
                return ['success' => false, 'message' => 'Failed to send welcome email'];
            }
        } catch (Exception $e) {
            $this->storeDevelopmentCopy('welcome', $email, 'Welcome to Digital Library!', null, 'failed', $e->getMessage());
            Logger::error("Exception in sendWelcomeEmail: " . $e->getMessage());
            return ['success' => false, 'message' => 'Email sending error'];
        }
    }

    private function storeDevelopmentCopy($type, $recipient, $subject, $referenceValue, $status, $error = null) {
        if (($this->config['debug'] ?? false) || (($_ENV['APP_ENV'] ?? 'production') === 'development')) {
            $logDir = __DIR__ . '/../../logs';
            if (!is_dir($logDir)) {
                mkdir($logDir, 0755, true);
            }

            $entry = [
                'timestamp' => date('c'),
                'type' => $type,
                'recipient' => $recipient,
                'subject' => $subject,
                'status' => $status,
            ];

            if ($referenceValue !== null) {
                $entry['reference'] = $referenceValue;
            }

            if ($error) {
                $entry['error'] = $error;
            }

            file_put_contents($logDir . '/email-outbox.log', json_encode($entry, JSON_UNESCAPED_SLASHES) . PHP_EOL, FILE_APPEND);
        }
    }

    /**
     * Verification email HTML template
     */
    private function getVerificationEmailTemplate($userName, $code) {
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <style>
                body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { padding: 20px; }
                .code-box { background: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
                .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
                .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999; border-radius: 0 0 8px 8px; }
                .button { background: #667eea; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; display: inline-block; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>📚 Digital Library</h1>
                    <p>Verify Your Email Address</p>
                </div>
                <div class='content'>
                    <p>Hi <strong>$userName</strong>,</p>
                    <p>Welcome to Digital Library! To complete your registration, please verify your email address by entering the code below:</p>
                    <div class='code-box'>
                        <div class='code'>$code</div>
                    </div>
                    <p>This code will expire in 15 minutes.</p>
                    <p>If you did not create this account, please ignore this email.</p>
                    <p>
                        <strong>Happy reading!</strong><br>
                        The Digital Library Team
                    </p>
                </div>
                <div class='footer'>
                    <p>&copy; 2026 Digital Library. All rights reserved.</p>
                    <p>This is an automated message, please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
        ";
    }

    /**
     * Welcome email HTML template
     */
    private function getWelcomeEmailTemplate($userName) {
        $frontendUrl = $_ENV['FRONTEND_URL'] ?? 'http://localhost:3000';
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <style>
                body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { padding: 20px; }
                .feature-list { list-style: none; padding: 0; }
                .feature-list li { padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
                .feature-list li:before { content: '✓ '; color: #667eea; font-weight: bold; }
                .button { background: #667eea; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; display: inline-block; margin: 20px 0; }
                .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999; border-radius: 0 0 8px 8px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>📚 Digital Library</h1>
                    <p>Welcome Aboard!</p>
                </div>
                <div class='content'>
                    <p>Hi <strong>$userName</strong>,</p>
                    <p>Your email has been verified successfully! Your Digital Library account is now active.</p>
                    <p><strong>What you can do now:</strong></p>
                    <ul class='feature-list'>
                        <li>Browse thousands of digital books</li>
                        <li>Listen to audiobooks in multiple languages</li>
                        <li>Save your favorite books</li>
                        <li>Use voice navigation</li>
                        <li>Get personalized recommendations</li>
                    </ul>
                    <p>
                        <a href='$frontendUrl/dashboard' class='button'>Get Started</a>
                    </p>
                    <p>If you have any questions, please don't hesitate to reach out!</p>
                    <p>
                        <strong>Happy reading!</strong><br>
                        The Digital Library Team
                    </p>
                </div>
                <div class='footer'>
                    <p>&copy; 2026 Digital Library. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        ";
    }

    /**
     * Send password reset email with code
     */
    public function sendPasswordResetEmail($email, $userName, $resetCode) {
        try {
            // Clear previous recipients
            $this->mail->clearAllRecipients();

            // Set recipient
            $this->mail->addAddress($email, $userName);

            // Set subject and body
            $this->mail->isHTML(true);
            $this->mail->Subject = 'Password Reset - Digital Library';

            // Create reset link
            $frontendUrl = $_ENV['FRONTEND_URL'] ?? 'http://localhost:3000';
            $resetLink = $frontendUrl . '/reset-password?email=' . urlencode($email) . '&code=' . urlencode($resetCode);

            // Create HTML body
            $body = $this->getPasswordResetEmailTemplate($userName, $resetLink);
            $this->mail->Body = $body;
            $this->mail->AltBody = "Click here to reset your password: $resetLink";

            // Send email
            if ($this->mail->send()) {
                $this->storeDevelopmentCopy('password_reset', $email, $this->mail->Subject, $resetLink, 'sent');
                Logger::info("Password reset email sent to: $email");
                return [
                    'success' => true,
                    'message' => 'Password reset email sent',
                    'email' => $email
                ];
            } else {
                $this->storeDevelopmentCopy('password_reset', $email, $this->mail->Subject, $resetLink, 'failed', $this->mail->ErrorInfo);
                Logger::warning("Password reset email failed to: $email - " . $this->mail->ErrorInfo);
                return [
                    'success' => false,
                    'message' => 'Failed to send password reset email',
                    'error' => $this->mail->ErrorInfo,
                    'email' => $email
                ];
            }
        } catch (Exception $e) {
            Logger::error("Exception in sendPasswordResetEmail: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Email service error',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Password reset email HTML template
     */
    private function getPasswordResetEmailTemplate($userName, $resetLink) {
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <style>
                body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
                .header { background: #f44336; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { padding: 20px; }
                .button { background: #667eea; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; display: inline-block; margin: 20px 0; }
                .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999; border-radius: 0 0 8px 8px; }
                .warning { background: #ffe0e0; border-left: 4px solid #f44336; padding: 10px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>🔐 Password Reset Request</h1>
                </div>
                <div class='content'>
                    <p>Hi <strong>$userName</strong>,</p>
                    <p>We received a request to reset your password. Click the button below to create a new password:</p>
                    <p>
                        <a href='$resetLink' class='button'>Reset Password</a>
                    </p>
                    <p>Or copy this link: <code>$resetLink</code></p>
                    <div class='warning'>
                        <strong>⚠️ Important:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
                    </div>
                    <p>For security reasons, we never ask for your password via email.</p>
                    <p>
                        The Digital Library Team
                    </p>
                </div>
                <div class='footer'>
                    <p>&copy; 2026 Digital Library. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        ";
    }
}
?>
