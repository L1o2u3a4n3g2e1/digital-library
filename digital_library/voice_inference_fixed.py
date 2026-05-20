# voice_inference_fixed.py
import torch
import numpy as np
import librosa
import pickle
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from model_definition import LSTM_STT

class LSTM_STT_Inference:
    def __init__(self, model_path="models/stt/lstm_stt_final.pt", vocab_path="data/processed/char_to_idx.pkl"):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # Load vocabulary
        with open(vocab_path, "rb") as f:
            self.char_to_idx = pickle.load(f)
        self.idx_to_char = {v: k for k, v in self.char_to_idx.items()}
        self.vocab_size = len(self.char_to_idx)
        
        print(f"Vocabulary size: {self.vocab_size}")
        
        # Create model and load weights
        self.model = LSTM_STT(input_dim=13, hidden_dim=128, num_classes=self.vocab_size, dropout=0.2)
        
        if os.path.exists(model_path):
            self.model.load_state_dict(torch.load(model_path, map_location=self.device, weights_only=False))
            print(f"✅ Model loaded from {model_path}")
        else:
            print(f"⚠️ Model file not found: {model_path}")
        
        self.model.eval()
        self.model.to(self.device)
        print(f"✅ Model ready on {self.device}")
    
    def extract_features(self, audio_path, max_len=50):
        """Extract MFCC features from audio file"""
        try:
            # Load audio
            audio, sr = librosa.load(audio_path, sr=16000, duration=3)
            
            # Extract MFCC features
            mfcc = librosa.feature.mfcc(
                y=audio,
                sr=sr,
                n_mfcc=13,
                n_fft=400,
                hop_length=160
            )
            
            # Pad or truncate to max_len
            if mfcc.shape[1] > max_len:
                mfcc = mfcc[:, :max_len]
            else:
                padding = max_len - mfcc.shape[1]
                mfcc = np.pad(mfcc, ((0, 0), (0, padding)), mode='constant')
            
            return torch.FloatTensor(mfcc.T).unsqueeze(0).to(self.device)
        
        except Exception as e:
            print(f"Feature extraction error: {e}")
            return None
    
    def decode_predictions(self, predictions):
        """Convert model output to text"""
        text = ""
        for step in predictions[0]:
            idx = torch.argmax(step).item()
            if idx in self.idx_to_char:
                char = self.idx_to_char[idx]
                if char not in ['<PAD>', '<BLANK>', '<UNK>']:
                    text += char
        return text.strip()
    
    def transcribe(self, audio_path):
        """Transcribe audio file to text"""
        features = self.extract_features(audio_path)
        if features is None:
            return ""
        
        with torch.no_grad():
            output = self.model(features)
            text = self.decode_predictions(output.cpu())
        
        return text

# Create and test
print("=" * 60)
print("🎤 VOICE INFERENCE SETUP")
print("=" * 60)

stt = LSTM_STT_Inference()

# Test with random input
print("\n🔊 Testing inference with random input...")
random_input = torch.randn(1, 50, 13).to(stt.device)

with torch.no_grad():
    output = stt.model(random_input)
    text = stt.decode_predictions(output.cpu())
    
print(f"   Random input result: '{text}'")

print("\n✅ Voice inference ready!")