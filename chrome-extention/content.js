// Function to create and show popup animation
function showHighlightPopup(selectedText) {
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
    
    // Create popup element
    const popup = document.createElement('div');
    popup.className = 'highlight-popup';
    
    // Create main text element
    const mainText = document.createElement('div');
    mainText.textContent = selectedText;
    mainText.style.cssText = `
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 2px;
    `;
    
    // Create tiny instruction text
    const instructionText = document.createElement('div');
    instructionText.textContent = 'press shift to save word';
    instructionText.style.cssText = `
        font-size: 10px;
        font-weight: 400;
        opacity: 0.8;
        line-height: 1.2;
    `;
    
    // Add text elements to popup
    popup.appendChild(mainText);
    popup.appendChild(instructionText);
    
    // Style the popup
    popup.style.cssText = `
        position: fixed;
        top: ${rect.top - 50}px;
        left: ${rect.left}px;
        background: linear-gradient(135deg,rgb(237, 189, 99) 0%,rgb(255, 255, 255) 100%);
        color: #333;
        padding: 8px 12px;
        border-radius: 20px;
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
        const response = await fetch('http://localhost:8000/highlight', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                highlight: highlightedText,
                user_id: "chrome_extension_user"
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Successfully sent to server:', result);
            
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
    if (event.metaKey && window.currentHighlightData) {
        console.log('Meta key pressed:', event.metaKey);
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
        
        // Show popup animation (but don't send to server yet)
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
                
                // Show popup animation (but don't send to server yet)
                showHighlightPopup(selectedText);
            }
        }, 100); // Small delay to ensure selection is complete
    }
});

console.log('Text Selection Logger extension loaded!'); 