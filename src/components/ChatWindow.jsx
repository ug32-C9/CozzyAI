import React, { useEffect } from 'react';
import Message from './Message';

const ChatWindow = ({
    messages,
    suggestions,
    onSuggestionClick,
    showWelcome,
    messagesEndRef,
    onCopyCode,
    onToggleThinking
}) => {

    useEffect(() => {
        // Handle copy buttons and thinking toggles via event delegation
        const handleClick = (e) => {
            const copyBtn = e.target.closest('.copy-btn');
            if (copyBtn) {
                onCopyCode(copyBtn);
                return;
            }

            const thinkingHeader = e.target.closest('.thinking-header');
            if (thinkingHeader) {
                onToggleThinking(thinkingHeader);
            }
        };

        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [onCopyCode, onToggleThinking]);

    if (showWelcome) {
        return (
            <div className="chat-window">
                <div className="welcome-screen">
                    <div className="welcome-hero">
                        <div className="welcome-logo">🔥</div>
                        <h1 className="welcome-title">How can I help you?</h1>
                        <p className="welcome-subtitle">Smart. Fast. Cozy. Your AI friend.</p>
                    </div>
                    <div className="welcome-cards">
                        {suggestions.map((s, idx) => (
                            <button
                                key={idx}
                                className="welcome-card"
                                onClick={() => onSuggestionClick(s.prompt)}
                            >
                                <span className="card-icon">{s.icon}</span>
                                <div className="card-title">{s.title}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-window">
            <div className="messages-container">
                {messages.map((msg, idx) => (
                    <Message key={idx} message={msg} />
                ))}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};

export default ChatWindow;