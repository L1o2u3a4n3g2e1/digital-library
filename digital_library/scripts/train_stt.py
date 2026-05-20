"""
Train LSTM model for Speech-to-Text - FIXED VERSION
"""

import os
import pickle
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, LSTM, Dense, Dropout, Bidirectional, TimeDistributed, Reshape
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
from sklearn.model_selection import train_test_split

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

print("=" * 60)
print("🧠 LSTM MODEL TRAINING - FIXED")
print("=" * 60)

print("\n📁 Loading preprocessed data...")

with open("../data/processed/features.pkl", "rb") as f:
    X = pickle.load(f)

with open("../data/processed/labels.pkl", "rb") as f:
    y = pickle.load(f)

with open("../data/processed/char_to_idx.pkl", "rb") as f:
    char_to_idx = pickle.load(f)

print(f"\n📊 Data loaded:")
print(f"   X shape: {X.shape}")
print(f"   y shape: {y.shape}")
print(f"   Vocabulary size: {len(char_to_idx)}")

# Verify shapes match
time_steps = X.shape[1]
label_length = y.shape[1]

print(f"\n📊 Shape verification:")
print(f"   Time steps (MFCC): {time_steps}")
print(f"   Label length: {label_length}")
print(f"   ✅ Shapes match!" if time_steps == label_length else "❌ Shape mismatch!")

# Split data
X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)
print(f"\n📊 Train/Validation split:")
print(f"   Train: {X_train.shape[0]} samples")
print(f"   Validation: {X_val.shape[0]} samples")

# Build LSTM model
print("\n🏗️ Building LSTM model...")

input_layer = Input(shape=(X.shape[1], X.shape[2]), name="audio_input")

# LSTM Layer 1
lstm1 = Bidirectional(LSTM(128, return_sequences=True, dropout=0.2), name="bilstm_1")(input_layer)

# LSTM Layer 2
lstm2 = Bidirectional(LSTM(128, return_sequences=True, dropout=0.2), name="bilstm_2")(lstm1)

# Flatten the sequence dimension
# Reshape from (batch, time_steps, features) to (batch, time_steps * features)
# Then use Dense layer to output character for each time step
output_layer = TimeDistributed(Dense(len(char_to_idx), activation='softmax'), name="output")(lstm2)

# Create model
model = Model(inputs=input_layer, outputs=output_layer)

# Compile
model.compile(
    optimizer=Adam(learning_rate=0.001),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

print("\n📋 Model Architecture:")
model.summary()

# Callbacks
callbacks = [
    EarlyStopping(patience=5, restore_best_weights=True, verbose=1),
    ModelCheckpoint("../models/stt/lstm_stt_best.keras", monitor='val_loss', save_best_only=True, verbose=1)
]

# Train
print("\n🚀 Training LSTM model...")

history = model.fit(
    X_train, y_train,
    validation_data=(X_val, y_val),
    epochs=50,
    batch_size=32,
    callbacks=callbacks,
    verbose=1
)

# Save final model
model.save("../models/stt/lstm_stt_final.keras")
model.save("../models/stt/lstm_stt_final.h5")
print("\n✅ Model saved!")

# Save training history
with open("../models/stt/history.pkl", "wb") as f:
    pickle.dump(history.history, f)

print(f"\n📊 Training complete!")
print(f"   Final training accuracy: {history.history['accuracy'][-1]:.4f}")
print(f"   Final validation accuracy: {history.history['val_accuracy'][-1]:.4f}")