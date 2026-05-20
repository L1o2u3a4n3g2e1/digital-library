<?php

class LibraryController {
    private $db;
    private $service;
    private $tokenService;

    public function __construct($database) {
        $this->db = $database;
        require_once __DIR__ . '/../services/LibraryService.php';
        require_once __DIR__ . '/../services/TokenService.php';
        $this->service = new LibraryService();
        $this->tokenService = new TokenService();
    }

    private function getJsonInput() {
        $input = file_get_contents('php://input');
        return json_decode($input, true) ?? [];
    }

    private function getAuthToken() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';
        if (strpos($authHeader, 'Bearer ') === 0) {
            return substr($authHeader, 7);
        }
        return null;
    }

    private function getCurrentUserId() {
        $token = $this->getAuthToken();
        if (!$token) {
            return null;
        }

        $result = $this->tokenService->verifyToken($token);
        if (!($result['success'] ?? false)) {
            return null;
        }

        return (int)($result['data']->userId ?? 0);
    }

    private function getPreferredLanguage() {
        $headers = getallheaders();
        return $headers['X-App-Language'] ?? ($_GET['language'] ?? null);
    }

    public function listBooks() {
        $books = $this->service->listBooks($this->getCurrentUserId(), $this->getPreferredLanguage());
        Response::success($books);
    }

    public function searchBooks() {
        $query = trim($_GET['q'] ?? '');
        $userId = $this->getCurrentUserId();
        if ($query !== '') {
            $this->service->recordSearch($userId, $query, $_GET['lang'] ?? $this->getPreferredLanguage());
        }

        $books = $this->service->searchBooks($_GET, $userId, $this->getPreferredLanguage());
        Response::success($books);
    }

    public function recommendedBooks() {
        $books = $this->service->recommendedBooks($this->getCurrentUserId(), $this->getPreferredLanguage());
        Response::success($books);
    }

    public function getBook($id) {
        $book = $this->service->getBook($id, $this->getCurrentUserId());
        if (!$book) {
            Response::error('Book not found', 404);
        }

        $this->service->recordBookView($this->getCurrentUserId(), $book);
        Response::success($book);
    }

    public function uploadBook() {
        if (empty($_FILES['file'])) {
            Response::validationError(['file' => 'Book file is required']);
        }

        $file = $_FILES['file'];
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowedExtensions = ['pdf', 'txt'];

        if (!in_array($extension, $allowedExtensions, true)) {
            Response::validationError(['file' => 'Only PDF and TXT files are supported']);
        }

        $targetDir = __DIR__ . '/../../uploads/books';
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0755, true);
        }

        $safeName = time() . '-' . preg_replace('/[^a-zA-Z0-9._-]/', '-', basename($file['name']));
        $targetPath = $targetDir . '/' . $safeName;

        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            Response::error('Failed to save uploaded file', 500);
        }

        Response::success([
            'title' => $_POST['title'] ?? pathinfo($file['name'], PATHINFO_FILENAME),
            'author' => $_POST['author'] ?? 'Unknown author',
            'language' => $_POST['language'] ?? 'en',
            'category' => $_POST['category'] ?? 'general',
            'path' => 'uploads/books/' . $safeName,
            'size' => (int)$file['size'],
        ], 'Book uploaded successfully', 201);
    }

    public function uploadCover() {
        if (empty($_FILES['file'])) {
            Response::validationError(['file' => 'Cover image is required']);
        }

        $file = $_FILES['file'];
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];

        if (!in_array($extension, $allowedExtensions, true)) {
            Response::validationError(['file' => 'Only JPG, PNG, and WEBP images are supported']);
        }

        $targetDir = __DIR__ . '/../../uploads/covers';
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0755, true);
        }

        $safeName = time() . '-' . preg_replace('/[^a-zA-Z0-9._-]/', '-', basename($file['name']));
        $targetPath = $targetDir . '/' . $safeName;

        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            Response::error('Failed to save cover image', 500);
        }

        Response::success([
            'path' => 'uploads/covers/' . $safeName,
            'size' => (int)$file['size'],
        ], 'Cover uploaded successfully', 201);
    }

    public function translateText() {
        $input = $this->getJsonInput();
        $text = trim($input['text'] ?? '');
        $from = trim($input['from'] ?? 'en');
        $to = trim($input['to'] ?? 'rw');

        if ($text === '') {
            Response::validationError(['text' => 'Text is required']);
        }

        $bookId = isset($input['bookId']) ? (int)$input['bookId'] : null;
        $translated = $this->service->translateText($text, $from, $to, $bookId);
        $book = $bookId ? $this->service->getBook($bookId, $this->getCurrentUserId()) : null;
        $this->service->recordTranslation($this->getCurrentUserId(), $input, $book);

        Response::success([
            'translated' => $translated,
            'from' => $from,
            'to' => $to,
        ]);
    }

    public function translationLanguages() {
        Response::success([
            ['code' => 'en', 'label' => 'English'],
            ['code' => 'rw', 'label' => 'Kinyarwanda'],
        ]);
    }

    public function generateAudio() {
        $input = $this->getJsonInput();
        $bookId = (int)($input['bookId'] ?? 0);
        $book = $this->service->getBook($bookId, $this->getCurrentUserId());

        Response::success([
            'book_id' => $bookId,
            'language' => $input['lang'] ?? ($book['language'] ?? 'en'),
            'status' => 'browser_speech_ready',
        ], 'Audio ready for browser playback');
    }

    public function getAudio($bookId) {
        $book = $this->service->getBook($bookId, $this->getCurrentUserId());
        if (!$book) {
            Response::error('Book not found', 404);
        }

        Response::success([
            'book_id' => $bookId,
            'status' => 'browser_speech_ready',
            'text' => $book['content'][$book['language']] ?? null,
        ]);
    }

    public function getStats() {
        $userId = $this->getCurrentUserId();
        if (!$userId) {
            Response::success([
                'booksRead' => 0,
                'booksStarted' => 0,
                'listeningHours' => 0,
                'streak' => 0,
                'weeklyReadingMinutes' => [0, 0, 0, 0, 0, 0, 0],
                'readingProgress' => 0,
                'totalReadingMinutes' => 0,
                'translationsUsed' => 0,
                'voiceCommands' => 0,
                'searchCount' => 0,
                'topCategory' => null,
            ]);
        }

        Response::success($this->service->getStats($userId));
    }

    public function logRead() {
        $userId = $this->getCurrentUserId();
        if (!$userId) {
            Response::error('Unauthorized', 401);
        }

        $input = $this->getJsonInput();
        $book = $this->service->getBook((int)($input['bookId'] ?? 0), $userId);
        $result = $this->service->recordRead($userId, $input, $book);

        Response::success([
            'book_id' => (int)($input['bookId'] ?? 0),
            'metrics' => $result,
        ], 'Reading activity recorded');
    }

    public function logAudio() {
        $userId = $this->getCurrentUserId();
        if (!$userId) {
            Response::error('Unauthorized', 401);
        }

        $input = $this->getJsonInput();
        $book = $this->service->getBook((int)($input['bookId'] ?? 0), $userId);
        $this->service->recordAudio($userId, $input, $book);
        Response::success([], 'Audio activity recorded');
    }

    public function logVoice() {
        $userId = $this->getCurrentUserId();
        if (!$userId) {
            Response::error('Unauthorized', 401);
        }

        $input = $this->getJsonInput();
        $detectedLanguage = $input['detected_language'] ?? $this->service->detectLanguage($input['text'] ?? '');
        $input['detected_language'] = $detectedLanguage;
        $this->service->recordVoice($userId, $input);
        Response::success([
            'detected_language' => $detectedLanguage,
            'text' => trim($input['text'] ?? ''),
        ], 'Voice activity recorded');
    }
}
