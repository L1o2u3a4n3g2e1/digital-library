# test_command_model.py
import torch
import numpy as np
import pickle
import sys
from train_command_model import CommandLSTM

print("=" * 60)
print("🧪 TESTING COMMAND RECOGNITION LSTM")
print("=" * 60)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load vocabulary
with open("data/processed/char_to_idx_commands.pkl", "rb") as f:
    char_to_idx = pickle.load(f)

idx_to_char = {v: k for k, v in char_to_idx.items()}
vocab_size = len(char_to_idx)

print(f"Vocabulary size: {vocab_size}")

# Load model
model = CommandLSTM(num_classes=vocab_size)
model.load_state_dict(torch.load("models/stt/command_model.pt", map_location=device))
model.eval()
model.to(device)

def decode_output(output):
    """Decode model output to text"""
    text = ""
    prev_char = ""
    for step in output[0]:
        idx = torch.argmax(step).item()
        if idx in idx_to_char:
            char = idx_to_char[idx]
            if char not in ['<PAD>', '<BLANK>', '<UNK>'] and char != prev_char:
                text += char
                prev_char = char
    return text

# Test with test commands
test_commands = [
    "soma igitabo",
    "ikurikira", 
    "read book",
    "next page"
]

print("\n🔊 Testing with synthetic test inputs...")
for cmd in test_commands:
    # Create a test feature for this command
    import hashlib
    seed = int(hashlib.md5(cmd.encode()).hexdigest()[:8], 16)
    np.random.seed(seed)
    
    test_input = torch.randn(1, 50, 13).to(device)
    
    with torch.no_grad():
        output = model(test_input)
        decoded = decode_output(output.cpu())
    
    print(f"   Expected: '{cmd}'")
    print(f"   Predicted: '{decoded}'")
    print()

print("✅ Test complete!")