# Multilingual Library Database Documentation

## Project Title
RNN Based Multilingual Digital Library for Enhancing Inclusive Access to Books for Low Literacy Users

## Database Name
`multilingual_library`

## Database Technology
- MySQL / MariaDB (compatible with XAMPP)
- Relational Database Management System (RDBMS)
- Supports multilingual, audio, AI, and accessibility-focused data storage

## Purpose
The database stores:
- User accounts
- Books
- Audiobooks
- Speech data
- Translation data
- AI recommendation data
- RNN model information
- User activity
- Accessibility settings

## Main Database Modules
| Module | Description |
| --- | --- |
| Authentication | User login and registration |
| Books | Digital book management |
| Audio | Audiobook and Text-to-Speech storage |
| Translation | Multilingual translation storage |
| Speech Recognition | Speech-to-text processing logs |
| RNN AI | Recommendation and prediction data |
| Accessibility | Low literacy support and preferences |
| Analytics | User activity and behavior tracking |

## Supported Languages
- English
- French
- Kinyarwanda
- Kiswahili

## AI Features
The system integrates:
- RNN models
- LSTM models
- Speech-to-Text
- Text-to-Speech
- Automatic Translation
- Voice Navigation
- Recommendation Engine
- Language Detection

## Accessibility Features
The system supports:
- Low literacy mode
- Large buttons
- Voice guidance
- Audiobooks
- High contrast mode
- Multilingual navigation

## Supported Functional Requirements
The database supports:
- User authentication
- Book uploads
- Book downloads
- Search history and analytics
- Translation system
- Audiobook generation
- Speech recognition logging
- Voice commands
- AI recommendations
- Offline access
- User analytics

## Tables and Purpose
1. `users`: Stores admin, client, librarian accounts and accessibility settings.
2. `books`: Stores uploaded digital books and metadata.
3. `book_translations`: Stores translated book versions.
4. `audiobooks`: Stores generated audiobook files.
5. `bookmarks`: Stores user-saved books.
6. `listening_history`: Tracks audiobook listening progress.
7. `search_history`: Stores search records for recommendations and analytics.
8. `voice_commands`: Stores voice navigation commands.
9. `user_recommendations`: Stores AI-generated recommendations.
10. `rnn_models`: Stores trained RNN/LSTM model metadata.
11. `training_datasets`: Stores AI training dataset records.
12. `speech_to_text_logs`: Stores speech recognition output logs.
13. `text_to_speech_logs`: Stores generated audio records.
14. `user_activity`: Tracks system usage and analytics.
15. `downloads`: Tracks downloaded books for offline access.
16. `notifications`: Stores user notifications.

## Relationship Structure
- `users` → `books`, `bookmarks`, `downloads`, `listening_history`, `search_history`, `voice_commands`, `user_activity`, `user_recommendations`
- `books` → `audiobooks`, `book_translations`, `downloads`, `bookmarks`, `listening_history`
- `rnn_models` → `training_datasets`

## Implementation Notes
- This schema is compatible with XAMPP/MySQL and phpMyAdmin.
- Use `InnoDB` for referential integrity.
- Use `utf8mb4` charset to support multilingual content.

## How to deploy in XAMPP / phpMyAdmin
1. Open `http://localhost/phpmyadmin/`.
2. Create a new database named `multilingual_library` or import the provided SQL file.
3. Open the `Import` tab, choose `multilingual_library_schema.sql`, and run it.
4. Confirm the tables were created in the database.

## Files Included
- `multilingual_library_schema.sql`: MySQL-compatible database schema for XAMPP
- `multilingual_library_database.md`: Documentation for the database design
