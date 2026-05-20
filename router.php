<?php

$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$frontendBuildDir = __DIR__ . '/digital-library-main/digital_library/frontend/build';

if (strpos($uri, '/api') === 0) {
    require __DIR__ . '/backend/index.php';
    return true;
}

if (strpos($uri, '/uploads/') === 0) {
    $uploadPath = realpath(__DIR__ . $uri);
    $uploadsRoot = realpath(__DIR__ . '/uploads');

    if ($uploadPath && $uploadsRoot && strpos($uploadPath, $uploadsRoot) === 0 && is_file($uploadPath)) {
        $mime = mime_content_type($uploadPath) ?: 'application/octet-stream';
        header('Content-Type: ' . $mime);
        header('Content-Length: ' . filesize($uploadPath));
        readfile($uploadPath);
        return true;
    }

    http_response_code(404);
    echo 'File not found';
    return true;
}

$requestedFile = realpath($frontendBuildDir . $uri);
$frontendRoot = realpath($frontendBuildDir);

if ($requestedFile && $frontendRoot && strpos($requestedFile, $frontendRoot) === 0 && is_file($requestedFile)) {
    return false;
}

$indexPath = $frontendBuildDir . '/index.html';
if (is_file($indexPath)) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($indexPath);
    return true;
}

http_response_code(500);
echo 'Frontend build not found.';
return true;
