<?php
/**
 * Auth Service
 * Business logic for authentication and registration
 */

class AuthService {
    private $userModel;
    private $emailService;
    private $tokenService;
    private $cookieService;
    private $preferenceService;
    private $smsService;
    private $conn;

    public function __construct($database) {
        require_once __DIR__ . '/../models/User.php';
        require_once __DIR__ . '/EmailService.php';
        require_once __DIR__ . '/TokenService.php';
        require_once __DIR__ . '/CookieService.php';
        require_once __DIR__ . '/PreferenceService.php';
        require_once __DIR__ . '/SmsService.php';

        $this->conn = $database->getConnection();
        $this->userModel = new User($database);
        $this->emailService = new EmailService();
        $this->tokenService = new TokenService();
        $this->cookieService = new CookieService();
        $this->preferenceService = new PreferenceService($database);
        $this->smsService = new SmsService($database);
    }

    private function isDevelopment() {
        return ($_ENV['APP_ENV'] ?? 'production') === 'development';
    }

    private function buildVerificationPayload($emailResult, $code, $codeExpiry) {
        $payload = [
            'next_step' => 'verify_email',
            'email_delivery' => $emailResult['success'] ? 'sent' : 'failed',
        ];

        if ($this->isDevelopment()) {
            $payload['verification_code'] = $code;
            $payload['verification_expires_at'] = $codeExpiry;
        }

        if (!$emailResult['success']) {
            $payload['email_error'] = $emailResult['error'] ?? $emailResult['message'] ?? 'Email delivery failed';
        }

        return $payload;
    }

    private function normalizePhone($phone) {
        $trimmed = trim((string) $phone);
        $digits = preg_replace('/\D+/', '', $trimmed);

        if ($digits === '') {
            return '';
        }

        if (strpos($digits, '250') === 0) {
            return '+' . $digits;
        }

        if (strpos($digits, '0') === 0 && strlen($digits) === 10) {
            return '+250' . substr($digits, 1);
        }

        if (strlen($digits) === 9) {
            return '+250' . $digits;
        }

        if (strpos($trimmed, '+') === 0) {
            return '+' . $digits;
        }

        return $trimmed;
    }

    private function isValidPhone($phone) {
        return (bool) preg_match('/^\+?[0-9]{9,15}$/', $phone);
    }

    private function buildGuestVerificationPayload($smsResult, $phone) {
        $payload = [
            'next_step' => 'verify_phone',
            'phone' => $phone,
            'sms_delivery' => $smsResult['delivery'] ?? ($smsResult['success'] ? 'sent' : 'failed'),
        ];

        if (!$smsResult['success']) {
            $payload['sms_error'] = $smsResult['error'] ?? $smsResult['message'] ?? 'SMS delivery failed';
        }

        return $payload;
    }

    private function guestVerificationMessage($deliveryMode, $resent = false) {
        if ($deliveryMode === 'live') {
            return $resent ? 'A new verification SMS has been sent to your phone.' : 'Guest sign-in started. Check your phone for the verification code.';
        }

        if ($deliveryMode === 'sandbox') {
            return $resent
                ? 'A new verification SMS was sent to the Africa\'s Talking sandbox simulator, not a real phone.'
                : 'Guest sign-in started. The current SMS provider is in sandbox mode, so the message goes to the simulator instead of your phone.';
        }

        if ($deliveryMode === 'simulated' || $deliveryMode === 'unconfigured') {
            return $resent
                ? 'Real SMS delivery is not configured on this server yet. The verification message was only simulated for development.'
                : 'Guest sign-in started, but real SMS delivery is not configured on this server yet. No phone message will arrive until live credentials are added.';
        }

        return $resent ? 'A new verification SMS has been prepared.' : 'Guest sign-in started. Check your phone for the verification code.';
    }

    private function issueGuestVerificationCode($userId, $phone) {
        $code = $this->tokenService->generateVerificationCode();
        $codeExpiry = $this->tokenService->getVerificationCodeExpiry();

        if (!$this->userModel->setVerificationToken($userId, $code, $codeExpiry)) {
            return [
                'success' => false,
                'message' => 'Failed to save phone verification code',
                'code' => 'TOKEN_SAVE_FAILED',
            ];
        }

        $smsResult = $this->smsService->sendGuestVerificationCode($userId, $phone, $code);

        if (!$smsResult['success']) {
            Logger::warning("SMS sending failed for guest user: $userId", [
                'phone' => $phone,
                'error' => $smsResult['error'] ?? null,
            ]);
        }

        return [
            'success' => true,
            'sms_sent' => $smsResult['success'],
            'payload' => $this->buildGuestVerificationPayload($smsResult, $phone),
        ];
    }

