"""
LSTM-Powered Multilingual Digital Library
Database schema matching your exact structure
"""

from fastapi import FastAPI, HTTPException, Request, Form, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import os
import uuid
import hashlib
import shutil
from datetime import datetime
from typing import Optional
import json
from contextlib import contextmanager

# Database connection
import pymysql
from pymysql.cursors import DictCursor

# ============================================
# DATABASE CONNECTION
# ============================================

def get_db():
    return pymysql.connect(
        host="localhost",
        user="root",
        password="",
        database="digital_library",
        cursorclass=DictCursor,
        autocommit=True
    )

@contextmanager
def db_session():
    conn = get_db()
    try:
        yield conn
    finally:
        conn.close()

# ============================================
# CREATE FASTAPI APP
# ============================================

app = FastAPI(title="Digital Library API", version="2.0.0")

# Enable CORS (development-friendly)
# Allow all origins during local development so the frontend can reach the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create upload folders
os.makedirs("uploads/audio", exist_ok=True)
os.makedirs("uploads/books", exist_ok=True)
os.makedirs("uploads/covers", exist_ok=True)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ============================================
# DATABASE SCHEMA GUARD
# ============================================

def ensure_database_schema():
    with db_session() as conn:
        cursor = conn.cursor()

        # Additional book metadata and purchase/library tables
        cursor.execute("CREATE TABLE IF NOT EXISTS user_library ("
                       "user_id int(11) NOT NULL,"
                       "book_id int(11) NOT NULL,"
                       "saved_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,"
                       "PRIMARY KEY (user_id, book_id),"
                       "CONSTRAINT fk_user_library_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,"
                       "CONSTRAINT fk_user_library_book FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE)"
                       " ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;")

        cursor.execute("CREATE TABLE IF NOT EXISTS user_purchases ("
                       "purchase_id int(11) NOT NULL AUTO_INCREMENT,"
                       "user_id int(11) NOT NULL,"
                       "book_id int(11) NOT NULL,"
                       "purchase_date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,"
                       "PRIMARY KEY (purchase_id),"
                       "CONSTRAINT fk_user_purchases_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,"
                       "CONSTRAINT fk_user_purchases_book FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE)"
                       " ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;")

        cursor.execute("CREATE TABLE IF NOT EXISTS book_ratings ("
                       "rating_id int(11) NOT NULL AUTO_INCREMENT,"
                       "user_id int(11) NOT NULL,"
                       "book_id int(11) NOT NULL,"
                       "rating tinyint(1) NOT NULL,"
                       "review text DEFAULT NULL,"
                       "created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,"
                       "updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,"
                       "PRIMARY KEY (rating_id),"
                       "UNIQUE KEY uniq_rating (user_id, book_id),"
                       "CONSTRAINT fk_book_ratings_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,"
                       "CONSTRAINT fk_book_ratings_book FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE)"
                       " ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;")

        cursor.execute("CREATE TABLE IF NOT EXISTS book_shares ("
                       "share_id int(11) NOT NULL AUTO_INCREMENT,"
                       "sender_user_id int(11) NOT NULL,"
                       "recipient_user_id int(11) NOT NULL,"
                       "book_id int(11) NOT NULL,"
                       "shared_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,"
                       "PRIMARY KEY (share_id),"
                       "CONSTRAINT fk_book_shares_sender FOREIGN KEY (sender_user_id) REFERENCES users(user_id) ON DELETE CASCADE,"
                       "CONSTRAINT fk_book_shares_recipient FOREIGN KEY (recipient_user_id) REFERENCES users(user_id) ON DELETE CASCADE,"
                       "CONSTRAINT fk_book_shares_book FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE)"
                       " ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;")

        cursor.execute("SHOW COLUMNS FROM books LIKE 'is_free'")
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE books ADD COLUMN is_free TINYINT(1) NOT NULL DEFAULT 1")

        cursor.execute("SHOW COLUMNS FROM books LIKE 'price'")
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE books ADD COLUMN price DECIMAL(8,2) NOT NULL DEFAULT 0.00")

        cursor.execute("SHOW COLUMNS FROM books LIKE 'is_user_uploaded'")
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE books ADD COLUMN is_user_uploaded TINYINT(1) NOT NULL DEFAULT 0")

        cursor.execute("SHOW COLUMNS FROM books LIKE 'uploaded_by'")
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE books ADD COLUMN uploaded_by int(11) DEFAULT NULL")

