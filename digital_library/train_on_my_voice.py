import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import numpy as np
import pickle

# Configuration
HIDDEN_DIM = 256
NUM_LAYERS = 3
DROPOUT = 0.3
LEARNING_RATE = 0.001
EPOCHS = 50

# Reuse model architecture
class LSTM_STT(nn.Module):
    def __init__(self, input_dim=13, hidden_dim=256, num_layers=3, num_classes=16, dropout=0.3):
        super(LSTM_STT, self).__init__()
        self.lstm = nn.LSTM(
            input_size=input_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            bidirectional=True,
            dropout=dropout if num_layers > 1 else 0
        )
        self.global_avg_pool = nn.AdaptiveAvgPool1d(1)
        self.fc1 = nn.Linear(hidden_dim * 2, 128)
        self.fc2 = nn.Linear(128, num_classes)
        self.dropout = nn.Dropout(dropout)
        self.relu = nn.ReLU()
    
    def forward(self, x):
        lstm_out, _ = self.lstm(x)
        lstm_out = lstm_out.transpose(1, 2)
        pooled = self.global_avg_pool(lstm_out)
        pooled = pooled.squeeze(-1)
        x = self.dropout(pooled)
        x = self.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.fc2(x)
        return x

def main():
    print("=" * 60)
    print("🧠 TRAINING LSTM ON YOUR VOICE")
    print("=" * 60)
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    
    # Load data
    try:
        X = np.load("data/processed/X_my_voice.npy")
        y = np.load("data/processed/y_my_voice.npy")
    except FileNotFoundError:
        print("❌ Error: No voice data found. Run 'python collect_voice_data.py' first.")
        return
        
    with open("data/processed/command_mapping.pkl", "rb") as f:
        mapping = pickle.load(f)
        idx_to_command = mapping["idx_to_command"]
        
    num_classes = len(idx_to_command)
    print(f"📊 Training with {len(X)} samples across {num_classes} commands.")
    
    # Prepare DataLoader
    X_tensor = torch.FloatTensor(X)
    y_tensor = torch.LongTensor(y)
    dataset = TensorDataset(X_tensor, y_tensor)
    dataloader = DataLoader(dataset, batch_size=8, shuffle=True)
    
    # Initialize Model
    model = LSTM_STT(num_classes=num_classes).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)
    
    # Training Loop
    print("\n🚀 Starting training...")
    model.train()
    for epoch in range(EPOCHS):
        total_loss = 0
        for features, labels in dataloader:
            features = features.to(device)
            labels = labels.to(device)
            
            outputs = model(features)
            loss = criterion(outputs, labels)
            
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            
            total_loss += loss.item()
            
        if (epoch + 1) % 10 == 0:
            print(f"   Epoch {epoch+1}/{EPOCHS}, Loss: {total_loss/len(dataloader):.4f}")
            
    # Save model
    os.makedirs("models/stt", exist_ok=True)
    torch.save(model.state_dict(), "models/stt/best_stt_model.pt")
    print(f"\n✅ SUCCESS! Trained model saved to models/stt/best_stt_model.pt")
    print("🎉 Now your voice will be recognized in the application!")

if __name__ == "__main__":
    main()
