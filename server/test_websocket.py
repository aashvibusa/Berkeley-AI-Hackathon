#!/usr/bin/env python3
"""
Test script for WebSocket audio endpoint
"""
import asyncio
import websockets
import wave
import numpy as np
import io

async def test_websocket():
    """Test the WebSocket audio endpoint"""
    uri = "ws://localhost:8000/ws/audio"
    
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected to WebSocket")
            
            # Create a simple test audio signal (1 second of 440Hz sine wave)
            sample_rate = 16000
            duration = 1.0
            frequency = 440.0
            
            t = np.linspace(0, duration, int(sample_rate * duration), False)
            audio_signal = np.sin(2 * np.pi * frequency * t)
            
            # Convert to 16-bit PCM
            audio_data = (audio_signal * 32767).astype(np.int16)
            
            # Create a simple WAV file in memory
            with io.BytesIO() as wav_buffer:
                with wave.open(wav_buffer, 'wb') as wav_file:
                    wav_file.setnchannels(1)
                    wav_file.setsampwidth(2)
                    wav_file.setframerate(sample_rate)
                    wav_file.writeframes(audio_data.tobytes())
                
                # Send the audio data
                await websocket.send(wav_buffer.getvalue())
                print("Sent test audio data")
            
            # Wait for response
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                print(f"Received response: {response}")
            except asyncio.TimeoutError:
                print("No response received within 10 seconds")
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_websocket()) 