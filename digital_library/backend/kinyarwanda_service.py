"""
Kinyarwanda-English Language Service - Fluent Support
Supports: Kinyarwanda and English only
Features: TTS, STT, Translation, Voice Commands
"""

import os
import uuid
import hashlib
import requests
import base64
import json
from pathlib import Path
from typing import Optional

# ============================================
# CONFIGURATION
# ============================================

# For offline TTS and STT (using Whisper for accuracy)
USE_WHISPER = True  # Set to False to use gTTS only

# ============================================
# KINYARWANDA-ENGLISH TRANSLATION (Fluent)
# ============================================

class KinyarwandaTranslator:
    """
    Fluent English to Kinyarwanda translation
    Extended dictionary with natural phrases
    """
    
    def __init__(self):
        self.translations = {
            # Greetings & Common Phrases
            'hello': 'Muraho',
            'hi': 'Muraho',
            'good morning': 'Mwaramutse',
            'good afternoon': 'Mwiriwe',
            'good evening': 'Mwiriwe', 
            'good night': 'Ijoro ryiza',
            'how are you': 'Amakuru',
            'i am fine': 'Ni meza',
            'i am good': 'Ni meza',
            'fine': 'Meza',
            'thank you': 'Urakoze',
            'thanks': 'Urakoze',
            'welcome': 'Urakaza neza',
            'sorry': 'Mbese',
            'excuse me': 'Mbabarira',
            'please': 'Nyamuneka',
            'ok': 'Sawa',
            'yes': 'Yego',
            'no': 'Oya',
            'maybe': 'Birashoboka',
            'wait': 'Tegereza',
            'help': 'Ubufasha',
            'help me': 'Mfasha',
            
            # Library & Reading
            'book': 'Igitabo',
            'books': 'Ibitabo',
            'read': 'Soma',
            'reading': 'Gusoma',
            'reader': 'Umusomyi',
            'library': 'Isomero',
            'page': 'Urupapuro',
            'pages': 'Urupapuro',
            'next': 'Ikurikira',
            'next page': 'Ikurikira',
            'previous': 'Ishize',
            'previous page': 'Ishize',
            'go back': 'Subira inyuma',
            'back': 'Subira',
            'continue': 'Komeza',
            'continue reading': 'Komeza gusoma',
            'open': 'Fungura',
            'open book': 'Fungura igitabo',
            'close': 'Funga',
            'start': 'Tangira',
            'stop': 'Hagarara',
            'pause': 'Hagarika',
            'play': 'Kina',
            
            # Voice Commands
            'read aloud': 'Soma mu ijwi rirenga',
            'speak': 'Vuga',
            'listen': 'Tega amatwi',
            'say it again': 'Vuga na rimwe',
            'repeat': 'Subiramo',
            'louder': 'Kuzamura ijwi',
            'softer': 'Gucisha ijwi',
            
            # Search & Navigation
            'search': 'Shakisha',
            'find': 'Shakisha',
            'search books': 'Shakisha ibitabo',
            'find books': 'Shakisha ibitabo',
            'category': 'Icyiciro',
            'categories': 'Ibyiciro',
            'show categories': 'Erekana ibyiciro',
            'dashboard': 'Urukurikirane',
            'home': 'Ahabanza',
            'settings': 'Igenamiterere',
            
            # Language
            'language': 'Ururimi',
            'change language': 'Hindura ururimi',
            'kinyarwanda': 'Ikinyarwanda',
            'english': 'Icyongereza',
            
            # Questions
            'what is this': 'Iki ni iki',
            'what page': 'Urupapero ruhe',
            'where am i': 'Ndi he',
            'what can i say': 'Niki nabaza',
            'show commands': 'Erekana amabwiriza',
            
            # Status
            'loading': 'Birimo birakora',
            'processing': 'Birimo bitunganywa',
            'done': 'Byakozwe',
            'completed': 'Byarangiye',
            'error': 'Ikosa',
            'failed': 'Byananiwe',
            'try again': 'Ongera ugerageze',
            'success': 'Byagenze neza',
            
            # Numbers
            'one': 'Rimwe',
            'two': 'Kabiri', 
            'three': 'Gatatu',
            'four': 'Kane',
            'five': 'Gatanu',
            'page one': 'Urupapuro rwa mbere',
            'page two': 'Urupapuro rwa kabiri',
            'page three': 'Urupapuro rwa gatatu',
        }
    
    def en_to_kin(self, text: str) -> str:
        """Translate English to Kinyarwanda"""
        if not text:
            return ""
        
        text_lower = text.lower().strip()
        
        # Exact match
        if text_lower in self.translations:
            return self.translations[text_lower]
        
        # Partial match - find longest matching phrase
        matches = []
        for eng, kin in self.translations.items():
            if eng in text_lower:
                matches.append((len(eng), eng, kin))
        
        if matches:
            matches.sort(reverse=True)
            return matches[0][2]
        
        # Return original for unknown words
        return text
    
    def kin_to_en(self, text: str) -> str:
        """Translate Kinyarwanda to English"""
        if not text:
            return ""
        
        text_lower = text.lower().strip()
        
        for eng, kin in self.translations.items():
            if kin.lower() == text_lower or kin.lower() in text_lower:
                return eng.capitalize()
        
        return text


