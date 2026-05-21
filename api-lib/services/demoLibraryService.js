import fs from 'node:fs';
import path from 'node:path';

const catalogPath = path.join(process.cwd(), 'backend', 'data', 'library_catalog.json');
const resourcesPath = path.join(process.cwd(), 'backend', 'data', 'kinyarwanda_resources.json');

const readJsonFile = (filePath, fallback) => {
  try {
    if (!fs.existsSync(filePath)) {
      return fallback;
    }

    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return Array.isArray(fallback) ? (Array.isArray(parsed) ? parsed : fallback) : parsed || fallback;
  } catch {
    return fallback;
  }
};

const asArray = (value) => (Array.isArray(value) ? value : []);
const nowIso = () => new Date().toISOString();

const defaultMetrics = () => ({
  book_progress: {},
  reading_events: [],
  audio_events: [],
  searches: [],
  voice_events: [],
  translation_events: [],
  book_views: [],
});

const normalizeMetrics = (metrics) => ({
  ...defaultMetrics(),
  ...(metrics && typeof metrics === 'object' ? metrics : {}),
  book_progress: metrics?.book_progress && typeof metrics.book_progress === 'object' ? metrics.book_progress : {},
  reading_events: asArray(metrics?.reading_events).slice(-50),
  audio_events: asArray(metrics?.audio_events).slice(-50),
  searches: asArray(metrics?.searches).slice(-30),
  voice_events: asArray(metrics?.voice_events).slice(-30),
  translation_events: asArray(metrics?.translation_events).slice(-30),
  book_views: asArray(metrics?.book_views).slice(-40),
});

const cookieOptions = (days = 30) => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: false,
  path: '/',
  maxAge: days * 24 * 60 * 60 * 1000,
});

const decodeCookieJson = (value, fallback) => {
  try {
    if (!value) return fallback;
    return JSON.parse(decodeURIComponent(value));
  } catch {
    return fallback;
  }
};

const encodeCookieJson = (value) => encodeURIComponent(JSON.stringify(value));

export default class DemoLibraryService {
  constructor() {
    this.catalog = readJsonFile(catalogPath, []);
    this.resources = readJsonFile(resourcesPath, {
      glossary: {},
      kinyarwanda_markers: [],
      english_markers: [],
    });
  }

  getMetrics(request) {
    return normalizeMetrics(decodeCookieJson(request.cookies?.ml_demo_metrics, defaultMetrics()));
  }

  persistMetrics(response, metrics) {
    response.cookie('ml_demo_metrics', encodeCookieJson(normalizeMetrics(metrics)), cookieOptions());
  }

  getUploads(request) {
    return asArray(decodeCookieJson(request.cookies?.ml_demo_uploads, []));
  }

  persistUploads(response, uploads) {
    response.cookie('ml_demo_uploads', encodeCookieJson(asArray(uploads).slice(-3)), cookieOptions());
  }

  summarizeBookForUser(book, progressMap = {}) {
    const progressInfo = progressMap[String(book.id)] || {
      progress: 0,
      minutes: 0,
      completed: false,
      last_language: book.language,
    };

    return {
      ...book,
      progress: Number(progressInfo.progress || 0),
      minutes_read: Number(progressInfo.minutes || 0),
      completed: Boolean(progressInfo.completed),
      preferred_language: progressInfo.last_language || book.language,
    };
  }

  uploadedBooksFromCookie(request) {
    return this.getUploads(request).map((item) => ({
      ...item,
      progress: 0,
      minutes_read: 0,
      completed: false,
      preferred_language: item.language || 'en',
    }));
  }

  async listBooks(userId = null, preferredLanguage = null, request = { cookies: {} }) {
    const uploads = this.uploadedBooksFromCookie(request);
    const progressMap = userId ? this.getMetrics(request).book_progress || {} : {};
    const summarized = [...this.catalog, ...uploads].map((book) => this.summarizeBookForUser(book, progressMap));

    if (preferredLanguage) {
      summarized.sort((left, right) => {
        const leftScore = asArray(left.available_languages).includes(preferredLanguage) ? 1 : 0;
        const rightScore = asArray(right.available_languages).includes(preferredLanguage) ? 1 : 0;
        if (leftScore === rightScore) {
          return Number(right.rating || 0) - Number(left.rating || 0);
        }
        return rightScore - leftScore;
      });
    }

    return summarized;
  }

