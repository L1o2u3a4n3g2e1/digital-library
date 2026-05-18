"""
Test the trained LSTM STT model with synthetic and real audio
"""

import torch
import numpy as np
import librosa
import pickle
import os
import sys

print("=" * 70)
print("🧪 TESTING LSTM STT MODEL")
print("=" * 70)

# Load model and mapping
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"💻 Device: {device}")

with open("data/processed/command_mapping.pkl", "rb") as f:
    mapping = pickle.load(f)
    idx_to_command = mapping["idx_to_command"]

# Load model
from train_stt_lstm import LSTM_STT

model = LSTM_STT(
    input_dim=13,
    hidden_dim=256,
    num_layers=3,
    num_classes=len(idx_to_command),
    dropout=0.3
)

# Try to load the best model
best_model_path = "models/stt/best_stt_model.pt"
if os.path.exists(best_model_path):
    model.load_state_dict(torch.load(best_model_path, map_location=device))
    print(f"✅ Loaded best model from {best_model_path}")
else:
    print(f"⚠️ Best model not found, using final model")
    model.load_state_dict(torch.load("models/stt/stt_model_final.pt", map_location=device))

model.eval()
model.to(device)

# ============================================
# TEST WITH SYNTHETIC DATA
# ============================================

print("\n📊 Testing with synthetic data...")

# Load a few test samples
X_test = np.load("data/processed/X_train.npy")[:10]
y_test = np.load("data/processed/y_train.npy")[:10]

correct = 0
for i in range(len(X_test)):
    features = torch.FloatTensor(X_test[i]).unsqueeze(0).to(device)
    true_label = y_test[i]
    true_command = idx_to_command[true_label]
    
    with torch.no_grad():
        output = model(features)
        _, predicted = torch.max(output, 1)
        pred_command = idx_to_command[predicted.item()]
    
    status = "✓" if predicted.item() == true_label else "✗"
    print(f"   {status} True: {true_command:20} | Predicted: {pred_command}")
    if predicted.item() == true_label:
        correct += 1

print(f"\n   Synthetic test accuracy: {correct}/{len(X_test)} ({100*correct/len(X_test):.1f}%)")

# ============================================
# CREATE AUDIO FILE FOR REAL TESTING
# ============================================

print("\n🔊 For real audio testing, you need to record your voice.")
print("   Run: python record_and_test.py")
print("   Or use: stt_inference.py")

# ============================================
# SAMPLE INFERENCE FUNCTION
# ============================================

def extract_features_from_audio(audio_path, sr=16000, max_len=50):
    """Extract MFCC features from audio file"""
    try:
        audio, sample_rate = librosa.load(audio_path, sr=sr, duration=3)
        mfcc = librosa.feature.mfcc(
            y=audio,
            sr=sr,
            n_mfcc=13,
            n_fft=400,
            hop_length=160
        )
        
        if mfcc.shape[1] > max_len:
            mfcc = mfcc[:, :max_len]
        else:
            padding = max_len - mfcc.shape[1]
            mfcc = np.pad(mfcc, ((0, 0), (0, padding)), mode='constant')
        
        return torch.FloatTensor(mfcc.T).unsqueeze(0).to(device)
    except Exception as e:
        print(f"Error: {e}")
        return None

def predict_audio(audio_path):
    """Predict command from audio file"""
    features = extract_features_from_audio(audio_path)
    if features is None:
        return "unknown", 0
    
    with torch.no_grad():
        output = model(features)
        probabilities = torch.softmax(output, dim=1)
        confidence, predicted = torch.max(probabilities, 1)
    
    command = idx_to_command[predicted.item()]
    return command, confidence.item()

print("\n" + "=" * 70)
print("✅ Test complete!")
print("=" * 70)
print("\n📝 To test with your voice:")
print("   1. Record a command (e.g., 'soma igitabo' or 'read book')")
print("   2. Save as 'test.wav' in backend folder")
print("   3. Run: predict_audio('test.wav')")