#!/usr/bin/env python3
"""
Helper script to save book content that was fetched by the browser.
This demonstrates how to save book content when available.
"""

import json
import os
from pathlib import Path

# Define the book mappings
BOOKS_MAP = {
    'Principles_of_Agriculture_Bailey.txt': 'Agriculture',
    'Farmers_Every_Day_Book_Stephens.txt': 'Agriculture',
    'Modern_Farming_Andrews.txt': 'Agriculture',
    'Wealth_of_Nations_Smith.txt': 'Business',
    'Benjamin_Franklin_Autobiography.txt': 'Business',
    'The_Prince_Machiavelli.txt': 'Business',
    'Essays_on_Education_Milton.txt': 'Education',
    'On_Education_Locke.txt': 'Education',
    'Little_Women_Alcott.txt': 'Family',
    'David_Copperfield_Dickens.txt': 'Family',
    'Jane_Eyre_Bronte.txt': 'Family',
    'Care_Feeding_Children_Holt.txt': 'Health',
    'Practice_of_Medicine_Flint.txt': 'Health',
    'Art_of_Healing_Hippocrates.txt': 'Health',
    'Pride_and_Prejudice_Austen.txt': 'Love',
    'Wuthering_Heights_Bronte.txt': 'Love',
    'Origin_of_Species_Darwin.txt': 'Social',
    'Social_Contract_Rousseau.txt': 'Social',
    'Tale_of_Two_Cities_Dickens.txt': 'Social',
}

BOOKS_PATH = Path(__file__).parent / 'books'

def main():
    print("\n" + "="*60)
    print("Book Export & Save Helper")
    print("="*60 + "\n")

    # Ensure all category directories exist
    for category in set(BOOKS_MAP.values()):
        category_path = BOOKS_PATH / category
        category_path.mkdir(parents=True, exist_ok=True)
        print(f"✓ Created category: {category}")

    print("\n" + "="*60)
    print("INSTRUCTIONS")
    print("="*60)
    print("""
The books have been fetched by the browser and stored in JavaScript.
To save them, you need to either:

OPTION 1: Use the browser's download functionality
  - Check if browser downloads appeared in your Downloads folder
  - If yes, run: ORGANIZE_DOWNLOADED_BOOKS.bat

OPTION 2: Use Node.js (if installed)
  - Run: node download_and_organize.js
  - This will download books directly from Project Gutenberg

OPTION 3: Manual download from Project Gutenberg
  - Visit: https://www.gutenberg.org
  - Search for each book using the IDs in README.txt
  - Download as Plain Text UTF-8
  - Move files to: books/[Category]/

Available books are organized as:
""")

    for category in sorted(set(BOOKS_MAP.values())):
        books_in_category = [name for name, cat in BOOKS_MAP.items() if cat == category]
        print(f"\n{category}:")
        for book in sorted(books_in_category):
            print(f"  • {book}")

    print("\n" + "="*60)
    print("Status")
    print("="*60)

    # Check which books already exist
    existing = []
    for filename, category in BOOKS_MAP.items():
        filepath = BOOKS_PATH / category / filename
        if filepath.exists():
            size_mb = filepath.stat().st_size / 1024 / 1024
            existing.append(f"✓ {filename} ({size_mb:.1f} MB)")

    if existing:
        print(f"\n{len(existing)} books already saved:\n")
        for book_info in existing:
            print(f"  {book_info}")
    else:
        print("\nNo books found in category folders yet.")

    print("\n" + "="*60 + "\n")

if __name__ == "__main__":
    main()
