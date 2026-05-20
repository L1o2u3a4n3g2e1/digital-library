<?php
/**
 * Logger Helper
 * Simple logging for debugging and monitoring
 */

class Logger {
    private static $logFile;

    public static function init() {
        $logDir = __DIR__ . '/../../logs';
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        self::$logFile = $logDir . '/app.log';
    }

    public static function info($message, $data = null) {
        self::log('INFO', $message, $data);
    }

    public static function error($message, $data = null) {
        self::log('ERROR', $message, $data);
    }

    public static function warning($message, $data = null) {
        self::log('WARNING', $message, $data);
    }

    public static function debug($message, $data = null) {
        if ($_ENV['APP_DEBUG'] ?? false) {
            self::log('DEBUG', $message, $data);
        }
    }

    private static function log($level, $message, $data = null) {
        if (!self::$logFile) {
            self::init();
        }

        $timestamp = date('Y-m-d H:i:s');
        $logMessage = "[$timestamp] $level: $message";

        if ($data) {
            $logMessage .= ' | ' . json_encode($data);
        }

        $logMessage .= PHP_EOL;

        error_log($logMessage, 3, self::$logFile);
    }
}

// Initialize logger
Logger::init();
?>
