# retrain_model.py
import os
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import pickle
import sys

# Ensure current directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from train_meaningful import LSTMModel
except ImportError:
    class LSTMModel(nn.Module):
        def __init__(self, input_dim=13, hidden_dim=128, num_classes=30):
            super().__init__()
            self.lstm = nn.LSTM(input_dim, hidden_dim, num_layers=2, batch_first=True, bidirectional=True, dropout=0.2)
            self.fc = nn.Linear(hidden_dim * 2, num_classes)
        
        def forward(self, x):
            x, _ = self.lstm(x)
            x = self.fc(x)
            return x

def retrain():
    print("=" * 60)
    print("🔄 RETRAINING LSTM MODEL WITH NEW DATA")
    print("=" * 60)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    # Load existing vocabulary
    vocab_path = "data/processed/char_to_idx_meaningful.pkl"
    if not os.path.exists(vocab_path):
        print(f"❌ Error: Vocabulary file not found at {vocab_path}")
        return

    with open(vocab_path, "rb") as f:
        char_to_idx = pickle.load(f)
    
    vocab_size = len(char_to_idx)
    blank_idx = char_to_idx.get('<BLANK>', 0)
    print(f"📝 Vocabulary size: {vocab_size}")

    # Load new data or existing data for fine-tuning
    # For now, we'll look for new_features.npy and new_labels.npy
    # If not found, we'll use the meaningful data
    features_path = "data/processed/new_features.npy"
    labels_path = "data/processed/new_labels.npy"

    if not os.path.exists(features_path):
        print("ℹ️ New data not found, using existing meaningful data for fine-tuning demo...")
        features_path = "data/processed/features_meaningful.npy"
        labels_path = "data/processed/labels_meaningful.npy"

    if not os.path.exists(features_path):
        print(f"❌ Error: Data files not found.")
        return

    X = np.load(features_path)
    y = np.load(labels_path)
    print(f"📊 Loaded data: X={X.shape}, y={y.shape}")

    # Load existing model
    model_path = "models/stt/meaningful_model.pt"
    model = LSTMModel(num_classes=vocab_size).to(device)
    
    if os.path.exists(model_path):
        print(f"📂 Loading existing model from {model_path}")
        model.load_state_dict(torch.load(model_path, map_location=device))
    else:
        print("⚠️ No existing model found. Training from scratch.")

    # Dataset and DataLoader
    dataset = TensorDataset(torch.FloatTensor(X), torch.LongTensor(y))
    dataloader = DataLoader(dataset, batch_size=32, shuffle=True)

    # Optimizer and Loss
    # Use a smaller learning rate for retraining/fine-tuning
    optimizer = optim.Adam(model.parameters(), lr=0.0001)
    criterion = nn.CTCLoss(blank=blank_idx, zero_infinity=True)

    # Retraining loop (fewer epochs)
    epochs = 10
    print(f"\n🚀 Starting retraining for {epochs} epochs...")
    
    model.train()
    for epoch in range(epochs):
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
        
        print(f"   Epoch {epoch+1}/{epochs}, Loss: {total_loss/len(dataloader):.4f}")

    # Save the updated model
    save_path = "models/stt/retrained_model.pt"
    os.makedirs("models/stt", exist_ok=True)
    torch.save(model.state_dict(), save_path)
    print(f"\n✅ Retrained model saved to {save_path}")
    print("🎉 Done!")

if __name__ == "__main__":
    retrain()
