<?php
/**
 * Digital Library API - Main Entry Point
 * RESTful API for user registration, authentication, and notifications
 */

// Load environment variables before reading configuration values.
require_once __DIR__ . '/../vendor/autoload.php';
$dotenv = \Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// Enable error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', ($_ENV['APP_DEBUG'] ?? false) ? '1' : '0');

// Set header to JSON
header('Content-Type: application/json');

// Enable CORS
$allowedOrigins = explode(',', $_ENV['ALLOWED_ORIGINS'] ?? 'http://localhost:3000');
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-App-Language');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Load dependencies
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/helpers/response.php';
require_once __DIR__ . '/helpers/logger.php';

// Initialize database
$db = new Database();

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remove /digital-library/backend/api from path
$path = str_replace('/digital-library/backend/api', '', $path);
// Fallback for /api if needed
if (strpos($path, '/api') === 0) {
    $path = str_replace('/api', '', $path);
}

// Log request
Logger::info("API Request: $method $path");

// Simple routing
if (preg_match('/^\/auth\//', $path)) {
    require_once __DIR__ . '/controllers/AuthController.php';
    $controller = new AuthController($db);

    if ($method === 'POST' && preg_match('/^\/auth\/register$/', $path)) {
        $controller->register();
    } elseif ($method === 'POST' && preg_match('/^\/auth\/register-guest$/', $path)) {
        $controller->registerGuest();
    } elseif ($method === 'POST' && preg_match('/^\/auth\/verify-guest-phone$/', $path)) {
        $controller->verifyGuestPhone();
    } elseif ($method === 'POST' && preg_match('/^\/auth\/verify-email$/', $path)) {
        $controller->verifyEmail();
    } elseif ($method === 'POST' && preg_match('/^\/auth\/login$/', $path)) {
        $controller->login();
    } elseif ($method === 'GET' && preg_match('/^\/auth\/me$/', $path)) {
        $controller->getMe();
    } elseif ($method === 'POST' && preg_match('/^\/auth\/resend-verification$/', $path)) {
        $controller->resendVerification();
    } elseif ($method === 'POST' && preg_match('/^\/auth\/resend-guest-verification$/', $path)) {
        $controller->resendGuestVerification();
    } elseif ($method === 'POST' && preg_match('/^\/auth\/forgot-password$/', $path)) {
        $controller->forgotPassword();
    } elseif ($method === 'POST' && preg_match('/^\/auth\/reset-password$/', $path)) {
        $controller->resetPassword();
    } elseif ($method === 'POST' && preg_match('/^\/auth\/logout$/', $path)) {
        $controller->logout();
    } else {
        Response::error('Endpoint not found', 404);
    }
} elseif (preg_match('/^\/preferences(?:\/|$)/', $path) || preg_match('/^\/csrf-token(?:\/|$)/', $path)) {
    require_once __DIR__ . '/controllers/PreferenceController.php';
    $controller = new PreferenceController($db);

    if ($method === 'GET' && preg_match('/^\/preferences$/', $path)) {
        $controller->getPreferences();
    } elseif ($method === 'PUT' && preg_match('/^\/preferences$/', $path)) {
        $controller->updatePreferences();
    } elseif ($method === 'PATCH' && preg_match('/^\/preferences\/([a-zA-Z_]+)$/', $path, $matches)) {
        $controller->updatePreferenceKey($matches[1]);
    } elseif ($method === 'POST' && preg_match('/^\/preferences\/reset$/', $path)) {
        $controller->resetPreferences();
    } elseif ($method === 'GET' && preg_match('/^\/csrf-token$/', $path)) {
        $controller->getCsrfToken();
    } else {
        Response::error('Endpoint not found', 404);
    }
} elseif (preg_match('/^\/books(?:\/|$)/', $path) || preg_match('/^\/upload(?:\/|$)/', $path) || preg_match('/^\/translate(?:\/|$)/', $path) || preg_match('/^\/audio(?:\/|$)/', $path) || preg_match('/^\/stats(?:\/|$)/', $path)) {
    require_once __DIR__ . '/controllers/LibraryController.php';
    $controller = new LibraryController($db);

    if ($method === 'GET' && preg_match('/^\/books$/', $path)) {
        $controller->listBooks();
    } elseif ($method === 'GET' && preg_match('/^\/books\/search$/', $path)) {
        $controller->searchBooks();
    } elseif ($method === 'GET' && preg_match('/^\/books\/recommended$/', $path)) {
        $controller->recommendedBooks();
    } elseif ($method === 'GET' && preg_match('/^\/books\/(\d+)$/', $path, $matches)) {
        $controller->getBook((int)$matches[1]);
    } elseif ($method === 'POST' && preg_match('/^\/upload\/book$/', $path)) {
        $controller->uploadBook();
    } elseif ($method === 'POST' && preg_match('/^\/upload\/cover$/', $path)) {
        $controller->uploadCover();
    } elseif ($method === 'POST' && preg_match('/^\/translate$/', $path)) {
        $controller->translateText();
    } elseif ($method === 'GET' && preg_match('/^\/translate\/languages$/', $path)) {
        $controller->translationLanguages();
    } elseif ($method === 'POST' && preg_match('/^\/audio\/generate$/', $path)) {
        $controller->generateAudio();
    } elseif ($method === 'GET' && preg_match('/^\/audio\/(\d+)$/', $path, $matches)) {
        $controller->getAudio((int)$matches[1]);
    } elseif ($method === 'GET' && preg_match('/^\/stats$/', $path)) {
        $controller->getStats();
    } elseif ($method === 'POST' && preg_match('/^\/stats\/read$/', $path)) {
        $controller->logRead();
    } elseif ($method === 'POST' && preg_match('/^\/stats\/audio$/', $path)) {
        $controller->logAudio();
    } elseif ($method === 'POST' && preg_match('/^\/stats\/voice$/', $path)) {
        $controller->logVoice();
    } else {
        Response::error('Endpoint not found', 404);
    }
} elseif ($method === 'GET' && preg_match('/^\/health$/', $path)) {
    Response::success(['status' => 'ok', 'timestamp' => date('Y-m-d H:i:s')]);
} else {
    Response::error('Endpoint not found', 404);
}

// Close database connection
$db->close();
?>
