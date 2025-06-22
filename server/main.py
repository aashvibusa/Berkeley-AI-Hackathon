from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import httpx
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="Highlight Logger API", version="1.0.0")

# Add CORS middleware to allow requests from Chrome extensions
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Environment variables for Letta API
LETTA_API_KEY = os.getenv("LETTA_API_KEY")
LETTA_AGENT_ID = os.getenv("LETTA_AGENT_ID")
LETTA_BASE_URL = "https://api.letta.ai/v1"

class HighlightRequest(BaseModel):
    highlight: str
    user_id: Optional[str] = "default_user"

@app.get("/")
async def root():
    return {"message": "Highlight Logger API is running!"}

@app.post("/highlight")
async def highlight_endpoint(request: HighlightRequest):
    """
    Receives a JSON object with a 'highlight' key and prints the value.
    Also forwards the request to Letta server.
    """
    try:
        # Print the highlighted text to console
        print(f"Received highlight: {request.highlight}")
        print(f"Highlight length: {len(request.highlight)}")
        print(f"User ID: {request.user_id}")
        print("-" * 50)
        
        # Forward to Letta server if environment variables are set
        letta_response = None
        if LETTA_API_KEY and LETTA_AGENT_ID:
            try:
                letta_url = f"{LETTA_BASE_URL}/agent/{LETTA_AGENT_ID}/tool/save_vocab/run"
                print(f"Letta URL: {letta_url}")
                print(f"Letta API Key: {LETTA_API_KEY}")
                print(f"Letta Agent ID: {LETTA_AGENT_ID}")
                print(f"Letta Base URL: {LETTA_BASE_URL}")
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        letta_url,
                        headers={
                            "Authorization": f"Bearer {LETTA_API_KEY}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "input": request.highlight,
                            "user_id": request.user_id
                        },
                        timeout=30.0
                    )
                    
                    if response.status_code == 200:
                        letta_response = response.json()
                        print(f"Successfully sent to Letta: {letta_response}")
                    else:
                        print(f"Letta API error: {response.status_code} - {response.text}")
                        
            except Exception as e:
                print(f"Error sending to Letta: {e}")
        else:
            print("Letta API credentials not configured. Skipping Letta request.")
        
        # Return a success response
        return {
            "status": "success",
            "message": "Highlight received and logged",
            "highlight": request.highlight,
            "length": len(request.highlight),
            "user_id": request.user_id,
            "letta_response": letta_response
        }
    except Exception as e:
        print(f"Error processing highlight: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 