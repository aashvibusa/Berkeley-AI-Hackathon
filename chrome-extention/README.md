# Glossa - Language Learning Chrome Extension

A comprehensive Chrome extension for language learning that combines text highlighting, translation, user authentication, and personalized language preferences.

## Features

- **Text Highlighting**: Detect and save highlighted text from any webpage
- **Real-time Translation**: Automatic translation to target language using Groq API
- **User Authentication**: Secure login/register system with password hashing
- **Language Preferences**: Customizable source and target languages with country flags
- **Persistent Storage**: User data and preferences saved locally and on server
- **Modern UI**: Beautiful orange and white design with smooth animations
- **Statistics**: Track saved words and learning progress
- **Works on all websites**

## Prerequisites

Make sure the FastAPI server is running at `http://localhost:8000` with all endpoints including user authentication. See the `server/` directory for setup instructions.

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select the `chrome-extention` folder
5. The extension should now appear in your extensions list

## Usage

### Initial Setup
1. **Click the Glossa extension icon** in your browser toolbar
2. **Watch the loading animation** with the Glossa branding
3. **Create an account** or sign in with existing credentials
4. **Set your language preferences** using the country flag selectors

### Text Highlighting
1. **Highlight any text** on any webpage using your mouse or keyboard
2. **Watch the popup appear** with original text and translation
3. **Press Shift** to save the word to your vocabulary
4. **Check your progress** in the extension popup

### Language Management
1. **Open the extension popup**
2. **Select source language** (language you're reading)
3. **Select target language** (language you're learning)
4. **Save settings** to update your preferences
5. **View your statistics** including saved word count

## Popup Features

### Loading Screen
- **Branded animation** with "Glossa" title
- **Smooth fade-in** with tagline
- **2-second display** before showing login/dashboard

### Authentication
- **Login screen** with user ID and password
- **Registration screen** with password confirmation
- **Password hashing** using SHA-256 for security
- **Persistent login** using Chrome storage
- **Form validation** and error handling

### Dashboard
- **Welcome message** with user ID
- **Statistics card** showing saved word count
- **Language selectors** with country flags
- **Settings management** with save/logout options

### Language Selection
- **6 supported languages**: English, Spanish, French, German, Italian, Portuguese
- **Country flag icons** for visual identification
- **Dropdown interface** with smooth animations
- **Real-time updates** when selections change

## User Flow

1. **First Time**: Create account → Set languages → Start highlighting
2. **Returning User**: Sign in → View stats → Adjust settings → Continue learning
3. **Text Interaction**: Highlight → See translation → Press Shift to save
4. **Progress Tracking**: Check popup for word count and statistics

## Technical Features

### Security
- **Password hashing** using Web Crypto API (SHA-256)
- **Secure storage** in Chrome's local storage
- **Server-side validation** for all requests
- **CORS protection** for cross-origin requests

### State Management
- **Chrome storage** for local user session
- **Server persistence** for user data and preferences
- **Real-time synchronization** between extension and server
- **Automatic data loading** on popup open

### UI/UX
- **Modern design** with orange and white color scheme
- **Smooth animations** for all interactions
- **Responsive layout** that adapts to content
- **Intuitive navigation** between screens
- **Visual feedback** for all actions

## Server Integration

The extension communicates with the FastAPI server for:
- **User authentication** (login/register)
- **Language preferences** (source/target languages)
- **Word storage** (highlighted vocabulary)
- **Statistics** (word counts and progress)

### API Endpoints Used
- `POST /users/register` - Create new account
- `POST /users/login` - Authenticate user
- `GET /users/{user_id}` - Get user data
- `POST /users/languages` - Update language preferences
- `POST /highlight` - Save highlighted words
- `POST /translate` - Translate text

## Files

- `manifest.json` - Extension configuration with popup and permissions
- `popup.html` - Main popup interface with all screens
- `popup.css` - Modern styling with orange/white theme
- `popup.js` - Interactive functionality and API communication
- `content.js` - Text highlighting and translation on web pages
- `README.md` - This file

## Testing

1. **Start the FastAPI server** (see `server/README.md`)
2. **Load the extension** in Chrome
3. **Click the extension icon** to open popup
4. **Create an account** or sign in
5. **Set language preferences** using the dropdowns
6. **Highlight text** on any website
7. **Press Shift** to save words
8. **Check progress** in the popup dashboard

## Troubleshooting

- **Popup not opening**: Check extension is enabled and reload if needed
- **Login fails**: Verify server is running and check console for errors
- **Translation not working**: Ensure Groq API key is configured on server
- **Language not saving**: Check network connection and server logs
- **Words not counting**: Verify user is logged in and server is accessible

## Security Notes

- Passwords are hashed using SHA-256 before transmission
- User sessions are stored locally in Chrome storage
- All API communication uses HTTPS (localhost)
- No sensitive data is logged or stored in plain text
- Server validates all user inputs and permissions

## Future Enhancements

- **More languages** support
- **Word categories** and tags
- **Learning progress** tracking
- **Export vocabulary** functionality
- **Offline mode** for basic features
- **Social features** for sharing progress 