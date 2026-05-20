# LSTM-Powered Multilingual Digital Library

A comprehensive digital library system featuring Kinyarwanda and English support, powered by LSTM (Long Short-Term Memory) neural networks for voice interaction and intelligent processing.

## 🌟 Features

- **Multilingual Support:** Full support for Kinyarwanda and English.
- **Voice Commands:** Navigate and interact with the library using voice.
- **Offline-First:** Designed to work with local models and datasets.
- **Dashboard:** Personalized dashboard for users to track progress and saved books.
- **Book Management:** Upload, download, rate, and share books.
- **Mobile & Web:** Cross-platform support with React (Web) and Expo (Mobile).

## 🏗️ Project Structure

```
digital_library/
├── backend/            # FastAPI Python server
│   ├── models/         # Trained AI models (STT, TTS, etc.)
│   ├── uploads/        # User uploads (books, audio)
│   └── main.py         # Main API server
├── frontend/           # React Web Application
├── mobile/             # React Native (Expo) Mobile App
├── data/               # Datasets and processed training data
├── models/             # Root models directory for ML experimentation
└── scripts/            # Utility scripts for data processing and training
```

## 🚀 Getting Started

### Backend Setup
1. Navigate to the `backend/` directory.
2. Create a virtual environment: `python -m venv venv`.
3. Activate the venv: `source venv/bin/activate` (Linux/Mac) or `venv\Scripts\activate` (Windows).
4. Install dependencies: `pip install -r requirements.txt`. (Note: Create this if missing)
5. Start the server: `python main.py`.

### Frontend Setup
1. Navigate to the `frontend/` directory.
2. Install dependencies: `npm install`.
3. Start the development server: `npm start`.

### Mobile Setup
1. Navigate to the `mobile/` directory.
2. Install dependencies: `npm install`.
3. Start Expo: `npx expo start`.

## 🧠 Machine Learning

The project uses LSTM models for Speech-to-Text (STT) and pattern recognition.
- **Training:** Use `train_meaningful.py` to train the command recognition model.
- **Retraining:** Use `retrain_model.py` for incremental training on new data.
- **Testing:** Use `test_model_fixed.py` to verify model performance.

## 🛠️ Requirements

- Python 3.8+
- Node.js & npm
- MySQL (for backend database)
- PyTorch (for ML models)

## 📄 License
MIT
