<?php
/**
 * User Model
 * Handles all user database operations
 */

class User {
    private $conn;

    public function __construct($database) {
        $this->conn = $database->getConnection();
    }

    /**
     * Create new user (email registration)
     */
    public function createUser($name, $email, $password, $phone = null) {
        try {
            $hashedPassword = password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);

            $stmt = $this->conn->prepare("
                INSERT INTO users (full_name, email, password, phone_number, is_verified, is_guest, created_at)
                VALUES (?, ?, ?, ?, 0, 0, NOW())
            ");

            $stmt->bind_param("ssss", $name, $email, $hashedPassword, $phone);

            if ($stmt->execute()) {
                $userId = $this->conn->insert_id;
                Logger::info("User created: $email (ID: $userId)");
                return [
                    'success' => true,
                    'user_id' => $userId,
                    'message' => 'User created successfully'
                ];
            } else {
                Logger::error("Failed to create user: " . $stmt->error);
                return [
                    'success' => false,
                    'message' => 'Failed to create user'
                ];
            }
        } catch (\Exception $e) {
            Logger::error("Exception in createUser: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error'];
        }
    }

    /**
     * Create guest user
     */
    public function createGuestUser($phone) {
        try {
            $stmt = $this->conn->prepare("
                INSERT INTO users (full_name, phone_number, is_guest, is_verified, created_at)
                VALUES ('Guest Reader', ?, 1, 0, NOW())
            ");

            $stmt->bind_param("s", $phone);

            if ($stmt->execute()) {
                $userId = $this->conn->insert_id;
                Logger::info("Guest user created (ID: $userId)");
                return [
                    'success' => true,
                    'user_id' => $userId
                ];
            } else {
                return ['success' => false, 'message' => 'Failed to create guest'];
            }
        } catch (\Exception $e) {
            Logger::error("Exception in createGuestUser: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error'];
        }
    }

    /**
     * Check if email exists
     */
    public function emailExists($email) {
        try {
            $stmt = $this->conn->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->bind_param("s", $email);
            $stmt->execute();
            $result = $stmt->get_result();
            return $result->num_rows > 0;
        } catch (\Exception $e) {
            Logger::error("Exception in emailExists: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Check if phone exists
     */
    public function phoneExists($phone) {
        try {
            $stmt = $this->conn->prepare("SELECT id FROM users WHERE phone_number = ?");
            $stmt->bind_param("s", $phone);
            $stmt->execute();
            $result = $stmt->get_result();
            return $result->num_rows > 0;
        } catch (\Exception $e) {
            Logger::error("Exception in phoneExists: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get user by phone number
     */
    public function getUserByPhone($phone) {
        try {
            $stmt = $this->conn->prepare("SELECT * FROM users WHERE phone_number = ?");
            $stmt->bind_param("s", $phone);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                return $result->fetch_assoc();
            }

            return null;
        } catch (\Exception $e) {
            Logger::error("Exception in getUserByPhone: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Set verification token
     */
    public function setVerificationToken($userId, $token, $expiry) {
        try {
            $stmt = $this->conn->prepare("
                UPDATE users
                SET verification_token = ?, verification_token_expiry = ?
                WHERE id = ?
            ");

            $stmt->bind_param("ssi", $token, $expiry, $userId);
            return $stmt->execute();
        } catch (\Exception $e) {
            Logger::error("Exception in setVerificationToken: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Verify email and mark user as verified
     */
    public function verifyEmail($userId, $token) {
        try {
            $stmt = $this->conn->prepare("
                UPDATE users
                SET is_verified = 1, verification_token = NULL, verification_token_expiry = NULL
                WHERE id = ? AND verification_token = ? AND verification_token_expiry > NOW()
            ");

            $stmt->bind_param("is", $userId, $token);

            if ($stmt->execute() && $this->conn->affected_rows > 0) {
                Logger::info("Email verified for user: $userId");
                return ['success' => true];
            } else {
                return ['success' => false, 'message' => 'Invalid or expired token'];
            }
        } catch (\Exception $e) {
            Logger::error("Exception in verifyEmail: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error'];
        }
    }

    /**
     * Verify guest phone and mark guest as verified
     */
    public function verifyGuestPhone($userId, $phone, $token) {
        try {
            $stmt = $this->conn->prepare("
                UPDATE users
                SET is_verified = 1, verification_token = NULL, verification_token_expiry = NULL
                WHERE id = ? AND phone_number = ? AND is_guest = 1 AND verification_token = ? AND verification_token_expiry > NOW()
            ");

            $stmt->bind_param("iss", $userId, $phone, $token);

            if ($stmt->execute() && $this->conn->affected_rows > 0) {
                Logger::info("Guest phone verified for user: $userId");
                return ['success' => true];
            }

            return ['success' => false, 'message' => 'Invalid or expired verification code'];
        } catch (\Exception $e) {
            Logger::error("Exception in verifyGuestPhone: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error'];
        }
    }

    /**
     * Get user by email
     */
    public function getUserByEmail($email) {
        try {
            $stmt = $this->conn->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->bind_param("s", $email);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                return $result->fetch_assoc();
            }
            return null;
        } catch (\Exception $e) {
            Logger::error("Exception in getUserByEmail: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get user by ID
     */
    public function getUserById($userId) {
        try {
            $stmt = $this->conn->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->bind_param("i", $userId);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                return $result->fetch_assoc();
            }
            return null;
        } catch (\Exception $e) {
            Logger::error("Exception in getUserById: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Verify password
     */
    public function verifyPassword($plainPassword, $hashedPassword) {
        return password_verify($plainPassword, $hashedPassword);
    }

    /**
     * Update last login
     */
    public function updateLastLogin($userId) {
        try {
            $stmt = $this->conn->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
            $stmt->bind_param("i", $userId);
            return $stmt->execute();
        } catch (\Exception $e) {
            Logger::error("Exception in updateLastLogin: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Create notification preferences for user
     */
    public function createNotificationPreferences($userId) {
        try {
            $stmt = $this->conn->prepare("
                INSERT INTO notification_preferences (user_id, email_notifications, sms_notifications, notification_frequency)
                VALUES (?, 1, 0, 'instant')
                ON DUPLICATE KEY UPDATE
                    email_notifications = VALUES(email_notifications),
                    sms_notifications = VALUES(sms_notifications),
                    notification_frequency = VALUES(notification_frequency)
            ");

            $stmt->bind_param("i", $userId);
            return $stmt->execute();
        } catch (\Exception $e) {
            Logger::error("Exception in createNotificationPreferences: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get user with safe data (no password)
     */
    public function getSafeUserData($user) {
        return [
            'id' => $user['id'],
            'name' => $user['full_name'] ?: 'Guest',
            'email' => $user['email'],
            'phone' => $user['phone_number'],
            'is_guest' => (bool)$user['is_guest'],
            'is_verified' => (bool)$user['is_verified'],
            'role' => $user['role'],
            'preferred_language' => $user['preferred_language'],
            'dark_mode' => (bool)$user['dark_mode'],
            'created_at' => $user['created_at'],
            'last_login' => $user['last_login']
        ];
    }

    /**
     * Log user activity
     */
    public function logActivity($userId, $activityType, $details = null) {
        try {
            $stmt = $this->conn->prepare("
                INSERT INTO user_activity (user_id, activity_type, details, created_at)
                VALUES (?, ?, ?, NOW())
            ");

            $detailsJson = $details ? json_encode($details) : null;
            $stmt->bind_param("iss", $userId, $activityType, $detailsJson);
            return $stmt->execute();
        } catch (\Exception $e) {
            Logger::error("Exception in logActivity: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Set remember-me token
     */
    public function setRememberMeToken($userId, $tokenHash) {
        try {
            $expiresAt = date('Y-m-d H:i:s', time() + (30 * 24 * 60 * 60)); // 30 days
            $deviceType = $this->getDeviceType();
            $ipAddress = $this->getClientIp();
            $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';

            $stmt = $this->conn->prepare("
                INSERT INTO remember_me_tokens (user_id, token_hash, device_fingerprint, ip_address, user_agent, expires_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ");

            if (!$stmt) {
                Logger::error("Prepare error: " . $this->conn->error);
                return false;
            }

            $fingerprint = md5($ipAddress . $userAgent);
            $stmt->bind_param("isssss", $userId, $tokenHash, $fingerprint, $ipAddress, $userAgent, $expiresAt);
            return $stmt->execute();
        } catch (\Exception $e) {
            Logger::error("Exception in setRememberMeToken: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Verify remember-me token
     */
    public function verifyRememberMeToken($userId, $tokenHash) {
        try {
            $stmt = $this->conn->prepare("
                SELECT id FROM remember_me_tokens
                WHERE user_id = ? AND token_hash = ? AND expires_at > NOW()
            ");

            $stmt->bind_param("is", $userId, $tokenHash);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                // Update last_used_at
                $updateStmt = $this->conn->prepare("
                    UPDATE remember_me_tokens
                    SET last_used_at = NOW()
                    WHERE user_id = ? AND token_hash = ?
                ");
                $updateStmt->bind_param("is", $userId, $tokenHash);
                $updateStmt->execute();

                return true;
            }

            return false;
        } catch (\Exception $e) {
            Logger::error("Exception in verifyRememberMeToken: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get device type from User-Agent
     */
    private function getDeviceType() {
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';

        if (preg_match('/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i', $userAgent)) {
            return 'mobile';
        } elseif (preg_match('/tablet|ipad|android/i', $userAgent)) {
            return 'tablet';
        }

        return 'desktop';
    }

    /**
     * Get client IP address
     */
    private function getClientIp() {
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            return $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            return explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
        }
        return $_SERVER['REMOTE_ADDR'] ?? '';
    }

    /**
     * Set password reset token
     */
    public function setPasswordResetToken($userId, $resetToken, $expiryTime) {
        try {
            $stmt = $this->conn->prepare("
                UPDATE users
                SET password_reset_token = ?, password_reset_expiry = ?
                WHERE id = ?
            ");

            if (!$stmt) {
                Logger::error("Prepare error: " . $this->conn->error);
                return [
                    'success' => false,
                    'message' => 'Database error',
                    'code' => 'DB_ERROR'
                ];
            }

            $stmt->bind_param("ssi", $resetToken, $expiryTime, $userId);

            if ($stmt->execute()) {
                Logger::info("Password reset token set for user: $userId");
                return ['success' => true];
            } else {
                Logger::error("Failed to set password reset token: " . $stmt->error);
                return [
                    'success' => false,
                    'message' => 'Failed to save reset token',
                    'code' => 'TOKEN_SAVE_FAILED'
                ];
            }
        } catch (\Exception $e) {
            Logger::error("Exception in setPasswordResetToken: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error'];
        }
    }

    /**
     * Verify and use password reset token
     */
    public function verifyPasswordResetToken($userId, $resetToken) {
        try {
            $stmt = $this->conn->prepare("
                SELECT id FROM users
                WHERE id = ? AND password_reset_token = ? AND password_reset_expiry > NOW()
            ");

            if (!$stmt) {
                Logger::error("Prepare error: " . $this->conn->error);
                return ['success' => false];
            }

            $stmt->bind_param("is", $userId, $resetToken);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                return ['success' => true];
            }

            return [
                'success' => false,
                'message' => 'Invalid or expired reset token'
            ];
        } catch (\Exception $e) {
            Logger::error("Exception in verifyPasswordResetToken: " . $e->getMessage());
            return ['success' => false];
        }
    }

    /**
     * Update password and clear reset token
     */
    public function updatePassword($userId, $hashedPassword) {
        try {
            $stmt = $this->conn->prepare("
                UPDATE users
                SET password = ?, password_reset_token = NULL, password_reset_expiry = NULL
                WHERE id = ?
            ");

            if (!$stmt) {
                Logger::error("Prepare error: " . $this->conn->error);
                return [
                    'success' => false,
                    'message' => 'Database error',
                    'code' => 'DB_ERROR'
                ];
            }

            $stmt->bind_param("si", $hashedPassword, $userId);

            if ($stmt->execute()) {
                Logger::info("Password updated for user: $userId");
                return ['success' => true];
            } else {
                Logger::error("Failed to update password: " . $stmt->error);
                return [
                    'success' => false,
                    'message' => 'Failed to update password',
                    'code' => 'UPDATE_FAILED'
                ];
            }
        } catch (\Exception $e) {
            Logger::error("Exception in updatePassword: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error'];
        }
    }
}
?>
