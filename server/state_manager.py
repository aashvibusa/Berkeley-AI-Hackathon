import json
import os
from typing import Dict, List, Optional

class StateManager:
    def __init__(self, store_file: str = "store.json"):
        self.store_file = store_file
        self.store = self.load_store()
    
    def load_store(self) -> Dict:
        """Load the store from JSON file."""
        try:
            if os.path.exists(self.store_file):
                with open(self.store_file, 'r', encoding='utf-8') as f:
                    store = json.load(f)
                    print(f"Store loaded from {self.store_file}")
                    return store
            else:
                # Create initial store structure
                initial_store = {"users": {}}
                self.save_store(initial_store)
                print(f"Created new store file: {self.store_file}")
                return initial_store
        except Exception as e:
            print(f"Error loading store: {e}")
            # Return default structure if loading fails
            return {"users": {}}
    
    def save_store(self, store: Optional[Dict] = None) -> bool:
        """Save the store to JSON file."""
        try:
            store_to_save = store if store is not None else self.store
            with open(self.store_file, 'w', encoding='utf-8') as f:
                json.dump(store_to_save, f, indent=2, ensure_ascii=False)
            print(f"Store saved to {self.store_file}")
            return True
        except Exception as e:
            print(f"Error saving store: {e}")
            return False
    
    def get_user(self, user_id: str) -> Dict:
        """Get user data, create if doesn't exist."""
        if user_id not in self.store["users"]:
            self.store["users"][user_id] = {
                "source_language": "auto",
                "target_language": "Spanish",
                "highlighted_words": []
            }
            self.save_store()
        return self.store["users"][user_id]
    
    def update_user_languages(self, user_id: str, source_language: str = None, target_language: str = None) -> bool:
        """Update user's language preferences."""
        try:
            user = self.get_user(user_id)
            if source_language:
                user["source_language"] = source_language
            if target_language:
                user["target_language"] = target_language
            self.save_store()
            return True
        except Exception as e:
            print(f"Error updating user languages: {e}")
            return False
    
    def add_highlighted_word(self, user_id: str, word: str) -> bool:
        """Add a highlighted word to user's list."""
        try:
            user = self.get_user(user_id)
            if word not in user["highlighted_words"]:
                user["highlighted_words"].append(word)
                self.save_store()
                print(f"Added word '{word}' for user {user_id}")
            return True
        except Exception as e:
            print(f"Error adding highlighted word: {e}")
            return False
    
    def get_highlighted_words(self, user_id: str) -> List[str]:
        """Get user's highlighted words list."""
        user = self.get_user(user_id)
        return user["highlighted_words"]
    
    def remove_highlighted_word(self, user_id: str, word: str) -> bool:
        """Remove a highlighted word from user's list."""
        try:
            user = self.get_user(user_id)
            if word in user["highlighted_words"]:
                user["highlighted_words"].remove(word)
                self.save_store()
                print(f"Removed word '{word}' for user {user_id}")
            return True
        except Exception as e:
            print(f"Error removing highlighted word: {e}")
            return False
    
    def get_all_users(self) -> Dict:
        """Get all users data."""
        return self.store["users"]
    
    def delete_user(self, user_id: str) -> bool:
        """Delete a user and their data."""
        try:
            if user_id in self.store["users"]:
                del self.store["users"][user_id]
                self.save_store()
                print(f"Deleted user {user_id}")
            return True
        except Exception as e:
            print(f"Error deleting user: {e}")
            return False
    
    def get_store_stats(self) -> Dict:
        """Get statistics about the store."""
        total_users = len(self.store["users"])
        total_words = sum(len(user["highlighted_words"]) for user in self.store["users"].values())
        return {
            "total_users": total_users,
            "total_highlighted_words": total_words,
            "users": list(self.store["users"].keys())
        } 