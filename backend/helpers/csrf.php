<?php
/**
 * CSRF Token Helper
 * Utilities for CSRF token validation
 */

class CsrfHelper {
    /**
     * Validate CSRF token for state-changing requests
     */
    public static function validateCsrfToken() {
        require_once __DIR__ . '/../services/CookieService.php';
        $cookieService = new CookieService();

        // Skip CSRF validation for safe methods
        $method = $_SERVER['REQUEST_METHOD'];
        if (in_array($method, ['GET', 'HEAD', 'OPTIONS'])) {
            return true;
        }

        // Get CSRF token from request
        $requestToken = $cookieService->getCsrfTokenFromRequest();

        if (!$requestToken) {
            return false;
        }

        // Validate token
        return $cookieService->validateCsrfToken($requestToken);
    }

    /**
     * Ensure CSRF token exists in cookies
     */
    public static function ensureCsrfToken() {
        require_once __DIR__ . '/../services/CookieService.php';
        $cookieService = new CookieService();

        $token = $cookieService->getCsrfCookie();

        if (!$token) {
            $token = $cookieService->generateCsrfToken();
            $cookieService->setCsrfCookie($token);
        }

        return $token;
    }
}
?>
