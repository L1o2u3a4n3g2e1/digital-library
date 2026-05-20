<?php
/**
 * Preference Controller
 * Handles user preference endpoints
 */

class PreferenceController {
    private $db;
    private $authService;
    private $preferenceService;
    private $cookieService;

    public function __construct($database) {
        $this->db = $database;
        require_once __DIR__ . '/../services/AuthService.php';
        require_once __DIR__ . '/../services/PreferenceService.php';
        require_once __DIR__ . '/../services/CookieService.php';

        $this->authService = new AuthService($database);
        $this->preferenceService = new PreferenceService($database);
        $this->cookieService = new CookieService();
    }

    private function getInput() {
        $input = file_get_contents('php://input');
        return json_decode($input, true) ?? [];
    }

    private function getAuthToken() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';

        if (strpos($authHeader, 'Bearer ') === 0) {
            return substr($authHeader, 7);
        }

        // Try to get from cookie
        return $this->cookieService->getAuthCookie();
    }

    private function requireAuth() {
        $token = $this->getAuthToken();

        if (!$token) {
            http_response_code(401);
            Response::error('Unauthorized - Token required', 401, ['code' => 'NO_TOKEN']);
            exit;
        }

        $result = $this->authService->getCurrentUser($token);

        if (!$result['success']) {
            http_response_code(401);
            Response::error('Unauthorized', 401, ['code' => $result['code'] ?? null]);
            exit;
        }

        return $result['data'];
    }

    /**
     * GET /api/preferences - Get user preferences
     */
    public function getPreferences() {
        $user = $this->requireAuth();
        $result = $this->preferenceService->getPreferences($user['id']);

        if ($result['success']) {
            Response::success($result['data']);
        } else {
            http_response_code(400);
            Response::error($result['message'], 400);
        }
    }

    /**
     * PUT /api/preferences - Update user preferences
     */
    public function updatePreferences() {
        $user = $this->requireAuth();
        $input = $this->getInput();

        if (empty($input)) {
            Response::validationError(['preferences' => 'Preferences data required']);
        }

        $result = $this->preferenceService->updatePreferences($user['id'], $input);

        if ($result['success']) {
            // Update preferences cookie
            $prefsForCookie = $this->preferenceService->getPreferencesForCookie($user['id']);
            if ($prefsForCookie) {
                $this->cookieService->setPreferenceCookie($prefsForCookie);
            }

            Response::success($result['data'], $result['message']);
        } else {
            http_response_code(400);
            Response::error($result['message'], 400, [
                'code' => $result['code'] ?? null,
                'errors' => $result['errors'] ?? null
            ]);
        }
    }

    /**
     * PATCH /api/preferences/:key - Update single preference
     */
    public function updatePreferenceKey($key) {
        $user = $this->requireAuth();
        $input = $this->getInput();

        if (!isset($input['value'])) {
            Response::validationError(['value' => 'Value is required']);
        }

        $result = $this->preferenceService->setPreference($user['id'], $key, $input['value']);

        if ($result['success']) {
            // Update preferences cookie
            $prefsForCookie = $this->preferenceService->getPreferencesForCookie($user['id']);
            if ($prefsForCookie) {
                $this->cookieService->setPreferenceCookie($prefsForCookie);
            }

            Response::success($result['data'], $result['message']);
        } else {
            http_response_code(400);
            Response::error($result['message'], 400, [
                'code' => $result['code'] ?? null,
                'errors' => $result['errors'] ?? null
            ]);
        }
    }

    /**
     * POST /api/preferences/reset - Reset preferences to defaults
     */
    public function resetPreferences() {
        $user = $this->requireAuth();
        $result = $this->preferenceService->resetPreferences($user['id']);

        if ($result['success']) {
            // Update preferences cookie
            $prefsForCookie = $this->preferenceService->getPreferencesForCookie($user['id']);
            if ($prefsForCookie) {
                $this->cookieService->setPreferenceCookie($prefsForCookie);
            }

            Response::success($result['data'], $result['message']);
        } else {
            http_response_code(400);
            Response::error($result['message'], 400);
        }
    }

    /**
     * GET /api/csrf-token - Get CSRF token
     */
    public function getCsrfToken() {
        $token = $this->cookieService->getCsrfCookie();

        if (!$token) {
            $token = $this->cookieService->generateCsrfToken();
            $this->cookieService->setCsrfCookie($token);
        }

        Response::success(['csrf_token' => $token]);
    }
}
?>
