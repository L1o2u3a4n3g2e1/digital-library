<?php
/**
 * Cookie Service
 * Handles all cookie operations (auth, remember-me, preferences, CSRF)
 */

class CookieService {
    private $isHttpOnly = true;
    private $isSecure = false; // Set to true in production with HTTPS
    private $sameSite = 'Lax';
    private $frontendOrigin;

    public function __construct() {
        $this->frontendOrigin = $_ENV['FRONTEND_URL'] ?? '';
        $this->isSecure = $this->shouldUseSecureCookies();
        $this->sameSite = $this->isCrossSiteRequest() && $this->isSecure ? 'None' : 'Lax';
    }

    private function shouldUseSecureCookies() {
        $appEnv = $_ENV['APP_ENV'] ?? 'development';
        if ($appEnv === 'production') {
            return true;
        }

        if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
            return true;
        }

        if (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https') {
            return true;
        }

        return false;
    }

    private function isCrossSiteRequest() {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        if ($origin === '' || $this->frontendOrigin === '') {
            return false;
        }

        $originHost = parse_url($origin, PHP_URL_HOST);
        $frontendHost = parse_url($this->frontendOrigin, PHP_URL_HOST);

        return !empty($originHost) && !empty($frontendHost) && strcasecmp($originHost, $frontendHost) === 0;
    }

    private function getCookieDomain() {
        $host = $_SERVER['HTTP_HOST'] ?? '';
        $host = preg_replace('/:\d+$/', '', $host);

        if ($host === '' || $host === 'localhost' || $host === '127.0.0.1') {
            return null;
        }

        return $host;
    }

    private function buildCookieOptions($expires, $httpOnly = true, $sameSite = null) {
        $options = [
            'expires' => $expires,
            'path' => '/',
            'secure' => $this->isSecure,
            'httponly' => $httpOnly,
            'samesite' => $sameSite ?? $this->sameSite,
        ];

        $domain = $this->getCookieDomain();
        if ($domain) {
            $options['domain'] = $domain;
        }

        return $options;
    }

    /**
     * Set session auth cookie with JWT token
     * @param string $token JWT token
     * @param int $expiryDays Days until expiry (default: 7)
     */
    public function setAuthCookie($token, $expiryDays = 7) {
        $expiryTime = time() + ($expiryDays * 24 * 60 * 60);

        setcookie(
            'auth_token',
            $token,
            $this->buildCookieOptions($expiryTime, $this->isHttpOnly)
        );
    }

    /**
     * Set remember-me cookie (long-lived session)
     * @param int $userId User ID
     * @param string $tokenHash Hash of the token
     * @param int $expiryDays Days until expiry (default: 30)
     */
    public function setRememberMeCookie($userId, $tokenHash, $expiryDays = 30) {
        $expiryTime = time() + ($expiryDays * 24 * 60 * 60);

        setcookie(
            'remember_me',
            $userId . ':' . $tokenHash,
            $this->buildCookieOptions($expiryTime, $this->isHttpOnly)
        );
    }

    /**
     * Set user preferences cookie (non-sensitive preferences)
     * @param array $preferences Preference data
     * @param int $expiryDays Days until expiry (default: 365)
     */
    public function setPreferenceCookie($preferences, $expiryDays = 365) {
        $expiryTime = time() + ($expiryDays * 24 * 60 * 60);
        $cookieValue = json_encode($preferences);

        setcookie(
            'user_preferences',
            $cookieValue,
            $this->buildCookieOptions($expiryTime, false)
        );
    }

    /**
     * Set CSRF token cookie
     * @param string $token CSRF token
     */
    public function setCsrfCookie($token) {
        setcookie(
            'csrf_token',
            $token,
            $this->buildCookieOptions(time() + (2 * 60 * 60), false, $this->sameSite === 'None' ? 'None' : 'Strict')
        );
    }

    /**
     * Get auth token from cookie
     */
    public function getAuthCookie() {
        return $_COOKIE['auth_token'] ?? null;
    }

    /**
     * Get remember-me cookie
     */
    public function getRememberMeCookie() {
        return $_COOKIE['remember_me'] ?? null;
    }

    /**
     * Get user preferences from cookie
     */
    public function getPreferenceCookie() {
        if (!isset($_COOKIE['user_preferences'])) {
            return null;
        }

        return json_decode($_COOKIE['user_preferences'], true);
    }

    /**
     * Get CSRF token from cookie
     */
    public function getCsrfCookie() {
        return $_COOKIE['csrf_token'] ?? null;
    }

    /**
     * Get CSRF token from request (header or body)
     */
    public function getCsrfTokenFromRequest() {
        // Check header first (preferred)
        if (!empty($_SERVER['HTTP_X_CSRF_TOKEN'])) {
            return $_SERVER['HTTP_X_CSRF_TOKEN'];
        }

        // Check POST body
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        return $input['csrf_token'] ?? null;
    }

    /**
     * Generate CSRF token
     */
    public function generateCsrfToken() {
        return bin2hex(random_bytes(32));
    }

    /**
     * Validate CSRF token
     */
    public function validateCsrfToken($token) {
        $cookieToken = $this->getCsrfCookie();

        if (empty($cookieToken) || empty($token)) {
            return false;
        }

        return hash_equals($cookieToken, $token);
    }

    /**
     * Clear auth cookie
     */
    public function clearAuthCookie() {
        setcookie('auth_token', '', $this->buildCookieOptions(time() - 3600, $this->isHttpOnly));
        unset($_COOKIE['auth_token']);
    }

    /**
     * Clear remember-me cookie
     */
    public function clearRememberMeCookie() {
        setcookie('remember_me', '', $this->buildCookieOptions(time() - 3600, $this->isHttpOnly));
        unset($_COOKIE['remember_me']);
    }

    /**
     * Clear CSRF cookie
     */
    public function clearCsrfCookie() {
        setcookie('csrf_token', '', $this->buildCookieOptions(time() - 3600, false, $this->sameSite === 'None' ? 'None' : 'Strict'));
        unset($_COOKIE['csrf_token']);
    }

    /**
     * Clear all auth-related cookies
     */
    public function clearAllAuthCookies() {
        $this->clearAuthCookie();
        $this->clearRememberMeCookie();
        $this->clearCsrfCookie();
    }

    /**
     * Check if auth is via cookie
     */
    public function hasAuthCookie() {
        return !empty($this->getAuthCookie());
    }

    /**
     * Check if has remember-me cookie
     */
    public function hasRememberMeCookie() {
        return !empty($this->getRememberMeCookie());
    }
}
?>
