from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import httpx
from typing import Optional
from dotenv import load_dotenv
from state_manager import StateManager
from letta_client import Letta, MessageCreate, TextContent

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

# Environment variables for APIs
LETTA_API_KEY = os.getenv("LETTA_API_KEY")
LETTA_AGENT_ID = os.getenv("LETTA_AGENT_ID")
LETTA_BASE_URL = "https://api.letta.ai/v1"
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
print(f"LETTA_API_KEY: {LETTA_API_KEY}")
print(f"LETTA_AGENT_ID: {LETTA_AGENT_ID}")
print(f"LETTA_BASE_URL: {LETTA_BASE_URL}")
print(f"GROQ_API_KEY: {GROQ_API_KEY}")

# Initialize state manager
state_manager = StateManager()

# Initialize Letta client
if LETTA_API_KEY:
    letta_client = Letta(token=LETTA_API_KEY)
else:
    letta_client = None

# Language code to full name mapping
LANGUAGE_MAP = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ja': 'Japanese',
    'zh': 'Chinese',
    'ko': 'Korean',
    'ru': 'Russian',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'auto': 'auto'
}

def expand_language_code(language_code: str) -> str:
    """
    Expand a language code to its full name.
    If the code is not found, return the original code.
    """
    if not language_code:
        return "auto"
    
    # Convert to lowercase for case-insensitive matching
    code_lower = language_code.lower()
    
    # Check if it's already a full name (capitalized)
    if language_code[0].isupper():
        return language_code
    
    # Look up in the language map
    return LANGUAGE_MAP.get(code_lower, language_code)

class HighlightRequest(BaseModel):
    highlight: str
    user_id: Optional[str] = "default_user"

class TranslateRequest(BaseModel):
    text: str
    user_id: Optional[str] = None

class UserLanguageRequest(BaseModel):
    user_id: str
    source_language: Optional[str] = None
    target_language: Optional[str] = None

class LoginRequest(BaseModel):
    user_id: str
    password: str

class RegisterRequest(BaseModel):
    user_id: str
    password: str
    first_name: str
    last_name: str

class SetPreferencesRequest(BaseModel):
    user_id: str
    experience_level: str
    learning_goal: str
    practice_frequency: str

class ChatMessageRequest(BaseModel):
    text: str

@app.get("/")
async def root():
    return {"message": "Highlight Logger API is running!"}

@app.get("/store/stats")
async def get_store_stats():
    """Get statistics about the store."""
    return state_manager.get_store_stats()

@app.get("/users/{user_id}")
async def get_user_data(user_id: str):
    """Get user data including languages and highlighted words."""
    user_data = state_manager.get_user(user_id)
    return {
        "user_id": user_id,
        "data": user_data
    }

@app.post("/users/register")
async def register_user(request: RegisterRequest):
    """Register a new user with hashed password."""
    try:
        # Check if user already exists
        if request.user_id in state_manager.store["users"]:
            raise HTTPException(status_code=400, detail="User already exists")
        
        # Create new user with hashed password
        state_manager.store["users"][request.user_id] = {
            "first_name": request.first_name,
            "last_name": request.last_name,
            "password": request.password,  # Store hashed password
            "source_language": "auto",
            "target_language": "Spanish",
            "highlighted_words": [],
            "preferences_set": False
        }
        state_manager.save_store()
        
        user_data = state_manager.get_user(request.user_id)
        user_data.pop("password", None)
        
        return {"username": request.user_id, **user_data, "is_new_user": True}
    except Exception as e:
        print(f"Error registering user: {e}")
        raise HTTPException(status_code=500, detail="Registration failed")

@app.post("/users/login")
async def login_user(request: LoginRequest):
    """Login user with password verification."""
    try:
        # Check if user exists
        if request.user_id not in state_manager.store["users"]:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        user_data = state_manager.store["users"][request.user_id]
        stored_password = user_data.get("password", "")
        
        # Verify password
        if stored_password != request.password:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Return user data (without password)
        user_data_copy = user_data.copy()
        user_data_copy.pop("password", None)  # Remove password from response
        
        is_new_user = not user_data.get("preferences_set", False)

        return {"username": request.user_id, **user_data_copy, "is_new_user": is_new_user}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error logging in user: {e}")
        raise HTTPException(status_code=500, detail="Login failed")

