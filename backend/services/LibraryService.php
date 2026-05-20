<?php

class LibraryService {
    private $catalogPath;
    private $metricsPath;
    private $catalog;

    public function __construct() {
        $this->catalogPath = __DIR__ . '/../data/library_catalog.json';
        $this->metricsPath = __DIR__ . '/../data/user_metrics.json';
        $this->catalog = $this->loadCatalog();
    }

    private function loadCatalog() {
        if (!file_exists($this->catalogPath)) {
            return [];
        }

        $decoded = json_decode(file_get_contents($this->catalogPath), true);
        return is_array($decoded) ? $decoded : [];
    }

    private function loadMetrics() {
        if (!file_exists($this->metricsPath)) {
            return ['users' => []];
        }

        $decoded = json_decode(file_get_contents($this->metricsPath), true);
        return is_array($decoded) ? $decoded : ['users' => []];
    }

    private function saveMetrics($metrics) {
        $dir = dirname($this->metricsPath);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        file_put_contents($this->metricsPath, json_encode($metrics, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

    private function loadKinyarwandaResources() {
        $resourcesPath = __DIR__ . '/../data/kinyarwanda_resources.json';
        if (!file_exists($resourcesPath)) {
            return ['glossary' => [], 'kinyarwanda_markers' => [], 'english_markers' => []];
        }

        $decoded = json_decode(file_get_contents($resourcesPath), true);
        return is_array($decoded) ? $decoded : ['glossary' => [], 'kinyarwanda_markers' => [], 'english_markers' => []];
    }

    private function userKey($userId) {
        return (string)($userId ?: 0);
    }

    private function defaultUserMetrics() {
        return [
            'book_progress' => [],
            'reading_events' => [],
            'audio_events' => [],
            'searches' => [],
            'voice_events' => [],
            'translation_events' => [],
            'book_views' => [],
        ];
    }

    private function getUserMetricsInternal(&$metrics, $userId) {
        $key = $this->userKey($userId);
        if (!isset($metrics['users'][$key])) {
            $metrics['users'][$key] = $this->defaultUserMetrics();
        }
        return $metrics['users'][$key];
    }

    private function getUserMetrics($userId) {
        $metrics = $this->loadMetrics();
        return $this->getUserMetricsInternal($metrics, $userId);
    }

    private function summarizeBookForUser($book, $progressMap) {
        $bookId = (string)$book['id'];
        $progressInfo = $progressMap[$bookId] ?? [
            'progress' => 0,
            'minutes' => 0,
            'completed' => false,
            'last_language' => $book['language'],
        ];

        $book['progress'] = (int)($progressInfo['progress'] ?? 0);
        $book['minutes_read'] = (int)($progressInfo['minutes'] ?? 0);
        $book['completed'] = (bool)($progressInfo['completed'] ?? false);
        $book['preferred_language'] = $progressInfo['last_language'] ?? $book['language'];

        return $book;
    }

    public function listBooks($userId = null, $preferredLanguage = null) {
        $progressMap = [];
        if ($userId) {
            $progressMap = $this->getUserMetrics($userId)['book_progress'] ?? [];
        }

        $books = array_map(function ($book) use ($progressMap) {
            return $this->summarizeBookForUser($book, $progressMap);
        }, $this->catalog);

        if ($preferredLanguage) {
            usort($books, function ($left, $right) use ($preferredLanguage) {
                $leftScore = in_array($preferredLanguage, $left['available_languages'] ?? [], true) ? 1 : 0;
                $rightScore = in_array($preferredLanguage, $right['available_languages'] ?? [], true) ? 1 : 0;
                if ($leftScore === $rightScore) {
                    return $right['rating'] <=> $left['rating'];
                }
                return $rightScore <=> $leftScore;
            });
        }

        return $books;
    }

    public function getBook($bookId, $userId = null) {
        foreach ($this->listBooks($userId) as $book) {
            if ((int)$book['id'] === (int)$bookId) {
                return $book;
            }
        }

        return null;
    }

    public function searchBooks($queryParams, $userId = null, $preferredLanguage = null) {
        $books = $this->listBooks($userId, $preferredLanguage);
        $query = strtolower(trim($queryParams['q'] ?? ''));
        $language = trim($queryParams['lang'] ?? '');
        $category = trim($queryParams['category'] ?? '');
        $hasAudio = $queryParams['hasAudio'] ?? null;
        $sort = trim($queryParams['sort'] ?? 'relevance');

        $filtered = array_values(array_filter($books, function ($book) use ($query, $language, $category, $hasAudio) {
            if ($query !== '') {
                $haystack = strtolower(
                    ($book['title'] ?? '') . ' ' .
                    ($book['title_en'] ?? '') . ' ' .
                    ($book['author'] ?? '') . ' ' .
                    ($book['description'] ?? '') . ' ' .
                    ($book['description_en'] ?? '')
                );
                if (strpos($haystack, $query) === false) {
                    return false;
                }
            }

            if ($language !== '' && $language !== 'all') {
                if (($book['language'] ?? '') !== $language && !in_array($language, $book['available_languages'] ?? [], true)) {
                    return false;
                }
            }

            if ($category !== '' && $category !== 'all' && ($book['category'] ?? '') !== $category) {
                return false;
            }

            if ($hasAudio !== null && $hasAudio !== '' && filter_var($hasAudio, FILTER_VALIDATE_BOOLEAN) && empty($book['hasAudio'])) {
                return false;
            }

            return true;
        }));

        usort($filtered, function ($left, $right) use ($sort) {
            switch ($sort) {
                case 'rating':
                    return $right['rating'] <=> $left['rating'];
                case 'popular':
                    return $right['readers'] <=> $left['readers'];
                case 'newest':
                    return $right['id'] <=> $left['id'];
                default:
                    return ($right['progress'] ?? 0) <=> ($left['progress'] ?? 0);
            }
        });

        return $filtered;
    }

    public function recommendedBooks($userId = null, $preferredLanguage = null) {
        $books = $this->listBooks($userId, $preferredLanguage);

        if (!$userId) {
            usort($books, function ($left, $right) {
                return $right['rating'] <=> $left['rating'];
            });
            return array_slice($books, 0, 8);
        }

        $metrics = $this->getUserMetrics($userId);
        $categoryScores = [];

        foreach (($metrics['reading_events'] ?? []) as $event) {
            $category = $event['category'] ?? null;
            if ($category) {
                $categoryScores[$category] = ($categoryScores[$category] ?? 0) + (int)($event['minutes'] ?? 0);
            }
        }

        foreach (($metrics['book_views'] ?? []) as $event) {
            $category = $event['category'] ?? null;
            if ($category) {
                $categoryScores[$category] = ($categoryScores[$category] ?? 0) + 2;
            }
        }

        usort($books, function ($left, $right) use ($categoryScores) {
            $leftScore = ($categoryScores[$left['category']] ?? 0) + ($left['rating'] * 10) + (($left['progress'] ?? 0) / 10);
            $rightScore = ($categoryScores[$right['category']] ?? 0) + ($right['rating'] * 10) + (($right['progress'] ?? 0) / 10);
            return $rightScore <=> $leftScore;
        });

        return array_slice($books, 0, 8);
    }

    public function recordBookView($userId, $book) {
        if (!$userId || !$book) {
            return;
        }

        $metrics = $this->loadMetrics();
        $userMetrics = &$metrics['users'][$this->userKey($userId)];
        if (!isset($userMetrics)) {
            $userMetrics = $this->defaultUserMetrics();
        }

        $userMetrics['book_views'][] = [
            'book_id' => (int)$book['id'],
            'category' => $book['category'],
            'at' => date('c'),
        ];

        $this->saveMetrics($metrics);
    }

    public function recordRead($userId, $payload, $book = null) {
        if (!$userId) {
            return null;
        }

        $metrics = $this->loadMetrics();
        $userMetrics = &$metrics['users'][$this->userKey($userId)];
        if (!isset($userMetrics)) {
            $userMetrics = $this->defaultUserMetrics();
        }

        $bookId = (int)($payload['bookId'] ?? 0);
        $minutes = max(0, (int)($payload['minutes'] ?? 0));
        $progress = max(0, min(100, (int)($payload['progress'] ?? 0)));
        $language = $payload['language'] ?? ($book['language'] ?? 'en');
        $completed = !empty($payload['completed']) || $progress >= 100;

        $progressMap = &$userMetrics['book_progress'];
        $key = (string)$bookId;

        if (!isset($progressMap[$key])) {
            $progressMap[$key] = [
                'progress' => 0,
                'minutes' => 0,
                'completed' => false,
                'last_language' => $language,
            ];
        }

        $progressMap[$key]['progress'] = max((int)$progressMap[$key]['progress'], $progress);
        $progressMap[$key]['minutes'] = (int)$progressMap[$key]['minutes'] + $minutes;
        $progressMap[$key]['completed'] = $progressMap[$key]['completed'] || $completed;
        $progressMap[$key]['last_language'] = $language;
        $progressMap[$key]['updated_at'] = date('c');

        $userMetrics['reading_events'][] = [
            'book_id' => $bookId,
            'category' => $book['category'] ?? null,
            'minutes' => $minutes,
            'progress' => $progress,
            'language' => $language,
            'at' => date('c'),
        ];

        $this->saveMetrics($metrics);
        return $progressMap[$key];
    }

    public function recordAudio($userId, $payload, $book = null) {
        if (!$userId) {
            return;
        }

        $metrics = $this->loadMetrics();
        $userMetrics = &$metrics['users'][$this->userKey($userId)];
        if (!isset($userMetrics)) {
            $userMetrics = $this->defaultUserMetrics();
        }

        $userMetrics['audio_events'][] = [
            'book_id' => (int)($payload['bookId'] ?? 0),
            'category' => $book['category'] ?? null,
            'seconds' => max(0, (int)($payload['seconds'] ?? 0)),
            'language' => $payload['language'] ?? ($book['language'] ?? 'en'),
            'at' => date('c'),
        ];

        $this->saveMetrics($metrics);
    }

    public function recordVoice($userId, $payload) {
        if (!$userId) {
            return;
        }

        $metrics = $this->loadMetrics();
        $userMetrics = &$metrics['users'][$this->userKey($userId)];
        if (!isset($userMetrics)) {
            $userMetrics = $this->defaultUserMetrics();
        }

        $userMetrics['voice_events'][] = [
            'text' => trim($payload['text'] ?? ''),
            'detected_language' => $payload['detected_language'] ?? 'unknown',
            'at' => date('c'),
        ];

        $this->saveMetrics($metrics);
    }

    public function recordSearch($userId, $query, $language = null) {
        if (!$userId || $query === '') {
            return;
        }

        $metrics = $this->loadMetrics();
        $userMetrics = &$metrics['users'][$this->userKey($userId)];
        if (!isset($userMetrics)) {
            $userMetrics = $this->defaultUserMetrics();
        }

        $userMetrics['searches'][] = [
            'query' => $query,
            'language' => $language ?: 'unknown',
            'at' => date('c'),
        ];

        $this->saveMetrics($metrics);
    }

    public function recordTranslation($userId, $payload, $book = null) {
        if (!$userId) {
            return;
        }

        $metrics = $this->loadMetrics();
        $userMetrics = &$metrics['users'][$this->userKey($userId)];
        if (!isset($userMetrics)) {
            $userMetrics = $this->defaultUserMetrics();
        }

        $userMetrics['translation_events'][] = [
            'book_id' => (int)($payload['bookId'] ?? 0),
            'category' => $book['category'] ?? null,
            'from' => $payload['from'] ?? 'en',
            'to' => $payload['to'] ?? 'rw',
            'length' => strlen($payload['text'] ?? ''),
            'at' => date('c'),
        ];

        $this->saveMetrics($metrics);
    }

    public function detectLanguage($text) {
        $normalized = mb_strtolower(trim((string)$text), 'UTF-8');
        if ($normalized === '') {
            return 'unknown';
        }

        $resources = $this->loadKinyarwandaResources();
        $rwMarkers = $resources['kinyarwanda_markers'] ?? [];
        $enMarkers = $resources['english_markers'] ?? [];

        $rwScore = 0;
        foreach ($rwMarkers as $marker) {
            if ($marker !== '' && preg_match('/\b' . preg_quote($marker, '/') . '\b/u', $normalized)) {
                $rwScore++;
            }
        }

        $enScore = 0;
        foreach ($enMarkers as $marker) {
            if ($marker !== '' && preg_match('/\b' . preg_quote($marker, '/') . '\b/u', $normalized)) {
                $enScore++;
            }
        }

        if ($rwScore === 0 && $enScore === 0) {
            return preg_match('/[a-z]/u', $normalized) ? 'en' : 'unknown';
        }

        if (abs($rwScore - $enScore) <= 1 && $rwScore > 0 && $enScore > 0) {
            return 'mixed';
        }

        return $rwScore > $enScore ? 'rw' : 'en';
    }

    private function buildWeeklyReadingMinutes($readingEvents) {
        $totals = array_fill(0, 7, 0);
        $today = new DateTimeImmutable('today');

        foreach ($readingEvents as $event) {
            $at = new DateTimeImmutable($event['at']);
            $daysAgo = (int)$today->diff($at->setTime(0, 0))->format('%r%a');
            if ($daysAgo <= 0 && $daysAgo >= -6) {
                $index = 6 + $daysAgo;
                $totals[$index] += (int)($event['minutes'] ?? 0);
            }
        }

        return $totals;
    }

    private function calculateStreak($readingEvents, $audioEvents) {
        $days = [];

        foreach (array_merge($readingEvents, $audioEvents) as $event) {
            $date = (new DateTimeImmutable($event['at']))->format('Y-m-d');
            $days[$date] = true;
        }

        $streak = 0;
        $cursor = new DateTimeImmutable('today');

        while (isset($days[$cursor->format('Y-m-d')])) {
            $streak++;
            $cursor = $cursor->modify('-1 day');
        }

        return $streak;
    }

    public function getStats($userId) {
        $userMetrics = $this->getUserMetrics($userId);
        $progressMap = $userMetrics['book_progress'] ?? [];
        $readingEvents = $userMetrics['reading_events'] ?? [];
        $audioEvents = $userMetrics['audio_events'] ?? [];
        $translationEvents = $userMetrics['translation_events'] ?? [];
        $categoryMinutes = [];
        $totalReadingMinutes = 0;

        $booksRead = 0;
        $activeProgress = [];
        foreach ($progressMap as $item) {
            if (!empty($item['completed'])) {
                $booksRead++;
            }
            if (!empty($item['progress'])) {
                $activeProgress[] = (int)$item['progress'];
            }
        }

        $audioSeconds = 0;
        foreach ($audioEvents as $event) {
            $audioSeconds += max(0, (int)($event['seconds'] ?? 0));
        }

        foreach ($readingEvents as $event) {
            $minutes = max(0, (int)($event['minutes'] ?? 0));
            $totalReadingMinutes += $minutes;
            $category = $event['category'] ?? null;
            if ($category) {
                $categoryMinutes[$category] = ($categoryMinutes[$category] ?? 0) + $minutes;
            }
        }

        arsort($categoryMinutes);

        return [
            'booksRead' => $booksRead,
            'booksStarted' => count($progressMap),
            'listeningHours' => round($audioSeconds / 3600, 1),
            'streak' => $this->calculateStreak($readingEvents, $audioEvents),
            'weeklyReadingMinutes' => $this->buildWeeklyReadingMinutes($readingEvents),
            'readingProgress' => count($activeProgress) ? (int)round(array_sum($activeProgress) / count($activeProgress)) : 0,
            'totalReadingMinutes' => $totalReadingMinutes,
            'translationsUsed' => count($translationEvents),
            'voiceCommands' => count($userMetrics['voice_events'] ?? []),
            'searchCount' => count($userMetrics['searches'] ?? []),
            'topCategory' => key($categoryMinutes) ?: null,
        ];
    }

    public function translateText($text, $from, $to, $bookId = null) {
        $text = trim($text);
        if ($text === '' || $from === $to) {
            return $text;
        }

        if ($bookId) {
            $book = $this->getBook($bookId);
            if ($book && isset($book['content'][$from], $book['content'][$to])) {
                $sourceParagraphs = preg_split("/\n\s*\n/", $book['content'][$from]);
                $targetParagraphs = preg_split("/\n\s*\n/", $book['content'][$to]);
                foreach ($sourceParagraphs as $index => $paragraph) {
                    if (strpos($paragraph, $text) !== false && isset($targetParagraphs[$index])) {
                        return $targetParagraphs[$index];
                    }
                }
            }
        }

        $resources = $this->loadKinyarwandaResources();
        $glossary = $resources['glossary'] ?? [];

        if ($from === 'en' && $to === 'rw') {
            foreach ($glossary as $english => $kinya) {
                $text = preg_replace('/\b' . preg_quote($english, '/') . '\b/i', $kinya, $text);
            }
            return "[rw] " . $text;
        }

        if ($from === 'rw' && $to === 'en') {
            foreach ($glossary as $english => $kinya) {
                $text = preg_replace('/\b' . preg_quote($kinya, '/') . '\b/ui', $english, $text);
            }
            return "[en] " . $text;
        }

        return "[" . $to . "] " . $text;
    }
}
