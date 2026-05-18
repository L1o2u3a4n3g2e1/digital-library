"""
LSTM Speech-to-Text Model Training from Scratch
Classifies audio MFCC features into text commands
"""

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import pickle
import os
import matplotlib.pyplot as plt

print("=" * 70)
print("🧠 LSTM SPEECH-TO-TEXT TRAINING")
print("=" * 70)

# Check device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"💻 Device: {device}")

# ============================================
# LOAD DATA
# ============================================

print("\n📁 Loading training data...")

X = np.load("data/processed/X_train.npy")
y = np.load("data/processed/y_train.npy")

with open("data/processed/command_mapping.pkl", "rb") as f:
    mapping = pickle.load(f)
    command_to_idx = mapping["command_to_idx"]
    idx_to_command = mapping["idx_to_command"]

num_classes = len(command_to_idx)
print(f"   X shape: {X.shape}")
print(f"   y shape: {y.shape}")
print(f"   Number of classes: {num_classes}")

# ============================================
# PREPARE DATA FOR PYTORCH
# ============================================

# Convert to tensors
X_tensor = torch.FloatTensor(X)
y_tensor = torch.LongTensor(y)

# Create dataset and dataloader
dataset = TensorDataset(X_tensor, y_tensor)
dataloader = DataLoader(dataset, batch_size=64, shuffle=True)

# Split into train/validation
from sklearn.model_selection import train_test_split

X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)

X_train_tensor = torch.FloatTensor(X_train)
y_train_tensor = torch.LongTensor(y_train)
X_val_tensor = torch.FloatTensor(X_val)
y_val_tensor = torch.LongTensor(y_val)

train_dataset = TensorDataset(X_train_tensor, y_train_tensor)
val_dataset = TensorDataset(X_val_tensor, y_val_tensor)

train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=64, shuffle=False)

print(f"\n📊 Split:")
print(f"   Train: {len(train_dataset)} samples")
print(f"   Validation: {len(val_dataset)} samples")

# ============================================
# BUILD LSTM MODEL
# ============================================

class LSTM_STT(nn.Module):
    """
    LSTM model for Speech-to-Text
    Input: MFCC features (time_steps, features)
    Output: Command class probabilities
    """
    
    def __init__(self, input_dim=13, hidden_dim=256, num_layers=3, num_classes=16, dropout=0.3):
        super(LSTM_STT, self).__init__()
        
        # Bidirectional LSTM layers
        self.lstm = nn.LSTM(
            input_size=input_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            bidirectional=True,
            dropout=dropout if num_layers > 1 else 0
        )
        
        # Global average pooling
        self.global_avg_pool = nn.AdaptiveAvgPool1d(1)
        
        # Fully connected layers
        self.fc1 = nn.Linear(hidden_dim * 2, 128)
        self.fc2 = nn.Linear(128, num_classes)
        self.dropout = nn.Dropout(dropout)
        self.relu = nn.ReLU()
    
    def forward(self, x):
        # x shape: (batch, time_steps, input_dim)
        lstm_out, _ = self.lstm(x)  # (batch, time_steps, hidden_dim*2)
        
        # Global average pooling over time dimension
        lstm_out = lstm_out.transpose(1, 2)  # (batch, hidden_dim*2, time_steps)
        pooled = self.global_avg_pool(lstm_out)  # (batch, hidden_dim*2, 1)
        pooled = pooled.squeeze(-1)  # (batch, hidden_dim*2)
        
        # Fully connected layers
        x = self.dropout(pooled)
        x = self.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.fc2(x)
        
        return x

# Create model
model = LSTM_STT(
    input_dim=13,
    hidden_dim=256,
    num_layers=3,
    num_classes=num_classes,
    dropout=0.3
).to(device)

print(f"\n🏗️ Model architecture:")
print(f"   Total parameters: {sum(p.numel() for p in model.parameters()):,}")
print(f"   LSTM hidden size: 256 (bidirectional -> 512)")
print(f"   LSTM layers: 3")
print(f"   Output classes: {num_classes}")

# ============================================
# TRAINING SETUP
# ============================================

criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)
scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, patience=5, factor=0.5)

# ============================================
# TRAINING LOOP
# ============================================

num_epochs = 100
train_losses = []
val_losses = []
train_accuracies = []
val_accuracies = []

print(f"\n🚀 Training for {num_epochs} epochs...\n")

best_val_acc = 0

for epoch in range(num_epochs):
    # Training
    model.train()
    train_loss = 0
    train_correct = 0
    train_total = 0
    
    for features, labels in train_loader:
        features = features.to(device)
        labels = labels.to(device)
        
        # Forward pass
        outputs = model(features)
        loss = criterion(outputs, labels)
        
        # Backward pass
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        
        train_loss += loss.item()
        _, predicted = torch.max(outputs, 1)
        train_total += labels.size(0)
        train_correct += (predicted == labels).sum().item()
    
    avg_train_loss = train_loss / len(train_loader)
    train_acc = 100 * train_correct / train_total
    train_losses.append(avg_train_loss)
    train_accuracies.append(train_acc)
    
    # Validation
    model.eval()
    val_loss = 0
    val_correct = 0
    val_total = 0
    
    with torch.no_grad():
        for features, labels in val_loader:
            features = features.to(device)
            labels = labels.to(device)
            
            outputs = model(features)
            loss = criterion(outputs, labels)
            
            val_loss += loss.item()
            _, predicted = torch.max(outputs, 1)
            val_total += labels.size(0)
            val_correct += (predicted == labels).sum().item()
    
    avg_val_loss = val_loss / len(val_loader)
    val_acc = 100 * val_correct / val_total
    val_losses.append(avg_val_loss)
    val_accuracies.append(val_acc)
    
    scheduler.step(avg_val_loss)
    
    # Save best model
    if val_acc > best_val_acc:
        best_val_acc = val_acc
        torch.save(model.state_dict(), "models/stt/best_stt_model.pt")
    
    # Print progress
    if (epoch + 1) % 10 == 0:
        print(f"Epoch {epoch+1:3d}/{num_epochs} | "
              f"Train Loss: {avg_train_loss:.4f} | Train Acc: {train_acc:.2f}% | "
              f"Val Loss: {avg_val_loss:.4f} | Val Acc: {val_acc:.2f}%")

# ============================================
# SAVE FINAL MODEL
# ============================================

os.makedirs("models/stt", exist_ok=True)
torch.save(model.state_dict(), "models/stt/stt_model_final.pt")
torch.save(model, "models/stt/stt_model_complete.pt")

print(f"\n✅ Model saved to: models/stt/")
print(f"   Best validation accuracy: {best_val_acc:.2f}%")

# ============================================
# PLOT TRAINING HISTORY
# ============================================

plt.figure(figsize=(12, 4))

plt.subplot(1, 2, 1)
plt.plot(train_losses, label='Train Loss')
plt.plot(val_losses, label='Validation Loss')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.legend()
plt.title('Training and Validation Loss')

plt.subplot(1, 2, 2)
plt.plot(train_accuracies, label='Train Accuracy')
plt.plot(val_accuracies, label='Validation Accuracy')
plt.xlabel('Epoch')
plt.ylabel('Accuracy (%)')
plt.legend()
plt.title('Training and Validation Accuracy')

plt.tight_layout()
plt.savefig("models/stt/training_history.png")
print("📊 Training history saved to: models/stt/training_history.png")

print("\n🎉 Training complete!")