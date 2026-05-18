# Digital Library System - Complete Implementation

A modern, multilingual digital library system built with React and Node.js featuring text-to-speech, speech recognition, and comprehensive book management.

## Features Implemented

### Core Features
- ✅ **User Authentication** - Secure login/register with JWT tokens
- ✅ **Multilingual Support** - English and Kinyarwanda interfaces
- ✅ **Book Library** - Browse, search, and filter books by category
- ✅ **Book Reader** - Clean reading interface with pagination
- ✅ **Text-to-Speech (TTS)** - Browser-native speech synthesis
- ✅ **Speech-to-Text (STT)** - Voice-based book search
- ✅ **Admin Dashboard** - Comprehensive management interface
- ✅ **Dark Mode** - Light and dark theme support
- ✅ **Responsive Design** - Works on desktop and mobile

### Admin Features
- ✅ Books Management (Create, Read, Update, Delete)
- ✅ User Management (View, Delete)
- ✅ Categories Management (Create, Delete)
- ✅ System Statistics (Total books, users, activities)
- ✅ Book Upload with content management

### Technical Stack
- **Frontend**: React 19 with modern hooks
- **Backend**: Node.js + Express with SQLite
- **Authentication**: JWT tokens (7-day expiry)
- **Database**: SQLite (in-memory, auto-persisted)
- **Speech APIs**: Browser Web Speech API (no external dependencies)
- **Styling**: CSS3 with CSS variables for theming

## How to Run

### Prerequisites
- Node.js v24.14.1 or higher
- npm v11.11.0 or higher
- Modern web browser (Chrome, Edge, Firefox)

### Step 1: Start the Backend Server

```bash
cd c:\Users\PC\Desktop\digital_library
node server.js
```

You should see:
```
Digital Library Server running on http://localhost:5000
Connected to in-memory SQLite database
Database initialized with sample data
```

### Step 2: Start the Frontend Development Server

In a new terminal:

```bash
cd c:\Users\PC\Desktop\digital_library\frontend
npm start
```

This will automatically open the application in your default browser at `http://localhost:3000`

### Step 3: Open in Browser

Navigate to: `http://localhost:3000`

## Testing the System

### Demo Credentials

**Admin Account:**
- Username: `admin`
- Password: `admin123`
- Role: Full system access

**Client Account:**
- Username: `client`
- Password: `client123`
- Role: Read-only book access

### Test Flows

#### 1. Welcome & Language Selection
1. Open http://localhost:3000
2. Click either 🇺🇸 English or 🇷🇼 Kinyarwanda
3. View demo credentials

#### 2. User Login
1. Click "Login" button
2. Enter admin credentials
3. Click "Login" button
4. Should see admin dashboard

#### 3. Library Dashboard (Client Mode)
1. Login as client user
2. Browse books in grid view
3. Use search bar to filter by title/author
4. Click category pills to filter by category
5. Click voice button (🎤) and speak to search

#### 4. Book Reading
1. Click any book card in library
2. Read content with pagination
3. Click 🔊 button to use text-to-speech
4. Click Previous/Next for navigation
5. Click "Back" to return to library

#### 5. Admin Dashboard
1. Login as admin
2. View stats in "Overview" tab
3. Add books in "Overview" tab form
4. Manage books in "Manage Books" tab
5. Manage users in "Manage Users" tab

#### 6. Multilingual Features
1. Use language selector in header (🇺🇸/🇷🇼)
2. Switch between English and Kinyarwanda
3. Interface updates in real-time
4. Books show bilingual content

#### 7. Dark Mode
1. Click theme toggle (☀️/🌙) in header
2. Interface switches between light/dark modes
3. Preference is saved

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Books
- `GET /api/books` - List all books (with filters)
- `GET /api/books/:id` - Get book details
- `POST /api/books` - Create book (admin only)
- `PUT /api/books/:id` - Update book (admin only)
- `DELETE /api/books/:id` - Delete book (admin only)

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)

### Admin
- `GET /api/users` - List all users (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)
- `PUT /api/users/:id/role` - Change user role (admin only)
- `GET /api/stats` - Get system statistics (admin only)

### Activities
- `POST /api/activity` - Log user activity

### Search
- `GET /api/search` - Advanced search with language filter

## Database Schema

### Users Table
- id: Primary key
- username: Unique username
- email: User email
- password: Hashed password (bcrypt)
- role: 'admin' or 'client'
- created_at: Registration timestamp

### Books Table
- id: Primary key
- title: Book title (English)
- title_kin: Book title (Kinyarwanda)
- author: Author name
- description: Book description
- category_id: Foreign key to categories
- language_id: Foreign key to languages
- content: Full text content
- created_at: Creation timestamp

