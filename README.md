# 🎙️ AI Text-to-Speech Narrator Studio

A beginner-friendly, modern web application that converts typed or pasted text into lifelike speech using the official **ElevenLabs Text-to-Speech API** and a secure backend.

---

## ✨ Features

- **Modern Responsive Design**: Clean studio dark theme with smooth gradients, card containers, and mobile responsiveness.
- **Large Text Input**: Generous typing area with real-time character count (up to 5,000 characters) and word counter.
- **1-Click Sample Prompts**: Test storytelling, tech podcast clips, audiobooks, quotes, and announcements instantly.
- **Voice Selection**: Dropdown featuring ElevenLabs voices (e.g. Rachel, Adam, Bella, Antoni, Josh, and custom library voices) with sample audio preview players.
- **Model Selection & Tuning**: Choose between *Eleven Multilingual v2*, *Eleven Turbo v2.5*, *Eleven Flash v2.5*, and *Eleven Monolingual v1*, with stability, clarity, style exaggeration, and speaker boost controls.
- **Audio Player & Waveform**: Instant audio playback with animated sound wave visualizer bars.
- **Playback Speed Selector**: Adjust speed between 0.75x, 1.0x, 1.25x, and 1.5x with a single click.
- **MP3 Download**: Save generated narrations directly to your computer with clean, descriptive filenames.
- **Recent Generations**: Re-listen to clips generated during your active session or download individual MP3s.
- **Strict Server-Side Security**: Your ElevenLabs API key is stored strictly on your local backend server in `.env`. It is **never** sent to the client browser or committed to GitHub.
- **Real-Time Verification**: The app never pretends the API is connected; it validates your key directly with ElevenLabs.

---

## 📁 Project Structure

```text
AI Voice project/
├── .env.example          # Template for your ElevenLabs API key
├── .gitignore            # Protects .env and node_modules from git commits
├── package.json          # Node.js project manifest & scripts
├── server.js             # Primary Node.js Express backend proxy
├── server.py             # Optional zero-dependency Python backend alternative
├── README.md             # Setup guide and documentation
└── public/
    ├── index.html        # Modern HTML5 studio interface
    ├── style.css         # Responsive dark-theme CSS styles
    └── app.js            # Frontend JavaScript (API calls, audio player, UI)
```

---

## 🚀 Quick Start Guide

### Step 1: Install Node.js (or Python)

If you do not have Node.js installed yet:
1. Download and install **Node.js LTS** from [nodejs.org](https://nodejs.org/).
   *(Alternatively, in PowerShell you can run `winget install OpenJS.NodeJS.LTS`).*
2. Verify installation:
   ```powershell
   node -v
   ```

*(Note: If you prefer Python, you can alternatively run the Python server with `python server.py` without needing npm).*

---

### Step 2: Get an ElevenLabs API Key

1. Go to [ElevenLabs](https://elevenlabs.io/) and create a free account.
2. In the bottom-left corner of the dashboard, click on your **Profile icon** &rarr; select **API Keys**.
3. Click **Create API Key**, copy the key, and keep it private.

---

### Step 3: Configure Environment Variables

1. Inside this project folder, make a copy of `.env.example` and name the new file `.env`:
   - In PowerShell:
     ```powershell
     Copy-Item .env.example .env
     ```
2. Open `.env` in your text editor (VS Code, Notepad, etc.) and paste your API key:
   ```env
   ELEVENLABS_API_KEY=sk_your_actual_elevenlabs_api_key_here
   PORT=3000
   ```
3. Save the file.

> 🔒 **Security Notice**: `.env` is listed inside `.gitignore`. Never share this file or upload it to GitHub.

---

### Step 4: Install Dependencies & Run the Server

#### Option A: Using Node.js (Recommended)
1. Open a terminal in this project folder:
   ```powershell
   npm install
   ```
   *(Note for Windows PowerShell: If you see an ExecutionPolicy error when running `npm`, run `npm.cmd install` or `cmd /c npm install` instead).*
2. Start the application:
   ```powershell
   npm start
   ```
   *(or run: `node server.js`)*
3. Open your browser and navigate to:
   **[http://localhost:3000](http://localhost:3000)**

#### Option B: Using Python (Zero-dependency alternative)
If you prefer Python instead of Node.js:
1. Run:
   ```powershell
   python server.py
   ```
2. Open your browser and navigate to:
   **[http://localhost:3000](http://localhost:3000)**

---

## 🛠️ How It Works (Secure Architecture)

```
[ Browser (HTML / CSS / JS) ]
           │
           │  1. POST /api/tts { text, voiceId } (No API Key sent)
           ▼
[ Secure Local Backend (server.js / server.py) ]
           │
           │  2. Reads ELEVENLABS_API_KEY from .env
           │  3. POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}
           │     Header: xi-api-key: [SECRET_KEY]
           ▼
[ Official ElevenLabs API ]
           │
           │  4. Returns MP3 Audio Stream
           ▼
[ Backend streams MP3 audio back to browser ]
           │
           ▼
[ Browser HTML5 Audio Player & Download Button ]
```

---

## ❓ Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **Status shows "API Key Needed"** | `.env` has not been created or still has the placeholder text. | Copy `.env.example` to `.env`, paste your ElevenLabs key, and restart the server. |
| **Error: HTTP 401 Unauthorized** | The ElevenLabs API key in `.env` is incorrect or expired. | Verify that the key copied from [elevenlabs.io](https://elevenlabs.io) matches `.env`. |
| **Error: HTTP 429 / Quota Reached** | Character quota on free tier exhausted. | Check your remaining character balance on the ElevenLabs dashboard. |
| **Port 3000 already in use** | Another application is listening on port 3000. | Change `PORT=3001` in your `.env` file and restart. |

---

## 📄 License
MIT License. Free for educational and personal use.
