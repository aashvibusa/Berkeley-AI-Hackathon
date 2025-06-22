import os
from dotenv import load_dotenv

def load_environment_variables():
    """
    Load environment variables from a .env file.
    This function will load all variables from .env into the environment.
    """
    # Load environment variables from .env file
    load_dotenv()
    
    # Example: Access environment variables
    letta_api_key = os.getenv("LETTA_API_KEY")
    letta_agent_id = os.getenv("LETTA_AGENT_ID")
    
    # Print loaded variables (be careful with sensitive data in production)
    print("Environment variables loaded:")
    print(f"LETTA_API_KEY: {'***' if letta_api_key else 'Not set'}")
    print(f"LETTA_AGENT_ID: {letta_agent_id or 'Not set'}")
    
    return {
        "LETTA_API_KEY": letta_api_key,
        "LETTA_AGENT_ID": letta_agent_id
    }

def load_env_with_validation():
    """
    Load environment variables and validate that required ones are present.
    """
    # Load the .env file
    load_dotenv()
    
    # Define required environment variables
    required_vars = ["LETTA_API_KEY", "LETTA_AGENT_ID"]
    missing_vars = []
    
    # Check if all required variables are present
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"Error: Missing required environment variables: {missing_vars}")
        print("Please check your .env file and ensure all required variables are set.")
        return False
    
    print("All required environment variables are loaded successfully!")
    return True

def load_env_with_defaults():
    """
    Load environment variables with default values for optional ones.
    """
    # Load the .env file
    load_dotenv()
    
    # Load with defaults
    config = {
        "LETTA_API_KEY": os.getenv("LETTA_API_KEY"),
        "LETTA_AGENT_ID": os.getenv("LETTA_AGENT_ID"),
        "DEBUG": os.getenv("DEBUG", "False").lower() == "true",  # Default to False
        "PORT": int(os.getenv("PORT", "8000")),  # Default to 8000
        "HOST": os.getenv("HOST", "0.0.0.0")  # Default to 0.0.0.0
    }
    
    print("Configuration loaded:")
    for key, value in config.items():
        if key == "LETTA_API_KEY" and value:
            print(f"{key}: ***")
        else:
            print(f"{key}: {value}")
    
    return config

if __name__ == "__main__":
    print("=== Basic Environment Loading ===")
    load_environment_variables()
    
    print("\n=== Environment Validation ===")
    load_env_with_validation()
    
    print("\n=== Environment with Defaults ===")
    load_env_with_defaults() 