import React, { useEffect, useRef } from 'react'
import Message from './Message'

export default function ChatWindow({ messages }) {
    const scrollRef = useRef(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    return (
        <div className="chat-window" ref={scrollRef}>
            <div className="messages-container">
                {messages.map((m) => (
                    <Message key={m.id} message={m} />
                ))}
            </div>
        </div>
    )
}