    private function issueVerificationCode($userId, $email, $name) {
        $code = $this->tokenService->generateVerificationCode();
        $codeExpiry = $this->tokenService->getVerificationCodeExpiry();

        if (!$this->userModel->setVerificationToken($userId, $code, $codeExpiry)) {
            return [
                'success' => false,
                'message' => 'Failed to save verification code',
                'code' => 'TOKEN_SAVE_FAILED'
            ];
        }

        $emailResult = $this->emailService->sendVerificationEmail($email, $name, $code);

        if (!$emailResult['success']) {
            Logger::warning("Email sending failed for user: $userId", [
                'email' => $email,
                'error' => $emailResult['error'] ?? null
            ]);
        }

        return [
            'success' => true,
            'email_sent' => $emailResult['success'],
            'payload' => $this->buildVerificationPayload($emailResult, $code, $codeExpiry),
        ];
    }

    /**
     * Register new user with email
     */
    public function register($name, $email, $password, $phone = null) {
        // Validate input
        if (empty($name) || empty($email) || empty($password)) {
            return [
                'success' => false,
                'message' => 'Name, email, and password are required',
                'code' => 'MISSING_FIELDS'
            ];
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return [
                'success' => false,
                'message' => 'Invalid email format',
                'code' => 'INVALID_EMAIL'
            ];
        }

        if (strlen($password) < 6) {
            return [
                'success' => false,
                'message' => 'Password must be at least 6 characters',
                'code' => 'WEAK_PASSWORD'
            ];
        }

        // Check if email exists
        if ($this->userModel->emailExists($email)) {
            return [
                'success' => false,
                'message' => 'Email already registered',
                'code' => 'EMAIL_EXISTS'
            ];
        }

        // Create user
        $createResult = $this->userModel->createUser($name, $email, $password, $phone);

        if (!$createResult['success']) {
            return $createResult;
        }

        $userId = $createResult['user_id'];

        $verificationResult = $this->issueVerificationCode($userId, $email, $name);

        if (!$verificationResult['success']) {
            return $verificationResult;
        }

        // Log activity
        $this->userModel->logActivity($userId, 'registration', ['email' => $email]);

        $message = $verificationResult['email_sent']
            ? 'Registration successful. Please check your email to verify.'
            : 'Registration successful. Email delivery failed, but the verification code is available for development testing.';

        return [
            'success' => true,
            'message' => $message,
            'data' => array_merge([
                'user_id' => $userId,
                'email' => $email,
            ], $verificationResult['payload'])
        ];
    }

    /**
     * Register guest user
     */
    public function registerGuest($phone) {
        $phone = $this->normalizePhone($phone);

        // Validate phone
        if (empty($phone)) {
            return [
                'success' => false,
                'message' => 'Phone number is required',
                'code' => 'MISSING_PHONE'
            ];
        }

        // Validate phone format (basic)
        if (!$this->isValidPhone($phone)) {
            return [
                'success' => false,
                'message' => 'Invalid phone format',
                'code' => 'INVALID_PHONE'
            ];
        }

        $user = $this->userModel->getUserByPhone($phone);

        if ($user && empty($user['is_guest'])) {
            return [
                'success' => false,
                'message' => 'This phone number is already linked to a full account',
                'code' => 'PHONE_LINKED_TO_ACCOUNT'
            ];
        }

        if (!$user) {
            $result = $this->userModel->createGuestUser($phone);

            if (!$result['success']) {
                return $result;
            }

            $userId = $result['user_id'];
        } else {
            $userId = $user['id'];
        }

        $verificationResult = $this->issueGuestVerificationCode($userId, $phone);

        if (!$verificationResult['success']) {
            return $verificationResult;
        }

        $this->userModel->logActivity($userId, 'guest_verification_requested', ['phone' => $phone]);

        return [
            'success' => true,
            'message' => $this->guestVerificationMessage($verificationResult['payload']['sms_delivery'] ?? null, false),
            'data' => array_merge([
                'user_id' => $userId,
                'user_type' => 'guest'
            ], $verificationResult['payload'])
        ];
    }

