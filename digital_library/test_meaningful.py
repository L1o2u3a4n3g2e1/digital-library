# test_meaningful.py
import torch
import numpy as np
import pickle
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from train_meaningful import LSTMModel

print("=" * 60)
print("🧪 TESTING MEANINGFUL LSTM MODEL")
print("=" * 60)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load vocabulary
with open("data/processed/char_to_idx_meaningful.pkl", "rb") as f:
    char_to_idx = pickle.load(f)

idx_to_char = {v: k for k, v in char_to_idx.items()}
vocab_size = len(char_to_idx)

print(f"Vocabulary size: {vocab_size}")

# Load model
model = LSTMModel(num_classes=vocab_size)
model.load_state_dict(torch.load("models/stt/meaningful_model.pt", map_location=device))
model.eval()
model.to(device)

print("✅ Model loaded")

# Test with random input
random_input = torch.randn(1, 50, 13).to(device)

with torch.no_grad():
    output = model(random_input)
    
    # Decode
    text = ""
    for step in output[0]:
        idx = torch.argmax(step).item()
        if idx in idx_to_char:
            char = idx_to_char[idx]
            if char not in ['<PAD>', '<BLANK>', '<UNK>']:
                text += char

print(f"\n🔊 Test output: '{text}'")

print("\n✅ Test complete!")