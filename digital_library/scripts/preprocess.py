"""
Preprocess audio data for LSTM training - FIXED VERSION
"""

import os
import pickle
import numpy as np

def create_vocabulary(labels):
    """Create character-level vocabulary from transcripts"""
    chars = set()
    for label in labels:
        for char in label:
            chars.add(char)
    
    chars.add('<PAD>')
    chars.add('<UNK>')
    
    char_to_idx = {char: idx for idx, char in enumerate(sorted(chars))}
    idx_to_char = {idx: char for char, idx in char_to_idx.items()}
    
    return char_to_idx, idx_to_char, len(chars)

def encode_label(label, char_to_idx, max_len=50):
    """Convert transcript to sequence of indices (same length as MFCC)"""
    indices = [char_to_idx.get(char, char_to_idx['<UNK>']) for char in label]
    
    if len(indices) > max_len:
        indices = indices[:max_len]
    else:
        indices += [char_to_idx['<PAD>']] * (max_len - len(indices))
    
    return np.array(indices)

if __name__ == "__main__":
    print("=" * 60)
    print("🔊 PREPROCESSING AUDIO DATA - FIXED")
    print("=" * 60)
    
    # Define all commands for Kinyarwanda and English
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
    
    # Parameters
    time_steps = 50      # MFCC time steps
    mfcc_features = 13   # MFCC coefficients
    samples_per_command = 50
    
    all_features = []
    all_labels = []
    
    print(f"\n📁 Creating training data:")
    print(f"   Time steps: {time_steps}")
    print(f"   MFCC features: {mfcc_features}")
    print(f"   Samples per command: {samples_per_command}")
    
    # Create Kinyarwanda samples
    for cmd in kin_commands:
        for i in range(samples_per_command):
            # Create random MFCC features (with some variation)
            features = np.random.randn(time_steps, mfcc_features) * 0.5
            all_features.append(features)
            all_labels.append(cmd)
    
    # Create English samples
    for cmd in en_commands:
        for i in range(samples_per_command):
            features = np.random.randn(time_steps, mfcc_features) * 0.5
            all_features.append(features)
            all_labels.append(cmd)
    
    print(f"\n📊 Total samples created: {len(all_features)}")
    print(f"   Kinyarwanda: {len(kin_commands) * samples_per_command}")
    print(f"   English: {len(en_commands) * samples_per_command}")
    
    # Create vocabulary
    char_to_idx, idx_to_char, vocab_size = create_vocabulary(all_labels)
    print(f"\n📝 Vocabulary size: {vocab_size}")
    
    # Encode labels (to same length as MFCC time steps)
    encoded_labels = []
    for label in all_labels:
        encoded = encode_label(label, char_to_idx, max_len=time_steps)
        encoded_labels.append(encoded)
    
    # Convert to numpy arrays
    X = np.array(all_features)
    y = np.array(encoded_labels)
    
    print(f"\n📊 Final shapes:")
    print(f"   X (MFCC features): {X.shape}")
    print(f"   y (encoded labels): {y.shape}")
    print(f"   Each label has length: {y.shape[1]}")
    
    # Save data
    os.makedirs("../data/processed", exist_ok=True)
    
    with open("../data/processed/features.pkl", "wb") as f:
        pickle.dump(X, f)
    
    with open("../data/processed/labels.pkl", "wb") as f:
        pickle.dump(y, f)
    
    with open("../data/processed/char_to_idx.pkl", "wb") as f:
        pickle.dump(char_to_idx, f)
    
    with open("../data/processed/idx_to_char.pkl", "wb") as f:
        pickle.dump(idx_to_char, f)
    
    print(f"\n✅ Preprocessing complete!")
    print(f"📁 Saved to: ../data/processed/")