    public function verifyGuestPhone($phone, $code) {
        $phone = $this->normalizePhone($phone);

        if (empty($phone) || empty($code)) {
            return [
                'success' => false,
                'message' => 'Phone number and verification code are required',
                'code' => 'MISSING_FIELDS'
            ];
        }

        $user = $this->userModel->getUserByPhone($phone);

        if (!$user || empty($user['is_guest'])) {
            return [
                'success' => false,
                'message' => 'Guest user not found',
                'code' => 'USER_NOT_FOUND'
            ];
        }

        $verifyResult = $this->userModel->verifyGuestPhone($user['id'], $phone, $code);

        if (!$verifyResult['success']) {
            return $verifyResult;
        }

        $this->userModel->createNotificationPreferences($user['id']);
        $token = $this->tokenService->generateToken($user['id'], $phone, 'guest');
        $this->userModel->logActivity($user['id'], 'guest_phone_verified', ['phone' => $phone]);

        $freshUser = $this->userModel->getUserById($user['id']) ?? array_merge($user, ['is_verified' => 1]);

        $this->cookieService->setAuthCookie($token, 7);
        $csrfToken = $this->cookieService->generateCsrfToken();
        $this->cookieService->setCsrfCookie($csrfToken);

        try {
            $prefsForCookie = $this->preferenceService->getPreferencesForCookie($user['id']);
            if ($prefsForCookie) {
                $this->cookieService->setPreferenceCookie($prefsForCookie);
            }
        } catch (\Exception $e) {
            Logger::warning("Could not set preference cookie for guest: " . $e->getMessage());
        }

        return [
            'success' => true,
            'message' => 'Phone verified successfully',
            'data' => [
                'token' => $token,
                'user' => $this->userModel->getSafeUserData($freshUser)
            ]
        ];
    }

    public function resendGuestVerification($phone) {
        $phone = $this->normalizePhone($phone);

        if (empty($phone)) {
            return [
                'success' => false,
                'message' => 'Phone number is required',
                'code' => 'MISSING_PHONE'
            ];
        }

        $user = $this->userModel->getUserByPhone($phone);

        if (!$user || empty($user['is_guest'])) {
            return [
                'success' => false,
                'message' => 'Guest user not found',
                'code' => 'USER_NOT_FOUND'
            ];
        }

        $verificationResult = $this->issueGuestVerificationCode($user['id'], $phone);

        if (!$verificationResult['success']) {
            return $verificationResult;
        }

        $this->userModel->logActivity($user['id'], 'guest_verification_resent', ['phone' => $phone]);

        return [
            'success' => true,
            'message' => $this->guestVerificationMessage($verificationResult['payload']['sms_delivery'] ?? null, true),
            'data' => array_merge([
                'phone' => $phone,
            ], $verificationResult['payload'])
        ];
    }

    /**
     * Verify email with code
     */
    public function verifyEmail($email, $code) {
        if (empty($email) || empty($code)) {
            return [
                'success' => false,
                'message' => 'Email and verification code required',
                'code' => 'MISSING_FIELDS'
            ];
        }

        // Get user
        $user = $this->userModel->getUserByEmail($email);

        if (!$user) {
            return [
                'success' => false,
                'message' => 'User not found',
                'code' => 'USER_NOT_FOUND'
            ];
        }

        // Check if already verified
        if ($user['is_verified']) {
            return [
                'success' => false,
                'message' => 'Email already verified',
                'code' => 'ALREADY_VERIFIED'
            ];
        }

        // Verify token
        $verifyResult = $this->userModel->verifyEmail($user['id'], $code);

        if (!$verifyResult['success']) {
            return $verifyResult;
        }

        // Create notification preferences
        $this->userModel->createNotificationPreferences($user['id']);

        // Send welcome email
        $this->emailService->sendWelcomeEmail($email, $user['full_name']);

        // Generate token
        $token = $this->tokenService->generateToken($user['id'], $email, $user['role'] ?? 'client');

        // Log activity
        $this->userModel->logActivity($user['id'], 'email_verified');

        $freshUser = $this->userModel->getUserById($user['id']) ?? array_merge($user, ['is_verified' => 1]);

        // Set auth cookie
        $this->cookieService->setAuthCookie($token, 7);

        // Set CSRF token
        $csrfToken = $this->cookieService->generateCsrfToken();
        $this->cookieService->setCsrfCookie($csrfToken);

        // Set preferences cookie (optional - don't break on error)
        try {
            $prefsForCookie = $this->preferenceService->getPreferencesForCookie($user['id']);
            if ($prefsForCookie) {
                $this->cookieService->setPreferenceCookie($prefsForCookie);
            }
        } catch (\Exception $e) {
            Logger::warning("Could not set preference cookie: " . $e->getMessage());
        }

        return [
            'success' => true,
            'message' => 'Email verified successfully',
            'data' => [
                'token' => $token,
                'user' => $this->userModel->getSafeUserData($freshUser)
            ]
        ];
    }

