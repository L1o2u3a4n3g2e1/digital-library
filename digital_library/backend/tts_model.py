"""
Text-to-Speech using gTTS
"""

import os
import uuid
from gtts import gTTS

class LSTM_TTS:
    def __init__(self):
        print("✅ TTS Model initialized")
        os.makedirs("uploads/audio", exist_ok=True)
    
    def synthesize(self, text, language='en', output_path=None):
        if not text or not text.strip():
            return None
        
        if output_path is None:
            output_path = f"uploads/audio/tts_{uuid.uuid4()}.mp3"
        
        os.makedirs("uploads/audio", exist_ok=True)
        
        try:
            # Use French voice for Kinyarwanda (closest match)
            lang_code = 'fr' if language == 'rw' else 'en'
            tts = gTTS(text=text, lang=lang_code, slow=False)
            tts.save(output_path)
            return output_path
        except Exception as e:
            print(f"TTS error: {e}")
            return None

# Create global instance
tts_model = LSTM_TTS()