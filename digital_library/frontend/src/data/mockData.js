export const MOCK_BOOKS = [
  { id: 1, title: 'The Psychology of Persuasion', author: 'Robert Cialdini', cover: 'https://covers.openlibrary.org/b/id/8739161-L.jpg', language: 'en', category: 'business', pages: 320, progress: 65, hasAudio: true, hasTranslation: true, rating: 4.8, readers: 12400, description: 'Influence, the classic book on persuasion, explains the psychology of why people say yes.', tags: ['psychology','persuasion','business'] },
  { id: 2, title: 'L\'Étranger', author: 'Albert Camus', cover: 'https://covers.openlibrary.org/b/id/8481670-L.jpg', language: 'fr', category: 'fiction', pages: 160, progress: 0, hasAudio: true, hasTranslation: true, rating: 4.6, readers: 9800, description: 'Un roman philosophique sur l\'absurde et la condition humaine.', tags: ['philosophy','fiction','classic'] },
  { id: 3, title: 'Kilimo Bora cha Mahindi', author: 'FAO Kenya', cover: null, language: 'sw', category: 'agriculture', pages: 88, progress: 30, hasAudio: true, hasTranslation: false, rating: 4.4, readers: 3200, description: 'Mwongozo wa kilimo cha mahindi kwa wakulima wa Afrika Mashariki.', tags: ['agriculture','farming','swahili'] },
  { id: 4, title: 'Ubuzima Bwiza', author: 'Dr. Jean-Marie Nkusi', cover: null, language: 'rw', category: 'health', pages: 124, progress: 80, hasAudio: true, hasTranslation: true, rating: 4.7, readers: 5600, description: 'Inama z\'ubuzima bwiza ku muryango w\'Umunyarwanda.', tags: ['health','kinyarwanda','wellness'] },
  { id: 5, title: 'Atomic Habits', author: 'James Clear', cover: 'https://covers.openlibrary.org/b/id/10471365-L.jpg', language: 'en', category: 'education', pages: 320, progress: 0, hasAudio: true, hasTranslation: true, rating: 4.9, readers: 28000, description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones.', tags: ['habits','productivity','self-help'] },
  { id: 6, title: 'Sapiens', author: 'Yuval Noah Harari', cover: 'https://covers.openlibrary.org/b/id/8971195-L.jpg', language: 'en', category: 'history', pages: 443, progress: 45, hasAudio: true, hasTranslation: true, rating: 4.7, readers: 31000, description: 'A Brief History of Humankind.', tags: ['history','anthropology','science'] },
  { id: 7, title: 'The Alchemist', author: 'Paulo Coelho', cover: 'https://covers.openlibrary.org/b/id/8321848-L.jpg', language: 'en', category: 'fiction', pages: 197, progress: 100, hasAudio: true, hasTranslation: true, rating: 4.5, readers: 19600, description: 'A magical story about following your dreams.', tags: ['fiction','philosophy','inspirational'] },
  { id: 8, title: 'Santé Familiale', author: 'Dr. Amina Diallo', cover: null, language: 'fr', category: 'health', pages: 210, progress: 0, hasAudio: false, hasTranslation: true, rating: 4.3, readers: 4100, description: 'Guide complet de santé pour les familles africaines.', tags: ['health','family','french'] },
];

export const MOCK_STATS = {
  booksRead: 14, listeningHours: 38, streak: 7, level: 'Avid Reader',
  weeklyReadingMinutes: [25, 40, 30, 55, 45, 60, 35],
  categoryBreakdown: [
    { name: 'Fiction', value: 35 }, { name: 'Science', value: 25 },
    { name: 'Health', value: 20 }, { name: 'History', value: 20 },
  ],
};

export const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'recommendation', message: 'New book recommended: "Thinking Fast and Slow"', time: '2m ago', read: false },
  { id: 2, type: 'audio', message: 'Audio for "Sapiens" is ready to listen', time: '1h ago', read: false },
  { id: 3, type: 'translation', message: 'Translation complete: "Ubuzima Bwiza" → English', time: '3h ago', read: true },
  { id: 4, type: 'milestone', message: '🎉 You completed 7-day reading streak!', time: '1d ago', read: true },
];

export const MOCK_USER = {
  id: 1, name: 'Anne Louange', email: 'yasriyag9@gmail.com',
  avatar: null, language: 'en', joinedAt: '2024-01-15',
  booksRead: 14, savedBooks: 6,
};

export const SAMPLE_TEXT = `Once upon a time, in a land where stories lived in every leaf and stone, there was a great library at the heart of a village. This library held books in every language spoken under the sun — English, French, Kiswahili, and Kinyarwanda.

The villagers would come from far and near to read, to listen, and to learn. Some came to find wisdom in the pages of ancient tales. Others came to hear the voices of distant lands through the gift of audio narration.

On the highest shelf lived a very special book — one that could translate itself into any language simply by being read aloud. The children loved this book most of all, for it taught them that all stories are one story, and all languages are one language: the language of the human heart.

The library keeper, an elderly woman named Amara, understood this truth better than anyone. "Books are bridges," she would say. "They carry you from where you are to where you need to be."

And so the library grew, one story at a time, one reader at a time, until its light reached every corner of the world.`;