    /**
     * Login user
     */
    public function login($email, $password, $rememberMe = false) {
        // Validate input
        if (empty($email) || empty($password)) {
            return [
                'success' => false,
                'message' => 'Email and password required',
                'code' => 'MISSING_FIELDS'
            ];
        }

        // Get user
        $user = $this->userModel->getUserByEmail($email);

        if (!$user) {
            Logger::warning("Login attempt with non-existent email: $email");
            return [
                'success' => false,
                'message' => 'Invalid email or password',
                'code' => 'INVALID_CREDENTIALS'
            ];
        }

        // Check if verified
        if (!$user['is_verified']) {
            return [
                'success' => false,
                'message' => 'Please verify your email first',
                'code' => 'EMAIL_NOT_VERIFIED'
            ];
        }

        // Verify password
        if (!$this->userModel->verifyPassword($password, $user['password'])) {
            Logger::warning("Failed login attempt for user: " . $user['id']);
            return [
                'success' => false,
                'message' => 'Invalid email or password',
                'code' => 'INVALID_CREDENTIALS'
            ];
        }

        // Update last login
        $this->userModel->updateLastLogin($user['id']);

        // Generate token
        $token = $this->tokenService->generateToken($user['id'], $email, $user['role'] ?? 'client');

        // Set cookies (optional - don't break login if cookies fail)
        try {
            // Set auth cookie
            $this->cookieService->setAuthCookie($token, 7);

            // Set remember-me cookie if requested
            if ($rememberMe) {
                $rememberToken = bin2hex(random_bytes(32));
                $tokenHash = hash('sha256', $rememberToken);
                $this->userModel->setRememberMeToken($user['id'], $tokenHash);
                $this->cookieService->setRememberMeCookie($user['id'], $tokenHash, 30);
            }

            // Set CSRF token
            $csrfToken = $this->cookieService->generateCsrfToken();
            $this->cookieService->setCsrfCookie($csrfToken);

            // Set preferences cookie
            $prefsForCookie = $this->preferenceService->getPreferencesForCookie($user['id']);
            if ($prefsForCookie) {
                $this->cookieService->setPreferenceCookie($prefsForCookie);
            }
        } catch (\Exception $e) {
            Logger::warning("Cookie setup failed during login: " . $e->getMessage());
        }

        // Log activity
        $this->userModel->logActivity($user['id'], 'login');

        Logger::info("User logged in: " . $user['id']);

        return [
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'token' => $token,
                'user' => $this->userModel->getSafeUserData($user)
            ]
        ];
    }

    /**
     * Verify token and get user
     */
    public function getCurrentUser($token) {
        if (empty($token)) {
            return [
                'success' => false,
                'message' => 'Token required',
                'code' => 'MISSING_TOKEN'
            ];
        }

        // Verify token
        $tokenResult = $this->tokenService->verifyToken($token);

        if (!$tokenResult['success']) {
            return $tokenResult;
        }

        $decoded = $tokenResult['data'];
        $userId = $decoded->userId;

        // Get user
        $user = $this->userModel->getUserById($userId);

        if (!$user) {
            return [
                'success' => false,
                'message' => 'User not found',
                'code' => 'USER_NOT_FOUND'
            ];
        }

        return [
            'success' => true,
            'data' => $this->userModel->getSafeUserData($user)
        ];
    }

    public function resendVerification($email) {
        if (empty($email)) {
            return [
                'success' => false,
                'message' => 'Email is required',
                'code' => 'MISSING_EMAIL'
            ];
        }

        $user = $this->userModel->getUserByEmail($email);

        if (!$user) {
            return [
                'success' => false,
                'message' => 'User not found',
                'code' => 'USER_NOT_FOUND'
            ];
        }

        if (!empty($user['is_verified'])) {
            return [
                'success' => false,
                'message' => 'Email already verified',
                'code' => 'ALREADY_VERIFIED'
            ];
        }

        $verificationResult = $this->issueVerificationCode($user['id'], $email, $user['full_name']);

        if (!$verificationResult['success']) {
            return $verificationResult;
        }

        $message = $verificationResult['email_sent']
            ? 'Verification email sent'
            : 'Verification code regenerated. Email delivery failed, but the code is available for development testing.';

        return [
            'success' => true,
            'message' => $message,
            'data' => array_merge([
                'email' => $email,
            ], $verificationResult['payload'])
        ];
    }

    /**
     * Request password reset
     */
    public function requestPasswordReset($email) {
        if (empty($email)) {
            return [
                'success' => false,
                'message' => 'Email is required',
                'code' => 'MISSING_EMAIL'
            ];
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return [
                'success' => false,
                'message' => 'Invalid email format',
                'code' => 'INVALID_EMAIL'
            ];
        }

        $user = $this->userModel->getUserByEmail($email);

        if (!$user) {
            // Don't reveal if user exists (security)
            return [
                'success' => true,
                'message' => 'If an account exists with this email, a password reset link has been sent.',
                'code' => 'RESET_SENT'
            ];
        }

        // Generate reset code
        $resetCode = $this->tokenService->generateVerificationCode();
        $resetCodeExpiry = date('Y-m-d H:i:s', time() + 3600); // 1 hour expiry

        // Store reset code using UserModel
        $tokenResult = $this->userModel->setPasswordResetToken($user['id'], $resetCode, $resetCodeExpiry);

        if (!$tokenResult['success']) {
            return $tokenResult;
        }

        // Send reset email
        $emailResult = $this->emailService->sendPasswordResetEmail($email, $user['full_name'], $resetCode);

        if (!$emailResult['success']) {
            Logger::warning("Password reset email failed for user: " . $user['id']);
        }

        $this->userModel->logActivity($user['id'], 'password_reset_requested');

        return [
            'success' => true,
            'message' => 'If an account exists with this email, a password reset link has been sent.',
            'code' => 'RESET_SENT',
            'data' => [
                'email' => $email,
                'email_sent' => $emailResult['success']
            ]
        ];
    }

    /**
     * Reset password with code
     */
    /**
     * Reset password with code
     */
    public function resetPassword($email, $resetCode, $newPassword) {
        if (empty($email) || empty($resetCode) || empty($newPassword)) {
            return [
                'success' => false,
                'message' => 'Email, reset code, and new password are required',
                'code' => 'MISSING_FIELDS'
            ];
        }

        if (strlen($newPassword) < 6) {
            return [
                'success' => false,
                'message' => 'Password must be at least 6 characters',
                'code' => 'WEAK_PASSWORD'
            ];
        }

        $user = $this->userModel->getUserByEmail($email);

        if (!$user) {
            return [
                'success' => false,
                'message' => 'User not found',
                'code' => 'USER_NOT_FOUND'
            ];
        }

        // Verify reset code using UserModel
        $verifyResult = $this->userModel->verifyPasswordResetToken($user['id'], $resetCode);

        if (!$verifyResult['success']) {
            Logger::warning("Invalid password reset attempt for user: " . $user['id']);
            return [
                'success' => false,
                'message' => $verifyResult['message'] ?? 'Invalid or expired reset code',
                'code' => 'INVALID_CODE'
            ];
        }

        // Hash new password
        $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 10]);

        // Update password and clear reset token using UserModel
        $updateResult = $this->userModel->updatePassword($user['id'], $hashedPassword);

        if (!$updateResult['success']) {
            return $updateResult;
        }

        $this->userModel->logActivity($user['id'], 'password_reset_completed');

        Logger::info("Password reset for user: " . $user['id']);

        return [
            'success' => true,
            'message' => 'Password reset successfully. You can now login with your new password.',
            'code' => 'PASSWORD_RESET'
        ];
    }
}
?>
