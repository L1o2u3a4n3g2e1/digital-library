const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'digital-library-secret-key-2025';

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads', 'books');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Initialize SQLite Database
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) console.error('Database connection error:', err);
  else console.log('Connected to in-memory SQLite database');
  initializeDatabase();
});

// Initialize Database Tables
function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE,
      phone_number TEXT UNIQUE,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'client',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Categories table
    db.run(`CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      name_kin TEXT NOT NULL
    )`);

    // Languages table
    db.run(`CREATE TABLE IF NOT EXISTS languages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL
    )`);

    // Books table
    db.run(`CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      title_kin TEXT,
      author TEXT NOT NULL,
      author_kin TEXT,
      description TEXT,
      description_kin TEXT,
      category_id INTEGER,
      language_id INTEGER,
      content TEXT,
      content_kin TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(category_id) REFERENCES categories(id),
      FOREIGN KEY(language_id) REFERENCES languages(id)
    )`);

    // User activities table
    db.run(`CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      activity_type TEXT,
      book_id INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(book_id) REFERENCES books(id)
    )`);

    // Insert sample languages
    db.run(`INSERT OR IGNORE INTO languages (code, name) VALUES ('en', 'English')`);
    db.run(`INSERT OR IGNORE INTO languages (code, name) VALUES ('kin', 'Kinyarwanda')`);

    // Insert sample categories
    db.run(`INSERT OR IGNORE INTO categories (name, name_kin) VALUES (?, ?)`, ['Fiction', 'Ibitabo by imvano']);
    db.run(`INSERT OR IGNORE INTO categories (name, name_kin) VALUES (?, ?)`, ['Education', 'Imyigire']);
    db.run(`INSERT OR IGNORE INTO categories (name, name_kin) VALUES (?, ?)`, ['Science', 'Siyanse']);
    db.run(`INSERT OR IGNORE INTO categories (name, name_kin) VALUES (?, ?)`, ['History', 'Amateka']);

    // Insert sample books
    const sampleBooks = [
      {
        title: 'The Great Journey',
        title_kin: 'Umwendo Munini',
        author: 'John Smith',
        author_kin: 'John Smith',
        description: 'An adventure story about exploration and discovery',
        description_kin: 'Inkuru y\'ubucuti kandi y\'ibihe bishya',
        content: 'Chapter 1: The Beginning... It was a cold morning when our hero started his journey. The mountains were tall and the sky was blue. He packed his bags with determination and set forth...',
        content_kin: 'Icyiciro 1: Inzira Imwe... Kwari kinini iyo umugeni ye gutangira umwendo we. Ibirunga byari birefu kandi inyanja yari itambitse. Yuzuye amahoro ye kandi yaravuye...',
        category_id: 1,
        language_id: 1
      },
      {
        title: 'Learning Mathematics',
        title_kin: 'Kwigisha Imibare',
        author: 'Dr. Alice Johnson',
        author_kin: 'Dr. Alice Johnson',
        description: 'A comprehensive guide to basic mathematics',
        description_kin: 'Gitabo cyambere ku mibare',
        content: 'Mathematics is the language of the universe. In this book, we explore the fundamentals of arithmetic, algebra, and geometry. Chapter 1: Numbers and Their Properties...',
        content_kin: 'Imibare ni ururimi rw\'isi. Muri iki gitabo, tuzakuramo ibisanzwe bya mibare. Icyiciro 1: Imibare n\'ibyiza byayo...',
        category_id: 2,
        language_id: 1
      },
      {
        title: 'History of Rwanda',
        title_kin: 'Amateka y\'u Rwanda',
        author: 'Prof. Jean Baptiste',
        author_kin: 'Prof. Jean Baptiste',
        description: 'An in-depth exploration of Rwanda\'s rich history',
        description_kin: 'Igice kirenze cy\'amateka y\'u Rwanda',
        content: 'Rwanda has a fascinating and complex history. From the early kingdoms to the modern nation, we trace the development of this African country. Chapter 1: The Early Kingdoms...',
        content_kin: 'U Rwanda rurimo amateka ashimishije kandi yoroshye. Kuva ku mahoro yambere kugeza ku muryango wihuje, tukurikirana iterambere ry\'iri gihugu. Icyiciro 1: Mahoro Yambere...',
        category_id: 4,
        language_id: 1
      }
    ];

    sampleBooks.forEach(book => {
      db.run(
        `INSERT OR IGNORE INTO books (title, title_kin, author, author_kin, description, description_kin, content, content_kin, category_id, language_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [book.title, book.title_kin, book.author, book.author_kin, book.description, book.description_kin, book.content, book.content_kin, book.category_id, book.language_id]
      );
    });

    // Insert default admin user
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.run(
      `INSERT OR IGNORE INTO users (username, email, phone_number, password, role) VALUES (?, ?, ?, ?, ?)`,
      ['admin', 'admin@library.com', '+250788000000', hashedPassword, 'admin']
    );

    // Insert default client user
    const clientPassword = bcrypt.hashSync('client123', 10);
    db.run(
      `INSERT OR IGNORE INTO users (username, email, phone_number, password, role) VALUES (?, ?, ?, ?, ?)`,
      ['client', 'client@library.com', '+250788111111', clientPassword, 'client']
    );

    console.log('Database initialized with sample data');
  });
}

// Authentication Routes
app.post('/api/auth/register', (req, res) => {
  const { username, email, password, phoneNumber } = req.body;
  const newUsername = username || phoneNumber;

  if (!newUsername || !password) {
    return res.status(400).json({ error: 'Username or phone number and password are required' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run(
    'INSERT INTO users (username, email, phone_number, password, role) VALUES (?, ?, ?, ?, ?)',
    [newUsername, email || null, phoneNumber || null, hashedPassword, 'client'],
    function(err) {
      if (err) {
        return res.status(400).json({ error: 'User already exists' });
      }
      const token = jwt.sign(
        { userId: this.lastID, role: 'client', username: newUsername },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      res.json({
        token,
        user: {
          id: this.lastID,
          username: newUsername,
          email: email || null,
          phoneNumber: phoneNumber || null,
          role: 'client'
        }
      });
    }
  );
});

app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ? OR phone_number = ? OR email = ?', [identifier, identifier, identifier], (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  });
});

// Get current user info
app.get('/api/auth/me', verifyToken, (req, res) => {
  db.get('SELECT id, username, email, role, created_at FROM users WHERE id = ?', [req.user.userId], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  });
});

// Middleware to verify JWT
function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
}

// Book Routes
app.get('/api/books', (req, res) => {
  const { language, category, search } = req.query;
  let query = 'SELECT * FROM books WHERE 1=1';
  const params = [];

  if (language) {
    query += ' AND language_id = (SELECT id FROM languages WHERE code = ?)';
    params.push(language);
  }

  if (category) {
    query += ' AND category_id = ?';
    params.push(category);
  }

  if (search) {
    query += ' AND (title LIKE ? OR author LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  db.all(query, params, (err, books) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(books);
  });
});

app.get('/api/books/:id', (req, res) => {
  db.get('SELECT * FROM books WHERE id = ?', [req.params.id], (err, book) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  });
});

app.post('/api/books', verifyToken, upload.single('file'), (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { title, title_kin, author, author_kin, description, description_kin, content, content_kin, category_id, language_id } = req.body;
  const file_path = req.file ? `/uploads/books/${req.file.filename}` : null;

  db.run(
    'INSERT INTO books (title, title_kin, author, author_kin, description, description_kin, content, content_kin, category_id, language_id, file_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [title, title_kin, author, author_kin, description, description_kin, content, content_kin, category_id, language_id, file_path],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Book added successfully', bookId: this.lastID });
    }
  );
});

app.put('/api/books/:id', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { title, author, description, content } = req.body;
  db.run(
    'UPDATE books SET title = ?, author = ?, description = ?, content = ? WHERE id = ?',
    [title, author, description, content, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Book updated successfully' });
    }
  );
});

app.delete('/api/books/:id', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  db.run('DELETE FROM books WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Book deleted successfully' });
  });
});

// Categories Routes
app.get('/api/categories', (req, res) => {
  db.all('SELECT * FROM categories', (err, categories) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(categories);
  });
});

app.post('/api/categories', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { name, name_kin } = req.body;
  db.run(
    'INSERT INTO categories (name, name_kin) VALUES (?, ?)',
    [name, name_kin],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Category created', categoryId: this.lastID });
    }
  );
});

app.delete('/api/categories/:id', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  db.run('DELETE FROM categories WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Category deleted' });
  });
});

// User Management Routes (Admin only)
app.get('/api/users', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  db.all('SELECT id, username, email, role, created_at FROM users', (err, users) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(users);
  });
});

app.delete('/api/users/:id', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  db.run('DELETE FROM users WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User deleted' });
  });
});

app.put('/api/users/:id/role', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { role } = req.body;
  if (!['admin', 'client'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  db.run('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User role updated' });
  });
});

// Search Route for Voice Search
app.get('/api/search', (req, res) => {
  const { query, language } = req.query;
  let sql = 'SELECT * FROM books WHERE (title LIKE ? OR author LIKE ? OR description LIKE ?)';
  const params = [`%${query}%`, `%${query}%`, `%${query}%`];

  if (language && language !== 'all') {
    sql += ' AND language_id = (SELECT id FROM languages WHERE code = ?)';
    params.push(language);
  }

  db.all(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Statistics Route for Admin
app.get('/api/stats', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  db.get('SELECT COUNT(*) as total_books FROM books', (err, bookStats) => {
    db.get('SELECT COUNT(*) as total_users FROM users', (err, userStats) => {
      db.get('SELECT COUNT(*) as total_activities FROM activities', (err, actStats) => {
        res.json({
          total_books: bookStats?.total_books || 0,
          total_users: userStats?.total_users || 0,
          total_activities: actStats?.total_activities || 0
        });
      });
    });
  });
});

// Activity Logging
app.post('/api/activity', verifyToken, (req, res) => {
  const { activity_type, book_id } = req.body;
  db.run(
    'INSERT INTO activities (user_id, activity_type, book_id) VALUES (?, ?, ?)',
    [req.user.userId, activity_type, book_id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Activity logged' });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Digital Library Server running on http://localhost:${PORT}`);
});
