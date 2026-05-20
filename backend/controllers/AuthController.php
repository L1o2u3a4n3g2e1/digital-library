<?php
/**
 * Auth Controller
 * Handles authentication endpoints
 */

class AuthController {
    private $db;
    private $authService;

    public function __construct($database) {
        $this->db = $database;
        require_once __DIR__ . '/../services/AuthService.php';
        $this->authService = new AuthService($database);
    }

    /**
     * Get request body as JSON
     */
    private function getInput() {
        $input = file_get_contents('php://input');
        return json_decode($input, true) ?? [];
    }

    /**
     * Get Authorization token from headers
     */
    private function getAuthToken() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';

        if (strpos($authHeader, 'Bearer ') === 0) {
            return substr($authHeader, 7);
        }

        require_once __DIR__ . '/../services/CookieService.php';
        $cookieService = new CookieService();
        return $cookieService->getAuthCookie();
    }

    /**
     * POST /api/auth/register - Register new user with email
     */
    public function register() {
        $input = $this->getInput();

        $name = trim($input['name'] ?? '');
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';
        $phone = trim($input['phone'] ?? null);

        // Validate
        $errors = [];
        if (empty($name)) $errors['name'] = 'Name is required';
        if (empty($email)) $errors['email'] = 'Email is required';
        if (empty($password)) $errors['password'] = 'Password is required';
        if (strlen($password) < 6) $errors['password'] = 'Password must be at least 6 characters';

        if (!empty($errors)) {
            Response::validationError($errors);
        }

        // Register
        $result = $this->authService->register($name, $email, $password, $phone);

        if ($result['success']) {
            Response::success($result['data'], $result['message'], 201);
        } else {
            http_response_code(400);
            Response::error($result['message'], 400, ['code' => $result['code'] ?? null]);
        }
    }

    /**
     * POST /api/auth/register-guest - Register guest user
     */
    public function registerGuest() {
        $input = $this->getInput();
        $phone = trim($input['phone'] ?? '');

        if (empty($phone)) {
            Response::validationError(['phone' => 'Phone number is required']);
        }

        $result = $this->authService->registerGuest($phone);

        if ($result['success']) {
            Response::success($result['data'], $result['message'], 201);
        } else {
            http_response_code(400);
            Response::error($result['message'], 400, ['code' => $result['code'] ?? null]);
        }
    }

    /**
     * POST /api/auth/verify-guest-phone - Verify guest phone with code
     */
    public function verifyGuestPhone() {
        $input = $this->getInput();
        $phone = trim($input['phone'] ?? '');
        $code = trim($input['code'] ?? '');

        $errors = [];
        if (empty($phone)) $errors['phone'] = 'Phone number is required';
        if (empty($code)) $errors['code'] = 'Verification code is required';

        if (!empty($errors)) {
            Response::validationError($errors);
        }

        $result = $this->authService->verifyGuestPhone($phone, $code);

        if ($result['success']) {
            Response::success($result['data'], $result['message']);
        } else {
            $statusCode = $result['code'] === 'USER_NOT_FOUND' ? 404 : 400;
            http_response_code($statusCode);
            Response::error($result['message'], $statusCode, ['code' => $result['code'] ?? null]);
        }
    }

    /**
     * POST /api/auth/verify-email - Verify email with code
     */
    public function verifyEmail() {
        $input = $this->getInput();
        $email = trim($input['email'] ?? '');
        $code = trim($input['code'] ?? '');

        if (empty($email) || empty($code)) {
            Response::validationError([
                'email' => empty($email) ? 'Email is required' : null,
                'code' => empty($code) ? 'Verification code is required' : null
            ]);
        }

        $result = $this->authService->verifyEmail($email, $code);

        if ($result['success']) {
            Response::success($result['data'], $result['message']);
        } else {
            $statusCode = $result['code'] === 'USER_NOT_FOUND' ? 404 : 400;
            http_response_code($statusCode);
            Response::error($result['message'], $statusCode, ['code' => $result['code'] ?? null]);
        }
    }

    /**
     * POST /api/auth/login - Login user
     */
    public function login() {
        $input = $this->getInput();
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';
        $rememberMe = $input['remember_me'] ?? false;

        if (empty($email) || empty($password)) {
            Response::validationError([
                'email' => empty($email) ? 'Email is required' : null,
                'password' => empty($password) ? 'Password is required' : null
            ]);
        }

        $result = $this->authService->login($email, $password, $rememberMe);

        if ($result['success']) {
            Response::success($result['data'], $result['message']);
        } else {
            http_response_code(401);
            Response::error($result['message'], 401, ['code' => $result['code'] ?? null]);
        }
    }

    /**
     * GET /api/auth/me - Get current authenticated user
     */
    public function getMe() {
        $token = $this->getAuthToken();

        if (!$token) {
            http_response_code(401);
            Response::error('Unauthorized - Token required', 401, ['code' => 'NO_TOKEN']);
        }

        $result = $this->authService->getCurrentUser($token);

        if ($result['success']) {
            Response::success($result['data'], 'User retrieved');
        } else {
            $statusCode = $result['code'] === 'TOKEN_EXPIRED' ? 401 : 401;
            http_response_code($statusCode);
            Response::error($result['message'], $statusCode, ['code' => $result['code'] ?? null]);
        }
    }

    /**
     * POST /api/auth/resend-verification - Resend verification email
     */
    public function resendVerification() {
        $input = $this->getInput();
        $email = trim($input['email'] ?? '');

        if (empty($email)) {
            Response::validationError(['email' => 'Email is required']);
        }

        $result = $this->authService->resendVerification($email);

        if ($result['success']) {
            Response::success($result['data'], $result['message']);
        } else {
            $statusCode = $result['code'] === 'USER_NOT_FOUND' ? 404 : 400;
            Response::error($result['message'], $statusCode, ['code' => $result['code'] ?? null]);
        }
    }

    /**
     * POST /api/auth/resend-guest-verification - Resend guest phone verification code
     */
    public function resendGuestVerification() {
        $input = $this->getInput();
        $phone = trim($input['phone'] ?? '');

        if (empty($phone)) {
            Response::validationError(['phone' => 'Phone number is required']);
        }

        $result = $this->authService->resendGuestVerification($phone);

        if ($result['success']) {
            Response::success($result['data'], $result['message']);
        } else {
            $statusCode = $result['code'] === 'USER_NOT_FOUND' ? 404 : 400;
            http_response_code($statusCode);
            Response::error($result['message'], $statusCode, ['code' => $result['code'] ?? null]);
        }
    }

    /**
     * POST /api/auth/logout - Logout user (clear cookies and tokens)
     */
    public function logout() {
        require_once __DIR__ . '/../services/CookieService.php';
        $cookieService = new CookieService();

        $token = $this->getAuthToken();

        if ($token) {
            require_once __DIR__ . '/../services/AuthService.php';
            $result = $this->authService->getCurrentUser($token);

            if ($result['success']) {
                require_once __DIR__ . '/../models/User.php';
                $userModel = new User($this->db);
                $userModel->logActivity($result['data']['id'], 'logout');
            }
        }

        // Clear all auth cookies
        $cookieService->clearAllAuthCookies();

        Response::success([], 'Logout successful');
    }

    /**
     * POST /api/auth/forgot-password - Request password reset
     */
    public function forgotPassword() {
        $input = $this->getInput();
        $email = trim($input['email'] ?? '');

        if (empty($email)) {
            Response::validationError(['email' => 'Email is required']);
        }

        $result = $this->authService->requestPasswordReset($email);

        if ($result['success']) {
            Response::success($result['data'] ?? [], $result['message']);
        } else {
            http_response_code(400);
            Response::error($result['message'], 400, ['code' => $result['code'] ?? null]);
        }
    }

    /**
     * POST /api/auth/reset-password - Reset password with code
     */
    public function resetPassword() {
        $input = $this->getInput();
        $email = trim($input['email'] ?? '');
        $resetCode = trim($input['reset_code'] ?? '');
        $newPassword = $input['new_password'] ?? '';

        $errors = [];
        if (empty($email)) $errors['email'] = 'Email is required';
        if (empty($resetCode)) $errors['reset_code'] = 'Reset code is required';
        if (empty($newPassword)) $errors['new_password'] = 'New password is required';
        if (strlen($newPassword) < 6 && !empty($newPassword)) $errors['new_password'] = 'Password must be at least 6 characters';

        if (!empty($errors)) {
            Response::validationError($errors);
        }

        $result = $this->authService->resetPassword($email, $resetCode, $newPassword);

        if ($result['success']) {
            Response::success([], $result['message']);
        } else {
            $statusCode = in_array($result['code'], ['USER_NOT_FOUND']) ? 404 : 400;
            http_response_code($statusCode);
            Response::error($result['message'], $statusCode, ['code' => $result['code'] ?? null]);
        }
    }
}
?>
