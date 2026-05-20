# train_lstm.py
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import pickle
import os

print("=" * 60)
print("🧠 TRAINING LSTM MODEL ON REAL KINYARWANDA DATA")
print("=" * 60)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Load data
print("\n📁 Loading training data...")
X = np.load("data/processed/X_train.npy")
y = np.load("data/processed/y_train.npy")

with open("data/processed/char_to_idx.pkl", "rb") as f:
    char_to_idx = pickle.load(f)

vocab_size = len(char_to_idx)
blank_idx = char_to_idx.get('<BLANK>', 0)

print(f"   X shape: {X.shape}")
print(f"   y shape: {y.shape}")
print(f"   Vocabulary size: {vocab_size}")

# Convert to PyTorch tensors
X_tensor = torch.FloatTensor(X)
y_tensor = torch.LongTensor(y)

dataset = TensorDataset(X_tensor, y_tensor)
dataloader = DataLoader(dataset, batch_size=64, shuffle=True)

# Define LSTM Model
class LSTM_STT(nn.Module):
    def __init__(self, input_dim=13, hidden_dim=256, num_layers=3, num_classes=vocab_size, dropout=0.3):
        super(LSTM_STT, self).__init__()
        
        self.lstm = nn.LSTM(
            input_size=input_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            bidirectional=True,
            dropout=dropout if num_layers > 1 else 0
        )
        
        self.fc = nn.Linear(hidden_dim * 2, num_classes)
        self.dropout = nn.Dropout(dropout)
    
    def forward(self, x):
        x, _ = self.lstm(x)
        x = self.dropout(x)
        x = self.fc(x)
        return x

# Create model
model = LSTM_STT().to(device)
print(f"\n🏗️ Model created with {sum(p.numel() for p in model.parameters()):,} parameters")

# Loss and optimizer
criterion = nn.CTCLoss(blank=blank_idx, zero_infinity=True)
optimizer = optim.Adam(model.parameters(), lr=0.001)
scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, patience=3, factor=0.5)

# Training
num_epochs = 50
print(f"\n🚀 Training for {num_epochs} epochs...\n")

for epoch in range(num_epochs):
    model.train()
    total_loss = 0
    
    for batch_idx, (features, labels) in enumerate(dataloader):
        features = features.to(device)
        labels = labels.to(device)
        
        # Forward pass
        outputs = model(features)
        outputs = outputs.permute(1, 0, 2)  # (time, batch, features)
        
        # Calculate CTC loss
        input_lengths = torch.full((features.size(0),), features.size(1), dtype=torch.long)
        target_lengths = (labels != 0).sum(dim=1)
        
        loss = criterion(outputs, labels, input_lengths, target_lengths)
        
        # Backward pass
        optimizer.zero_grad()
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()
        
        total_loss += loss.item()
    
    avg_loss = total_loss / len(dataloader)
    scheduler.step(avg_loss)
    
    if (epoch + 1) % 5 == 0:
        print(f"Epoch {epoch+1:2d}/{num_epochs} | Loss: {avg_loss:.4f} | LR: {optimizer.param_groups[0]['lr']:.6f}")

# Save model
os.makedirs("models/stt", exist_ok=True)
torch.save(model.state_dict(), "models/stt/lstm_model.pt")
torch.save(model, "models/stt/lstm_model_complete.pt")

print(f"\n✅ Model saved to: models/stt/lstm_model.pt")
print(f"\n🎉 Training complete!")