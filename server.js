require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Default curated ElevenLabs voices (used as graceful fallback when API key is pending)
const CURATED_DEFAULT_VOICES = [
  {
    voice_id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel',
    category: 'premade',
    labels: { accent: 'american', gender: 'female', age: 'young', description: 'calm, conversational' },
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/21m00Tcm4TlvDq8ikWAM/df6788f9-186e-4737-a62ad0f9011d.mp3'
  },
  {
    voice_id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam',
    category: 'premade',
    labels: { accent: 'american', gender: 'male', age: 'middle-aged', description: 'deep, narration' },
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/pNInz6obpgDQGcFmaJgB/6734175b-0821-4d11-83d9-a45a6c117d9f.mp3'
  },
  {
    voice_id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    category: 'premade',
    labels: { accent: 'american', gender: 'female', age: 'young', description: 'soft, expressive' },
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/EXAVITQu4vr4xnSDxMaL/0436572d-9265-4983-8470-6306149733b6.mp3'
  },
  {
    voice_id: 'ErXwobaYiN019PkySvjV',
    name: 'Antoni',
    category: 'premade',
    labels: { accent: 'american', gender: 'male', age: 'young', description: 'well-rounded, story' },
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/ErXwobaYiN019PkySvjV/38d8f367-7a2e-43a9-a937-2ee0f803f260.mp3'
  },
  {
    voice_id: 'TxGEqnHWrfWFTfGW9XjX',
    name: 'Josh',
    category: 'premade',
    labels: { accent: 'american', gender: 'male', age: 'young', description: 'natural, casual' },
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/TxGEqnHWrfWFTfGW9XjX/3e731454-9467-4632-9cb4-2661ab2ec4f3.mp3'
  },
  {
    voice_id: 'AZnzlk1XvdvUeBnXmlld',
    name: 'Domi',
    category: 'premade',
    labels: { accent: 'american', gender: 'female', age: 'young', description: 'strong, engaging' },
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/AZnzlk1XvdvUeBnXmlld/50dd647c-619a-45f6-a879-a476c938c5e2.mp3'
  },
  {
    voice_id: 'VR6AewLTigWG4xSOukaG',
    name: 'Arnold',
    category: 'premade',
    labels: { accent: 'american', gender: 'male', age: 'middle-aged', description: 'crisp, narrator' },
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/VR6AewLTigWG4xSOukaG/02123ec9-b69d-4762-b94d-17a41ec5ae68.mp3'
  },
  {
    voice_id: 'MF3mGyEYCl7XYWbV9V6O',
    name: 'Elli',
    category: 'premade',
    labels: { accent: 'american', gender: 'female', age: 'young', description: 'emotional, young' },
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/MF3mGyEYCl7XYWbV9V6O/d89552be-6eb7-400a-939e-21ef6ee4a880.mp3'
  },
  {
    voice_id: 'yoZ06aMxZJJ28mfd3POQ',
    name: 'Sam',
    category: 'premade',
    labels: { accent: 'american', gender: 'male', age: 'young', description: 'dynamic, raspy' },
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/yoZ06aMxZJJ28mfd3POQ/b88b201a-8c76-47b2-8bb4-0985a97579bd.mp3'
  },
  {
    voice_id: 'JBFqnCBsd6RMkjVDRZzb',
    name: 'George',
    category: 'premade',
    labels: { accent: 'british', gender: 'male', age: 'middle-aged', description: 'warm, British narration' },
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/JBFqnCBsd6RMkjVDRZzb/e6206d1a-0721-47bc-8025-631804332802.mp3'
  }
];

// Helper to get ElevenLabs API key (reads from .env dynamically if created/modified)
function getApiKey() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [k, ...vParts] = trimmed.split('=');
          if (k.trim() === 'ELEVENLABS_API_KEY') {
            const val = vParts.join('=').trim().replace(/^['"]|['"]$/g, '');
            if (val && val !== 'your_elevenlabs_api_key_here') {
              return val;
            }
          }
        }
      }
    } catch (_) {}
  }

  // Fallback to environment variable if set by container/system
  const envKey = process.env.ELEVENLABS_API_KEY;
  if (envKey && envKey.trim() !== '' && envKey.trim() !== 'your_elevenlabs_api_key_here') {
    return envKey.trim();
  }

  return null;
}

