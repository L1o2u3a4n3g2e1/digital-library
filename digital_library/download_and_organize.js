#!/usr/bin/env node
/**
 * Complete Book Downloader and Organizer
 * Downloads 21 Project Gutenberg books and organizes them by category
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const BOOKS_PATH = path.join(__dirname, 'books');

// Book definitions with categories
const BOOKS = [
  // Agriculture
  { id: '22896', filename: 'Principles_of_Agriculture_Bailey.txt', category: 'Agriculture' },
  { id: '31262', filename: 'Farmers_Every_Day_Book_Stephens.txt', category: 'Agriculture' },
  { id: '34763', filename: 'Modern_Farming_Andrews.txt', category: 'Agriculture' },

  // Business
  { id: '3825', filename: 'Wealth_of_Nations_Smith.txt', category: 'Business' },
  { id: '20203', filename: 'Benjamin_Franklin_Autobiography.txt', category: 'Business' },
  { id: '1232', filename: 'The_Prince_Machiavelli.txt', category: 'Business' },

  // Education
  { id: '10905', filename: 'Essays_on_Education_Milton.txt', category: 'Education' },
  { id: '8818', filename: 'On_Education_Locke.txt', category: 'Education' },
  { id: '20203', filename: 'Franklin_Autobiography_Education.txt', category: 'Education' },

  // Family
  { id: '514', filename: 'Little_Women_Alcott.txt', category: 'Family' },
  { id: '766', filename: 'David_Copperfield_Dickens.txt', category: 'Family' },
  { id: '1260', filename: 'Jane_Eyre_Bronte.txt', category: 'Family' },

  // Health
  { id: '8435', filename: 'Care_Feeding_Children_Holt.txt', category: 'Health' },
  { id: '26058', filename: 'Practice_of_Medicine_Flint.txt', category: 'Health' },
  { id: '27017', filename: 'Art_of_Healing_Hippocrates.txt', category: 'Health' },

  // Love
  { id: '1342', filename: 'Pride_and_Prejudice_Austen.txt', category: 'Love' },
  { id: '768', filename: 'Wuthering_Heights_Bronte.txt', category: 'Love' },
  { id: '1260', filename: 'Jane_Eyre_Bronte.txt', category: 'Love' },

  // Social
  { id: '2009', filename: 'Origin_of_Species_Darwin.txt', category: 'Social' },
  { id: '3742', filename: 'Social_Contract_Rousseau.txt', category: 'Social' },
  { id: '98', filename: 'Tale_of_Two_Cities_Dickens.txt', category: 'Social' },
];

/**
 * Download a book from Project Gutenberg
 */
function downloadBook(bookId) {
  return new Promise((resolve, reject) => {
    const url = `https://www.gutenberg.org/cache/epub/${bookId}/pg${bookId}.txt`;

    https.get(url, { timeout: 30000 }, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      let data = '';
      response.setEncoding('utf8');

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        resolve(data);
      });

      response.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Ensure directory exists
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Main download and organize process
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Project Gutenberg Book Downloader & Organizer             ║');
  console.log('║  Downloading 21 books to category folders...               ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Create category directories
  const categories = new Set(BOOKS.map(b => b.category));
  for (const category of categories) {
    ensureDir(path.join(BOOKS_PATH, category));
  }

  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;

  // Download and save each book
  for (let i = 0; i < BOOKS.length; i++) {
    const book = BOOKS[i];
    const categoryPath = path.join(BOOKS_PATH, book.category);
    const filePath = path.join(categoryPath, book.filename);

    // Skip if already exists
    if (fs.existsSync(filePath)) {
      console.log(`[${i + 1}/${BOOKS.length}] ⊘ SKIP: ${book.filename} (already exists)`);
      skipCount++;
      continue;
    }

    process.stdout.write(`[${i + 1}/${BOOKS.length}] ⏳ Downloading: ${book.filename}... `);

    try {
      const content = await downloadBook(book.id);
      fs.writeFileSync(filePath, content, 'utf8');

      const sizeMB = (content.length / 1024 / 1024).toFixed(2);
      console.log(`✓ (${sizeMB} MB)`);
      successCount++;

      // Delay to be respectful to the server
      await new Promise(r => setTimeout(r, 800));
    } catch (error) {
      console.log(`✗ Error: ${error.message}`);
      failCount++;
      // Continue with next book on error
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  // Print summary
  console.log('\n' + '═'.repeat(60));
  console.log('DOWNLOAD COMPLETE');
  console.log('═'.repeat(60));
  console.log(`✓ Successfully downloaded: ${successCount} books`);
  console.log(`⊘ Skipped (already exist): ${skipCount} books`);
  console.log(`✗ Failed: ${failCount} books`);
  console.log(`📊 Total: ${successCount + skipCount}/${BOOKS.length} books ready\n`);

  // List books by category
  console.log('📁 Books by Category:');
  for (const category of Array.from(categories).sort()) {
    const categoryPath = path.join(BOOKS_PATH, category);
    if (fs.existsSync(categoryPath)) {
      const files = fs.readdirSync(categoryPath)
        .filter(f => f.endsWith('.txt'))
        .sort();
      console.log(`\n  ${category}: ${files.length} books`);
      for (const file of files) {
        const filePath = path.join(categoryPath, file);
        const stats = fs.statSync(filePath);
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
        console.log(`    ✓ ${file} (${sizeMB} MB)`);
      }
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('✨ Your Digital Library is ready to use!');
  console.log('═'.repeat(60) + '\n');

  process.exit(failCount > 0 ? 1 : 0);
}

// Run the main function
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
