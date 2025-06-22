from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="Highlight Logger API", version="1.0.0")

# Add CORS middleware to allow requests from Chrome extensions
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class HighlightRequest(BaseModel):
    highlight: str

@app.get("/")
async def root():
    return {"message": "Highlight Logger API is running!"}

@app.post("/highlight")
async def highlight_endpoint(request: HighlightRequest):
    """
    Receives a JSON object with a 'highlight' key and prints the value.
    """
    try:
        # Print the highlighted text to console
        print(f"Received highlight: {request.highlight}")
        print(f"Highlight length: {len(request.highlight)}")
        print("-" * 50)
        
        # Return a success response
        return {
            "status": "success",
            "message": "Highlight received and logged",
            "highlight": request.highlight,
            "length": len(request.highlight)
        }
    except Exception as e:
        print(f"Error processing highlight: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 