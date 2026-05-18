"""
Generate Synthetic Training Data for LSTM Speech-to-Text
Creates MFCC-like features with command-specific patterns
"""

import numpy as np
import pickle
import os
import hashlib
from tqdm import tqdm

print("=" * 70)
print("🔊 GENERATING SYNTHETIC SPEECH TRAINING DATA")
print("=" * 70)

# Define all voice commands for Kinyarwanda and English
COMMANDS = {
    # Kinyarwanda commands (8)
    'soma igitabo': 0,
    'ikurikira': 1,
    'isubire inyuma': 2,
    'subira inyuma': 3,
    'ngaho': 4,
    'hindura ururimi': 5,
    'komeza gusoma': 6,
    'rura ibitabo': 7,
    # English commands (8)
    'read book': 8,
    'next page': 9,
    'previous page': 10,
    'go back': 11,
    'read aloud': 12,
    'change language': 13,
    'continue reading': 14,
    'search books': 15
}

# Reverse mapping
IDX_TO_COMMAND = {v: k for k, v in COMMANDS.items()}
NUM_CLASSES = len(COMMANDS)

def generate_mfcc_features(command, sample_id, time_steps=50, mfcc_dim=13):
    """
    Generate realistic MFCC-like features for a given command.
    
    Each command gets a unique spectral pattern that the LSTM will learn.
    """
    # Create a unique seed from command and sample_id
    seed = int(hashlib.md5(f"{command}_{sample_id}".encode()).hexdigest()[:8], 16)
    np.random.seed(seed)
    
    # Base random features
    features = np.random.randn(time_steps, mfcc_dim) * 0.3
    
    # Add command-specific pattern (unique for each command)
    command_hash = hash(command) % 1000
    for t in range(time_steps):
        # Frequency pattern varies over time
        freq = 100 + (t * 5) + (command_hash % 50)
        
        # Add sinusoidal patterns unique to each command
        for f in range(min(mfcc_dim, 8)):
            features[t, f] += np.sin(2 * np.pi * freq * (f+1) * t / 8000) * 0.5
            features[t, f] += np.cos(2 * np.pi * (freq/2) * t / time_steps) * 0.3
    
    # Add temporal smoothness (speech is not random)
    for t in range(1, time_steps):
        features[t] = features[t] * 0.6 + features[t-1] * 0.4
    
    # Add random noise (simulating real recordings)
    features += np.random.randn(time_steps, mfcc_dim) * 0.1
    
    # Add speaker variation
    speaker_variation = np.random.randn(mfcc_dim) * 0.05
    features += speaker_variation
    
    return features

# ============================================
# GENERATE DATASET
# ============================================

samples_per_command = 500  # 500 samples per command
total_samples = len(COMMANDS) * samples_per_command

print(f"\n📊 Dataset configuration:")
print(f"   Commands: {len(COMMANDS)}")
print(f"   Samples per command: {samples_per_command}")
print(f"   Total samples: {total_samples}")
print(f"   Time steps: 50")
print(f"   MFCC features: 13")

# Generate features and labels
print("\n🔊 Generating MFCC features...")
X = []  # Features
y = []  # Labels (indices)

for command, label in tqdm(COMMANDS.items(), desc="Commands"):
    for i in range(samples_per_command):
        features = generate_mfcc_features(command, i)
        X.append(features)
        y.append(label)

X = np.array(X)
y = np.array(y)

print(f"\n📊 Dataset shapes:")
print(f"   X (features): {X.shape}")
print(f"   y (labels): {y.shape}")

# ============================================
# SAVE DATASET
# ============================================

os.makedirs("data/processed", exist_ok=True)

np.save("data/processed/X_train.npy", X)
np.save("data/processed/y_train.npy", y)

# Save command mappings
with open("data/processed/command_mapping.pkl", "wb") as f:
    pickle.dump({"command_to_idx": COMMANDS, "idx_to_command": IDX_TO_COMMAND}, f)

print(f"\n✅ Dataset saved to: data/processed/")
print(f"   - X_train.npy: {X.shape}")
print(f"   - y_train.npy: {y.shape}")
print(f"   - command_mapping.pkl")

# Show sample distribution
print("\n📊 Command distribution:")
for cmd, idx in list(COMMANDS.items())[:5]:
    count = np.sum(y == idx)
    print(f"   {cmd}: {count} samples")
print("   ...")