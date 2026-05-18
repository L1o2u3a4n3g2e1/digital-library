"""
Voice API Endpoints - Simplified Version
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional

router = APIRouter(prefix="/api/voice", tags=["Voice Recognition"])


@router.get("/test")
async def test_endpoint():
    return {"status": "voice router is online", "message": "Voice API is working!"}


@router.post("/recognize")
async def recognize_speech(
    audio: UploadFile = File(...),
    language: str = Form("auto"),
    detect_commands: bool = Form(True)
):
    from voice_recognition_service import voice_service
    
    result = await voice_service.recognize(audio, language, detect_commands)
    
    return {
        "success": True,
        "text": result.text,
        "language": result.language,
        "confidence": result.confidence,
        "model_used": result.model_used,
        "is_command": result.is_command,
        "command_action": result.command_action
    }


@router.get("/commands")
async def get_voice_commands(language: str = "en"):
    from voice_recognition_service import voice_service
    
    commands = await voice_service.get_available_commands(language)
    
    return {
        "language": language,
        "categories": commands,
        "total_commands": sum(len(cmd_list) for cmd_list in commands.values())
    }


@router.post("/simulate-command")
async def simulate_command(text: str = Form(...), language: str = Form("en")):
    from voice_recognition_service import VoiceCommandRecognizer
    
    action, is_command = VoiceCommandRecognizer.recognize(text, language)
    
    return {
        "spoken_text": text,
        "detected_language": language,
        "is_command": is_command,
        "action": action if is_command else None
    }


@router.get("/models/info")
async def get_voice_models_info():
    from voice_recognition_service import voice_service
    return voice_service.get_model_info()