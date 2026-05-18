"""
Record your voice and test the LSTM STT model
"""

import pyaudio
import wave
import numpy as np
import librosa
import torch
import pickle
import os
import sys

print("=" * 70)
print("🎤 LSTM STT - VOICE COMMAND RECORDER & TESTER")
print("=" * 70)

# Check if pyaudio is installed
try:
    import pyaudio
except ImportError:
    print("❌ PyAudio not installed. Installing...")
    os.system("pip install pyaudio")
    import pyaudio

# Load model
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load command mapping
with open("data/processed/command_mapping.pkl", "rb") as f:
    mapping = pickle.load(f)
    idx_to_command = mapping["idx_to_command"]
    command_to_idx = mapping["command_to_idx"]

print(f"✅ Loaded {len(idx_to_command)} commands")

# Load model architecture
from train_stt_lstm import LSTM_STT

model = LSTM_STT(
    input_dim=13,
    hidden_dim=256,
    num_layers=3,
    num_classes=len(idx_to_command),
    dropout=0.3
)

# Load trained weights
model_path = "models/stt/best_stt_model.pt"
if os.path.exists(model_path):
    model.load_state_dict(torch.load(model_path, map_location=device))
    print(f"✅ Loaded model from {model_path}")
else:
    print(f"❌ Model not found at {model_path}")
    sys.exit(1)

model.eval()
model.to(device)

# ============================================
# RECORDING FUNCTION
# ============================================

def record_audio(filename="test_recording.wav", duration=3, sample_rate=16000):
    """Record audio from microphone"""
    print(f"\n🎙️ Recording for {duration} seconds...")
    print("   👄 Speak clearly into your microphone")
    
    CHUNK = 1024
    FORMAT = pyaudio.paInt16
    CHANNELS = 1
    
    p = pyaudio.PyAudio()
    
    # Find microphone
    print("   🔍 Finding microphone...")
    for i in range(p.get_device_count()):
        dev = p.get_device_info_by_index(i)
        if dev['maxInputChannels'] > 0:
            print(f"   🎤 Using: {dev['name']}")
            break
    
    stream = p.open(
        format=FORMAT,
        channels=CHANNELS,
        rate=sample_rate,
        input=True,
        frames_per_buffer=CHUNK
    )
    
    frames = []
    for i in range(0, int(sample_rate / CHUNK * duration)):
        data = stream.read(CHUNK)
        frames.append(data)
        # Show progress
        if i % 10 == 0:
            print(f"   Recording: {i * CHUNK / sample_rate:.1f}s", end="\r")
    
    stream.stop_stream()
    stream.close()
    p.terminate()
    
    # Save to file
    wf = wave.open(filename, 'wb')
    wf.setnchannels(CHANNELS)
    wf.setsampwidth(p.get_sample_size(FORMAT))
    wf.setframerate(sample_rate)
    wf.writeframes(b''.join(frames))
    wf.close()
    
    print(f"\n   ✅ Saved to {filename}")
    return filename

def extract_features(audio_path, sr=16000, max_len=50):
    """Extract MFCC features from audio"""
    audio, sample_rate = librosa.load(audio_path, sr=sr, duration=3)
    mfcc = librosa.feature.mfcc(
        y=audio,
        sr=sr,
        n_mfcc=13,
        n_fft=400,
        hop_length=160
    )
    
    if mfcc.shape[1] > max_len:
        mfcc = mfcc[:, :max_len]
    else:
        padding = max_len - mfcc.shape[1]
        mfcc = np.pad(mfcc, ((0, 0), (0, padding)), mode='constant')
    
    return torch.FloatTensor(mfcc.T).unsqueeze(0).to(device)

def predict_command(audio_path):
    """Predict command from audio"""
    features = extract_features(audio_path)
    if features is None:
        return "unknown", 0
    
    with torch.no_grad():
        output = model(features)
        probabilities = torch.softmax(output, dim=1)
        confidence, predicted = torch.max(probabilities, 1)
    
    command = idx_to_command[predicted.item()]
    return command, confidence.item()

# ============================================
# MAIN INTERACTIVE LOOP
# ============================================

print("\n" + "=" * 70)
print("📋 COMMANDS YOU CAN TEST")
print("=" * 70)

print("\n🇷🇼 KINYARWANDA COMMANDS:")
kin_commands = ["soma igitabo", "ikurikira", "isubire inyuma", "subira inyuma", 
                "ngaho", "hindura ururimi", "komeza gusoma", "rura ibitabo"]
for cmd in kin_commands:
    print(f"   • {cmd}")

print("\n🇺🇸 ENGLISH COMMANDS:")
en_commands = ["read book", "next page", "previous page", "go back", 
               "read aloud", "change language", "continue reading", "search books"]
for cmd in en_commands:
    print(f"   • {cmd}")

print("\n" + "=" * 70)
print("🎤 INSTRUCTIONS")
print("=" * 70)
print("1. Make sure your microphone is working")
print("2. Press Enter to start recording")
print("3. Speak ONE command clearly")
print("4. Wait 3 seconds for recording")
print("5. The model will predict what you said")
print("6. Type 'q' to quit\n")

while True:
    user_input = input("🎤 Press Enter to record (or 'q' to quit): ")
    
    if user_input.lower() == 'q':
        break
    
    # Record
    try:
        audio_file = record_audio(duration=3)
        
        # Predict
        command, confidence = predict_command(audio_file)
        
        print(f"\n{'='*50}")
        print(f"🎯 PREDICTION: '{command}'")
        print(f"📊 Confidence: {confidence:.2%}")
        print(f"{'='*50}\n")
        
        # Clean up
        os.remove(audio_file)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("   Please check your microphone and try again.\n")

print("\n✅ Test complete!")