  async getBook(bookId, userId = null, request = { cookies: {} }) {
    const books = await this.listBooks(userId, null, request);
    return books.find((book) => String(book.id) === String(bookId)) || null;
  }

  async searchBooks(queryParams = {}, userId = null, preferredLanguage = null, request = { cookies: {} }) {
    const books = await this.listBooks(userId, preferredLanguage, request);
    const query = String(queryParams.q || '').trim().toLowerCase();
    const language = String(queryParams.lang || '').trim();
    const category = String(queryParams.category || '').trim();
    const hasAudio = queryParams.hasAudio;
    const sort = String(queryParams.sort || 'relevance').trim();

    const filtered = books.filter((book) => {
      if (query) {
        const haystack = [book.title, book.title_en, book.author, book.description, book.description_en]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }

      if (language && language !== 'all') {
        if (book.language !== language && !asArray(book.available_languages).includes(language)) {
          return false;
        }
      }

      if (category && category !== 'all' && book.category !== category) {
        return false;
      }

      if (hasAudio !== undefined && hasAudio !== '' && String(hasAudio) !== 'false' && !book.hasAudio) {
        return false;
      }

      return true;
    });

    filtered.sort((left, right) => {
      if (sort === 'rating') return Number(right.rating || 0) - Number(left.rating || 0);
      if (sort === 'popular') return Number(right.readers || 0) - Number(left.readers || 0);
      if (sort === 'newest') return String(right.id).localeCompare(String(left.id), undefined, { numeric: true });
      return Number(right.progress || 0) - Number(left.progress || 0);
    });

    return filtered;
  }

