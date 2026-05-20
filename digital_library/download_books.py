#!/usr/bin/env python3
"""
Download books from Project Gutenberg and organize them by category
"""

import urllib.request
import os
from pathlib import Path

# Base path for books
base_path = r"C:\Users\PC\Desktop\digital_library\books"

# Book data: (category, filename, book_id)
books = [
    # Agriculture
    ("Agriculture", "Principles_of_Agriculture_Bailey.txt", "22896"),
    ("Agriculture", "Farmers_Every_Day_Book_Stephens.txt", "31262"),
    ("Agriculture", "Modern_Farming_Andrews.txt", "34763"),

    # Business
    ("Business", "Wealth_of_Nations_Smith.txt", "3825"),
    ("Business", "Benjamin_Franklin_Autobiography.txt", "20203"),
    ("Business", "The_Prince_Machiavelli.txt", "1232"),

    # Education
    ("Education", "Essays_on_Education_Milton.txt", "10905"),
    ("Education", "On_Education_Locke.txt", "8818"),
    ("Education", "Franklin_Autobiography_Education.txt", "20203"),

    # Family
    ("Family", "Little_Women_Alcott.txt", "514"),
    ("Family", "David_Copperfield_Dickens.txt", "766"),
    ("Family", "Jane_Eyre_Bronte.txt", "1260"),

    # Health
    ("Health", "Care_Feeding_Children_Holt.txt", "8435"),
    ("Health", "Practice_of_Medicine_Flint.txt", "26058"),
    ("Health", "Art_of_Healing_Hippocrates.txt", "27017"),

    # Love
    ("Love", "Pride_and_Prejudice_Austen.txt", "1342"),
    ("Love", "Wuthering_Heights_Bronte.txt", "768"),
    ("Love", "Jane_Eyre_Bronte.txt", "1260"),

    # Social
    ("Social", "Origin_of_Species_Darwin.txt", "2009"),
    ("Social", "Social_Contract_Rousseau.txt", "3742"),
    ("Social", "Tale_of_Two_Cities_Dickens.txt", "98"),
]

def download_book(category, filename, book_id):
    """Download a book from Project Gutenberg"""
    url = f"https://www.gutenberg.org/cache/epub/{book_id}/pg{book_id}.txt"

    # Create category folder if it doesn't exist
    category_path = os.path.join(base_path, category)
    Path(category_path).mkdir(parents=True, exist_ok=True)

    # Full file path
    file_path = os.path.join(category_path, filename)

    try:
        print(f"Downloading: {filename} ({category})...", end=" ", flush=True)
        urllib.request.urlretrieve(url, file_path)
        file_size = os.path.getsize(file_path)
        print(f"✓ ({file_size:,} bytes)")
        return True
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        return False

def main():
    """Main function"""
    print("=" * 70)
    print("PROJECT GUTENBERG BOOK DOWNLOADER")
    print("=" * 70)
    print(f"Downloading {len(books)} books to: {base_path}\n")

    success_count = 0
    failed_count = 0

    for category, filename, book_id in books:
        if download_book(category, filename, book_id):
            success_count += 1
        else:
            failed_count += 1

    print("\n" + "=" * 70)
    print(f"Download Complete!")
    print(f"Success: {success_count}/{len(books)}")
    print(f"Failed: {failed_count}/{len(books)}")
    print("=" * 70)

    # List downloaded books
    print("\nBooks by Category:")
    for category in ["Agriculture", "Business", "Education", "Family", "Health", "Love", "Social"]:
        category_path = os.path.join(base_path, category)
        if os.path.exists(category_path):
            files = [f for f in os.listdir(category_path) if f.endswith('.txt')]
            print(f"\n{category}: {len(files)} files")
            for f in sorted(files):
                file_size = os.path.getsize(os.path.join(category_path, f))
                print(f"  ✓ {f} ({file_size:,} bytes)")

if __name__ == "__main__":
    main()
