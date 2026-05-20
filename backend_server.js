import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Digital Library API', status: 'running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', service: 'digital-library-api' });
});

// Books endpoints
app.get('/api/books', (req, res) => {
  res.json({
    books: [
      { id: 1, title: 'Python Programming', author: 'John Doe' },
      { id: 2, title: 'Web Development', author: 'Jane Smith' },
      { id: 3, title: 'Machine Learning Basics', author: 'Bob Johnson' }
    ]
  });
});

app.post('/api/books', (req, res) => {
  res.json({ message: 'Book created', book: req.body });
});

app.get('/api/books/:id', (req, res) => {
  res.json({ id: req.params.id, title: `Book ${req.params.id}`, author: 'Unknown' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend API is running at http://localhost:${PORT}`);
});
