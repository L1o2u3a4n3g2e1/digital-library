# command_inference.py
import torch
import numpy as np
import pickle
import librosa
import hashlib
from train_command_model import CommandLSTM

class CommandRecognizer:
    def __init__(self, model_path="models/stt/command_model.pt", vocab_path="data/processed/char_to_idx_commands.pkl"):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # Load vocabulary
        with open(vocab_path, "rb") as f:
            self.char_to_idx = pickle.load(f)
        self.idx_to_char = {v: k for k, v in self.char_to_idx.items()}
        
        # Load model
        self.model = CommandLSTM(num_classes=len(self.char_to_idx))
        self.model.load_state_dict(torch.load(model_path, map_location=self.device))
        self.model.eval()
        self.model.to(self.device)
        
        print(f"✅ Command recognizer loaded on {self.device}")
    
    def extract_features(self, audio_path, max_len=50):
        """Extract MFCC features from audio"""
        try:
            audio, sr = librosa.load(audio_path, sr=16000, duration=3)
            mfcc = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=13, n_fft=400, hop_length=160)
            
            if mfcc.shape[1] > max_len:
                mfcc = mfcc[:, :max_len]
            else:
                padding = max_len - mfcc.shape[1]
                mfcc = np.pad(mfcc, ((0, 0), (0, padding)), mode='constant')
            
            return torch.FloatTensor(mfcc.T).unsqueeze(0).to(self.device)
        except:
            return None
    
    def decode(self, output):
        """Decode model output to text"""
        text = ""
        prev_char = ""
        for step in output[0]:
            idx = torch.argmax(step).item()
            if idx in self.idx_to_char:
                char = self.idx_to_char[idx]
                if char not in ['<PAD>', '<BLANK>', '<UNK>'] and char != prev_char:
                    text += char
                    prev_char = char
        return text
    
    def recognize(self, audio_path):
        """Recognize command from audio file"""
        features = self.extract_features(audio_path)
        if features is None:
            return "", 0
        
        with torch.no_grad():
            output = self.model(features)
            text = self.decode(output.cpu())
        
        return text, 0.95  # confidence

if __name__ == "__main__":
    recognizer = CommandRecognizer()
    print("\n🎤 Command recognizer ready!")
    print("   Call recognizer.recognize('audio.wav') to transcribe")