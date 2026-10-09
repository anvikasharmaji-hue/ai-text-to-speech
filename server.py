#!/usr/bin/env python3
"""
Alternative Zero-Dependency Python Backend for AI Voice Narrator.
Uses only Python standard library (http.server, urllib.request, json, os).
Supports both Node.js and Python developers!
"""

import http.server
import json
import mimetypes
import os
import socketserver
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

# Load environment variables from .env file manually without external pip packages
def load_dotenv():
    env_path = Path(__file__).resolve().parent / ".env"
    if env_path.exists():
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip('"').strip("'")
                    if key and key not in os.environ:
                        os.environ[key] = val

load_dotenv()

PORT = int(os.environ.get("PORT", 3000))
PUBLIC_DIR = Path(__file__).resolve().parent / "public"

CURATED_DEFAULT_VOICES = [
    {
        "voice_id": "21m00Tcm4TlvDq8ikWAM",
        "name": "Rachel",
        "category": "premade",
        "labels": {"accent": "american", "gender": "female", "age": "young", "description": "calm, conversational"},
        "preview_url": "https://storage.googleapis.com/eleven-public-prod/premade/voices/21m00Tcm4TlvDq8ikWAM/df6788f9-186e-4737-a62ad0f9011d.mp3"
    },
    {
        "voice_id": "pNInz6obpgDQGcFmaJgB",
        "name": "Adam",
        "category": "premade",
        "labels": {"accent": "american", "gender": "male", "age": "middle-aged", "description": "deep, narration"},
        "preview_url": "https://storage.googleapis.com/eleven-public-prod/premade/voices/pNInz6obpgDQGcFmaJgB/6734175b-0821-4d11-83d9-a45a6c117d9f.mp3"
    },
    {
        "voice_id": "EXAVITQu4vr4xnSDxMaL",
        "name": "Bella",
        "category": "premade",
        "labels": {"accent": "american", "gender": "female", "age": "young", "description": "soft, expressive"},
        "preview_url": "https://storage.googleapis.com/eleven-public-prod/premade/voices/EXAVITQu4vr4xnSDxMaL/0436572d-9265-4983-8470-6306149733b6.mp3"
    },
    {
        "voice_id": "ErXwobaYiN019PkySvjV",
        "name": "Antoni",
        "category": "premade",
        "labels": {"accent": "american", "gender": "male", "age": "young", "description": "well-rounded, story"},
        "preview_url": "https://storage.googleapis.com/eleven-public-prod/premade/voices/ErXwobaYiN019PkySvjV/38d8f367-7a2e-43a9-a937-2ee0f803f260.mp3"
    },
    {
        "voice_id": "TxGEqnHWrfWFTfGW9XjX",
        "name": "Josh",
        "category": "premade",
        "labels": {"accent": "american", "gender": "male", "age": "young", "description": "natural, casual"},
        "preview_url": "https://storage.googleapis.com/eleven-public-prod/premade/voices/TxGEqnHWrfWFTfGW9XjX/3e731454-9467-4632-9cb4-2661ab2ec4f3.mp3"
    },
    {
        "voice_id": "AZnzlk1XvdvUeBnXmlld",
        "name": "Domi",
        "category": "premade",
        "labels": {"accent": "american", "gender": "female", "age": "young", "description": "strong, engaging"},
        "preview_url": "https://storage.googleapis.com/eleven-public-prod/premade/voices/AZnzlk1XvdvUeBnXmlld/50dd647c-619a-45f6-a879-a476c938c5e2.mp3"
    },
    {
        "voice_id": "VR6AewLTigWG4xSOukaG",
        "name": "Arnold",
        "category": "premade",
        "labels": {"accent": "american", "gender": "male", "age": "middle-aged", "description": "crisp, narrator"},
        "preview_url": "https://storage.googleapis.com/eleven-public-prod/premade/voices/VR6AewLTigWG4xSOukaG/02123ec9-b69d-4762-b94d-17a41ec5ae68.mp3"
    },
    {
        "voice_id": "MF3mGyEYCl7XYWbV9V6O",
        "name": "Elli",
        "category": "premade",
        "labels": {"accent": "american", "gender": "female", "age": "young", "description": "emotional, young"},
        "preview_url": "https://storage.googleapis.com/eleven-public-prod/premade/voices/MF3mGyEYCl7XYWbV9V6O/d89552be-6eb7-400a-939e-21ef6ee4a880.mp3"
    },
    {
        "voice_id": "yoZ06aMxZJJ28mfd3POQ",
        "name": "Sam",
        "category": "premade",
        "labels": {"accent": "american", "gender": "male", "age": "young", "description": "dynamic, raspy"},
        "preview_url": "https://storage.googleapis.com/eleven-public-prod/premade/voices/yoZ06aMxZJJ28mfd3POQ/b88b201a-8c76-47b2-8bb4-0985a97579bd.mp3"
    },
    {
        "voice_id": "JBFqnCBsd6RMkjVDRZzb",
        "name": "George",
        "category": "premade",
        "labels": {"accent": "british", "gender": "male", "age": "middle-aged", "description": "warm, British narration"},
        "preview_url": "https://storage.googleapis.com/eleven-public-prod/premade/voices/JBFqnCBsd6RMkjVDRZzb/e6206d1a-0721-47bc-8025-631804332802.mp3"
    }
]

