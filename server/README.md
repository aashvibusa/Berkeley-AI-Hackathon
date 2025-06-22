# FastAPI Highlight Logger Server

A FastAPI server that receives highlighted text via a POST endpoint, prints it to the console, forwards it to the Letta AI server for vocabulary saving, provides translation services using Groq API, maintains persistent user state in a JSON store, and includes real-time audio streaming with speech-to-text transcription using Whisper.

## Features

- POST `/highlight` endpoint that accepts JSON with a "highlight" key
- POST `/translate` endpoint that translates text using Groq API with dynamic language preferences
- WebSocket `/ws/audio` endpoint for real-time audio streaming and transcription
- Persistent state management with JSON store (`store.json`)
- User data management with source/target languages and highlighted words
- Real-time audio capture and transcription using OpenAI Whisper
- Prints received highlights and transcribed audio to the server console
- Forwards highlights to Letta AI server for vocabulary saving
- Returns JSON response with status and highlight information
- Built-in API documentation at `/docs`
- CORS middleware enabled to allow requests from Chrome extensions and web pages
- Environment variables loaded from .env file

## Installation

1. Install the required dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
```bash
# Copy the template file to .env
cp env_template.txt .env

# Edit .env with your actual API credentials
# Replace the placeholder values with your real API keys and agent ID
```

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```bash
# Required: Letta API Configuration
LETTA_API_KEY=your_actual_api_key_here
LETTA_AGENT_ID=your_actual_agent_id_here

# Required: Groq API Configuration (for translation)
GROQ_API_KEY=your_groq_api_key_here

# Optional: Server Configuration
DEBUG=False
PORT=8000
HOST=0.0.0.0
```

### Required Variables:
- `LETTA_API_KEY`: Your Letta AI API key
- `LETTA_AGENT_ID`: Your Letta AI agent ID
- `GROQ_API_KEY`: Your Groq API key for translation services

### Optional Variables:
- `DEBUG`: Set to "True" for debug mode (default: False)
- `PORT`: Server port (default: 8000)
- `HOST`: Server host (default: 0.0.0.0)

## Running the Server

1. Start the server:
```bash
python main.py
```

Or alternatively:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

2. The server will start on `http://localhost:8000`

## Testing Environment Variables

You can test if your environment variables are loaded correctly:

```bash
python load_env.py
```

This will show you which variables are loaded and validate that required ones are present.

## State Management

The server maintains persistent state in `store.json` with the following structure:

```json
{
  "users": {
    "user_id": {
      "source_language": "auto",
      "target_language": "Spanish",
      "highlighted_words": ["word1", "word2", "word3"]
    }
  }
}
```

### Store Features:
- **Automatic loading** on server startup
- **Automatic saving** whenever state changes
- **User creation** on first highlight
- **Duplicate prevention** for highlighted words
- **Persistent storage** across server restarts

## API Endpoints

### GET `/`
- Returns a simple status message
- Response: `{"message": "Highlight Logger API is running!"}`

### GET `/store/stats`
- Returns statistics about the store
- Response: `{"total_users": 5, "total_highlighted_words": 25, "users": ["user1", "user2"]}`

### GET `/users/{user_id}`
- Returns user data including languages and highlighted words
- Creates user if doesn't exist

### POST `/users/languages`
- Updates user's language preferences
- Request: `{"user_id": "user1", "source_language": "English", "target_language": "Spanish"}`

### GET `/users/{user_id}/words`
- Returns user's highlighted words list
- Response: `{"user_id": "user1", "highlighted_words": ["hello", "world"], "count": 2}`

### DELETE `/users/{user_id}/words/{word}`
- Removes a word from user's highlighted words list

### POST `/highlight`
- Accepts JSON with a "highlight" key and optional "user_id"
- Prints the highlight to the server console
- Forwards the request to Letta AI server
- Saves highlighted word to user's store
- Returns success response with highlight details, Letta response, and user data
- CORS enabled for cross-origin requests

