import os
import pyaudio
import wave
import numpy as np
import librosa
import torch
import pickle
import time

# Configuration
COMMANDS = [
    "soma igitabo", "ikurikira", "isubire inyuma", "subira inyuma", 
    "read book", "next page", "previous page", "go back"
]
SAMPLES_PER_COMMAND = 5
DURATION = 2  # seconds
SAMPLE_RATE = 16000
MFCC_FEATURES = 13
MAX_LEN = 50

def record_audio(filename):
    CHUNK = 1024
    FORMAT = pyaudio.paInt16
    CHANNELS = 1
    
    p = pyaudio.PyAudio()
    stream = p.open(format=FORMAT, channels=CHANNELS, rate=SAMPLE_RATE, input=True, frames_per_buffer=CHUNK)
    
    print(f"🎙️ Recording...")
    frames = []
    for _ in range(0, int(SAMPLE_RATE / CHUNK * DURATION)):
        data = stream.read(CHUNK)
        frames.append(data)
    
    stream.stop_stream()
    stream.close()
    p.terminate()
    
    wf = wave.open(filename, 'wb')
    wf.setnchannels(CHANNELS)
    wf.setsampwidth(p.get_sample_size(FORMAT))
    wf.setframerate(SAMPLE_RATE)
    wf.writeframes(b''.join(frames))
    wf.close()

def extract_features(audio_path):
    audio, sr = librosa.load(audio_path, sr=SAMPLE_RATE, duration=DURATION)
    mfcc = librosa.feature.mfcc(y=audio, sr=SAMPLE_RATE, n_mfcc=MFCC_FEATURES, n_fft=400, hop_length=160)
    if mfcc.shape[1] > MAX_LEN:
        mfcc = mfcc[:, :MAX_LEN]
    else:
        padding = MAX_LEN - mfcc.shape[1]
        mfcc = np.pad(mfcc, ((0, 0), (0, padding)), mode='constant')
    return mfcc.T

def main():
    print("=" * 60)
    print("🎤 VOICE DATA COLLECTION FOR LSTM TRAINING")
    print("=" * 60)
    print(f"You will record {SAMPLES_PER_COMMAND} samples for each command.")
    
    features_list = []
    labels_list = []
    
    os.makedirs("data/my_voice", exist_ok=True)
    
    for cmd in COMMANDS:
        print(f"\n👉 Command: '{cmd}'")
        for i in range(SAMPLES_PER_COMMAND):
            input(f"   Press Enter to record sample {i+1}/{SAMPLES_PER_COMMAND}...")
            temp_wav = f"data/my_voice/temp.wav"
            record_audio(temp_wav)
            
            features = extract_features(temp_wav)
            features_list.append(features)
            labels_list.append(cmd)
            os.remove(temp_wav)
            
    # Save collected data
    X = np.array(features_list)
    
    # Load or create label mapping
    mapping_path = "data/processed/command_mapping.pkl"
    if os.path.exists(mapping_path):
        with open(mapping_path, "rb") as f:
            mapping = pickle.load(f)
            command_to_idx = mapping["command_to_idx"]
    else:
        command_to_idx = {cmd: i for i, cmd in enumerate(COMMANDS)}
        mapping = {"command_to_idx": command_to_idx, "idx_to_command": {i: cmd for cmd, i in command_to_idx.items()}}
        with open(mapping_path, "wb") as f:
            pickle.dump(mapping, f)
            
    y = np.array([command_to_idx[label] for label in labels_list])
    
    np.save("data/processed/X_my_voice.npy", X)
    np.save("data/processed/y_my_voice.npy", y)
    
    print("\n" + "=" * 60)
    print("✅ DATA COLLECTION COMPLETE!")
    print(f"📊 Saved {len(X)} samples to data/processed/X_my_voice.npy")
    print("🚀 Next step: Run 'python train_on_my_voice.py'")
    print("=" * 60)

if __name__ == "__main__":
    main()
