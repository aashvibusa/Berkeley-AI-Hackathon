export const API_URL = "http://localhost:8000";

export const api = {
  login: async (username, password) => {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to login');
    }
    return response.json();
  },
  signup: async (username, password) => {
    const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to sign up');
    }
    return response.json();
  },
  getStats: async (userId) => {
    const response = await fetch(`${API_URL}/users/${userId}/stats`);
    if (!response.ok) throw new Error('Failed to get stats');
    return response.json();
  },
  setPreferences: async (userId, preferences) => {
    const response = await fetch(`${API_URL}/users/set-preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, preferences }),
    });
    if (!response.ok) throw new Error('Failed to set preferences');
    return response.json();
  },
  getMessages: async (userId) => {
    const response = await fetch(`${API_URL}/chat/get-messages?user_id=${userId}`);
    if (!response.ok) throw new Error('Failed to get messages');
    const data = await response.json();
    return data.messages;
  },
  sendMessage: async (userId, text) => {
    const response = await fetch(`${API_URL}/chat/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, text }),
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  },
};

export default api; 