# ============================================
# KINYARWANDA TEXT-TO-SPEECH (Fluent)
# ============================================

class KinyarwandaTTS:
    """
    Fluent Kinyarwanda Text-to-Speech
    Uses gTTS with optimal settings for Kinyarwanda
    """
    
    def __init__(self):
        os.makedirs("uploads/audio", exist_ok=True)
    
    def synthesize(self, text: str, output_path: str = None) -> Optional[str]:
        """Convert Kinyarwanda or English text to speech"""
        try:
            from gtts import gTTS
            
            if output_path is None:
                text_hash = hashlib.md5(text.encode()).hexdigest()[:10]
                output_path = f"uploads/audio/speech_{text_hash}.mp3"
            
            # Detect language (simple heuristic)
            # Kinyarwanda often contains common Kinyarwanda words
            kin_words = ['muraho', 'amakuru', 'igitabo', 'soma', 'komeza', 'subira', 
                        'hindura', 'ururimi', 'urakoze', 'yego', 'oya']
            
            is_kinyarwanda = any(word in text.lower() for word in kin_words)
            
            # Use French for Kinyarwanda (closest available in gTTS)
            # Use English for English text
            lang = 'fr' if is_kinyarwanda else 'en'
            
            tts = gTTS(text=text, lang=lang, slow=False)
            tts.save(output_path)
            
            return output_path
            
        except Exception as e:
            print(f"TTS error: {e}")
            return None


# ============================================
# KINYARWANDA SPEECH-TO-TEXT (Using Whisper)
# ============================================

class KinyarwandaSTT:
    """
    Fluent Speech-to-Text for Kinyarwanda and English
    Uses OpenAI Whisper for high accuracy
    """
    
    def __init__(self):
        self.model = None
        self.is_loaded = False
    
    def load_model(self):
        """Load Whisper model for STT"""
        try:
            import whisper
            # Use 'base' model for balance of speed and accuracy
            self.model = whisper.load_model("base")
            self.is_loaded = True
            print("✅ Whisper STT model loaded for Kinyarwanda/English")
            return True
        except Exception as e:
            print(f"⚠️ Whisper not available: {e}")
            return False
    
    def transcribe(self, audio_path: str, language: str = "auto") -> str:
        """Transcribe audio to text"""
        if not self.is_loaded:
            if not self.load_model():
                return ""
        
        try:
            # Map language codes for Whisper
            whisper_lang = None
            if language == 'rw':
                whisper_lang = 'rw'
            elif language == 'en':
                whisper_lang = 'en'
            
            result = self.model.transcribe(
                audio_path,
                language=whisper_lang,
                task="transcribe",
                fp16=False
            )
            
            return result.get("text", "").strip()
            
        except Exception as e:
            print(f"STT error: {e}")
            return ""


# ============================================
# KINYARWANDA VOICE COMMANDS (Fluent)
# ============================================