@app.on_event("startup")
def startup_event():
    try:
        ensure_database_schema()
    except Exception as error:
        print("Warning: could not ensure database schema:", error)

# ============================================
# TRANSLATION DICTIONARY
# ============================================

TRANSLATIONS = {
    'hello': 'Muraho', 'hi': 'Muraho', 'how are you': 'Amakuru',
    'good morning': 'Mwaramutse', 'thank you': 'Urakoze', 'thanks': 'Urakoze',
    'welcome': 'Urakaza neza', 'yes': 'Yego', 'no': 'Oya', 'ok': 'Sawa',
    'book': 'Igitabo', 'books': 'Ibitabo', 'read': 'Soma', 'reading': 'Gusoma',
    'page': 'Urupapuro', 'next': 'Ikurikira', 'previous': 'Ishize',
    'go back': 'Subira inyuma', 'back': 'Subira', 'continue': 'Komeza',
    'continue reading': 'Komeza gusoma', 'open': 'Fungura', 'open book': 'Fungura igitabo',
    'read aloud': 'Soma mu ijwi rirenga', 'listen': 'Tega amatwi', 'pause': 'Hagarika',
    'search': 'Shakisha', 'find': 'Shakisha', 'category': 'Icyiciro',
    'categories': 'Ibyiciro', 'language': 'Ururimi', 'change language': 'Hindura ururimi',
    'kinyarwanda': 'Ikinyarwanda', 'english': 'Icyongereza', 'download': 'Kubyinjiza',
    'upload': 'Gutura', 'translate': 'Guhindura',
    'and': 'Na', 'with': 'Na', 'or': 'Cyangwa', 'but': 'Ariko', 'for': 'Ku byerekeye',
}

# ============================================
# USER SESSIONS
# ============================================

def create_user_session(preferred_language='en'):
    with db_session() as conn:
        cursor = conn.cursor()
        session_token = str(uuid.uuid4())
        cursor.execute(
            "INSERT INTO users (username, preferred_language, session_token) VALUES (%s, %s, %s)",
            ("Guest", preferred_language, session_token)
        )
        user_id = cursor.lastrowid
        return {"user_id": user_id, "session_token": session_token}

def get_user_by_id(user_id):
    with db_session() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
        return cursor.fetchone()

def update_user_language(user_id, language):
    with db_session() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET preferred_language = %s WHERE user_id = %s", (language, user_id))

def save_user_progress(user_id, book_id, page):
    with db_session() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO user_progress (user_id, book_id, last_page_read, last_accessed)
            VALUES (%s, %s, %s, NOW())
            ON DUPLICATE KEY UPDATE last_page_read = %s, last_accessed = NOW()
        """, (user_id, book_id, page, page))

def get_user_progress(user_id):
    with db_session() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT b.book_id, b.title, b.cover_image_url, up.last_page_read
            FROM user_progress up
            JOIN books b ON up.book_id = b.book_id
            WHERE up.user_id = %s
            ORDER BY up.last_accessed DESC
        """, (user_id,))
        return cursor.fetchall()


def save_book_to_library(user_id, book_id):
    with db_session() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO user_library (user_id, book_id, saved_at)
            VALUES (%s, %s, NOW())
            ON DUPLICATE KEY UPDATE saved_at = NOW()
        """, (user_id, book_id))


def get_user_library(user_id):
    with db_session() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT b.book_id, b.title, b.author, b.cover_image_url, b.price, b.is_free,
                   IFNULL(AVG(r.rating), 0) AS avg_rating,
                   COUNT(r.rating) AS rating_count
            FROM user_library ul
            JOIN books b ON ul.book_id = b.book_id
            LEFT JOIN book_ratings r ON r.book_id = b.book_id
            WHERE ul.user_id = %s
            GROUP BY b.book_id
            ORDER BY ul.saved_at DESC
        """, (user_id,))
        return cursor.fetchall()


def has_user_book_purchase(user_id, book_id):
    with db_session() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT 1 FROM user_purchases WHERE user_id = %s AND book_id = %s", (user_id, book_id))
        return cursor.fetchone() is not None


def get_user_purchased_books(user_id):
    with db_session() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT b.book_id, b.title, b.author, b.cover_image_url, b.price, b.is_free,
                   IFNULL(AVG(r.rating), 0) AS avg_rating,
                   COUNT(r.rating) AS rating_count
            FROM user_purchases up
            JOIN books b ON up.book_id = b.book_id
            LEFT JOIN book_ratings r ON r.book_id = b.book_id
            WHERE up.user_id = %s
            GROUP BY b.book_id
            ORDER BY up.purchase_date DESC
        """, (user_id,))
        return cursor.fetchall()


def get_book_rating_summary(book_id):
    with db_session() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT AVG(rating) AS avg_rating, COUNT(*) AS rating_count FROM book_ratings WHERE book_id = %s", (book_id,))
        return cursor.fetchone() or {'avg_rating': 0, 'rating_count': 0}


def save_book_rating(user_id, book_id, rating, review=None):
    with db_session() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO book_ratings (user_id, book_id, rating, review, created_at, updated_at)
            VALUES (%s, %s, %s, %s, NOW(), NOW())
            ON DUPLICATE KEY UPDATE rating = %s, review = %s, updated_at = NOW()
        """, (user_id, book_id, rating, review, rating, review))


def share_book_record(sender_id, recipient_id, book_id):
    with db_session() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO book_shares (sender_user_id, recipient_user_id, book_id, shared_at)
            VALUES (%s, %s, %s, NOW())
        """, (sender_id, recipient_id, book_id))

# ============================================
# API ENDPOINTS
# ============================================

@app.get("/")
def root():
    return {"message": "Digital Library API", "status": "active", "version": "2.0.0"}

# ---------- USER & SESSION ENDPOINTS ----------

@app.post("/api/user/create")
def create_user(preferred_language: str = "en"):
    return create_user_session(preferred_language)

@app.get("/api/user/{user_id}")
def get_user(user_id: int):
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/api/user/{user_id}/language")
def update_language(user_id: int, language: str):
    update_user_language(user_id, language)
    return {"message": "Language updated", "language": language}

@app.get("/api/user/{user_id}/progress")
def get_progress(user_id: int):
    return get_user_progress(user_id)

# ---------- DASHBOARD ENDPOINT ----------

@app.get("/api/dashboard/{user_id}")
def get_dashboard(user_id: int):
    with db_session() as conn:
        cursor = conn.cursor()
        
        cursor.execute("SELECT preferred_language FROM users WHERE user_id = %s", (user_id,))
        user = cursor.fetchone()
        user_lang = user['preferred_language'] if user else 'en'
        
        cursor.execute("SELECT category_id, name_en, name_rw, icon_url, color_hex FROM categories")
        categories = cursor.fetchall()
        for cat in categories:
            cat['name'] = cat['name_rw'] if user_lang == 'rw' else cat['name_en']
            cat['icon'] = cat['icon_url']
        category_map = {cat['category_id']: cat['name'] for cat in categories}

        cursor.execute("""
            SELECT b.book_id, b.title, b.author, b.cover_image_url, b.price, b.is_free,
                   IFNULL(AVG(r.rating), 0) AS avg_rating,
                   COUNT(r.rating) AS rating_count
            FROM user_library ul
            JOIN books b ON ul.book_id = b.book_id
            LEFT JOIN book_ratings r ON r.book_id = b.book_id
            WHERE ul.user_id = %s
            GROUP BY b.book_id
            ORDER BY ul.saved_at DESC
        """, (user_id,))
        saved_books = cursor.fetchall()

        cursor.execute("""
            SELECT b.book_id, b.title, b.author, b.cover_image_url, b.price, b.is_free,
                   IFNULL(AVG(r.rating), 0) AS avg_rating,
                   COUNT(r.rating) AS rating_count
            FROM user_purchases up
            JOIN books b ON up.book_id = b.book_id
            LEFT JOIN book_ratings r ON r.book_id = b.book_id
            WHERE up.user_id = %s
            GROUP BY b.book_id
            ORDER BY up.purchase_date DESC
        """, (user_id,))
        purchased_books = cursor.fetchall()

        cursor.execute("""
            SELECT b.book_id, b.title, b.cover_image_url, up.last_page_read as current_page
            FROM user_progress up
            JOIN books b ON up.book_id = b.book_id
            WHERE up.user_id = %s
            ORDER BY up.last_accessed DESC
            LIMIT 1
        """, (user_id,))
        continue_reading = cursor.fetchone()

        cursor.execute("""
            SELECT b.book_id, b.title, b.author, b.cover_image_url, b.price, b.is_free,
                   IFNULL(AVG(r.rating), 0) AS avg_rating,
                   COUNT(r.rating) AS rating_count
            FROM books b
            LEFT JOIN book_ratings r ON r.book_id = b.book_id
            WHERE b.is_user_uploaded = 1 AND b.uploaded_by = %s
            GROUP BY b.book_id
            ORDER BY b.book_id DESC
        """, (user_id,))
        uploaded_books = cursor.fetchall()

        cursor.execute("""
            SELECT b.book_id, b.title, b.author, b.cover_image_url, b.price, b.is_free, b.category_id,
                   IFNULL(AVG(r.rating), 0) AS avg_rating,
                   COUNT(r.rating) AS rating_count,
                   IF(EXISTS(SELECT 1 FROM user_purchases up WHERE up.user_id = %s AND up.book_id = b.book_id), 1, 0) AS purchased,
                   IF(EXISTS(SELECT 1 FROM user_library ul WHERE ul.user_id = %s AND ul.book_id = b.book_id), 1, 0) AS saved
            FROM books b
            LEFT JOIN book_ratings r ON r.book_id = b.book_id
            GROUP BY b.book_id
            ORDER BY b.view_count DESC, b.download_count DESC
            LIMIT 20
        """, (user_id, user_id))
        recommended = cursor.fetchall()
        for book in recommended:
            book['category_name'] = category_map.get(book.get('category_id'), book.get('category_name', ''))
            book['purchased'] = bool(book.get('purchased'))
            book['saved'] = bool(book.get('saved'))

    return {
        "categories": categories,
        "saved_books": saved_books,
        "purchased_books": purchased_books,
        "uploaded_books": uploaded_books,
        "downloaded_books": [],  # Cleaned up duplicate
        "continue_reading": continue_reading,
        "recommended": recommended,
        "preferred_language": user_lang
    }

# ---------- BOOK ENDPOINTS ----------

@app.get("/api/books")
def get_books(category_id: Optional[int] = None, search: Optional[str] = None):
    with db_session() as conn:
        cursor = conn.cursor()
        
        query = "SELECT * FROM books WHERE 1=1"
        params = []
        
        if category_id:
            query += " AND category_id = %s"
            params.append(category_id)
        
        if search:
            query += " AND (title LIKE %s OR author LIKE %s)"
            params.append(f"%{search}%")
            params.append(f"%{search}%")
        
        query += " ORDER BY title"
        cursor.execute(query, params)
        return cursor.fetchall()

@app.get("/api/book/{book_id}")
def get_book(book_id: int):
    with db_session() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM books WHERE book_id = %s", (book_id,))
        book = cursor.fetchone()
        
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")
        
        # Increment view count (Optimized to use same connection)
        cursor.execute("UPDATE books SET view_count = view_count + 1 WHERE book_id = %s", (book_id,))
        
        return book

@app.get("/api/book/{book_id}/content")
def get_book_content(book_id: int, page: int = 1, language: str = "en"):
    with db_session() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT content_id, page_number, page_text, audio_path
            FROM book_content
            WHERE book_id = %s AND page_number = %s AND language_code = %s
        """, (book_id, page, language))
        content = cursor.fetchone()
        
        if not content:
            cursor.execute("""
                SELECT content_id, page_number, page_text, audio_path
                FROM book_content
                WHERE book_id = %s AND page_number = %s AND language_code = 'en'
            """, (book_id, page))
            content = cursor.fetchone()
    
    if not content:
        return {"page_number": page, "page_text": "No content available", "language_code": language}
    
    # Map audio_path to audio_url for frontend
    if content and 'audio_path' in content:
        content['audio_url'] = content['audio_path']
    
    return content

@app.post("/api/book/{book_id}/progress")
def update_progress(user_id: int, book_id: int, page: int):
    save_user_progress(user_id, book_id, page)

@app.post("/api/book/{book_id}/library")
def add_book_to_library(book_id: int, user_id: int):
    save_book_to_library(user_id, book_id)
    return {"message": "Book saved to your library", "book_id": book_id}

@app.get("/api/user/{user_id}/library")
def get_user_library_endpoint(user_id: int):
    return {"saved_books": get_user_library(user_id)}

@app.get("/api/user/{user_id}/purchases")
def get_user_purchases(user_id: int):
    return {"purchased_books": get_user_purchased_books(user_id)}

@app.post("/api/book/{book_id}/purchase")
def purchase_book(book_id: int, user_id: int):
    with db_session() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT title, price, is_free FROM books WHERE book_id = %s", (book_id,))
        book = cursor.fetchone()
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")

        if book.get('is_free'):
            save_book_to_library(user_id, book_id)
            return {"message": "This book is free and has been added to your library", "book_id": book_id}

        if has_user_book_purchase(user_id, book_id):
            return {"message": "You already purchased this book", "book_id": book_id}

        cursor.execute(
            "INSERT INTO user_purchases (user_id, book_id, purchase_date) VALUES (%s, %s, NOW())",
            (user_id, book_id)
        )
    
    save_book_to_library(user_id, book_id)
    return {"message": f"Book purchased successfully for ${book.get('price', 0):.2f}", "book_id": book_id}

@app.post("/api/book/{book_id}/rate")
def rate_book_endpoint(book_id: int, user_id: int = Form(...), rating: int = Form(...), review: str = Form(None)):
    if rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    save_book_rating(user_id, book_id, rating, review)
    return {"message": "Thank you for rating this book", "book_id": book_id, "rating": rating}

@app.get("/api/book/{book_id}/rating")
def get_book_rating(book_id: int):
    return get_book_rating_summary(book_id)

@app.post("/api/book/{book_id}/share")
def share_book_endpoint(book_id: int, sender_id: int = Form(...), recipient_id: int = Form(None), recipient_username: str = Form(None)):
    if not recipient_id and not recipient_username:
        raise HTTPException(status_code=400, detail="Recipient id or username is required")

    with db_session() as conn:
        cursor = conn.cursor()
        if recipient_id:
            cursor.execute("SELECT user_id FROM users WHERE user_id = %s", (recipient_id,))
        else:
            cursor.execute("SELECT user_id FROM users WHERE username = %s", (recipient_username,))
        recipient = cursor.fetchone()
        if not recipient:
            raise HTTPException(status_code=404, detail="Recipient user not found")

    share_book_record(sender_id, recipient['user_id'], book_id)
    return {"message": "Book shared successfully", "book_id": book_id, "recipient_id": recipient['user_id']}

@app.post("/api/book/{book_id}/download")
def download_book(book_id: int, user_id: int):
    with db_session() as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT title, file_path, is_free FROM books WHERE book_id = %s", (book_id,))
        book = cursor.fetchone()
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")

        if not book.get('is_free') and not has_user_book_purchase(user_id, book_id):
            raise HTTPException(status_code=403, detail="Book is paid. Purchase it before downloading.")

        cursor.execute("UPDATE books SET download_count = download_count + 1 WHERE book_id = %s", (book_id,))

    file_path = book.get('file_path')
    if file_path and isinstance(file_path, str) and file_path.startswith('http'):
        return JSONResponse({
            "title": book['title'],
            "download_url": file_path,
            "message": "Download from external source",
        })

    if file_path and os.path.exists(file_path):
        return FileResponse(path=file_path, filename=os.path.basename(file_path), media_type='application/octet-stream')

    content = get_book_content(book_id, 1, 'en')
    return {
        "title": book['title'],
        "content": content.get('page_text', ''),
        "message": "Book downloaded successfully"
    }

@app.post("/api/upload-book")
async def upload_book(
    title: str = Form(...),
    author: str = Form(...),
    category_id: int = Form(...),
    user_id: int = Form(...),
    file: UploadFile = File(...)
):
    # Save uploaded file
    file_extension = file.filename.split('.')[-1]
    new_filename = f"{uuid.uuid4()}.{file_extension}"
    upload_dir = 'uploads/books'
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, new_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Read content
    content_text = ""
    if file_extension in ['txt', 'md']:
        with open(file_path, 'r', encoding='utf-8') as f:
            content_text = f.read()
    
    with db_session() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO books (title, author, category_id, file_path, is_user_uploaded, uploaded_by, total_pages)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (title, author, category_id, file_path, True, user_id, 1))
        book_id = cursor.lastrowid
        
        if content_text:
            cursor.execute("""
                INSERT INTO book_content (book_id, page_number, language_code, page_text)
                VALUES (%s, %s, %s, %s)
            """, (book_id, 1, 'en', content_text[:1000]))
    
    return {"book_id": book_id, "message": "Book uploaded successfully"}

# ---------- TRANSLATION ENDPOINTS ----------

