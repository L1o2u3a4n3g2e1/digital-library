# create_sample_data.py
import os
import numpy as np
import pickle
import random

print("=" * 60)
print("📁 CREATING SAMPLE TRAINING DATA FOR LSTM STT")
print("=" * 60)

# Create directories
os.makedirs("data/processed", exist_ok=True)
os.makedirs("models/stt", exist_ok=True)

# Define Kinyarwanda and English commands
kin_commands = [
    "soma igitabo",      # read book
    "ikurikira",         # next
    "isubire inyuma",    # previous
    "subira inyuma",     # go back
    "ngaho",             # read aloud
    "hindura ururimi",   # change language
    "komeza gusoma",     # continue reading
    "rura ibitabo"       # search books
]

en_commands = [
    "read book",
    "next page",
    "previous page", 
    "go back",
    "read aloud",
    "change language",
    "continue reading",
    "search books"
]

print(f"\n📝 Creating training data for:")
print(f"   Kinyarwanda: {len(kin_commands)} commands")
print(f"   English: {len(en_commands)} commands")

# Parameters
time_steps = 50      # Number of time frames
mfcc_features = 13   # MFCC coefficients
samples_per_command = 100  # 100 samples per command

all_features = []
all_labels = []

print(f"\n🔊 Generating {samples_per_command} samples per command...")

# Generate random MFCC features for Kinyarwanda commands
for cmd in kin_commands:
    for i in range(samples_per_command):
        # Add unique random pattern for each sample
        features = np.random.randn(time_steps, mfcc_features) * 0.5
        # Add some variation based on command
        command_seed = hash(cmd) % 100
        features = features + (command_seed / 1000.0)
        all_features.append(features)
        all_labels.append(cmd)

# Generate random MFCC features for English commands
for cmd in en_commands:
    for i in range(samples_per_command):
        features = np.random.randn(time_steps, mfcc_features) * 0.5
        command_seed = hash(cmd) % 100
        features = features + (command_seed / 1000.0)
        all_features.append(features)
        all_labels.append(cmd)

print(f"📊 Total samples generated: {len(all_features)}")

# Create character-level vocabulary
def create_vocabulary(labels):
    chars = set()
    for label in labels:
        for char in label:
            chars.add(char)
    chars.add('<PAD>')   # Padding token
    chars.add('<BLANK>') # CTC blank token
    chars.add('<UNK>')   # Unknown token
    
    char_to_idx = {char: idx for idx, char in enumerate(sorted(chars))}
    idx_to_char = {idx: char for char, idx in char_to_idx.items()}
    return char_to_idx, idx_to_char

# Encode labels to sequences of indices
def encode_label(label, char_to_idx, max_len=50):
    indices = [char_to_idx.get(char, char_to_idx['<UNK>']) for char in label]
    if len(indices) > max_len:
        indices = indices[:max_len]
    else:
        indices += [char_to_idx['<PAD>']] * (max_len - len(indices))
    return np.array(indices)

# Create vocabulary
char_to_idx, idx_to_char = create_vocabulary(all_labels)
vocab_size = len(char_to_idx)

print(f"\n📝 Vocabulary size: {vocab_size}")
print(f"   Characters: {list(char_to_idx.keys())[:15]}...")

# Encode all labels
encoded_labels = [encode_label(label, char_to_idx) for label in all_labels]

# Convert to numpy arrays
X = np.array(all_features)
y = np.array(encoded_labels)

print(f"\n📊 Dataset shapes:")
print(f"   X (MFCC features): {X.shape}")
print(f"   y (encoded labels): {y.shape}")

# Save preprocessed data
np.save("data/processed/features.npy", X)
np.save("data/processed/labels.npy", y)

with open("data/processed/char_to_idx.pkl", "wb") as f:
    pickle.dump(char_to_idx, f)
with open("data/processed/idx_to_char.pkl", "wb") as f:
    pickle.dump(idx_to_char, f)

print(f"\n✅ Sample data created successfully!")
print(f"   Features saved to: data/processed/features.npy")
print(f"   Labels saved to: data/processed/labels.npy")
print(f"   Vocabulary saved to: data/processed/char_to_idx.pkl")
print(f"\n📁 You can now run: python train_stt.py")