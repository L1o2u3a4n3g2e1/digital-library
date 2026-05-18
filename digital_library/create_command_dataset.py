# create_command_dataset.py
import numpy as np
import pickle
import os
import hashlib

print("=" * 60)
print("🎯 CREATING COMMAND RECOGNITION DATASET")
print("=" * 60)

# Define Kinyarwanda and English commands with their actions
COMMANDS = {
    # Kinyarwanda
    "soma igitabo": "open_book",
    "ikurikira": "next_page", 
    "isubire inyuma": "previous_page",
    "subira inyuma": "go_back",
    "ngaho": "read_aloud",
    "hindura ururimi": "change_language",
    "komeza gusoma": "continue_reading",
    "rura ibitabo": "search_books",
    # English
    "read book": "open_book",
    "next page": "next_page",
    "previous page": "previous_page",
    "go back": "go_back",
    "read aloud": "read_aloud",
    "change language": "change_language",
    "continue reading": "continue_reading",
    "search books": "search_books"
}

def create_command_features(command, sample_num, time_steps=50, mfcc_features=13):
    """Generate unique MFCC pattern for each command"""
    
    # Create unique seed from command
    seed = int(hashlib.md5(command.encode()).hexdigest()[:8], 16)
    np.random.seed(seed + sample_num)
    
    # Base random features
    features = np.random.randn(time_steps, mfcc_features) * 0.2
    
    # Add command-specific frequency patterns
    for t in range(time_steps):
        # Fundamental frequency varies over time
        freq = 100 + (t * 2) + (seed % 50)
        
        # Add sinusoidal patterns unique to each command
        for f in range(min(mfcc_features, 5)):
            features[t, f] += np.sin(2 * np.pi * freq * (f+1) * t / 8000) * 0.4
            features[t, f] += np.cos(2 * np.pi * (freq/2) * t / time_steps) * 0.3
    
    # Add temporal smoothness
    for t in range(1, time_steps):
        features[t] = features[t] * 0.6 + features[t-1] * 0.4
    
    # Add noise for variation
    features += np.random.randn(time_steps, mfcc_features) * 0.15
    
    return features

# Create dataset
samples_per_command = 500
all_features = []
all_labels = []

print(f"\n📁 Creating dataset with {len(COMMANDS)} commands")
print(f"   Samples per command: {samples_per_command}")
print(f"   Total samples: {len(COMMANDS) * samples_per_command}")

for command in COMMANDS.keys():
    for i in range(samples_per_command):
        features = create_command_features(command, i)
        all_features.append(features)
        all_labels.append(command)

# Convert to numpy
X = np.array(all_features)
y = np.array(all_labels)

print(f"\n📊 Dataset shapes:")
print(f"   X: {X.shape}")
print(f"   y: {y.shape}")

# Create character vocabulary
def create_vocabulary(labels):
    chars = set()
    for label in labels:
        for char in label:
            chars.add(char)
    chars.add('<PAD>')
    chars.add('<BLANK>')
    chars.add('<UNK>')
    char_to_idx = {char: idx for idx, char in enumerate(sorted(chars))}
    idx_to_char = {idx: char for char, idx in char_to_idx.items()}
    return char_to_idx, idx_to_char

def encode_label(label, char_to_idx, max_len=50):
    indices = [char_to_idx.get(char, char_to_idx['<UNK>']) for char in label]
    if len(indices) > max_len:
        indices = indices[:max_len]
    else:
        indices += [char_to_idx['<PAD>']] * (max_len - len(indices))
    return np.array(indices)

char_to_idx, idx_to_char = create_vocabulary(all_labels)
vocab_size = len(char_to_idx)
blank_idx = char_to_idx['<BLANK>']

print(f"\n📝 Vocabulary size: {vocab_size}")
print(f"   Blank token index: {blank_idx}")
print(f"   Characters: {list(char_to_idx.keys())[:15]}...")

# Encode labels
y_encoded = np.array([encode_label(label, char_to_idx) for label in all_labels])

# Save
os.makedirs("data/processed", exist_ok=True)
np.save("data/processed/X_commands.npy", X)
np.save("data/processed/y_commands.npy", y_encoded)

with open("data/processed/char_to_idx_commands.pkl", "wb") as f:
    pickle.dump(char_to_idx, f)
with open("data/processed/idx_to_char_commands.pkl", "wb") as f:
    pickle.dump(idx_to_char, f)

print(f"\n✅ Command dataset saved!")
print(f"   Location: data/processed/")