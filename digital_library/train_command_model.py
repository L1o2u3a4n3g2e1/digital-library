# train_command_model.py
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import pickle
import os

print("=" * 60)
print("🧠 TRAINING COMMAND RECOGNITION LSTM")
print("=" * 60)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Load data
X = np.load("data/processed/X_commands.npy")
y = np.load("data/processed/y_commands.npy")

with open("data/processed/char_to_idx_commands.pkl", "rb") as f:
    char_to_idx = pickle.load(f)

vocab_size = len(char_to_idx)
blank_idx = char_to_idx.get('<BLANK>', 1)

print(f"\n📊 Data loaded:")
print(f"   X shape: {X.shape}")
print(f"   y shape: {y.shape}")
print(f"   Vocabulary size: {vocab_size}")

# Convert to tensors
X_tensor = torch.FloatTensor(X)
y_tensor = torch.LongTensor(y)

dataset = TensorDataset(X_tensor, y_tensor)
dataloader = DataLoader(dataset, batch_size=128, shuffle=True)

# Define LSTM model
class CommandLSTM(nn.Module):
    def __init__(self, input_dim=13, hidden_dim=256, num_layers=2, num_classes=vocab_size):
        super(CommandLSTM, self).__init__()
        self.lstm = nn.LSTM(input_dim, hidden_dim, num_layers, batch_first=True, bidirectional=True, dropout=0.2)
        self.fc = nn.Linear(hidden_dim * 2, num_classes)
        self.dropout = nn.Dropout(0.3)
    
    def forward(self, x):
        x, _ = self.lstm(x)
        x = self.dropout(x)
        x = self.fc(x)
        return x

model = CommandLSTM().to(device)
print(f"\n🏗️ Model parameters: {sum(p.numel() for p in model.parameters()):,}")

# Loss and optimizer
criterion = nn.CTCLoss(blank=blank_idx, zero_infinity=True)
optimizer = optim.Adam(model.parameters(), lr=0.001)

# Training
num_epochs = 50
print(f"\n🚀 Training for {num_epochs} epochs...")

for epoch in range(num_epochs):
    model.train()
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
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()
        
        total_loss += loss.item()
    
    if (epoch + 1) % 10 == 0:
        avg_loss = total_loss / len(dataloader)
        print(f"Epoch {epoch+1:3d}/{num_epochs} | Loss: {avg_loss:.4f}")

# Save model
os.makedirs("models/stt", exist_ok=True)
torch.save(model.state_dict(), "models/stt/command_model.pt")
torch.save(model, "models/stt/command_complete.pt")

print(f"\n✅ Model saved to: models/stt/command_model.pt")
print(f"\n🎉 Training complete!")