### Categories Table
- id: Primary key
- name: Category name (English)
- name_kin: Category name (Kinyarwanda)

### Languages Table
- id: Primary key
- code: Language code ('en', 'kin')
- name: Language name

### Activities Table
- id: Primary key
- user_id: Foreign key to users
- activity_type: Type of activity
- book_id: Foreign key to books
- timestamp: Activity timestamp

## Features in Detail

### Text-to-Speech (TTS)
- Uses browser's native `SpeechSynthesis` API
- Available in book reader
- Click 🔊 button to play
- Auto-detects language from app setting
- Supports English and French (for Kinyarwanda)

### Speech-to-Text (STT)
- Uses browser's `SpeechRecognition` API
- Available in library search
- Hold down 🎤 button to record
- Release to transcribe
- Supports English and French (for Kinyarwanda)

### Dark Mode
- CSS variables for theming
- Stored in localStorage
- Persists across sessions
- Smooth transitions

### Responsive Design
- Mobile-first approach
- Tablets: 768px breakpoint
- Mobile: 480px breakpoint
- Touch-friendly buttons and inputs

## Sample Data

The system comes pre-populated with 3 sample books:

1. **The Great Journey**
   - Author: John Smith
   - Category: Fiction
   - Bilingual content included

2. **Learning Mathematics**
   - Author: Dr. Alice Johnson
   - Category: Education
   - Bilingual content included

3. **History of Rwanda**
   - Author: Prof. Jean Baptiste
   - Category: History
   - Bilingual content included

## Troubleshooting

### Backend Won't Start
```
Error: EADDRINUSE: address already in use :::5000
```
- Another process is using port 5000
- Kill it: `pkill -f "node server.js"`
- Or change PORT in server.js

### Frontend Won't Build
```
npm ERR! ERESOLVE could not resolve
```
- Delete node_modules and package-lock.json
- Run `npm install` again

### Microphone Not Working
- Ensure browser has microphone permissions
- Check browser settings for site permissions
- Try in Chrome/Edge (best support)

### Text-to-Speech Not Playing
- Check browser compatibility (Chrome, Edge, Firefox)
- Ensure system volume is not muted
- Check browser console for errors

## Browser Compatibility

| Feature | Chrome | Edge | Firefox | Safari |
|---------|--------|------|---------|--------|
| Web Speech API | ✅ | ✅ | ✅* | ❌ |
| Speech Synthesis | ✅ | ✅ | ✅ | ✅ |
| localStorage | ✅ | ✅ | ✅ | ✅ |
| CSS Grid | ✅ | ✅ | ✅ | ✅ |
| Flexbox | ✅ | ✅ | ✅ | ✅ |

*Firefox requires different API name (webkitSpeechRecognition)

## Project Structure

```
digital_library/
├── backend/
│   └── ... (legacy Python backend)
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.js (Main component - 700+ lines)
│   │   ├── App.css (Complete styling - 400+ lines)
│   │   └── ...
│   └── package.json
├── server.js (Node.js backend - 400+ lines)
├── package.json (Backend dependencies)
└── SYSTEM_README.md (This file)
```

## API Request Examples

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Get Books
```bash
curl http://localhost:5000/api/books?category=1&search=journey
```

### Get Categories
```bash
curl http://localhost:5000/api/categories
```

### Add Book (with auth)
```bash
curl -X POST http://localhost:5000/api/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title":"New Book",
    "author":"Author Name",
    "description":"Description",
    "content":"Content...",
    "category_id":1,
    "language_id":1
  }'
```

## Performance Notes

- In-memory SQLite database (fast but not persistent)
- Compiled React app suitable for production (npm run build)
- CSS is optimized with variables for theme switching
- No external API calls needed (Web Speech API is browser-native)
- Frontend bundle: ~200KB (minified)
- Backend: Lightweight Express server

## Security Considerations

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with 7-day expiry
- CORS enabled for development
- No sensitive data in localStorage (only tokens)
- SQL parameterization prevents injection
- Authentication middleware on protected routes

## Future Enhancement Opportunities

- PDF upload and rendering
- User book reviews and ratings
- Reading history and bookmarks
- Download books as PDF/EPUB
- Advanced search with full-text indexing
- User profiles and preferences
- Book sharing between users
- Backup and restore functionality
- Multi-user sessions management

## Support & Help

For issues or questions:
1. Check browser console (F12) for errors
2. Verify both servers are running
3. Test API endpoints with curl
4. Check server logs in terminal
5. Clear localStorage and try again

## License

MIT License - Free to use and modify

---

**System Status**: ✅ Fully Operational
**Last Updated**: May 17, 2026
**Version**: 1.0.0
