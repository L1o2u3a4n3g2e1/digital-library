# download_data.py
from datasets import load_dataset
import os

print("=" * 60)
print("📥 DOWNLOADING KINYARWANDA SPEECH DATA")
print("=" * 60)

# Create directories
os.makedirs("data/raw/audio", exist_ok=True)

try:
    print("\n📁 Loading Common Voice Kinyarwanda dataset...")
    dataset = load_dataset(
        "mozilla-foundation/common_voice_17_0",
        "rw",
        split="train",
        streaming=True
    )
    
    print("📝 Saving transcripts and downloading audio...")
    with open("data/raw/transcripts.txt", "w", encoding="utf-8") as f:
        for i, sample in enumerate(dataset):
            if i >= 500:  # Start with 500 samples for prototype
                break
            
            audio_path = sample["audio"]["path"]
            transcript = sample["sentence"]
            f.write(f"{audio_path}|{transcript}\n")
            
            if (i + 1) % 50 == 0:
                print(f"   Downloaded {i+1}/500 samples")
    
    print(f"\n✅ Downloaded {i+1} samples")
    
except Exception as e:
    print(f"⚠️ Error downloading dataset: {e}")
    print("\n📝 Creating sample data for testing...")
    
    # Create sample data
    sample_commands = [
        "soma igitabo",
        "ikurikira",
        "isubire inyuma",
        "subira inyuma",
        "ngaho",
        "hindura ururimi",
        "komeza gusoma",
        "rura ibitabo",
        "read book",
        "next page"
    ]
    
    with open("data/raw/transcripts.txt", "w", encoding="utf-8") as f:
        for i, cmd in enumerate(sample_commands):
            f.write(f"sample_{i}.wav|{cmd}\n")
    
    print(f"✅ Created {len(sample_commands)} sample transcripts")