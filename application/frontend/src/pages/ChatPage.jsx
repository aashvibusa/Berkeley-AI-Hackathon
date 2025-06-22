import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import './ChatPage.css';

const ChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { chatId } = useParams();
    const chatWindowRef = useRef(null);

    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    // Function to render message content
    const renderMessageContent = (content) => {
        if (typeof content === 'string') {
            return <p>{content}</p>;
        }
        if (Array.isArray(content) && content.length > 0 && content[0].type === 'text') {
            return content[0].text;
        }
        return JSON.stringify(content);
    };

    const handleSend = async () => {
        if (input.trim() && !isLoading) {
            const userMessage = { role: 'user', content: input };
            setMessages(prevMessages => [...prevMessages, userMessage]);
            setInput('');
            setIsLoading(true);

            try {
                const response = await api.sendMessage(chatId, input);
                console.log(response);
                const agentMessage = { role: 'agent', content: response.messages.messages[1].content };
                setMessages(prevMessages => [...prevMessages, agentMessage]);
            } catch (error) {
                console.error('Failed to send message:', error);
                const errorMessage = { role: 'agent', content: 'Sorry, I encountered an error. Please try again.' };
                setMessages(prevMessages => [...prevMessages, userMessage, errorMessage]);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="chat-page-container">
            <header className="chat-header">
                <h1>Chat with your Spanish Tutor</h1>
            </header>
            <div className="chat-window" ref={chatWindowRef}>
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.role}`}>
                        {renderMessageContent(message.content)}
                    </div>
                ))}
                {isLoading && <div className="loading-indicator">Tutor is typing...</div>}
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                    disabled={isLoading}
                />
                <button onClick={handleSend} disabled={isLoading}>
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatPage;