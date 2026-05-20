import pymysql
from database import DB_CONFIG
import os

def add_books():
    conn = pymysql.connect(
        host=DB_CONFIG['host'],
        user=DB_CONFIG['user'],
        password=DB_CONFIG['password'],
        database=DB_CONFIG['database']
    )
    cursor = conn.cursor()

    # New Requested Categories
    categories = [
        (1, 'Family', 'Umuryango', 'home-heart', '#FF6B6B'),
        (2, 'Farming', 'Ubuhinzi', 'leaf', '#4CAF50'),
        (3, 'Education', 'Uburezi', 'school', '#4285F4'),
        (4, 'Divertisement', 'Imyidagaduro', 'controller-classic', '#FBBC05')
    ]

    cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
    cursor.execute("TRUNCATE TABLE categories")
    
    for cat in categories:
        cursor.execute("""
            INSERT INTO categories (category_id, name_en, name_rw, icon_url, color_hex)
            VALUES (%s, %s, %s, %s, %s)
        """, cat)

    # Books Mapping to New Categories
    books = [
        ('The Psychology of Persuasion', 'Robert Cialdini', 3, 'https://m.media-amazon.com/images/I/41-7LwA8SXL._AC_UF1000,1000_QL80_.jpg', '../books/The Psychology of Persuasion.pdf'),
        ('The Alexander Book', 'Elizabeth Alexander', 1, 'https://m.media-amazon.com/images/I/61S+mXfN2nL._AC_UF1000,1000_QL80_.jpg', '../books/familly/Elizabeth_Alexander_Book-compressed.pdf'),
        ('Sugar Beans Guide', 'Agriculture Dept', 2, 'https://m.media-amazon.com/images/I/91wb7uS+0fL._AC_UF1000,1000_QL80_.jpg', '../books/farming/sugar-beans-growers-guide.pdf'),
        ('Maggot Production', 'Farming Expert', 2, 'https://m.media-amazon.com/images/I/919NnN0M-+L._AC_UF1000,1000_QL80_.jpg', '../books/farming/technique-for-maggot-production-2010.pdf'),
        ('The Alchemist', 'Paulo Coelho', 4, 'https://m.media-amazon.com/images/I/51Z0nLAfLmL.jpg', 'uploads/books/alchemist.txt'),
        ('Harry Potter', 'J.K. Rowling', 4, 'https://m.media-amazon.com/images/I/81YOuOGFeTL._AC_UF1000,1000_QL80_.jpg', 'uploads/books/hp.txt')
    ]

    for book in books:
        cursor.execute("""
            INSERT INTO books (title, author, category_id, cover_image_url, file_path)
            VALUES (%s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE category_id = VALUES(category_id)
        """, book)

    cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
    conn.commit()
    conn.close()
    print("✅ Success! Categories updated to Family, Farming, Education, and Divertisement.")

if __name__ == "__main__":
    add_books()