#### Request Body:
```json
{
    "highlight": "Your highlighted text here",
    "user_id": "user_abc123"
}
```

#### Response:
```json
{
    "status": "success",
    "message": "Highlight received and logged",
    "highlight": "Your highlighted text here",
    "length": 25,
    "user_id": "user_abc123",
    "letta_response": {
        "result": "Vocabulary saved successfully"
    },
    "user_data": {
        "source_language": "auto",
        "target_language": "Spanish",
        "highlighted_words": ["Your highlighted text here", "previous word"]
    }
}
```

### POST `/translate`
- Accepts JSON with a "text" key
- Translates the text to Spanish using Groq API
- Returns the original and translated text
- CORS enabled for cross-origin requests

#### Request Body:
```json
{
    "text": "Hello world"
}
```

#### Response:
```json
{
    "status": "success",
    "message": "Text translated successfully",
    "original_text": "Hello world",
    "translated_text": "Hola mundo",
    "source_language": "English",
    "target_language": "Spanish"
}
```

### WebSocket `/ws/audio`
- Real-time WebSocket endpoint for audio streaming
- Accepts audio data in WebM format with Opus codec
- Performs speech-to-text transcription using OpenAI Whisper
- Prints transcribed text to server console
- Returns transcription results to connected clients

#### WebSocket Connection:
```javascript
const websocket = new WebSocket('ws://localhost:8000/ws/audio');

websocket.onopen = () => {
    console.log('Connected to audio WebSocket');
};

websocket.onmessage = (event) => {
    console.log('Transcription result:', event.data);
};

// Send audio data
websocket.send(audioBuffer);
```

#### Server Console Output:
```
🎤 Transcribed Audio: Hello, this is a test of the audio transcription system.
```

## Audio Streaming Integration

## Letta AI Integration

The server forwards highlight requests to the Letta AI API using the following endpoint:
```
POST https://api.letta.ai/v1/agent/{AGENT_ID}/tool/save_vocab/run
```

### Letta Request Format:
```json
{
    "input": "highlighted_text",
    "user_id": "user_id"
}
```

## Groq Translation Integration

The server uses Groq API for translation services:
```
POST https://api.groq.com/openai/v1/chat/completions
```

### Groq Configuration:
- **Model**: llama3-8b-8192
- **Temperature**: 0.1 (for consistent translations)
- **Max Tokens**: 1000
- **System Prompt**: Professional translator role

If the environment variables are not set, the server will return appropriate error messages.

## Testing

### Using curl:

#### Test store stats:
```bash
curl -X GET "http://localhost:8000/store/stats"
```

#### Test user data:
```bash
curl -X GET "http://localhost:8000/users/chrome_extension_user"
```

#### Test highlight endpoint:
```bash
curl -X POST "http://localhost:8000/highlight" \
     -H "Content-Type: application/json" \
     -d '{"highlight": "This is a test highlight", "user_id": "test_user"}'
```

#### Test translate endpoint:
```bash
curl -X POST "http://localhost:8000/translate" \
     -H "Content-Type: application/json" \
     -d '{"text": "Hello world"}'
```

### Using the interactive docs:
1. Go to `http://localhost:8000/docs`
2. Click on the desired endpoint
3. Click "Try it out"
4. Enter your JSON payload
5. Click "Execute"

## CORS Support

The server includes CORS middleware that allows requests from:
- Chrome extensions
- Web pages from any origin
- Local development environments

This enables the Chrome extension to successfully send highlighted text to the server.

## API Documentation

- Interactive API docs: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

## Files

- `main.py` - FastAPI application with all endpoints, CORS middleware, and API integrations
- `state_manager.py` - State management module for handling store.json operations
- `store.json` - Persistent JSON store for user data
- `load_env.py` - Utility script for testing environment variable loading
- `requirements.txt` - Python dependencies including python-dotenv and httpx
- `env_template.txt` - Template for creating .env file
- `README.md` - This file 