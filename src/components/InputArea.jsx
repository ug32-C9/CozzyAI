import React, { useState, useRef, useEffect } from 'react'

export default function InputArea({ onSend, onStop, isLoading }) {
    const [text, setText] = useState('')
    const textareaRef = useRef(null)

    const handleInput = (e) => {
        setText(e.target.value)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleSend = () => {
        if (!text.trim() || isLoading) return
        onSend(text)
        setText('')
    }

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
        }
    }, [text])

    return (
        <div className="input-area">
            <div className="input-wrapper">
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    className="input-textarea"
                    placeholder="Ask CozzyAI…"
                    rows="1"
                    autoFocus
                />
                <div className="input-footer">
                    <span className="input-hint">Enter to send · Shift+Enter for newline</span>
                    <div className="input-actions">
                        {!isLoading ? (
                            <button
                                onClick={handleSend}
                                className="action-btn send-btn"
                                disabled={!text.trim()}
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 13V3M3 8l5-5 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        ) : (
                            <button onClick={onStop} className="action-btn stop-btn">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                                    <rect x="2" y="2" width="8" height="8" rx="1.5" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
