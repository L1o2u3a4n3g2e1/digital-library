# train_meaningful.py
import os
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import pickle
import random

print("=" * 60)
print("🧠 TRAINING LSTM WITH MEANINGFUL PATTERNS")
print("=" * 60)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Define commands and their numeric patterns
# Each command gets a unique pattern that the LSTM will learn
command_patterns = {
    # Kinyarwanda commands
    "soma igitabo": [0.8, -0.2, 0.3, -0.1, 0.2, 0.1, -0.3, 0.4, -0.2, 0.1],
    "ikurikira": [0.2, 0.7, -0.3, 0.1, -0.2, 0.3, 0.1, -0.1, 0.2, -0.3],
    "isubire inyuma": [-0.1, 0.3, 0.8, -0.2, 0.1, -0.3, 0.2, 0.1, -0.2, 0.3],
    "subira inyuma": [-0.2, -0.1, 0.4, 0.7, -0.3, 0.1, -0.2, 0.3, 0.1, -0.1],
    "ngaho": [0.3, -0.3, -0.1, 0.2, 0.6, -0.2, 0.1, -0.1, 0.2, -0.2],
    "hindura ururimi": [0.1, 0.2, -0.2, 0.3, -0.1, 0.7, -0.3, 0.1, -0.2, 0.2],
    "komeza gusoma": [0.4, 0.1, -0.2, -0.3, 0.2, 0.1, 0.8, -0.2, 0.1, -0.3],
    "rura ibitabo": [-0.3, -0.4, 0.2, 0.1, 0.3, -0.1, 0.2, 0.6, -0.2, 0.1],
    # English commands
    "read book": [0.9, -0.1, 0.2, -0.2, 0.3, 0.1, -0.1, 0.2, -0.2, 0.1],
    "next page": [0.2, 0.8, -0.2, 0.1, -0.1, 0.2, 0.1, -0.2, 0.1, -0.1],
    "previous page": [-0.1, 0.3, 0.9, -0.1, 0.1, -0.2, 0.1, 0.1, -0.2, 0.1],
    "go back": [-0.2, -0.1, 0.2, 0.8, -0.2, 0.1, -0.1, 0.2, 0.1, -0.2],
    "read aloud": [0.3, -0.2, 0.1, -0.1, 0.7, -0.1, 0.2, -0.1, 0.1, -0.1],
    "change language": [0.1, 0.2, -0.1, 0.2, -0.1, 0.6, -0.2, 0.1, -0.1, 0.2],
    "continue reading": [0.4, -0.3, 0.2, 0.1, -0.2, 0.1, 0.7, -0.1, 0.1, -0.2],
    "search books": [-0.2, 0.1, -0.1, 0.2, 0.1, -0.2, 0.1, 0.7, -0.1, 0.1]
}

def generate_pattern_features(command, time_steps=50, mfcc_features=13):
    """Generate MFCC-like features with command-specific pattern"""
    pattern = command_patterns.get(command, [0.0] * 10)
    
    # Create features with the pattern embedded
    features = np.random.randn(time_steps, mfcc_features) * 0.2
    
    # Embed pattern across time steps
    for t in range(min(time_steps, 30)):
        for i in range(min(mfcc_features, len(pattern))):
            features[t, i] += pattern[i] * (0.8 - t * 0.01)
    
    return features

def create_vocabulary(labels):
    """Create character-level vocabulary"""
    chars = set()
    for label in labels:
        for char in label:
            chars.add(char)
    chars.add('<PAD>')
    chars.add('<BLANK>')
    chars.add('<UNK>')
    char_to_idx = {char: idx for idx, char in enumerate(sorted(chars))}
    return char_to_idx, len(chars)

def encode_label(label, char_to_idx, max_len=50):
    indices = [char_to_idx.get(char, char_to_idx['<UNK>']) for char in label]
    if len(indices) > max_len:
        indices = indices[:max_len]
    else:
        indices += [char_to_idx['<PAD>']] * (max_len - len(indices))
    return np.array(indices)

# Create dataset
all_commands = list(command_patterns.keys())
samples_per_command = 300

print(f"\n📁 Creating dataset:")
print(f"   Commands: {len(all_commands)}")
print(f"   Samples per command: {samples_per_command}")
print(f"   Total samples: {len(all_commands) * samples_per_command}")

features_list = []
labels_list = []

for cmd in all_commands:
    for i in range(samples_per_command):
        features = generate_pattern_features(cmd)
        features_list.append(features)
        labels_list.append(cmd)

# Create vocabulary
char_to_idx, vocab_size = create_vocabulary(labels_list)
blank_idx = char_to_idx['<BLANK>']

print(f"📝 Vocabulary size: {vocab_size}")

# Encode labels
X = np.array(features_list)
y = np.array([encode_label(label, char_to_idx) for label in labels_list])

print(f"📊 Shapes: X={X.shape}, y={y.shape}")

# Save data
os.makedirs("data/processed", exist_ok=True)
np.save("data/processed/features_meaningful.npy", X)
np.save("data/processed/labels_meaningful.npy", y)
with open("data/processed/char_to_idx_meaningful.pkl", "wb") as f:
    pickle.dump(char_to_idx, f)

# Define model
class LSTMModel(nn.Module):
    def __init__(self, input_dim=13, hidden_dim=128, num_classes=vocab_size):
        super().__init__()
        self.lstm = nn.LSTM(input_dim, hidden_dim, num_layers=2, batch_first=True, bidirectional=True, dropout=0.2)
        self.fc = nn.Linear(hidden_dim * 2, num_classes)
    
    def forward(self, x):
        x, _ = self.lstm(x)
        x = self.fc(x)
        return x

# Train
print("\n🚀 Training...")

dataset = TensorDataset(torch.FloatTensor(X), torch.LongTensor(y))
dataloader = DataLoader(dataset, batch_size=64, shuffle=True)

model = LSTMModel().to(device)
criterion = nn.CTCLoss(blank=blank_idx, zero_infinity=True)
optimizer = optim.Adam(model.parameters(), lr=0.001)

for epoch in range(30):
    total_loss = 0
    for features, labels in dataloader:
        features = features.to(device)
        labels = labels.to(device)
        
        outputs = model(features)
        outputs = outputs.permute(1, 0, 2)
        
        input_lengths = torch.full((features.size(0),), features.size(1), dtype=torch.long)
        target_lengths = (labels != 0).sum(dim=1)
        
        loss = criterion(outputs, labels, input_lengths, target_lengths)
        
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        
        total_loss += loss.item()
    
    if (epoch + 1) % 5 == 0:
        print(f"Epoch {epoch+1}/30, Loss: {total_loss/len(dataloader):.4f}")

# Save model
os.makedirs("models/stt", exist_ok=True)
torch.save(model.state_dict(), "models/stt/meaningful_model.pt")
torch.save(model, "models/stt/meaningful_complete.pt")
print(f"\n✅ Model saved!")