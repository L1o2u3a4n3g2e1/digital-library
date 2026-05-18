import os
import torch
import torch.nn as nn
import numpy as np
import librosa
import pickle
import io
import soundfile as sf

# Re-define the model class as it's needed for loading
class LSTM_STT(nn.Module):
    def __init__(self, input_dim=13, hidden_dim=256, num_layers=3, num_classes=16, dropout=0.3):
        super(LSTM_STT, self).__init__()
        self.lstm = nn.LSTM(
            input_size=input_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            bidirectional=True,
            dropout=dropout if num_layers > 1 else 0
        )
        self.global_avg_pool = nn.AdaptiveAvgPool1d(1)
        self.fc1 = nn.Linear(hidden_dim * 2, 128)
        self.fc2 = nn.Linear(128, num_classes)
        self.dropout = nn.Dropout(dropout)
        self.relu = nn.ReLU()
    
    def forward(self, x):
        lstm_out, _ = self.lstm(x)
        lstm_out = lstm_out.transpose(1, 2)
        pooled = self.global_avg_pool(lstm_out)
        pooled = pooled.squeeze(-1)
        x = self.dropout(pooled)
        x = self.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.fc2(x)
        return x

class VoiceRecognitionService:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        self.idx_to_command = {}
        self.is_loaded = False
        self.load_model()

    def load_model(self):
        try:
            mapping_path = os.path.join(os.path.dirname(__file__), "data", "processed", "command_mapping.pkl")
            model_path = os.path.join(os.path.dirname(__file__), "models", "stt", "best_stt_model.pt")

            if os.path.exists(mapping_path) and os.path.exists(model_path):
                with open(mapping_path, "rb") as f:
                    mapping = pickle.load(f)
                    self.idx_to_command = mapping["idx_to_command"]
                
                num_classes = len(self.idx_to_command)
                self.model = LSTM_STT(num_classes=num_classes).to(self.device)
                self.model.load_state_dict(torch.load(model_path, map_location=self.device))
                self.model.eval()
                self.is_loaded = True
                print("✅ Voice Recognition Model loaded successfully")
            else:
                print("⚠️ Voice Recognition Model or Mapping not found")
        except Exception as e:
            print(f"❌ Error loading Voice Recognition Service: {e}")

    async def recognize(self, audio_file, language="auto", detect_commands=True):
        if not self.is_loaded:
            return type('obj', (object,), {"text": "Model not loaded", "language": "en", "confidence": 0, "model_used": "none", "is_command": False, "command_action": None})

        try:
            # Read audio from bytes/file object
            audio_bytes = await audio_file.read()
            audio_io = io.BytesIO(audio_bytes)
            audio, sr = librosa.load(audio_io, sr=16000, duration=3)
            
            # Extract MFCC
            mfcc = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=13, n_fft=400, hop_length=160)
            
            # Pad/Truncate to 50 time steps
            max_len = 50
            if mfcc.shape[1] > max_len:
                mfcc = mfcc[:, :max_len]
            else:
                padding = max_len - mfcc.shape[1]
                mfcc = np.pad(mfcc, ((0, 0), (0, padding)), mode='constant')
            
            features = torch.FloatTensor(mfcc.T).unsqueeze(0).to(self.device)
            
            with torch.no_grad():
                output = self.model(features)
                probabilities = torch.softmax(output, dim=1)
                confidence, predicted = torch.max(probabilities, 1)
            
            command = self.idx_to_command.get(predicted.item(), "unknown")
            
            return type('obj', (object,), {
                "text": command,
                "language": "en", # Placeholder
                "confidence": confidence.item(),
                "model_used": "LSTM",
                "is_command": True,
                "command_action": command
            })
        except Exception as e:
            print(f"❌ Recognition error: {e}")
            return type('obj', (object,), {"text": str(e), "language": "en", "confidence": 0, "model_used": "none", "is_command": False, "command_action": None})

    async def get_available_commands(self, language="en"):
        return {
            "navigation": ["next page", "previous page", "go back"],
            "reading": ["read aloud", "stop reading"],
            "system": ["change language"]
        }

    def get_model_info(self):
        return {
            "architecture": "LSTM",
            "layers": 3,
            "bidirectional": True,
            "hidden_dim": 256,
            "is_loaded": self.is_loaded
        }

voice_service = VoiceRecognitionService()
