import pymysql
from pymysql.cursors import DictCursor

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'digital_library'
}

def check_data():
    try:
        conn = pymysql.connect(**DB_CONFIG, cursorclass=DictCursor)
        with conn.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) as count FROM books")
            books_count = cursor.fetchone()['count']
            
            cursor.execute("SELECT COUNT(*) as count FROM categories")
            cats_count = cursor.fetchone()['count']
            
            print(f"DATABASE_STATUS: OK")
            print(f"BOOKS_COUNT: {books_count}")
            print(f"CATEGORIES_COUNT: {cats_count}")
            
            if books_count > 0:
                cursor.execute("SELECT title FROM books LIMIT 5")
                titles = [row['title'] for row in cursor.fetchall()]
                print(f"SAMPLE_BOOKS: {', '.join(titles)}")
                
    except Exception as e:
        print(f"DATABASE_ERROR: {e}")

if __name__ == "__main__":
    check_data()
