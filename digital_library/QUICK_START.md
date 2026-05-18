# 🚀 Quick Start Guide - Digital Library System

## System is NOW RUNNING! ✅

### Current Status
- ✅ **Backend Server**: Running on `http://localhost:5000`
- ✅ **Frontend Server**: Running on `http://localhost:3000`
- ✅ **Database**: SQLite (initialized with sample data)
- ✅ **All Features**: Implemented and ready to test

---

## 🌐 Access the Application

### Open in Browser
**👉 [http://localhost:3000](http://localhost:3000)**

---

## 🔐 Demo Login Credentials

### Admin Dashboard Access
```
Username: admin
Password: admin123
Role: Full System Access
```

### Regular User Access
```
Username: client
Password: client123
Role: Read-Only (Library browsing)
```

---

## 📋 What to Test

### 1️⃣ Welcome Screen
- [ ] Open http://localhost:3000
- [ ] See language selection (English 🇺🇸 / Kinyarwanda 🇷🇼)
- [ ] Click your preferred language

### 2️⃣ Authentication
- [ ] Click "Login"
- [ ] Enter admin credentials above
- [ ] Click Login button
- [ ] Should see Admin Dashboard

### 3️⃣ Library (Client Mode)
- [ ] Login as `client` user instead
- [ ] Browse books in grid layout
- [ ] See 3 sample books: "The Great Journey", "Learning Mathematics", "History of Rwanda"
- [ ] Try search functionality
- [ ] Filter by categories using pills
- [ ] Click 🎤 button to test voice search (speak a book title)

### 4️⃣ Book Reader
- [ ] Click any book card
- [ ] Read content with clear typography
- [ ] Use Previous/Next buttons for pagination
- [ ] Click 🔊 button to hear text read aloud (Text-to-Speech)
- [ ] Navigate pages with buttons
- [ ] Click "Back" to return to library

### 5️⃣ Admin Dashboard
- [ ] Login as admin
- [ ] See three tabs:
  - **Overview**: System stats + Add book form
  - **Manage Books**: List of all books
  - **Manage Users**: List of all users

### 6️⃣ Language Switching
- [ ] Click language selector in header (🇺🇸/🇷🇼)
- [ ] See entire interface switch languages
- [ ] Book content updates (bilingual support)
- [ ] Preference saved automatically

### 7️⃣ Dark Mode
- [ ] Click theme button (☀️/🌙) in header
- [ ] Switch between light and dark modes
- [ ] Try reading in dark mode
- [ ] Preference saved automatically

### 8️⃣ Admin Features
- [ ] Add a new book via Overview tab form
- [ ] Fill in: Title, Author, Description, Content
- [ ] Verify book appears in "Manage Books" tab
- [ ] Delete a book
- [ ] View user list in "Manage Users" tab
- [ ] Delete a user
- [ ] Check stats update in Overview

---

## 🎯 Key Features Verified

### Backend API ✅
```bash
# Test Categories
curl http://localhost:5000/api/categories

# Test Books
curl http://localhost:5000/api/books

# Test Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Frontend Features ✅
- [x] React single-page application
- [x] Multilingual (EN/KIN)
- [x] Dark mode theme
- [x] Responsive design (mobile, tablet, desktop)
- [x] Real-time language switching
- [x] Book search and filtering
- [x] Text-to-speech (🔊)
- [x] Speech recognition (🎤)
- [x] Admin dashboard
- [x] User authentication
- [x] Book management
- [x] Category management
- [x] System statistics

---

## 📱 Responsive Design

Try resizing the browser window to test responsiveness:
- **Desktop**: Full layout with sidebar
- **Tablet (768px)**: Optimized for tablets
- **Mobile (480px)**: Stack layout, touch-friendly

---

## 🔊 Audio Features

### Text-to-Speech (TTS)
- Available in book reader
- Click 🔊 button while reading
- Browser synthesizes speech
- Supports English and French

### Speech-to-Text (STT)
- Use in library search
- Hold 🎤 button and speak
- Supported languages: English, French

---

## 🌍 Multilingual Content

Sample books include bilingual content:

**Book 1: The Great Journey**
- English: "Chapter 1: The Beginning... It was a cold morning..."
- Kinyarwanda: "Icyiciro 1: Inzira Imwe... Kwari kinini iyo..."

**Book 2: Learning Mathematics**
- English: "Mathematics is the language of the universe..."
- Kinyarwanda: "Imibare ni ururimi rw'isi..."

**Book 3: History of Rwanda**
- English: "Rwanda has a fascinating and complex history..."
- Kinyarwanda: "U Rwanda rurimo amateka ashimishije kandi yoroshye..."

---

## 🛠️ Technical Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Frontend | React | 19.2.5 |
| Backend | Node.js/Express | 24.14.1 |
| Database | SQLite | In-memory |
| Authentication | JWT | 7-day expiry |
| Speech API | Web Speech API | Browser-native |
| Styling | CSS3 | CSS Variables |

---

## 📊 System Statistics

Current system has:
- **Total Books**: 3 (sample data)
- **Total Users**: 2 (admin, client)
- **Categories**: 4 (Fiction, Education, Science, History)
- **Languages**: 2 (English, Kinyarwanda)

---

## ⚙️ Server Status

### Backend Server Logs
```bash
tail -20 /tmp/server.log
```

### Frontend Server Logs
```bash
tail -20 /tmp/frontend.log
```

### Active Processes
```bash
ps aux | grep -E "node|npm" | grep -v grep
```

---

## 🐛 Troubleshooting

### Can't connect to http://localhost:3000?
- Verify frontend is running: `npm start` in frontend directory
- Check if port 3000 is available
- Try: `lsof -i :3000`

### Can't connect to http://localhost:5000?
- Verify backend is running: `node server.js`
- Check if port 5000 is available
- Try: `lsof -i :5000`

### Login not working?
- Verify credentials (admin/admin123 or client/client123)
- Check browser console (F12) for errors
- Verify backend is running

### Text-to-Speech not working?
- Ensure system volume is not muted
- Try different browser (Chrome/Edge recommended)
- Check browser permissions for microphone

### Voice search not working?
- Enable microphone in browser settings
- Try Chrome or Edge (best support)
- Speak clearly and wait for transcription

---

## 📸 Screenshot Descriptions

### Welcome Screen
- Centered with library icon (📚)
- Two large buttons: English 🇺🇸 | Kinyarwanda 🇷🇼
- Demo credentials displayed
- Gradient background

### Library Dashboard
- Header with title and controls
- Search bar with voice button
- Category filter pills
- Book grid (4 columns on desktop)
- Each book shows cover, title, author

### Book Reader
- Large readable text
- Page navigation
- Text-to-speech button
- Page counter
- Back button

### Admin Dashboard
- Three tabs: Overview | Books | Users
- Stats cards showing totals
- Form to add books
- Tables for books and users

---

## 🎓 Learning Resources

### Understanding the Code Structure

**Backend** (`server.js`):
- 400+ lines
- Express server with SQLite
- JWT authentication
- REST API endpoints
- Multer for file uploads

**Frontend** (`App.js`):
- 700+ lines
- Complete React SPA
- Multilingual support
- Dark mode theme
- Web Speech API integration

**Styling** (`App.css`):
- 400+ lines
- CSS Grid and Flexbox
- Dark mode variables
- Mobile responsive breakpoints

---

## 🎉 Success Indicators

You'll know everything is working when:
- ✅ Welcome screen loads with language options
- ✅ Can login with provided credentials
- ✅ See admin dashboard or library
- ✅ Can switch languages (entire UI changes)
- ✅ Can toggle dark mode
- ✅ Search for books works
- ✅ Can click book and read it
- ✅ Text-to-speech button plays audio

---

## 📞 Need Help?

1. Check browser console (F12 > Console tab)
2. Check backend logs: `tail -f /tmp/server.log`
3. Test API directly with curl
4. Verify both servers are running
5. Clear browser cache and try again

---

## 🚀 Ready to Go!

**The Digital Library System is fully operational and ready for demonstration!**

👉 **Open your browser and navigate to:** http://localhost:3000

Happy reading! 📖