/**
 * GET /api/status
 * Verifies real API connection with ElevenLabs API.
 * Supports both full-access keys and scoped keys (with TTS & Voices permissions).
 */
app.get('/api/status', async (req, res) => {
  const apiKey = getApiKey();

  if (!apiKey) {
    return res.json({
      status: 'ok',
      configured: false,
      verified: false,
      message: 'ELEVENLABS_API_KEY is missing. Add your API key to your .env file to enable speech generation.'
    });
  }

  // Verify key against ElevenLabs
  try {
    let verified = false;
    let tier = 'Active';
    let usage = null;

    // 1. Check /v1/user for subscription stats (if full permission)
    try {
      const userResp = await fetch('https://api.elevenlabs.io/v1/user', {
        method: 'GET',
        headers: { 'xi-api-key': apiKey, 'Accept': 'application/json' }
      });
      if (userResp.ok) {
        const userData = await userResp.json().catch(() => ({}));
        const sub = userData?.subscription || {};
        tier = sub.tier || 'Active';
        const charLimit = sub.character_limit;
        const charCount = sub.character_count;
        if (charLimit !== undefined && charCount !== undefined) {
          usage = `${charCount.toLocaleString()} / ${charLimit.toLocaleString()} characters used`;
        }
        verified = true;
      }
    } catch (_) {}

    // 2. Fallback to /v1/voices for scoped keys (TTS + Voices permissions)
    if (!verified) {
      const voicesResp = await fetch('https://api.elevenlabs.io/v1/voices', {
        method: 'GET',
        headers: { 'xi-api-key': apiKey, 'Accept': 'application/json' }
      });
      if (voicesResp.ok) {
        verified = true;
      }
    }

    if (verified) {
      return res.json({
        status: 'ok',
        configured: true,
        verified: true,
        tier: tier,
        usage: usage,
        message: 'Successfully authenticated with ElevenLabs API.'
      });
    } else {
      return res.json({
        status: 'ok',
        configured: true,
        verified: false,
        statusCode: 401,
        message: 'Invalid ElevenLabs API Key. Please verify the key in your .env file.'
      });
    }
  } catch (err) {
    return res.json({
      status: 'ok',
      configured: true,
      verified: false,
      message: `Could not reach ElevenLabs servers: ${err.message || 'Network error'}`
    });
  }
});

/**
 * GET /api/voices
 * Fetches available voices from ElevenLabs API (or returns curated default voices if key not set yet).
 */
app.get('/api/voices', async (req, res) => {
  const apiKey = getApiKey();

  // If no API key configured, return curated fallback voices
  if (!apiKey) {
    return res.json({
      success: true,
      source: 'fallback',
      message: 'Using default voices list. Configure ELEVENLABS_API_KEY in .env to fetch all voices from your account.',
      voices: CURATED_DEFAULT_VOICES
    });
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`ElevenLabs API returned ${response.status} when fetching voices:`, errorText);
      return res.json({
        success: true,
        source: 'fallback_error',
        message: `ElevenLabs returned HTTP ${response.status}. Displaying default voices.`,
        voices: CURATED_DEFAULT_VOICES
      });
    }

    const data = await response.json();
    return res.json({
      success: true,
      source: 'elevenlabs',
      voices: (Array.isArray(data.voices) && data.voices.length > 0) ? data.voices : CURATED_DEFAULT_VOICES
    });
  } catch (error) {
    console.error('Error fetching voices from ElevenLabs:', error);
    return res.json({
      success: true,
      source: 'fallback_network',
      message: 'Could not connect to ElevenLabs API to fetch voices. Showing default voices.',
      voices: CURATED_DEFAULT_VOICES
    });
  }
});