@app.get("/api/translate")
@app.post("/api/translate")
def translate_text(text: str, target_lang: str = "rw"):
    text_lower = text.lower().strip()
    
    if target_lang == "rw":
        if text_lower in TRANSLATIONS:
            translated = TRANSLATIONS[text_lower]
        else:
            translated = text
    else:
        for eng, kin in TRANSLATIONS.items():
            if kin.lower() == text_lower:
                translated = eng.capitalize()
                break
        else:
            translated = text
    
    return {"original": text, "translated": translated}

@app.post("/api/translate-book")
def translate_book(book_id: int, target_lang: str = "rw"):
    with db_session() as conn:
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT page_number, page_text FROM book_content
            WHERE book_id = %s AND language_code = 'en'
            ORDER BY page_number
        """, (book_id,))
        pages = cursor.fetchall()
    
    translated_pages = []
    for page in pages:
        translated_text = translate_text(page['page_text'], target_lang)
        translated_pages.append({
            "page": page['page_number'],
            "original": page['page_text'],
            "translated": translated_text['translated']
        })
    
    return {"book_id": book_id, "target_language": target_lang, "pages": translated_pages}

# ---------- TEXT-TO-SPEECH ----------

@app.post("/api/text-to-speech")
async def text_to_speech(text: str, language: str = "en"):
    from gtts import gTTS
    
    filename = f"{uuid.uuid4()}.mp3"
    filepath = f"uploads/audio/{filename}"
    
    try:
        if language == "rw":
            tts = gTTS(text=text, lang='fr', slow=False)
        else:
            tts = gTTS(text=text, lang='en', slow=False)
        tts.save(filepath)
        return {"audio_url": f"/uploads/audio/{filename}", "success": True}
    except Exception as e:
        return {"error": str(e), "success": False}

# ---------- VOICE COMMANDS ----------

@app.post("/api/voice/recognize")
async def recognize_voice(audio: UploadFile = File(...), language: str = Form("en")):
    from voice_recognition_service import voice_service
    result = await voice_service.recognize(audio, language)
    return {
        "text": result.text,
        "is_command": result.is_command,
        "command_action": result.command_action,
        "confidence": result.confidence
    }

@app.get("/api/voice/commands")
def get_voice_commands(language: str = "en"):
    if language == "rw":
        return {
            "commands": [
                {"phrase": "soma igitabo", "action": "open_book"},
                {"phrase": "ikurikira", "action": "next_page"},
                {"phrase": "isubire inyuma", "action": "previous_page"},
                {"phrase": "ngaho", "action": "read_aloud"},
                {"phrase": "subira inyuma", "action": "go_back"},
                {"phrase": "hindura ururimi", "action": "change_language"},
                {"phrase": "komeza gusoma", "action": "continue_reading"},
            ]
        }
    else:
        return {
            "commands": [
                {"phrase": "read book", "action": "open_book"},
                {"phrase": "next page", "action": "next_page"},
                {"phrase": "next", "action": "next_page"},
                {"phrase": "previous page", "action": "previous_page"},
                {"phrase": "previous", "action": "previous_page"},
                {"phrase": "read aloud", "action": "read_aloud"},
                {"phrase": "speak", "action": "read_aloud"},
                {"phrase": "go back", "action": "go_back"},
                {"phrase": "change language", "action": "change_language"},
                {"phrase": "continue reading", "action": "continue_reading"},
            ]
        }

# ---------- MODEL INFO ----------

@app.get("/api/models/info")
def get_models_info():
    return {
        "primary_ai": "LSTM (Long Short-Term Memory - Advanced RNN)",
        "languages": ["Kinyarwanda", "English"],
        "tts_model": "gTTS (with French fallback for Kinyarwanda)",
        "translation": "Dictionary-based",
        "features": [
            "Voice Commands",
            "Text-to-Speech",
            "User Sessions",
            "Book Upload",
            "Book Download",
            "Book Translation",
            "Progress Tracking"
        ]
    }

# ============================================
# RUN SERVER
# ============================================

if __name__ == "__main__":
    import uvicorn
    print("\n" + "=" * 60)
    print("📚 DIGITAL LIBRARY API v2.0")
    print("=" * 60)
    print(f"📍 Server: http://localhost:8000")
    print(f"📚 API Docs: http://localhost:8000/docs")
    print(f"🌍 Languages: Kinyarwanda (rw) | English (en)")
    print("=" * 60 + "\n")
    uvicorn.run(app, host="127.0.0.1", port=8000)