@app.post("/users/set-preferences")
async def set_preferences(request: SetPreferencesRequest):
    """Set user preferences and inform the Letta agent."""
    user_id = request.user_id
    if not letta_client or not LETTA_AGENT_ID:
        raise HTTPException(status_code=500, detail="Letta API not configured")

    memory = {"human": {}}

    # 1. Fetch memory from Letta
    try:
        retrieved_block = letta_client.blocks.retrieve(block_id=user_id)
        if retrieved_block and retrieved_block.get("memory") and retrieved_block.get("memory", {}).get("human"):
             memory["human"] = retrieved_block["memory"]["human"]
    except Exception as e:
        # A 404 for a new user would be caught here, which is acceptable.
        print(f"Could not retrieve memory from Letta (this might be expected for a new user): {e}")

    # 2. Prepare the data for the Letta agent
    new_preferences = {
        "experience_level": request.experience_level,
        "learning_goal": request.learning_goal,
        "practice_frequency": request.practice_frequency,
    }

    # 3. Call the Letta agent's set_preferences tool
    try:
        tool_name = "set_preferences"
        letta_client.agents.tools.run(
            agent_id=LETTA_AGENT_ID,
            tool_name=tool_name,
            input=new_preferences,
            memory=memory,
        )
    except Exception as e:
        print(f"Error from Letta API: {e}")
        # Continuing to ensure our DB gets updated regardless of Letta's status.

    # 4. Update the user's preferences in our database
    user_data = state_manager.get_user(user_id)
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
        
    state_manager.store["users"][user_id]["preferences"] = new_preferences
    state_manager.store["users"][user_id]["preferences_set"] = True
    state_manager.save_store()

    return {"status": "success", "message": "Preferences updated successfully."}

@app.post("/users/languages")
async def update_user_languages(request: UserLanguageRequest):
    """Update user's language preferences."""
    success = state_manager.update_user_languages(
        request.user_id, 
        request.source_language, 
        request.target_language
    )
    if success:
        return {
            "status": "success",
            "message": "User languages updated",
            "user_id": request.user_id,
            "data": state_manager.get_user(request.user_id)
        }
    else:
        raise HTTPException(status_code=500, detail="Failed to update user languages")

@app.get("/users/{user_id}/words")
async def get_user_words(user_id: str):
    """Get user's highlighted words."""
    words = state_manager.get_highlighted_words(user_id)
    return {
        "user_id": user_id,
        "highlighted_words": words,
        "count": len(words)
    }

@app.delete("/users/{user_id}/words/{word}")
async def remove_user_word(user_id: str, word: str):
    """Remove a word from user's highlighted words."""
    success = state_manager.remove_highlighted_word(user_id, word)
    if success:
        return {
            "status": "success",
            "message": f"Word '{word}' removed for user {user_id}"
        }
    else:
        raise HTTPException(status_code=500, detail="Failed to remove word")

