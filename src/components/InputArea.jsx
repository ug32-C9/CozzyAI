import React, { useRef, useEffect } from 'react';

const InputArea = ({ onSend, onStop, isLoading }) => {
    const textareaRef = useRef(null);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const handleInput = () => {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!isLoading) onSend();
            }
        };

        textarea.addEventListener('input', handleInput);
        textarea.addEventListener('keydown', handleKeyDown);

        return () => {
            textarea.removeEventListener('input', handleInput);
            textarea.removeEventListener('keydown', handleKeyDown);
        };
    }, [onSend, isLoading]);

    return (
        <div className="input-area">
            <div className="input-wrapper">
                <textarea
                    ref={textareaRef}
                    id="chat-textarea"
                    className="input-textarea"
                    placeholder="Message CozzyAI…"
                    rows="1"
                    disabled={isLoading}
                />
                <div className="input-footer">
                    <span className="input-hint">Enter to send · Shift+Enter for newline</span>
                    <div className="input-actions">
                        {!isLoading ? (
                            <button
                                id="send-btn"
                                className="send-btn"
                                onClick={() => onSend()}
                                disabled={!textareaRef.current?.value.trim()}
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 13V3M3 8l5-5 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        ) : (
                            <button id="stop-btn" className="stop-btn" onClick={onStop}>
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                                    <rect x="2" y="2" width="8" height="8" rx="1.5" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InputArea;