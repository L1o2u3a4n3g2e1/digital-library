from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="Digital Library API", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Digital Library API", "status": "running"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "digital-library-api"}

@app.get("/api/books")
def get_books():
    return {
        "books": [
            {"id": 1, "title": "Python Programming", "author": "John Doe"},
            {"id": 2, "title": "Web Development", "author": "Jane Smith"},
            {"id": 3, "title": "Machine Learning Basics", "author": "Bob Johnson"},
        ]
    }

@app.post("/api/books")
def create_book(book: dict):
    return {"message": "Book created", "book": book}

@app.get("/api/books/{book_id}")
def get_book(book_id: int):
    return {"id": book_id, "title": f"Book {book_id}", "author": "Unknown"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
