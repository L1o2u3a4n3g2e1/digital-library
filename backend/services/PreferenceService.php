<?php
/**
 * Preference Service
 * Manages user preferences (theme, language, etc.)
 */

class PreferenceService {
    private $conn;
    private $userModel;

    public function __construct($database) {
        require_once __DIR__ . '/../models/User.php';
        $this->conn = $database->getConnection();
        $this->userModel = new User($database);
    }

    /**
     * Get user preferences
     */
    public function getPreferences($userId) {
        $query = "SELECT preferences FROM users WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();

        if (!$row) {
            return [
                'success' => false,
                'message' => 'User not found',
                'code' => 'USER_NOT_FOUND'
            ];
        }

        $preferences = $row['preferences'] ? json_decode($row['preferences'], true) : [];

        return [
            'success' => true,
            'data' => $this->getDefaultPreferences($preferences)
        ];
    }

    /**
     * Update user preferences
     */
    public function updatePreferences($userId, $preferences) {
        // Validate user exists
        $user = $this->userModel->getUserById($userId);
        if (!$user) {
            return [
                'success' => false,
                'message' => 'User not found',
                'code' => 'USER_NOT_FOUND'
            ];
        }

        // Get current preferences
        $currentPrefs = $this->getPreferences($userId);
        $merged = array_merge($currentPrefs['data'] ?? [], $preferences);

        // Validate preferences
        $validation = $this->validatePreferences($merged);
        if (!$validation['valid']) {
            return [
                'success' => false,
                'message' => 'Invalid preferences',
                'code' => 'INVALID_PREFERENCES',
                'errors' => $validation['errors']
            ];
        }

        // Save to database
        $query = "UPDATE users SET preferences = ?, updated_at = NOW() WHERE id = ?";
        $stmt = $this->conn->prepare($query);

        if (!$stmt) {
            return [
                'success' => false,
                'message' => 'Database error: ' . $this->conn->error,
                'code' => 'DB_ERROR'
            ];
        }

        $preferencesJson = json_encode($merged);
        $stmt->bind_param("si", $preferencesJson, $userId);

        if (!$stmt->execute()) {
            return [
                'success' => false,
                'message' => 'Failed to update preferences',
                'code' => 'UPDATE_FAILED'
            ];
        }

        Logger::info("User preferences updated: $userId");

        return [
            'success' => true,
            'message' => 'Preferences updated',
            'data' => $merged
        ];
    }

    /**
     * Set single preference
     */
    public function setPreference($userId, $key, $value) {
        $currentResult = $this->getPreferences($userId);

        if (!$currentResult['success']) {
            return $currentResult;
        }

        $preferences = $currentResult['data'];
        $preferences[$key] = $value;

        return $this->updatePreferences($userId, $preferences);
    }

    /**
     * Get default preferences with user overrides
     */
    private function getDefaultPreferences($userPrefs = []) {
        $defaults = [
            'theme' => 'light',           // light, dark, auto
            'language' => 'en',            // en, ar, fr, etc.
            'notifications_email' => true,
            'notifications_push' => false,
            'notifications_sms' => false,
            'auto_read_logging' => true,
            'show_reading_time' => true,
            'font_size' => 'medium',      // small, medium, large, xlarge
            'line_height' => 'normal',     // normal, comfortable, spacious
            'pagination_style' => 'continuous', // continuous, paginated
            'keep_reading_history' => true,
            'recommended_books' => true,
            'newsletter_subscription' => false,
            'profile_visibility' => 'private', // private, friends, public
            'two_factor_enabled' => false
        ];

        return array_merge($defaults, $userPrefs ?? []);
    }

    /**
     * Validate preference values
     */
    private function validatePreferences($preferences) {
        $errors = [];

        $allowed = [
            'theme' => ['light', 'dark', 'auto'],
            'language' => ['en', 'ar', 'fr', 'es', 'de', 'pt', 'zh'],
            'font_size' => ['small', 'medium', 'large', 'xlarge'],
            'line_height' => ['normal', 'comfortable', 'spacious'],
            'pagination_style' => ['continuous', 'paginated'],
            'profile_visibility' => ['private', 'friends', 'public']
        ];

        $booleans = [
            'notifications_email',
            'notifications_push',
            'notifications_sms',
            'auto_read_logging',
            'show_reading_time',
            'keep_reading_history',
            'recommended_books',
            'newsletter_subscription',
            'two_factor_enabled'
        ];

        foreach ($booleans as $key) {
            if (isset($preferences[$key]) && !is_bool($preferences[$key])) {
                $errors[$key] = "Must be a boolean";
            }
        }

        foreach ($allowed as $key => $values) {
            if (isset($preferences[$key]) && !in_array($preferences[$key], $values)) {
                $errors[$key] = "Invalid value. Allowed: " . implode(', ', $values);
            }
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }

    /**
     * Reset preferences to defaults
     */
    public function resetPreferences($userId) {
        return $this->updatePreferences($userId, []);
    }

    /**
     * Export user preferences as cookie-friendly JSON
     */
    public function getPreferencesForCookie($userId) {
        $result = $this->getPreferences($userId);

        if (!$result['success']) {
            return null;
        }

        // Only include non-sensitive preferences for cookie
        $prefs = $result['data'];
        return [
            'theme' => $prefs['theme'],
            'language' => $prefs['language'],
            'font_size' => $prefs['font_size'],
            'line_height' => $prefs['line_height'],
            'pagination_style' => $prefs['pagination_style']
        ];
    }
}
?>
