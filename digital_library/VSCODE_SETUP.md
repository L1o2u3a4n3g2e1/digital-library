# VS Code Setup & Execution Guide

## 📋 Step 1: Open the Project in VS Code

### Option A: Open Folder Directly
1. Open **VS Code**
2. Click **File** → **Open Folder**
3. Navigate to: `C:\Users\PC\Desktop\digital_library`
4. Click **Select Folder**
5. VS Code will load all project files

### Option B: Open from Command Line
1. Open **Command Prompt** (Windows) or **Terminal** (Mac/Linux)
2. Type:
```bash
cd C:\Users\PC\Desktop\digital_library
code .
```
3. Press Enter
4. VS Code will open with the project loaded

---

## 📂 Project Structure You Should See

```
digital_library/
├── server.js                 ← Backend API (Node.js/Express)
├── package.json             ← Dependencies (just updated!)
├── public/
│   └── index.html          ← Frontend UI (React)
├── START_HERE.txt          ← Quick start guide
├── SETUP_GUIDE.txt         ← Detailed documentation
├── VSCODE_SETUP.md         ← This file
└── README.md               ← Complete documentation
```

---

## 🔧 Step 2: Install Dependencies in VS Code

### Using VS Code Terminal:

1. **Open the integrated terminal** in VS Code:
   - Press `Ctrl + `` (backtick) on Windows
   - Or go to **View** → **Terminal**

2. **You should see the terminal** showing your project path:
   ```
   C:\Users\PC\Desktop\digital_library>
   ```

3. **Install dependencies** by typing:
   ```bash
   npm install
   ```

4. **Wait for installation** to complete (takes 1-2 minutes)
   - You'll see many packages being installed
   - Look for the final message confirming installation

5. **Verify installation** by checking that `node_modules` folder appears in your project

---

## ✅ Step 3: Start the Server from VS Code

### In the VS Code Terminal:

1. **Type this command:**
   ```bash
   npm start
   ```

2. **Press Enter**

3. **You should see these messages:**
   ```
   Digital Library Server running on http://localhost:5000
   Connected to in-memory SQLite database
   Database initialized with sample data
   ```

4. **The server is now running!** ✅

---

## 🌐 Step 4: Open in Your Browser

1. **Open any web browser** (Chrome, Firefox, Edge, Safari)

2. **Go to:**
   ```
   http://localhost:5000
   ```

3. **You should see:**
   - The login page
   - "Digital Library" heading
   - Language toggle buttons (EN/KIN)
   - Demo account buttons

---

## 🎯 Step 5: Test the System

### Login as Client:
- Click **"Try Client Account"** button
- Or enter:
  - Username: `client`
  - Password: `client123`
- You're in! 🎉

### Login as Admin:
- Click **"Try Admin Account"** button
- Or go back to login and enter:
  - Username: `admin`
  - Password: `admin123`
- Access the Admin Panel!

---

## 📝 VS Code Tips & Tricks

### Useful Keyboard Shortcuts:

| Action | Shortcut |
|--------|----------|
| Open Terminal | `Ctrl + `` |
| Find File | `Ctrl + P` |
| Search in Files | `Ctrl + Shift + F` |
| Save File | `Ctrl + S` |
| Format Code | `Shift + Alt + F` |
| Comment Line | `Ctrl + /` |

### File Navigation:
- Click any file in the Explorer panel (left side)
- Files open in the editor
- Click the "X" to close tabs

### Editing Code:
1. Click on any file to open it
2. Make changes directly
3. Save with `Ctrl + S`
4. Server will still run (changes apply on refresh)

---

## 🐛 Debugging Tips

### View Server Logs in Terminal:
- All server messages appear in the terminal
- Look for error messages in red
- Look for success messages in white/gray

### Test API Endpoints:
The terminal will show:
```
GET /api/books
POST /api/auth/login
GET /api/categories
```

### Check for Errors:
- If something doesn't work, check the terminal
- Look for error messages
- See the SETUP_GUIDE.txt for troubleshooting

---

## 🔄 Common Tasks

### Restart the Server:
1. Click in the terminal
2. Press `Ctrl + C` to stop
3. Type `npm start` to restart

### Stop the Server:
1. Click in the terminal
2. Press `Ctrl + C`

### Install Additional Packages:
```bash
npm install package-name
```

### View Package Versions:
```bash
npm list
```

---

## 🎨 Code File Overview

### server.js (Backend - ~450 lines)
- **What it does:** Runs the API server
- **Key sections:**
  - Database initialization
  - User authentication routes
  - Book management routes
  - Search functionality
  - Admin statistics

### public/index.html (Frontend - ~1200 lines)
- **What it does:** React application with UI
- **Key sections:**
  - App component (main logic)
  - Login page
  - Homepage with book browsing
  - Book reader
  - Admin panel
  - Translations (English & Kinyarwanda)
  - Styling (CSS)

---

## 📚 Making Changes

### Adding a New Feature:

1. **Backend (server.js):**
   - Add new API route
   - Add database logic
   - Test with browser

2. **Frontend (public/index.html):**
   - Add new React component
   - Call the new API endpoint
   - Test the UI

3. **Restart server** if you modify server.js

---

## 🚀 Production-Ready Checklist

- [ ] All 3 sample books visible
- [ ] Client can login and logout
- [ ] Admin can login and access panel
- [ ] Books display with correct information
- [ ] Voice search works (🎤 button)
- [ ] Text-to-speech works (▶ Play button)
- [ ] Language switching works (EN/KIN buttons)
- [ ] Category filtering works
- [ ] Search functionality works
- [ ] Admin can add new books
- [ ] Statistics display correctly

---

## 🎓 Learning Resources

### Understanding the Code:

**server.js Structure:**
```javascript
// 1. Imports and setup
const express = require('express');
const sqlite3 = require('sqlite3');

// 2. Initialize app and database
const app = express();
const db = new sqlite3.Database(':memory:');

// 3. Create tables
db.run(`CREATE TABLE IF NOT EXISTS users ...`);

// 4. Define routes
app.get('/api/books', (req, res) => { ... });

// 5. Start server
app.listen(PORT, () => { ... });
```

**Frontend (React) Structure:**
```javascript
// 1. Main App component
function App() {
  const [currentUser, setCurrentUser] = useState(null);
  // ... other state
}

// 2. Child components
function LoginPage() { ... }
function HomePage() { ... }
function BookReaderPage() { ... }
function AdminPanel() { ... }

// 3. Render to DOM
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
```

---

## 💡 Next Steps

1. ✅ Open project in VS Code
2. ✅ Run `npm install`
3. ✅ Run `npm start`
4. ✅ Open http://localhost:5000
5. ✅ Test all features
6. 📖 Read the code and understand how it works
7. 🎯 Make modifications and add new features
8. 🚀 Deploy to a server (for production)

---

## 🆘 Getting Help

### If You Get Stuck:

1. **Check the terminal** for error messages
2. **Read SETUP_GUIDE.txt** for troubleshooting
3. **Check README.md** for detailed documentation
4. **Restart the server:** `Ctrl + C` then `npm start`
5. **Clear browser cache:** Press `Ctrl + Shift + Delete`

---

## 📞 Contact

- **Author:** Rukundo Yassili
- **Email:** yasriyag9@gmail.com
- **Project:** Digital Library System - Multilingual Edition

---

**You're all set! Happy coding! 🚀📚**