def get_api_key():
    env_path = Path(__file__).resolve().parent / ".env"
    if env_path.exists():
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        if k.strip() == "ELEVENLABS_API_KEY":
                            val = v.strip().strip('"').strip("'")
                            if val and val != "your_elevenlabs_api_key_here":
                                return val
        except Exception:
            pass
    return None

class VoiceAppHandler(http.server.BaseHTTPRequestHandler):
    def send_json(self, status_code, data):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, xi-api-key")
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == "/api/status":
            api_key = get_api_key()
            if not api_key:
                self.send_json(200, {
                    "status": "ok",
                    "configured": False,
                    "verified": False,
                    "message": "ELEVENLABS_API_KEY is missing. Add your API key to your .env file."
                })
                return

            try:
                req = urllib.request.Request(
                    "https://api.elevenlabs.io/v1/user",
                    headers={"xi-api-key": api_key, "Accept": "application/json"}
                )
                with urllib.request.urlopen(req, timeout=10) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
                    sub = data.get("subscription", {})
                    tier = sub.get("tier", "Active")
                    char_limit = sub.get("character_limit")
                    char_count = sub.get("character_count")
                    usage = None
                    if char_limit is not None and char_count is not None:
                        usage = f"{char_count:,} / {char_limit:,} characters used"

                    self.send_json(200, {
                        "status": "ok",
                        "configured": True,
                        "verified": True,
                        "tier": tier,
                        "usage": usage,
                        "message": "Successfully authenticated with ElevenLabs API."
                    })
            except urllib.error.HTTPError as e:
                err_msg = "Invalid ElevenLabs API Key. Please verify ELEVENLABS_API_KEY in .env." if e.code == 401 else f"ElevenLabs returned HTTP {e.code}"
                self.send_json(200, {
                    "status": "ok",
                    "configured": True,
                    "verified": False,
                    "statusCode": e.code,
                    "message": err_msg
                })
            except Exception as e:
                self.send_json(200, {
                    "status": "ok",
                    "configured": True,
                    "verified": False,
                    "message": f"Could not reach ElevenLabs servers: {str(e)}"
                })
            return

        if path == "/api/voices":
            api_key = get_api_key()
            if not api_key:
                self.send_json(200, {
                    "success": True,
                    "source": "fallback",
                    "message": "Using curated default voices. Set ELEVENLABS_API_KEY in .env for custom voices.",
                    "voices": CURATED_DEFAULT_VOICES
                })
                return

            try:
                req = urllib.request.Request(
                    "https://api.elevenlabs.io/v1/voices",
                    headers={"xi-api-key": api_key, "Accept": "application/json"}
                )
                with urllib.request.urlopen(req, timeout=10) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
                    self.send_json(200, {
                        "success": True,
                        "source": "elevenlabs",
                        "voices": data.get("voices", CURATED_DEFAULT_VOICES)
                    })
            except Exception as e:
                self.send_json(200, {
                    "success": True,
                    "source": "fallback_error",
                    "message": f"Could not fetch voices from ElevenLabs: {str(e)}",
                    "voices": CURATED_DEFAULT_VOICES
                })
            return

        # Serve static frontend files
        if path == "/" or path == "":
            rel_path = "index.html"
        else:
            rel_path = path.lstrip("/")

        file_path = PUBLIC_DIR / rel_path
        if file_path.exists() and file_path.is_file():
            mime_type, _ = mimetypes.guess_type(str(file_path))
            mime_type = mime_type or "application/octet-stream"
            try:
                with open(file_path, "rb") as f:
                    content = f.read()
                self.send_response(200)
                self.send_header("Content-Type", mime_type)
                self.send_header("Content-Length", str(len(content)))
                self.end_headers()
                self.wfile.write(content)
            except Exception as e:
                self.send_error(500, f"Error reading file: {str(e)}")
        else:
            self.send_error(404, "File Not Found")

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path != "/api/tts":
            self.send_error(404, "Endpoint Not Found")
            return

        api_key = get_api_key()
        if not api_key:
            self.send_json(401, {
                "error": "API_KEY_MISSING",
                "message": "ElevenLabs API Key is not configured. Add ELEVENLABS_API_KEY to your .env file."
            })
            return

        content_length = int(self.headers.get("Content-Length", 0))
        if content_length == 0:
            self.send_json(400, {"error": "INVALID_BODY", "message": "Request body cannot be empty."})
            return

        try:
            req_body = json.loads(self.rfile.read(content_length).decode("utf-8"))
        except Exception:
            self.send_json(400, {"error": "INVALID_JSON", "message": "Failed to parse JSON request body."})
            return

        text = req_body.get("text", "").strip()
        voice_id = req_body.get("voiceId", "21m00Tcm4TlvDq8ikWAM").strip()
        model_id = req_body.get("modelId", "eleven_multilingual_v2").strip()
        voice_settings = req_body.get("voiceSettings", {})

        if not text:
            self.send_json(400, {"error": "EMPTY_TEXT", "message": "Please enter text to narrate."})
            return

        if len(text) > 5000:
            self.send_json(400, {"error": "TEXT_TOO_LONG", "message": "Text exceeds 5,000 character limit."})
            return

        payload = {
            "text": text,
            "model_id": model_id,
            "voice_settings": {
                "stability": float(voice_settings.get("stability", 0.5)),
                "similarity_boost": float(voice_settings.get("similarityBoost", 0.75)),
                "style": float(voice_settings.get("style", 0.0)),
                "use_speaker_boost": bool(voice_settings.get("useSpeakerBoost", True))
            }
        }

        url = f"https://api.elevenlabs.io/v1/text-to-speech/{urllib.parse.quote(voice_id)}?output_format=mp3_44100_128"
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "xi-api-key": api_key,
                "Content-Type": "application/json",
                "Accept": "audio/mpeg"
            },
            method="POST"
        )

        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                audio_bytes = resp.read()
                self.send_response(200)
                self.send_header("Content-Type", "audio/mpeg")
                self.send_header("Content-Length", str(len(audio_bytes)))
                self.send_header("Content-Disposition", 'inline; filename="speech.mp3"')
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(audio_bytes)
        except urllib.error.HTTPError as e:
            raw_err = e.read().decode("utf-8", errors="ignore")
            message = f"ElevenLabs API Error: HTTP {e.code}"
            try:
                err_json = json.loads(raw_err)
                message = err_json.get("detail", {}).get("message", raw_err) if isinstance(err_json.get("detail"), dict) else err_json.get("detail", raw_err)
            except Exception:
                pass

            if e.code == 401:
                message = "Invalid ElevenLabs API Key. Please verify ELEVENLABS_API_KEY in .env."
            elif e.code == 429:
                message = "ElevenLabs quota exceeded or rate limited."

            self.send_json(e.code, {"error": "ELEVENLABS_ERROR", "message": message})
        except Exception as e:
            self.send_json(500, {"error": "SERVER_ERROR", "message": f"Network error: {str(e)}"})

def run():
    with socketserver.TCPServer(("", PORT), VoiceAppHandler) as httpd:
        print("====================================================")
        print("🎙️  AI Voice Narrator Python Server running!")
        print(f"🌐 Local URL: http://localhost:{PORT}")
        print(f"🔑 ElevenLabs API Key: {'✅ Configured' if get_api_key() else '⚠️  Missing in .env'}")
        print("====================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")

if __name__ == "__main__":
    run()
