<?php
/**
 * SMS Service
 * Sends guest verification codes through Africa's Talking or a development-safe fallback.
 */

class SmsService {
    private $conn;
    private $provider;
    private $environment;
    private $username;
    private $apiKey;
    private $senderId;
    private $smsgatewayApiKey;
    private $smsgatewayDeviceId;

    public function __construct($database) {
        $this->conn = $database->getConnection();
        $this->provider = strtolower($_ENV['SMS_PROVIDER'] ?? 'log');
        $this->environment = strtolower($_ENV['AT_ENV'] ?? 'sandbox');
        $this->username = $_ENV['AT_USERNAME'] ?? '';
        $this->apiKey = $_ENV['AT_API_KEY'] ?? '';
        $this->senderId = $_ENV['AT_SENDER_ID'] ?? '';
        $this->smsgatewayApiKey = $_ENV['SMSGATEWAY_API_KEY'] ?? '';
        $this->smsgatewayDeviceId = $_ENV['SMSGATEWAY_DEVICE_ID'] ?? '';
    }

    public function sendGuestVerificationCode($userId, $phone, $code) {
        $minutes = max(1, (int) ceil(((int) ($_ENV['VERIFICATION_CODE_EXPIRY'] ?? 900)) / 60));
        $message = "Digital Library code: {$code}. It expires in {$minutes} minutes.";
        return $this->sendSms($userId, $phone, $message);
    }

    private function sendSms($userId, $phone, $message) {
        $normalizedPhone = $this->normalizePhone($phone);
        $delivery = 'unconfigured';
        $error = null;
        $success = false;

        if ($this->provider === 'smsgateway' && !empty($this->smsgatewayApiKey)) {
            try {
                $result = $this->sendViaSmsGateway($normalizedPhone, $message);
                $delivery = 'sent';
                $success = true;

                $this->logSms($userId, $normalizedPhone, $message, 'sent', null);
                $this->storeDevelopmentCopy($normalizedPhone, $message, $delivery, $result);
            } catch (\Throwable $e) {
                $error = $e->getMessage();
                $this->logSms($userId, $normalizedPhone, $message, 'failed', $error);
                $this->storeDevelopmentCopy($normalizedPhone, $message, 'failed', null, $error);
            }
        } elseif ($this->provider === 'africastalking' && $this->hasAfricaTalkingCredentials()) {
            try {
                $result = $this->sendViaAfricaTalking($normalizedPhone, $message);
                $delivery = $this->environment;
                $success = true;

                $this->logSms($userId, $normalizedPhone, $message, 'sent', null);
                $this->storeDevelopmentCopy($normalizedPhone, $message, $delivery, $result);
            } catch (\Throwable $e) {
                $error = $e->getMessage();
            }
        }

        if (!$success) {
            if ($this->isDevelopment()) {
                $success = true;
                $delivery = 'simulated';
                $this->logSms($userId, $normalizedPhone, $message, 'sent', $error);
                $this->storeDevelopmentCopy($normalizedPhone, $message, $delivery, null, $error);
            } else {
                $this->logSms($userId, $normalizedPhone, $message, 'failed', $error ?: 'SMS provider not configured');
            }
        }

        return [
            'success' => $success,
            'delivery' => $delivery,
            'message' => $success ? 'Verification SMS prepared' : 'Failed to send verification SMS',
            'error' => $error,
        ];
    }

    private function sendViaSmsGateway($phone, $message) {
        $payload = [
            'phone_number' => $phone,
            'message' => $message,
        ];

        $curl = curl_init('https://smsgateway.me/api/send');
        curl_setopt_array($curl, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 20,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => 0,
            CURLOPT_HTTPHEADER => [
                'Accept: application/json',
                'Content-Type: application/json',
            ],
            CURLOPT_POSTFIELDS => json_encode($payload),
            CURLOPT_USERPWD => $this->smsgatewayApiKey . ':',
        ]);

        $responseBody = curl_exec($curl);
        $curlError = curl_error($curl);
        $statusCode = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
        curl_close($curl);

        if ($responseBody === false) {
            throw new RuntimeException('SMS Gateway request failed: ' . $curlError);
        }

        $decoded = json_decode($responseBody, true);

        if ($statusCode >= 400) {
            $message = $decoded['error'] ?? $decoded['message'] ?? $responseBody;
            throw new RuntimeException('SMS Gateway rejected the SMS request: ' . $message);
        }

        return $decoded ?: ['raw' => $responseBody];
    }

    private function hasAfricaTalkingCredentials() {
        return !empty($this->apiKey) && ($this->environment === 'sandbox' || !empty($this->username));
    }

    private function sendViaAfricaTalking($phone, $message) {
        $username = $this->environment === 'sandbox' ? 'sandbox' : $this->username;
        $payload = [
            'username' => $username,
            'to' => $phone,
            'message' => $message,
        ];

        if ($this->environment !== 'sandbox' && !empty($this->senderId)) {
            $payload['from'] = $this->senderId;
        }

        $curl = curl_init('https://api.africastalking.com/version1/messaging');
        curl_setopt_array($curl, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 20,
            CURLOPT_HTTPHEADER => [
                'Accept: application/json',
                'Content-Type: application/x-www-form-urlencoded',
                'apiKey: ' . $this->apiKey,
            ],
            CURLOPT_POSTFIELDS => http_build_query($payload),
        ]);

        $responseBody = curl_exec($curl);
        $curlError = curl_error($curl);
        $statusCode = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
        curl_close($curl);

        if ($responseBody === false) {
            throw new RuntimeException('Africa\'s Talking request failed: ' . $curlError);
        }

        $decoded = json_decode($responseBody, true);

        if ($statusCode >= 400) {
            $message = $decoded['SMSMessageData']['Message'] ?? $responseBody;
            throw new RuntimeException('Africa\'s Talking rejected the SMS request: ' . $message);
        }

        return $decoded ?: ['raw' => $responseBody];
    }

    private function isDevelopment() {
        return ($_ENV['APP_ENV'] ?? 'production') === 'development';
    }

    private function normalizePhone($phone) {
        $trimmed = trim((string) $phone);
        $hasPlus = strpos($trimmed, '+') === 0;
        $digits = preg_replace('/\D+/', '', $trimmed);

        if ($digits === '') {
            return $trimmed;
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

        return $hasPlus ? '+' . $digits : $digits;
    }

    private function logSms($userId, $phone, $message, $status, $error = null) {
        try {
            $stmt = $this->conn->prepare("
                INSERT INTO sms_logs (user_id, recipient_phone, message, status, error_message, sent_at)
                VALUES (?, ?, ?, ?, ?, NOW())
            ");

            if ($stmt) {
                $stmt->bind_param("issss", $userId, $phone, $message, $status, $error);
                $stmt->execute();
            }
        } catch (\Throwable $e) {
            Logger::warning("Could not log SMS: " . $e->getMessage());
        }
    }

    private function storeDevelopmentCopy($phone, $message, $delivery, $providerResult = null, $error = null) {
        if (!$this->isDevelopment()) {
            return;
        }

        $logDir = __DIR__ . '/../../logs';
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }

        $entry = [
            'timestamp' => date('c'),
            'provider' => $this->provider,
            'delivery' => $delivery,
            'phone' => $phone,
            'message' => $message,
        ];

        if ($providerResult !== null) {
            $entry['provider_result'] = $providerResult;
        }

        if ($error) {
            $entry['error'] = $error;
        }

        file_put_contents($logDir . '/sms-outbox.log', json_encode($entry, JSON_UNESCAPED_SLASHES) . PHP_EOL, FILE_APPEND);
    }
}
