# download_common_voice.py
import os
from datasets import load_dataset
import pandas as pd
import shutil
import requests
from tqdm import tqdm

print("=" * 60)
print("📥 DOWNLOADING COMMON VOICE KINYARWANDA DATASET")
print("=" * 60)

# Create directories
os.makedirs("data/raw/audio", exist_ok=True)
os.makedirs("data/raw/transcripts", exist_ok=True)

try:
    print("\n📁 Loading Common Voice Kinyarwanda dataset...")
    
    # Load the dataset (streaming mode to save disk space)
    dataset = load_dataset(
        "mozilla-foundation/common_voice_17_0",
        "rw",
        split="train",
        streaming=True
    )
    
    # Save first 1000 samples
    audio_files = []
    transcripts = []
    
    print("\n💾 Saving audio files and transcripts...")
    
    for i, sample in enumerate(dataset):
        if i >= 1000:  # Start with 1000 samples for prototype
            break
        
        # Get audio and transcript
        audio = sample["audio"]
        transcript = sample["sentence"]
        
        # Save audio file
        audio_filename = f"sample_{i}.mp3"
        audio_path = os.path.join("data/raw/audio", audio_filename)
        
        # Download audio if it's a URL
        if "path" in audio:
            try:
                # Copy or download audio
                if os.path.exists(audio["path"]):
                    shutil.copy(audio["path"], audio_path)
                else:
                    # Try to download
                    response = requests.get(audio["path"], timeout=10)
                    with open(audio_path, "wb") as f:
                        f.write(response.content)
            except:
                # Create dummy audio if download fails
                print(f"   Warning: Could not download audio for sample {i}")
                continue
        
        audio_files.append(audio_filename)
        transcripts.append(transcript)
        
        if (i + 1) % 100 == 0:
            print(f"   Downloaded {i+1} samples")
    
    # Save transcripts
    df = pd.DataFrame({"audio_file": audio_files, "transcript": transcripts})
    df.to_csv("data/raw/transcripts/common_voice.csv", index=False)
    
    print(f"\n✅ Downloaded {len(audio_files)} samples")
    print(f"📁 Audio saved to: data/raw/audio/")
    print(f"📄 Transcripts saved to: data/raw/transcripts/common_voice.csv")
    
except Exception as e:
    print(f"⚠️ Error: {e}")
    print("\n📝 Creating sample data for testing...")
    
    # Create sample data for testing
    sample_commands = [
        "soma igitabo", "ikurikira", "isubire inyuma", "subira inyuma",
        "ngaho", "hindura ururimi", "komeza gusoma", "rura ibitabo",
        "read book", "next page", "previous page", "go back"
    ]
    
    df = pd.DataFrame({
        "audio_file": [f"sample_{i}.wav" for i in range(len(sample_commands))],
        "transcript": sample_commands
    })
    df.to_csv("data/raw/transcripts/common_voice.csv", index=False)
    
    print(f"✅ Created {len(sample_commands)} sample transcripts")