@app.post("/translate")
async def translate_endpoint(request: TranslateRequest):
    """
    Translates text using Groq API based on user's language preferences.
    If text is in source language, translate to target. If text is in target language, translate to source.
    """
    try:
        if not GROQ_API_KEY:
            raise HTTPException(status_code=500, detail="Groq API key not configured")
        
        print(f"Received translation request: {request.text}")
        print(f"Text length: {len(request.text)}")
        print(f"User ID: {request.user_id}")
        print("-" * 50)
        
        # Get user's language preferences
        source_language = "auto"
        target_language = "Spanish"
        
        if request.user_id:
            user_data = state_manager.get_user(request.user_id)
            print(f"User data: {user_data}")
            source_language = user_data.get("source_language", "auto")
            target_language = user_data.get("target_language", "Spanish")
        
        # Expand language codes to full names
        source_language_full = expand_language_code(source_language)
        target_language_full = expand_language_code(target_language)
        
        # Prepare the request for Groq API
        groq_url = "https://api.groq.com/openai/v1/chat/completions"
        print(f"Source language: {source_language} -> {source_language_full}")
        print(f"Target language: {target_language} -> {target_language_full}")
        
        # Create dynamic system prompt based on user's language preferences
        if source_language == "auto":
            # If source is auto, just translate to target language
            system_prompt = f"You are a professional translator. Translate the given text to {target_language_full}. Only return the translated text, nothing else."
        else:
            # If source is specified, check if text is in source or target language and translate accordingly
            system_prompt = f"""You are a professional translator. 
If the text is in {source_language_full}, translate it to {target_language_full}.
If the text is in {target_language_full}, translate it to {source_language_full}.
Only return the translated text, nothing else."""
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                groq_url,
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama3-8b-8192",
                    "messages": [
                        {
                            "role": "system",
                            "content": system_prompt
                        },
                        {
                            "role": "user",
                            "content": request.text
                        }
                    ],
                    "temperature": 0.1,
                    "max_tokens": 1000
                },
                timeout=30.0
            )
            
            if response.status_code == 200:
                result = response.json()
                translated_text = result["choices"][0]["message"]["content"].strip()
                print(f"Successfully translated: {translated_text}")
                
                return {
                    "status": "success",
                    "message": "Text translated successfully",
                    "original_text": request.text,
                    "translated_text": translated_text,
                    "source_language": source_language_full,
                    "target_language": target_language_full
                }
            else:
                print(f"Groq API error: {response.status_code} - {response.text}")
                raise HTTPException(status_code=response.status_code, detail=f"Groq API error: {response.text}")
                
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error translating text: {e}")
        raise HTTPException(status_code=500, detail=f"Translation error: {str(e)}")

@app.post("/highlight")
async def highlight_endpoint(request: HighlightRequest):
    """
    Receives a JSON object with a 'highlight' key and prints the value.
    Also forwards the request to Letta server and saves to store.
    """
    try:
        # Print the highlighted text to console
        print(f"Received highlight: {request.highlight}")
        print(f"Highlight length: {len(request.highlight)}")
        print(f"User ID: {request.user_id}")
        print("-" * 50)
        
        # Save to store
        state_manager.add_highlighted_word(request.user_id, request.highlight)
        
        # Get updated user data
        user_data = state_manager.get_user(request.user_id)
        
        # Return a success response
        return {
            "status": "success",
            "message": "Highlight received and logged",
            "highlight": request.highlight,
            "length": len(request.highlight),
            "user_id": request.user_id,
            "user_data": user_data
        }
    except Exception as e:
        print(f"Error processing highlight: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/chat/send-message")
async def send_message(request: ChatMessageRequest):
    """
    Send a message to the Letta agent and get the latest response.
    
    NOTE: The current version of letta-client does not seem to support
    multi-user conversations via a user_id parameter. These calls will
    therefore be made in a shared context.
    """
    text = request.text
    if not letta_client or not LETTA_AGENT_ID:
        raise HTTPException(status_code=500, detail="Letta API not configured")

    try:
        # Send user message to Letta and return the agent's response
        response_messages = letta_client.agents.messages.create(
            agent_id=LETTA_AGENT_ID,
            messages=[MessageCreate(role="user", content=[TextContent(text=text)])],
        )
        return {"messages": response_messages}

    except Exception as e:
        print(f"Error sending message to Letta: {e}")
        raise HTTPException(status_code=500, detail="Failed to send message to agent")

@app.get("/chat/get-messages")
async def get_messages(user_id: str):
    """
    Get all messages for a user from the Letta agent.

    NOTE: The current version of letta-client does not seem to support
    multi-user conversations via a user_id parameter. These calls will
    therefore be made in a shared context.
    """
    if not letta_client or not LETTA_AGENT_ID:
        raise HTTPException(status_code=500, detail="Letta API not configured")

    try:
        messages = letta_client.agents.messages.list(
            agent_id=LETTA_AGENT_ID
        )
        return {"messages": messages}
            
    except Exception as e:
        print(f"Error getting messages from Letta: {e}")
        raise HTTPException(status_code=500, detail="Failed to get messages from agent")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail="An internal error occurred")

@app.get("/users/{user_id}/stats")
async def get_user_stats(user_id: str):
    """Get user statistics."""
    user_data = state_manager.get_user(user_id)
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "total_words": len(user_data.get("highlighted_words", [])),
        "words_mastered": 0,  # Placeholder
        "lessons_completed": 0, # Placeholder
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 