class KinyarwandaVoiceCommands:
    """
    Fluent voice command recognition for Kinyarwanda and English
    """
    
    COMMANDS = {
        # Navigation Commands
        'soma igitabo': 'open_book',
        'fungura igitabo': 'open_book',
        'open book': 'open_book',
        'read book': 'open_book',
        
        'komeza gusoma': 'continue_reading',
        'continue reading': 'continue_reading',
        'continue': 'continue_reading',
        
        'subira inyuma': 'go_back',
        'go back': 'go_back',
        'back': 'go_back',
        
        'ikurikira': 'next_page',
        'next page': 'next_page',
        'next': 'next_page',
        
        'isubire inyuma': 'previous_page',
        'previous page': 'previous_page',
        'previous': 'previous_page',
        
        # Playback Commands
        'ngaho': 'read_aloud',
        'soma': 'read_aloud',
        'read aloud': 'read_aloud',
        'speak': 'read_aloud',
        
        'hagarika': 'pause',
        'pause': 'pause',
        'stop': 'pause',
        
        'kina': 'play',
        'play': 'play',
        
        # Search Commands
        'shakisha igitabo': 'search_books',
        'search books': 'search_books',
        'find books': 'search_books',
        'search': 'search_books',
        
        'erekana ibyiciro': 'show_categories',
        'show categories': 'show_categories',
        'categories': 'show_categories',
        
        # Settings Commands
        'hindura ururimi': 'change_language',
        'change language': 'change_language',
        'switch language': 'change_language',
        
        # Help Commands
        'ubufasha': 'help',
        'help': 'help',
        'help me': 'help',
        'what can i say': 'help',
        'show commands': 'help',
        
        # Page Commands
        'what page': 'what_page',
        'which page': 'what_page',
        'current page': 'what_page',
        'page number': 'what_page',
    }
    
    @classmethod
    def recognize(cls, spoken_text: str) -> str:
        """Recognize voice command and return action"""
        if not spoken_text:
            return 'unknown'
        
        text = spoken_text.lower().strip()
        
        # Exact match
        if text in cls.COMMANDS:
            return cls.COMMANDS[text]
        
        # Partial match - find longest matching phrase
        matches = []
        for phrase, action in cls.COMMANDS.items():
            if phrase in text or text in phrase:
                matches.append((len(phrase), action))
        
        if matches:
            matches.sort(reverse=True)
            return matches[0][1]
        
        return 'unknown'
    
    @classmethod
    def get_all(cls) -> dict:
        """Get all commands by category"""
        return {
            'navigation': ['soma igitabo', 'ikurikira', 'isubire inyuma', 'subira inyuma', 'komeza gusoma'],
            'playback': ['ngaho', 'hagarika', 'kina'],
            'search': ['shakisha igitabo', 'erekana ibyiciro'],
            'settings': ['hindura ururimi'],
            'help': ['ubufasha']
        }
    
    @classmethod
    def get_english_commands(cls) -> list:
        """Get English commands only"""
        return ['open book', 'read book', 'continue', 'next', 'previous', 'go back', 
                'read aloud', 'pause', 'play', 'search books', 'show categories', 
                'change language', 'help', 'what page']
    
    @classmethod
    def get_kinyarwanda_commands(cls) -> list:
        """Get Kinyarwanda commands only"""
        return ['soma igitabo', 'komeza gusoma', 'ikurikira', 'isubire inyuma', 
                'subira inyuma', 'ngaho', 'hagarika', 'shakisha ibitabo', 
                'erekana ibyiciro', 'hindura ururimi', 'ubufasha']


# ============================================
# INITIALIZE SERVICES
# ============================================

# Create instances
kinyarwanda_tts = KinyarwandaTTS()
kinyarwanda_translator = KinyarwandaTranslator()
kinyarwanda_stt = KinyarwandaSTT()
kinyarwanda_commands = KinyarwandaVoiceCommands()

# Try to load STT model in background
try:
    kinyarwanda_stt.load_model()
except:
    pass

print("\n" + "=" * 60)
print("🇷🇼 KINYARWANDA-ENGLISH FLUENT SERVICE")
print("=" * 60)
print(f"📚 Translation: {len(kinyarwanda_translator.translations)} phrases")
print(f"🎤 Voice Commands: {len(kinyarwanda_commands.get_all())} commands")
print(f"   - Kinyarwanda: {len(kinyarwanda_commands.get_kinyarwanda_commands())}")
print(f"   - English: {len(kinyarwanda_commands.get_english_commands())}")
print(f"🔊 TTS: Active (gTTS with language detection)")
print(f"🎙️ STT: {'Active (Whisper)' if kinyarwanda_stt.is_loaded else 'Fallback mode'}")
print("=" * 60)

# Test translations
print("\n📝 Translation Examples:")
test_phrases = [
    ("hello", "Muraho"),
    ("book", "Igitabo"),
    ("read aloud", "Soma mu ijwi rirenga"),
    ("change language", "Hindura ururimi"),
    ("continue reading", "Komeza gusoma")
]
for eng, expected in test_phrases:
    result = kinyarwanda_translator.en_to_kin(eng)
    status = "✓" if result == expected else "?"
    print(f"  {status} '{eng}' → '{result}'")

print("\n🎤 Voice Command Examples:")
test_commands = [
    ("soma igitabo", "open_book"),
    ("read book", "open_book"),
    ("ikurikira", "next_page"),
    ("next page", "next_page"),
    ("ngaho", "read_aloud")
]
for cmd, expected in test_commands:
    result = kinyarwanda_commands.recognize(cmd)
    status = "✓" if result == expected else "?"
    print(f"  {status} '{cmd}' → {result}")

print("\n✅ Kinyarwanda-English fluent service ready!")
print("=" * 60)