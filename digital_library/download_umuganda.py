# download_umuganda.py
import os
from huggingface_hub import snapshot_download
import pandas as pd

print("=" * 60)
print("📥 DOWNLOADING DIGITAL UMUGANDA DATASET")
print("=" * 60)

# Create directory
os.makedirs("data/umuganda", exist_ok=True)

try:
    print("\n📁 Downloading Digital Umuganda Kinyarwanda dataset...")
    
    # Download the dataset
    snapshot_download(
        repo_id="DigitalUmuganda/KinyarwandaTTS_female_voice",
        local_dir="data/umuganda/tts_model",
        local_dir_use_symlinks=False
    )
    
    print("✅ TTS model downloaded")
    
    # Also try to get their speech dataset if available
    print("\n📁 Looking for speech dataset...")
    
    # Digital Umuganda also has translation datasets
    from datasets import load_dataset
    
    try:
        # Load translation dataset
        dataset = load_dataset("DigitalUmuganda/kinyarwanda-english", split="train", streaming=True)
        
        translations = []
        for i, sample in enumerate(dataset):
            if i >= 500:
                break
            translations.append({
                "kinyarwanda": sample.get("kinyarwanda", ""),
                "english": sample.get("english", "")
            })
        
        df = pd.DataFrame(translations)
        df.to_csv("data/umuganda/translations.csv", index=False)
        print(f"✅ Downloaded {len(translations)} translation pairs")
        
    except:
        print("⚠️ Translation dataset not available")
    
except Exception as e:
    print(f"⚠️ Error: {e}")
    print("\n📝 Note: Digital Umuganda dataset download may require authentication")