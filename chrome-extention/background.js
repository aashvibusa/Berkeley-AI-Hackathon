// // Background script for audio capture and WebSocket communication
// let audioStream = null;
// let mediaRecorder = null;
// let websocket = null;
// let isListening = false;

// // Handle messages from popup
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.action === 'toggleListening') {
//         if (request.enabled) {
//             startListening();
//         } else {
//             stopListening();
//         }
//         sendResponse({ success: true });
//     }
//     return true;
// });

// // Handle messages from content script
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.action === 'audioStreamReady') {
//         console.log('Audio stream ready from content script');
//         // The content script will handle the WebSocket connection
//     }
//     return true;
// });

// // Start audio listening
// async function startListening() {
//     try {
//         // Get the active tab
//         const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
//         if (!tab) {
//             console.error('No active tab found');
//             return;
//         }

//         console.log('Attempting to capture audio from tab:', tab.id);

//         // Capture tab audio using the callback-based API
//         const streamId = await new Promise((resolve, reject) => {
//             chrome.tabCapture.capture({
//                 audio: true,
//                 video: false
//             }, (streamId) => {
//                 if (chrome.runtime.lastError) {
//                     reject(new Error(chrome.runtime.lastError.message));
//                 } else {
//                     resolve(streamId);
//                 }
//             });
//         });

//         if (!streamId) {
//             throw new Error('Failed to get stream ID');
//         }

//         console.log('Got stream ID:', streamId);

//         // Get the stream from the stream ID
//         audioStream = await navigator.mediaDevices.getUserMedia({
//             audio: {
//                 mandatory: {
//                     chromeMediaSource: 'tab',
//                     chromeMediaSourceId: streamId
//                 }
//             }
//         });

//         if (!audioStream) {
//             throw new Error('Failed to get audio stream');
//         }

//         console.log('Audio stream obtained successfully');

//         // Create MediaRecorder
//         mediaRecorder = new MediaRecorder(audioStream, {
//             mimeType: 'audio/webm;codecs=opus'
//         });

//         // Connect to WebSocket
//         websocket = new WebSocket('ws://localhost:8000/ws/audio');
        
//         websocket.onopen = () => {
//             console.log('WebSocket connected');
//             isListening = true;
            
//             // Start recording
//             mediaRecorder.start(1000); // Send chunks every second
            
//             // Notify popup that listening has started
//             chrome.runtime.sendMessage({
//                 action: 'listeningStatusChanged',
//                 isListening: true
//             });
//         };

//         websocket.onerror = (error) => {
//             console.error('WebSocket error:', error);
//             stopListening();
//         };

//         websocket.onclose = () => {
//             console.log('WebSocket closed');
//             stopListening();
//         };

//         // Handle audio data
//         mediaRecorder.ondataavailable = (event) => {
//             if (websocket && websocket.readyState === WebSocket.OPEN) {
//                 // Convert blob to array buffer and send
//                 event.data.arrayBuffer().then(buffer => {
//                     websocket.send(buffer);
//                 });
//             }
//         };

//     } catch (error) {
//         console.error('Error starting audio listening:', error);
//         stopListening();
//     }
// }

// // Stop audio listening
// function stopListening() {
//     isListening = false;
    
//     // Stop media recorder
//     if (mediaRecorder && mediaRecorder.state !== 'inactive') {
//         mediaRecorder.stop();
//     }
    
//     // Close WebSocket
//     if (websocket) {
//         websocket.close();
//         websocket = null;
//     }
    
//     // Stop audio stream
//     if (audioStream) {
//         audioStream.getTracks().forEach(track => track.stop());
//         audioStream = null;
//     }
    
//     // Notify popup that listening has stopped
//     chrome.runtime.sendMessage({
//         action: 'listeningStatusChanged',
//         isListening: false
//     });
    
//     console.log('Audio listening stopped');
// }

// // Handle extension installation
// chrome.runtime.onInstalled.addListener(() => {
//     console.log('Glossa extension installed');
// }); 

chrome.action.onClicked.addListener((tab) => {
    chrome.tabCapture.capture(
      {
        audio: true,
        video: false
      },
      (stream) => {
        if (chrome.runtime.lastError) {
          console.error("Error capturing tab:", chrome.runtime.lastError.message);
          return;
        }
        console.log("Audio stream captured!", stream);
  
        // Example: connect to Web Audio API for visualization/processing
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
  
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
  
        console.log("Audio connected to Web Audio API");
      }
    );
  });
  