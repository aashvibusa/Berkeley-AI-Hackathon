# FastAPI Highlight Logger Server

A FastAPI server that receives highlighted text via a POST endpoint, prints it to the console, and forwards it to the Letta AI server for vocabulary saving.

## Features

- POST `/highlight` endpoint that accepts JSON with a "highlight" key
- Prints received highlights to the server console
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

# Edit .env with your actual Letta API credentials
# Replace the placeholder values with your real API key and agent ID
```

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```bash
# Required: Letta API Configuration
LETTA_API_KEY=your_actual_api_key_here
LETTA_AGENT_ID=your_actual_agent_id_here

# Optional: Server Configuration
DEBUG=False
PORT=8000
HOST=0.0.0.0
```

### Required Variables:
- `LETTA_API_KEY`: Your Letta AI API key
- `LETTA_AGENT_ID`: Your Letta AI agent ID

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

## API Endpoints

### GET `/`
- Returns a simple status message
- Response: `{"message": "Highlight Logger API is running!"}`

### POST `/highlight`
- Accepts JSON with a "highlight" key and optional "user_id"
- Prints the highlight to the server console
- Forwards the request to Letta AI server
- Returns success response with highlight details and Letta response
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
    }
}
```

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

If the environment variables are not set, the server will still log highlights locally but skip the Letta API call.

## Testing

### Using curl:
```bash
curl -X POST "http://localhost:8000/highlight" \
     -H "Content-Type: application/json" \
     -d '{"highlight": "This is a test highlight", "user_id": "test_user"}'
```

### Using the interactive docs:
1. Go to `http://localhost:8000/docs`
2. Click on the POST `/highlight` endpoint
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

- `main.py` - FastAPI application with highlight endpoint, CORS middleware, and Letta integration
- `load_env.py` - Utility script for testing environment variable loading
- `requirements.txt` - Python dependencies including python-dotenv
- `env_template.txt` - Template for creating .env file
- `requirements.txt` - Python dependencies including httpx for HTTP requests
- `env.example` - Example environment variables file
- `README.md` - This file 