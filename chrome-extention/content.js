// Function to check if user is logged in
async function getCurrentUser() {
    try {
        const result = await chrome.storage.local.get(['currentUser']);
        return result.currentUser;
    } catch (error) {
        console.log('Error getting current user:', error);
        return null;
    }
}

// Function to translate text using the server
async function translateText(text) {
    try {
        // Get current user from Chrome storage
        const currentUser = await getCurrentUser();
        console.log('Current user for translation:', currentUser ? currentUser.user_id : 'None');
        
        const requestBody = {
            text: text,
            user_id: currentUser ? currentUser.user_id : null
        };
        
        console.log('Translation request:', requestBody);
        
        const response = await fetch('http://localhost:8000/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Translation successful:', result);
            console.log(`Translated from ${result.source_language} to ${result.target_language}`);
            return result.translated_text;
        } else {
            console.error('Translation failed:', response.status, response.statusText);
            return null;
        }
    } catch (error) {
        console.error('Error translating text:', error);
        return null;
    }
}

// Function to create and show popup animation
async function showHighlightPopup(selectedText) {
    // Remove any existing popups
    const existingPopup = document.querySelector('.highlight-popup');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // Get selection range to position the popup
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // Get current user for personalized feedback
    const currentUser = await getCurrentUser();
    
    // Create popup element
    const popup = document.createElement('div');
    popup.className = 'highlight-popup';
    
    // Create main text element (original text)
    const mainText = document.createElement('div');
    mainText.textContent = selectedText;
    mainText.style.cssText = `
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 4px;
    `;
    
    // Create translated text element (initially shows loading)
    const translatedText = document.createElement('div');
    translatedText.textContent = 'Translating...';
    translatedText.style.cssText = `
        font-size: 12px;
        font-weight: 400;
        color: #666;
        font-style: italic;
        margin-bottom: 4px;
    `;
    
    // Create tiny instruction text
    const instructionText = document.createElement('div');
    if (currentUser) {
        instructionText.textContent = `press shift to save word (${currentUser.user_id})`;
    } else {
        instructionText.textContent = 'press shift to save word (guest)';
    }
    instructionText.style.cssText = `
        font-size: 10px;
        font-weight: 400;
        opacity: 0.8;
        line-height: 1.2;
    `;
    
    // Add text elements to popup
    popup.appendChild(mainText);
    popup.appendChild(translatedText);
    popup.appendChild(instructionText);
    
    // Style the popup
    popup.style.cssText = `
        position: fixed;
        top: ${rect.top - 70}px;
        left: ${rect.left}px;
        background: linear-gradient(135deg,rgb(237, 189, 99) 0%,rgb(255, 255, 255) 100%);
        color: #333;
        padding: 10px 14px;
        border-radius: 5px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.3s ease-out;
        pointer-events: none;
        max-width: 300px;
        word-wrap: break-word;
        text-align: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    // Add to page
    document.body.appendChild(popup);
    
    // Trigger fade-in animation
    setTimeout(() => {
        popup.style.opacity = '1';
        popup.style.transform = 'translateY(0)';
    }, 10);
    
    // Store the selected text and popup reference for shift key handling
    window.currentHighlightData = {
        text: selectedText,
        popup: popup
    };
    
    // Get translation
    const translatedResult = await translateText(selectedText);
    if (translatedResult) {
        translatedText.textContent = translatedResult;
        translatedText.style.color = '#2c5aa0';
        translatedText.style.fontStyle = 'normal';
    } else {
        translatedText.textContent = 'Translation failed';
        translatedText.style.color = '#e74c3c';
    }
}

// Function to close popup with animation
function closePopup(popup) {
    if (popup && popup.parentNode) {
        popup.style.opacity = '0';
        popup.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            if (popup.parentNode) {
                popup.remove();
            }
        }, 300);
    }
    // Clear the stored data
    window.currentHighlightData = null;
}

// Function to send highlighted text to the server
async function sendHighlightToServer(highlightedText) {
    try {
        // Get current user from Chrome storage
        const currentUser = await getCurrentUser();
        console.log('Current user for highlight:', currentUser ? currentUser.user_id : 'Default');
        
        const requestBody = {
            highlight: highlightedText,
            user_id: currentUser ? currentUser.user_id : "chrome_extension_user"
        };
        
        console.log('Highlight request:', requestBody);
        
        const response = await fetch('http://localhost:8000/highlight', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Successfully sent to server:', result);
            
            // Log user data if available
            if (result.user_data) {
                console.log('User data updated:', {
                    source_language: result.user_data.source_language,
                    target_language: result.user_data.target_language,
                    word_count: result.user_data.highlighted_words ? result.user_data.highlighted_words.length : 0
                });
            }
            
            // Log Letta response if available
            if (result.letta_response) {
                console.log('Letta API response:', result.letta_response);
            }
        } else {
            console.error('Failed to send to server:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Error sending to server:', error);
    }
}

// Listen for shift key press to save the highlighted text
document.addEventListener('keydown', function(event) {
    console.log('Shift key pressed:', event.key);
    console.log('Current highlight data:', window.currentHighlightData);
    console.log(event.key === 'Shift' && window.currentHighlightData);
    if (event.key === 'Shift' && window.currentHighlightData) {
        console.log('Meta key pressed:', event.key);
        event.preventDefault();
        
        const { text, popup } = window.currentHighlightData;
        
        // Send to server
        sendHighlightToServer(text);
        
        // Close the popup
        closePopup(popup);
        
        console.log('Text saved via Shift key:', text);
    }
});

// Listen for text selection events
document.addEventListener('mouseup', function() {
    const selectedText = window.getSelection().toString().trim();
    
    if (selectedText) {
        console.log('Selected text:', selectedText);
        console.log('Selection length:', selectedText.length);
        console.log('Current URL:', window.location.href);
        console.log('---');
        
        // Show popup animation with translation
        showHighlightPopup(selectedText);
    }
});

// Also listen for keyboard selection (Ctrl+A, etc.)
document.addEventListener('keyup', function(event) {
    // Check if Ctrl+A or Cmd+A was pressed
    if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
        setTimeout(() => {
            const selectedText = window.getSelection().toString().trim();
            if (selectedText) {
                console.log('Selected text (keyboard):', selectedText);
                console.log('Selection length:', selectedText.length);
                console.log('Current URL:', window.location.href);
                console.log('---');
                
                // Show popup animation with translation
                showHighlightPopup(selectedText);
            }
        }, 100); // Small delay to ensure selection is complete
    }
});

console.log('Text Selection Logger extension loaded!'); 