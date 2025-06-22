# Text Selection Logger Chrome Extension

A Chrome extension that logs highlighted text to the browser console and sends it to a FastAPI server.

## Features

- Detects text selection via mouse
- Detects text selection via keyboard (Ctrl+A/Cmd+A)
- Logs selected text, selection length, and current URL to console
- Sends highlighted text to FastAPI server at localhost:8000/highlight
- Works on all websites

## Prerequisites

Make sure the FastAPI server is running at `http://localhost:8000`. See the `server/` directory for setup instructions.

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select the `chrome-extention` folder
5. The extension should now appear in your extensions list

## Usage

1. After installation, the extension will automatically work on all websites
2. Highlight any text on a webpage using your mouse or keyboard
3. The extension will:
   - Log the selection to the browser console
   - Send the highlighted text to the FastAPI server
4. Open the browser console (F12 or right-click → Inspect → Console) to see:
   - The selected text
   - Length of the selection
   - Current URL
   - Server response status
   - A separator line

## Server Integration

The extension sends POST requests to `http://localhost:8000/highlight` with the following JSON structure:
```json
{
    "highlight": "Your highlighted text here"
}
```

The server will print the received text to its console and return a success response.

## Files

- `manifest.json` - Extension configuration with host permissions
- `content.js` - Script that runs on web pages to detect text selection and send to server
- `README.md` - This file

## Testing

1. Start the FastAPI server (see `server/README.md`)
2. Go to any website (e.g., google.com)
3. Open the browser console
4. Highlight some text on the page
5. Check both the browser console and server console for the logged information

## Troubleshooting

- Make sure Developer mode is enabled in Chrome extensions
- Ensure the FastAPI server is running at localhost:8000
- If the extension doesn't work, try refreshing the page
- Check that the extension is enabled in the extensions list
- Check browser console for any error messages related to server communication 