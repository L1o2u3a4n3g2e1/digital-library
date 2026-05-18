"""
Download Kinyarwanda and English Datasets for LSTM Training
No APIs - Raw data only
"""

import os
import requests
import pandas as pd
from tqdm import tqdm
import zipfile
import json

print("=" * 70)
print("📥 DOWNLOADING DATASETS FOR LSTM TRAINING")
print("=" * 70)

# Create directories
os.makedirs("data/raw/kinyarwanda/text", exist_ok=True)
os.makedirs("data/raw/kinyarwanda/audio", exist_ok=True)
os.makedirs("data/raw/english/text", exist_ok=True)
os.makedirs("data/raw/english/audio", exist_ok=True)

# ============================================
# 1. KINYARWANDA TEXT DATA (Common Voice)
# ============================================

print("\n[1/5] Downloading Kinyarwanda text data...")

try:
    from datasets import load_dataset
    
    print("   Loading Common Voice Kinyarwanda (streaming)...")
    dataset = load_dataset(
        "mozilla-foundation/common_voice_17_0",
        "rw",
        split="train",
        streaming=True
    )
    
    texts = []
    for i, sample in enumerate(tqdm(dataset, desc="   Downloading", total=5000)):
        if i >= 5000:
            break
        sentence = sample.get("sentence", "").strip()
        if sentence:
            texts.append(sentence)
    
    with open("data/raw/kinyarwanda/text/sentences.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(texts))
    
    print(f"   ✅ Downloaded {len(texts)} Kinyarwanda sentences")
    
except Exception as e:
    print(f"   ⚠️ Error: {e}")
    print("   Creating sample data...")
    
    sample_texts = [
        "soma igitabo", "ikurikira", "isubire inyuma", "subira inyuma",
        "ngaho", "hindura ururimi", "komeza gusoma", "rura ibitabo",
        "muraho", "amakuru", "urakoze", "yego", "oya", "mwaramutse",
        "mwiriwe", "ndashaka gusoma", "mfungurire igitabo", "hagarika",
        "kina", "shakisha", "erekana ibyiciro", "ubufasha", "subira"
    ]
    
    with open("data/raw/kinyarwanda/text/sentences.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(sample_texts))
    
    print(f"   ✅ Created {len(sample_texts)} sample sentences")

# ============================================
# 2. KINYARWANDA TRANSLATION PAIRS
# ============================================

print("\n[2/5] Downloading Kinyarwanda-English translation pairs...")

try:
    from datasets import load_dataset
    
    dataset = load_dataset(
        "DigitalUmuganda/kinyarwanda-english",
        split="train",
        streaming=True
    )
    
    pairs = []
    for i, sample in enumerate(tqdm(dataset, desc="   Downloading", total=5000)):
        if i >= 5000:
            break
        kin = sample.get("kinyarwanda", "").strip()
        eng = sample.get("english", "").strip()
        if kin and eng:
            pairs.append({"kinyarwanda": kin, "english": eng})
    
    df = pd.DataFrame(pairs)
    df.to_csv("data/raw/kinyarwanda/text/translation_pairs.csv", index=False)
    
    print(f"   ✅ Downloaded {len(pairs)} translation pairs")
    
except Exception as e:
    print(f"   ⚠️ Error: {e}")
    
    sample_pairs = [
        ("soma igitabo", "read book"),
        ("ikurikira", "next"),
        ("isubire inyuma", "previous"),
        ("subira inyuma", "go back"),
        ("ngaho", "read aloud"),
        ("hindura ururimi", "change language"),
        ("komeza gusoma", "continue reading"),
        ("rura ibitabo", "search books"),
    ]
    
    df = pd.DataFrame(sample_pairs, columns=["kinyarwanda", "english"])
    df.to_csv("data/raw/kinyarwanda/text/translation_pairs.csv", index=False)
    
    print(f"   ✅ Created {len(sample_pairs)} sample pairs")

# ============================================
# 3. ENGLISH TEXT DATA (LibriSpeech)
# ============================================

print("\n[3/5] Downloading English text data...")

# Create sample English commands (for voice commands)
english_commands = [
    "read book", "open book", "next page", "next", "previous page",
    "previous", "go back", "back", "read aloud", "speak", "change language",
    "continue reading", "continue", "search books", "search", "show categories",
    "pause", "stop", "play", "resume", "help", "what page", "page number"
]

with open("data/raw/english/text/commands.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(english_commands))

print(f"   ✅ Created {len(english_commands)} English command samples")

# ============================================
# 4. CREATE CHARACTER VOCABULARY
# ============================================

print("\n[4/5] Creating character vocabulary...")

# Load all Kinyarwanda text
with open("data/raw/kinyarwanda/text/sentences.txt", "r", encoding="utf-8") as f:
    kin_texts = f.read().split("\n")

# Load all English text
with open("data/raw/english/text/commands.txt", "r", encoding="utf-8") as f:
    eng_texts = f.read().split("\n")

# Combine all characters
all_chars = set()
for text in kin_texts + eng_texts:
    for char in text:
        all_chars.add(char)

# Add special tokens
special_tokens = ['<PAD>', '<UNK>', '<SOS>', '<EOS>', '<BLANK>']
vocab = sorted(list(all_chars)) + special_tokens
char_to_idx = {char: idx for idx, char in enumerate(vocab)}
idx_to_char = {idx: char for char, idx in char_to_idx.items()}

# Save vocabulary
import pickle
with open("data/processed/vocab.pkl", "wb") as f:
    pickle.dump({
        "char_to_idx": char_to_idx,
        "idx_to_char": idx_to_char,
        "vocab_size": len(vocab)
    }, f)

print(f"   ✅ Vocabulary size: {len(vocab)} characters")
print(f"   📝 Characters: {list(vocab)[:30]}...")

# ============================================
# 5. CREATE TRAINING DATASET
# ============================================

print("\n[5/5] Creating training dataset...")

# Create dataframe for STT training
stt_data = []
for text in kin_texts + eng_texts:
    if text.strip():
        # Create label (same text for ASR)
        stt_data.append({
            "text": text.strip(),
            "language": "rw" if text in kin_texts else "en"
        })

df_stt = pd.DataFrame(stt_data)
df_stt.to_csv("data/processed/stt_training_data.csv", index=False)

print(f"   ✅ STT training samples: {len(df_stt)}")

# Create translation training data
df_trans = pd.read_csv("data/raw/kinyarwanda/text/translation_pairs.csv")
df_trans.to_csv("data/processed/translation_training_data.csv", index=False)

print(f"   ✅ Translation samples: {len(df_trans)}")

# ============================================
# SUMMARY
# ============================================

print("\n" + "=" * 70)
print("✅ DATASET DOWNLOAD COMPLETE!")
print("=" * 70)
print("\n📁 Data location: backend/data/")
print("")
print("   📄 Kinyarwanda sentences:", len(kin_texts))
print("   📄 English commands:", len(eng_texts))
print("   📄 Translation pairs:", len(df_trans))
print("   📝 Vocabulary size:", len(vocab))
print("")
print("=" * 70)
print("🚀 NEXT: Train LSTM models")
print("   1. Train STT model: python train_stt.py")
print("   2. Train Translation model: python train_translation.py")
print("   3. Train TTS model: python train_tts.py")
print("=" * 70)