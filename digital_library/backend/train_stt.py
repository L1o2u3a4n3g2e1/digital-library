"""
LSTM Speech-to-Text Training from Scratch
Kinyarwanda + English
No pretrained models, no APIs
"""

import numpy as np
import pandas as pd
import pickle
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
from sklearn.model_selection import train_test_split

print("=" * 70)
print("🧠 LSTM SPEECH-TO-TEXT TRAINING (FROM SCRATCH)")
print("=" * 70)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"💻 Device: {device}")

# Load vocabulary
with open("data/processed/vocab.pkl", "rb") as f:
    vocab_data = pickle.load(f)
    char_to_idx = vocab_data["char_to_idx"]
    idx_to_char = vocab_data["idx_to_char"]
    vocab_size = vocab_data["vocab_size"]

print(f"📝 Vocabulary size: {vocab_size}")

# Load training data
df = pd.read_csv("data/processed/stt_training_data.csv")
texts = df["text"].tolist()
print(f"📊 Training samples: {len(texts)}")

# ============================================
# DATASET CLASS
# ============================================

class STTDataset(Dataset):
    def __init__(self, texts, char_to_idx, max_len=100):
        self.texts = texts
        self.char_to_idx = char_to_idx
        self.max_len = max_len
        
    def __len__(self):
        return len(self.texts)
    
    def __getitem__(self, idx):
        text = self.texts[idx]
        # Convert text to indices
        indices = [self.char_to_idx.get(c, self.char_to_idx['<UNK>']) for c in text]
        
        # Pad or truncate
        if len(indices) > self.max_len:
            indices = indices[:self.max_len]
        else:
            indices += [self.char_to_idx['<PAD>']] * (self.max_len - len(indices))
        
        return torch.LongTensor(indices)

# Create dataset
dataset = STTDataset(texts, char_to_idx)
dataloader = DataLoader(dataset, batch_size=32, shuffle=True)

# ============================================
# LSTM MODEL
# ============================================

class LSTMAutoencoder(nn.Module):
    def __init__(self, vocab_size, embedding_dim=128, hidden_dim=256, num_layers=2):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embedding_dim)
        self.encoder = nn.LSTM(embedding_dim, hidden_dim, num_layers, batch_first=True, bidirectional=True)
        self.decoder = nn.LSTM(hidden_dim * 2, hidden_dim, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_dim, vocab_size)
        
    def forward(self, x):
        embedded = self.embedding(x)
        encoder_out, (hidden, cell) = self.encoder(embedded)
        decoder_out, _ = self.decoder(encoder_out)
        output = self.fc(decoder_out)
        return output

model = LSTMAutoencoder(vocab_size).to(device)
print(f"🏗️ Model parameters: {sum(p.numel() for p in model.parameters()):,}")

# Loss and optimizer
criterion = nn.CrossEntropyLoss(ignore_index=char_to_idx['<PAD>'])
optimizer = optim.Adam(model.parameters(), lr=0.001)

# ============================================
# TRAINING LOOP
# ============================================

num_epochs = 50
print(f"\n🚀 Training for {num_epochs} epochs...\n")

for epoch in range(num_epochs):
    model.train()
    total_loss = 0
    
    for batch in dataloader:
        batch = batch.to(device)
        
        # Forward pass
        output = model(batch)
        loss = criterion(output.view(-1, vocab_size), batch.view(-1))
        
        # Backward pass
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        
        total_loss += loss.item()
    
    if (epoch + 1) % 10 == 0:
        avg_loss = total_loss / len(dataloader)
        print(f"Epoch {epoch+1:3d}/{num_epochs} | Loss: {avg_loss:.4f}")

# Save model
torch.save(model.state_dict(), "models/stt/lstm_stt.pt")
print("\n✅ Model saved to: models/stt/lstm_stt.pt")

print("\n🎉 Training complete!")