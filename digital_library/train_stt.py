# train_stt.py
import os
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
import pickle

print("=" * 60)
print("🧠 LSTM SPEECH-TO-TEXT TRAINING")
print("=" * 60)

# Check device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# ============================================
# DATASET CLASS
# ============================================

class SpeechDataset(Dataset):
    def __init__(self, features_path, labels_path):
        self.features = np.load(features_path)
        self.labels = np.load(labels_path)
        
    def __len__(self):
        return len(self.features)
    
    def __getitem__(self, idx):
        features = torch.FloatTensor(self.features[idx])
        labels = torch.LongTensor(self.labels[idx])
        
        # Calculate actual lengths
        input_length = torch.sum(features.sum(dim=1) != 0).item()
        label_length = torch.sum(labels != 0).item()
        
        return features, labels, input_length, label_length

# ============================================
# LSTM MODEL
# ============================================

class LSTM_STT(nn.Module):
    def __init__(self, input_dim=13, hidden_dim=128, num_classes=30, dropout=0.2):
        super(LSTM_STT, self).__init__()
        
        # Bidirectional LSTM layers
        self.lstm1 = nn.LSTM(
            input_size=input_dim,
            hidden_size=hidden_dim,
            num_layers=1,
            batch_first=True,
            bidirectional=True,
            dropout=0
        )
        
        self.lstm2 = nn.LSTM(
            input_size=hidden_dim * 2,
            hidden_size=hidden_dim,
            num_layers=1,
            batch_first=True,
            bidirectional=True,
            dropout=0
        )
        
        self.dropout = nn.Dropout(dropout)
        self.fc = nn.Linear(hidden_dim * 2, num_classes)
    
    def forward(self, x):
        x, _ = self.lstm1(x)
        x = self.dropout(x)
        x, _ = self.lstm2(x)
        x = self.dropout(x)
        x = self.fc(x)
        return x

# ============================================
# CTC LOSS
# ============================================

class CTCLoss(nn.Module):
    def __init__(self, blank_idx):
        super(CTCLoss, self).__init__()
        self.blank_idx = blank_idx
        self.ctc_loss = nn.CTCLoss(blank=blank_idx, zero_infinity=True)
    
    def forward(self, outputs, targets, input_lengths, target_lengths):
        log_probs = nn.functional.log_softmax(outputs, dim=2)
        return self.ctc_loss(log_probs, targets, input_lengths, target_lengths)

# ============================================
# MAIN TRAINING
# ============================================

# Load vocabulary
print("\n📁 Loading vocabulary...")
with open("data/processed/char_to_idx.pkl", "rb") as f:
    char_to_idx = pickle.load(f)

vocab_size = len(char_to_idx)
blank_idx = char_to_idx.get('<BLANK>', 0)

print(f"   Vocabulary size: {vocab_size}")
print(f"   Blank token index: {blank_idx}")

# Load dataset
print("\n📁 Loading dataset...")
dataset = SpeechDataset("data/processed/features.npy", "data/processed/labels.npy")
dataloader = DataLoader(dataset, batch_size=32, shuffle=True)

print(f"   Total samples: {len(dataset)}")

# Create model
print("\n🏗️ Building LSTM model...")
model = LSTM_STT(
    input_dim=13,
    hidden_dim=128,
    num_classes=vocab_size,
    dropout=0.2
).to(device)

total_params = sum(p.numel() for p in model.parameters())
print(f"   Total parameters: {total_params:,}")

# Loss and optimizer
criterion = CTCLoss(blank_idx=blank_idx)
optimizer = optim.Adam(model.parameters(), lr=0.001)

# Training
num_epochs = 20
print(f"\n🚀 Training for {num_epochs} epochs...")

for epoch in range(num_epochs):
    model.train()
    total_loss = 0
    
    for batch_idx, (features, labels, input_lengths, label_lengths) in enumerate(dataloader):
        features = features.to(device)
        labels = labels.to(device)
        
        # Forward pass
        outputs = model(features)
        outputs = outputs.permute(1, 0, 2)  # (time, batch, classes)
        
        # Calculate loss
        loss = criterion(outputs, labels, input_lengths, label_lengths)
        
        # Backward pass
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        
        total_loss += loss.item()
        
        if batch_idx % 10 == 0:
            print(f"  Epoch {epoch+1}, Batch {batch_idx}, Loss: {loss.item():.4f}")
    
    avg_loss = total_loss / len(dataloader)
    print(f"📊 Epoch {epoch+1}/{num_epochs} completed. Average Loss: {avg_loss:.4f}")

# Save model
os.makedirs("models/stt", exist_ok=True)
torch.save(model.state_dict(), "models/stt/lstm_stt_final.pt")
torch.save(model, "models/stt/lstm_stt_complete.pt")
print(f"\n✅ Model saved to: models/stt/lstm_stt_final.pt")
print(f"✅ Complete model saved to: models/stt/lstm_stt_complete.pt")

print(f"\n🎉 Training complete!")