/**
 * POST /api/tts
 * Generates speech audio from text using ElevenLabs Text-to-Speech endpoint.
 * Request body: { text, voiceId, modelId, voiceSettings }
 */
app.post('/api/tts', async (req, res) => {
  const apiKey = getApiKey();

  // 1. Validate API Key
  if (!apiKey) {
    return res.status(401).json({
      error: 'API_KEY_MISSING',
      message: 'ElevenLabs API Key is not configured. Please create a .env file with your ELEVENLABS_API_KEY and restart the server.'
    });
  }

  // 2. Validate Request Body
  const { text, voiceId, modelId, voiceSettings } = req.body || {};

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({
      error: 'INVALID_TEXT',
      message: 'Please provide valid text to synthesize.'
    });
  }

  const cleanText = text.trim();
  if (cleanText.length > 5000) {
    return res.status(400).json({
      error: 'TEXT_TOO_LONG',
      message: `Text length (${cleanText.length} characters) exceeds the 5,000 character limit for single generation.`
    });
  }

  const targetVoiceId = (voiceId && typeof voiceId === 'string')
    ? voiceId.trim()
    : '21m00Tcm4TlvDq8ikWAM'; // Default to Rachel if not selected

  const targetModelId = (modelId && typeof modelId === 'string')
    ? modelId.trim()
    : 'eleven_multilingual_v2'; // High-quality multilingual model

  // 3. Prepare payload for ElevenLabs TTS
  const payload = {
    text: cleanText,
    model_id: targetModelId,
    voice_settings: {
      stability: voiceSettings?.stability !== undefined ? Number(voiceSettings.stability) : 0.5,
      similarity_boost: voiceSettings?.similarityBoost !== undefined ? Number(voiceSettings.similarityBoost) : 0.75,
      style: voiceSettings?.style !== undefined ? Number(voiceSettings.style) : 0.0,
      use_speaker_boost: voiceSettings?.useSpeakerBoost !== undefined ? Boolean(voiceSettings.useSpeakerBoost) : true
    }
  };

  try {
    // Official ElevenLabs text-to-speech endpoint
    const elevenlabsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(targetVoiceId)}?output_format=mp3_44100_128`;

    const apiResponse = await fetch(elevenlabsUrl, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify(payload)
    });

    if (!apiResponse.ok) {
      let errorMessage = `ElevenLabs API error: HTTP ${apiResponse.status} ${apiResponse.statusText}`;
      try {
        const errorData = await apiResponse.json();
        if (errorData?.detail?.message) {
          errorMessage = errorData.detail.message;
        } else if (errorData?.detail) {
          errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }
      } catch (_) {
        // Fallback to text if not JSON
        const rawText = await apiResponse.text().catch(() => '');
        if (rawText) errorMessage = rawText;
      }

      // Provide friendly user-facing interpretations for common API codes
      if (apiResponse.status === 401) {
        errorMessage = 'Invalid ElevenLabs API Key. Please verify the key in your .env file.';
      } else if (apiResponse.status === 429) {
        errorMessage = 'ElevenLabs quota exceeded or rate limit reached. Please check your ElevenLabs account credits.';
      }

      return res.status(apiResponse.status).json({
        error: 'ELEVENLABS_REQUEST_FAILED',
        statusCode: apiResponse.status,
        message: errorMessage
      });
    }

    // Stream or buffer the audio response back to the client
    const audioBuffer = await apiResponse.arrayBuffer();

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.byteLength);
    res.setHeader('Content-Disposition', 'inline; filename="speech.mp3"');
    res.setHeader('Cache-Control', 'no-cache');

    return res.end(Buffer.from(audioBuffer));
  } catch (error) {
    console.error('TTS Generation error:', error);
    return res.status(500).json({
      error: 'SERVER_ERROR',
      message: `Failed to communicate with ElevenLabs: ${error.message || 'Unknown network error'}`
    });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🎙️  AI Voice Narrator Server is running!`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`🔑 ElevenLabs API Key: ${getApiKey() ? '✅ Configured' : '⚠️  Missing in .env'}`);
  console.log(`====================================================`);
});
