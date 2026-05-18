"""
Download Kinyarwanda and English speech datasets for LSTM training
"""

import os

def create_sample_kinyarwanda_data():
    """Create sample Kinyarwanda data for testing"""
    sample_transcripts = [
        "soma igitabo",
        "ikurikira",
        "isubire inyuma",
        "subira inyuma",
        "ngaho",
        "hindura ururimi",
        "komeza gusoma",
        "rura ibitabo"
    ]
    
    os.makedirs("../data/kinyarwanda/audio", exist_ok=True)
    
    with open("../data/kinyarwanda/transcripts.txt", "w", encoding="utf-8") as f:
        for i, transcript in enumerate(sample_transcripts):
            f.write(f"sample_{i}.wav|{transcript}\n")
    
    print(f"✅ Created {len(sample_transcripts)} sample Kinyarwanda transcripts")

def create_sample_english_data():
    """Create sample English data for testing"""
    sample_transcripts = [
        "read book",
        "next page", 
        "previous page",
        "go back",
        "change language",
        "read aloud",
        "continue reading",
        "search books",
        "open book",
        "stop"
    ]
    
    os.makedirs("../data/english/audio", exist_ok=True)
    
    with open("../data/english/transcripts.txt", "w", encoding="utf-8") as f:
        for i, transcript in enumerate(sample_transcripts):
            f.write(f"sample_{i}.wav|{transcript}\n")
    
    print(f"✅ Created {len(sample_transcripts)} sample English transcripts")

def download_kinyarwanda_tts_data():
    """Download Kinyarwanda TTS model from Digital Umuganda"""
    print("📥 Downloading Kinyarwanda TTS model...")
    
    try:
        from huggingface_hub import snapshot_download
        
        snapshot_download(
            repo_id="DigitalUmuganda/KinyarwandaTTS_female_voice",
            local_dir="../models/tts/kinyarwanda_tts",
            local_dir_use_symlinks=False
        )
        print("✅ Kinyarwanda TTS model downloaded")
    except Exception as e:
        print(f"⚠️ TTS download failed: {e}")
        print("   You can download manually from Hugging Face")

if __name__ == "__main__":
    print("=" * 60)
    print("📥 DOWNLOADING SPEECH DATASETS")
    print("=" * 60)
    
    os.makedirs("../data/kinyarwanda/audio", exist_ok=True)
    os.makedirs("../data/english/audio", exist_ok=True)
    os.makedirs("../models/stt", exist_ok=True)
    os.makedirs("../models/tts", exist_ok=True)
    
    create_sample_english_data()
    create_sample_kinyarwanda_data()
    
    # Try to download TTS model (optional)
    try:
        download_kinyarwanda_tts_data()
    except:
        pass
    
    print("\n✅ Data setup complete!")
    print("📁 Sample transcripts created in data/ folder")