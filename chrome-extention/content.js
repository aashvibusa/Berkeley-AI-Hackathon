// Function to send highlighted text to the server
async function sendHighlightToServer(highlightedText) {
    try {
        const response = await fetch('http://localhost:8000/highlight', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                highlight: highlightedText
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Successfully sent to server:', result);
        } else {
            console.error('Failed to send to server:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Error sending to server:', error);
    }
}

// Listen for text selection events
document.addEventListener('mouseup', function() {
    const selectedText = window.getSelection().toString().trim();
    
    if (selectedText) {
        console.log('Selected text:', selectedText);
        console.log('Selection length:', selectedText.length);
        console.log('Current URL:', window.location.href);
        console.log('---');
        
        // Send to server
        sendHighlightToServer(selectedText);
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
                
                // Send to server
                sendHighlightToServer(selectedText);
            }
        }, 100); // Small delay to ensure selection is complete
    }
});

console.log('Text Selection Logger extension loaded!'); 