  async recommendedBooks(userId = null, preferredLanguage = null, request = { cookies: {} }) {
    const books = await this.listBooks(userId, preferredLanguage, request);
    if (!userId) {
      return [...books].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0)).slice(0, 8);
    }

    const metrics = this.getMetrics(request);
    const categoryScores = {};

    for (const event of metrics.reading_events || []) {
      if (event.category) {
        categoryScores[event.category] = (categoryScores[event.category] || 0) + Number(event.minutes || 0);
      }
    }

    return [...books]
      .sort((left, right) => {
        const leftScore = (categoryScores[left.category] || 0) + (Number(left.rating || 0) * 10) + (Number(left.progress || 0) / 10);
        const rightScore = (categoryScores[right.category] || 0) + (Number(right.rating || 0) * 10) + (Number(right.progress || 0) / 10);
        return rightScore - leftScore;
      })
      .slice(0, 8);
  }

  recordBookView(userId, book, request, response) {
    if (!userId || !book) return;
    const metrics = this.getMetrics(request);
    metrics.book_views.push({ book_id: String(book.id), category: book.category, at: nowIso() });
    this.persistMetrics(response, metrics);
  }

  recordSearch(userId, query, language, request, response) {
    if (!userId || !query) return;
    const metrics = this.getMetrics(request);
    metrics.searches.push({ query, language: language || 'unknown', at: nowIso() });
    this.persistMetrics(response, metrics);
  }

  recordRead(userId, payload, book, request, response) {
    if (!userId) return null;
    const metrics = this.getMetrics(request);
    const bookId = String(payload.bookId || '');
    const minutes = Math.max(0, Number(payload.minutes || 0));
    const progress = Math.max(0, Math.min(100, Number(payload.progress || 0)));
    const language = payload.language || book?.language || 'en';
    const completed = Boolean(payload.completed) || progress >= 100;

    if (!metrics.book_progress[bookId]) {
      metrics.book_progress[bookId] = {
        progress: 0,
        minutes: 0,
        completed: false,
        last_language: language,
      };
    }

    const target = metrics.book_progress[bookId];
    target.progress = Math.max(Number(target.progress || 0), progress);
    target.minutes = Number(target.minutes || 0) + minutes;
    target.completed = Boolean(target.completed) || completed;
    target.last_language = language;
    target.updated_at = nowIso();

    metrics.reading_events.push({
      book_id: bookId,
      category: book?.category || null,
      minutes,
      progress,
      language,
      at: nowIso(),
    });

    this.persistMetrics(response, metrics);
    return target;
  }

  recordAudio(userId, payload, book, request, response) {
    if (!userId) return;
    const metrics = this.getMetrics(request);
    metrics.audio_events.push({
      book_id: String(payload.bookId || ''),
      category: book?.category || null,
      seconds: Math.max(0, Number(payload.seconds || 0)),
      language: payload.language || book?.language || 'en',
      at: nowIso(),
    });
    this.persistMetrics(response, metrics);
  }

  recordVoice(userId, payload, request, response) {
    if (!userId) return;
    const metrics = this.getMetrics(request);
    metrics.voice_events.push({
      text: String(payload.text || '').trim(),
      detected_language: payload.detected_language || 'unknown',
      at: nowIso(),
    });
    this.persistMetrics(response, metrics);
  }

  recordTranslation(userId, payload, book, request, response) {
    if (!userId) return;
    const metrics = this.getMetrics(request);
    metrics.translation_events.push({
      book_id: String(payload.bookId || ''),
      category: book?.category || null,
      from: payload.from || 'en',
      to: payload.to || 'rw',
      length: String(payload.text || '').length,
      at: nowIso(),
    });
    this.persistMetrics(response, metrics);
  }

  buildWeeklyReadingMinutes(readingEvents) {
    const totals = [0, 0, 0, 0, 0, 0, 0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const event of readingEvents) {
      const date = new Date(event.at);
      date.setHours(0, 0, 0, 0);
      const diffDays = Math.round((date.getTime() - today.getTime()) / 86400000);
      if (diffDays <= 0 && diffDays >= -6) {
        totals[6 + diffDays] += Number(event.minutes || 0);
      }
    }

    return totals;
  }

  calculateStreak(readingEvents, audioEvents) {
    const days = new Set();
    for (const event of [...readingEvents, ...audioEvents]) {
      days.add(new Date(event.at).toISOString().slice(0, 10));
    }

    let streak = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    while (days.has(cursor.toISOString().slice(0, 10))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
  }

  getStats(userId, request) {
    if (!userId) {
      return {
        booksRead: 0,
        booksStarted: 0,
        listeningHours: 0,
        streak: 0,
        weeklyReadingMinutes: [0, 0, 0, 0, 0, 0, 0],
        readingProgress: 0,
        totalReadingMinutes: 0,
        translationsUsed: 0,
        voiceCommands: 0,
        searchCount: 0,
        topCategory: null,
      };
    }

    const metrics = this.getMetrics(request);
    const progressMap = metrics.book_progress || {};
    const readingEvents = metrics.reading_events || [];
    const audioEvents = metrics.audio_events || [];
    const categoryMinutes = {};
    let booksRead = 0;
    let totalReadingMinutes = 0;
    let audioSeconds = 0;
    const activeProgress = [];

    for (const item of Object.values(progressMap)) {
      if (item.completed) booksRead += 1;
      if (item.progress) activeProgress.push(Number(item.progress));
    }

    for (const event of readingEvents) {
      const minutes = Math.max(0, Number(event.minutes || 0));
      totalReadingMinutes += minutes;
      if (event.category) {
        categoryMinutes[event.category] = (categoryMinutes[event.category] || 0) + minutes;
      }
    }

    for (const event of audioEvents) {
      audioSeconds += Math.max(0, Number(event.seconds || 0));
    }

    const topCategory = Object.entries(categoryMinutes).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    return {
      booksRead,
      booksStarted: Object.keys(progressMap).length,
      listeningHours: Number((audioSeconds / 3600).toFixed(1)),
      streak: this.calculateStreak(readingEvents, audioEvents),
      weeklyReadingMinutes: this.buildWeeklyReadingMinutes(readingEvents),
      readingProgress: activeProgress.length ? Math.round(activeProgress.reduce((sum, value) => sum + value, 0) / activeProgress.length) : 0,
      totalReadingMinutes,
      translationsUsed: asArray(metrics.translation_events).length,
      voiceCommands: asArray(metrics.voice_events).length,
      searchCount: asArray(metrics.searches).length,
      topCategory,
    };
  }

  detectLanguage(text) {
    const normalized = String(text || '').trim().toLowerCase();
    if (!normalized) return 'unknown';

    const rwMarkers = asArray(this.resources.kinyarwanda_markers);
    const enMarkers = asArray(this.resources.english_markers);

    let rwScore = 0;
    for (const marker of rwMarkers) {
      if (marker && new RegExp(`\\b${marker.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'u').test(normalized)) {
        rwScore += 1;
      }
    }

    let enScore = 0;
    for (const marker of enMarkers) {
      if (marker && new RegExp(`\\b${marker.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'u').test(normalized)) {
        enScore += 1;
      }
    }

    if (rwScore === 0 && enScore === 0) {
      return /[a-z]/u.test(normalized) ? 'en' : 'unknown';
    }

    if (Math.abs(rwScore - enScore) <= 1 && rwScore > 0 && enScore > 0) {
      return 'mixed';
    }

    return rwScore > enScore ? 'rw' : 'en';
  }

  async translateText(text, from, to, bookId = null, request = { cookies: {} }) {
    let value = String(text || '').trim();
    if (!value || from === to) {
      return value;
    }

    if (bookId) {
      const book = await this.getBook(bookId, null, request);
      if (book?.content?.[from] && book?.content?.[to]) {
        const sourceParagraphs = String(book.content[from]).split(/\n\s*\n/);
        const targetParagraphs = String(book.content[to]).split(/\n\s*\n/);
        for (let index = 0; index < sourceParagraphs.length; index += 1) {
          if (sourceParagraphs[index].includes(value) && targetParagraphs[index]) {
            return targetParagraphs[index];
          }
        }
      }
    }

    const glossary = this.resources.glossary || {};
    if (from === 'en' && to === 'rw') {
      for (const [english, kinyarwanda] of Object.entries(glossary)) {
        value = value.replace(new RegExp(`\\b${english.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'gi'), kinyarwanda);
      }
      return `[rw] ${value}`;
    }

    if (from === 'rw' && to === 'en') {
      for (const [english, kinyarwanda] of Object.entries(glossary)) {
        value = value.replace(new RegExp(`\\b${String(kinyarwanda).replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'giu'), english);
      }
      return `[en] ${value}`;
    }

    return `[${to}] ${value}`;
  }

  createUploadedBook({ file, body, currentUserId, request, response }) {
    const title = body.title || path.parse(file.originalname).name;
    const author = body.author || 'Unknown author';
    const language = body.language || 'en';
    const category = body.category || 'general';
    const description = body.description || '';
    const generateAudio = String(body.generateAudio || 'true') !== 'false';
    const allowTranslation = String(body.allowTranslation || 'true') !== 'false';

    let contentText = description || `${title} was uploaded successfully.`;
    if (file.mimetype === 'text/plain' || file.originalname.toLowerCase().endsWith('.txt')) {
      contentText = file.buffer.toString('utf8').trim() || contentText;
    } else if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      contentText = `${description || title}\n\nPDF upload received in Vercel demo mode. Full PDF extraction is not enabled, so this preview uses the provided metadata.`;
    }

    const preview = contentText.slice(0, 1200);
    const uploads = this.getUploads(request);
    const next = [
      ...uploads,
      {
        id: `upload-demo-${Date.now()}`,
        slug: `upload-demo-${Date.now()}`,
        title,
        title_en: null,
        author,
        description,
        category,
        language,
        available_languages: [language],
        cover: body.cover || '',
        hasAudio: generateAudio,
        hasTranslation: allowTranslation,
        source_url: null,
        download_url: null,
        edition_type: 'user_upload',
        rating: 4.0,
        readers: 1,
        content: { [language]: preview },
        created_by: currentUserId || null,
        created_at: nowIso(),
      },
    ].slice(-3);

    this.persistUploads(response, next);
    return next[next.length - 1];
  }
}
