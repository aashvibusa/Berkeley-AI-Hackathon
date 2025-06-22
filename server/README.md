# FastAPI Highlight Logger Server

A simple FastAPI server that receives highlighted text via a POST endpoint and prints it to the console.

## Features

- POST `/highlight` endpoint that accepts JSON with a "highlight" key
- Prints received highlights to the server console
- Returns JSON response with status and highlight information
- Built-in API documentation at `/docs`
- CORS middleware enabled to allow requests from Chrome extensions and web pages

## Installation

1. Install the required dependencies:
```bash
pip install -r requirements.txt
```

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

## API Endpoints

### GET `/`
- Returns a simple status message
- Response: `{"message": "Highlight Logger API is running!"}`

### POST `/highlight`
- Accepts JSON with a "highlight" key
- Prints the highlight to the server console
- Returns success response with highlight details
- CORS enabled for cross-origin requests

#### Request Body:
```json
{
    "highlight": "Your highlighted text here"
}
```

#### Response:
```json
{
    "status": "success",
    "message": "Highlight received and logged",
    "highlight": "Your highlighted text here",
    "length": 25
}
```

## Testing

### Using curl:
```bash
curl -X POST "http://localhost:8000/highlight" \
     -H "Content-Type: application/json" \
     -d '{"highlight": "This is a test highlight"}'
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

- `main.py` - FastAPI application with the highlight endpoint and CORS middleware
- `requirements.txt` - Python dependencies
- `README.md` - This file 