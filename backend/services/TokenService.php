<?php
/**
 * Token Service
 * Handles JWT token generation and validation
 */

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class TokenService {
    private $secret;
    private $expiry;
    private $algorithm = 'HS256';

    public function __construct() {
        $this->secret = $_ENV['JWT_SECRET'] ?? 'your-secret-key-min-32-chars-change-this-in-production';
        $this->expiry = $_ENV['JWT_EXPIRY'] ?? 86400; // 24 hours

        // Validate secret length
        if (strlen($this->secret) < 32) {
            Logger::warning("JWT_SECRET is too short. Using default secret.");
        }
    }

    /**
     * Generate JWT token for user
     */
    public function generateToken($userId, $email, $role = 'client') {
        try {
            $payload = [
                'iat' => time(),
                'exp' => time() + $this->expiry,
                'userId' => $userId,
                'email' => $email,
                'role' => $role
            ];

            $token = JWT::encode($payload, $this->secret, $this->algorithm);
            Logger::info("Token generated for user: $userId");
            return $token;
        } catch (\Exception $e) {
            Logger::error("Token generation failed: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Verify and decode JWT token
     */
    public function verifyToken($token) {
        try {
            $decoded = JWT::decode($token, new Key($this->secret, $this->algorithm));
            return [
                'success' => true,
                'data' => $decoded
            ];
        } catch (\Firebase\JWT\ExpiredException $e) {
            Logger::warning("Token expired: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Token expired',
                'code' => 'TOKEN_EXPIRED'
            ];
        } catch (\Firebase\JWT\InvalidSignatureException $e) {
            Logger::warning("Invalid token signature");
            return [
                'success' => false,
                'message' => 'Invalid token',
                'code' => 'INVALID_SIGNATURE'
            ];
        } catch (\Exception $e) {
            Logger::error("Token verification failed: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Invalid token',
                'code' => 'INVALID_TOKEN'
            ];
        }
    }

    /**
     * Generate verification code (6-digit)
     */
    public function generateVerificationCode() {
        $length = $_ENV['VERIFICATION_CODE_LENGTH'] ?? 6;
        return str_pad(random_int(0, pow(10, $length) - 1), $length, '0', STR_PAD_LEFT);
    }

    /**
     * Get token expiry timestamp
     */
    public function getTokenExpiry() {
        return time() + $this->expiry;
    }

    /**
     * Get verification code expiry timestamp
     */
    public function getVerificationCodeExpiry() {
        $codeExpiry = $_ENV['VERIFICATION_CODE_EXPIRY'] ?? 900; // 15 minutes
        return date('Y-m-d H:i:s', time() + (int)$codeExpiry);
    }
}
?>
