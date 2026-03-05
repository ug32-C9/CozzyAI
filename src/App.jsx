import { useState, useEffect, useCallback, useRef } from 'react'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import InputArea from './components/InputArea'
import WelcomeScreen from './components/WelcomeScreen'
import ErrorBanner from './components/ErrorBanner'

export default function App() {
    const [conversations, setConversations] = useState(() => {
        const saved = localStorage.getItem('cozzy_chats')
        return saved ? JSON.parse(saved) : []
    })
    const [activeId, setActiveId] = useState(null)
    const [messages, setMessages] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const abortControllerRef = useRef(null)

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem('cozzy_chats', JSON.stringify(conversations))
    }, [conversations])

    const handleNewChat = useCallback(() => {
        setActiveId(null)
        setMessages([])
        setError(null)
        if (abortControllerRef.current) abortControllerRef.current.abort()
    }, [])

    const handleSelectConv = useCallback((id) => {
        const conv = conversations.find(c => c.id === id)
        if (conv) {
            setActiveId(id)
            setMessages(conv.messages)
            setError(null)
        }
    }, [conversations])

    const handleDeleteConv = useCallback((id) => {
        setConversations(prev => prev.filter(c => c.id !== id))
        if (activeId === id) handleNewChat()
    }, [activeId, handleNewChat])

    const handleSend = async (text) => {
        if (!text.trim() || isLoading) return
        setIsLoading(true)
        setError(null)

        const userMsg = { role: 'user', content: text, id: Date.now().toString() }
        const newMessages = [...messages, userMsg]
        setMessages(newMessages)

        const aiMsgId = (Date.now() + 1).toString()
        const aiPlaceholder = { role: 'assistant', content: '', thinking: '', isStreaming: true, id: aiMsgId }
        setMessages(prev => [...prev, aiPlaceholder])

        try {
            abortControllerRef.current = new AbortController()
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: newMessages.map(({ role, content }) => ({ role, content })) }),
                signal: abortControllerRef.current.signal
            })

            if (!response.ok) throw new Error('Failed to connect to AI')

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let finalContent = ''
            let finalThinking = ''
            let buffer = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                buffer += decoder.decode(value, { stream: true })
                const lines = buffer.split('\n')
                buffer = lines.pop()

                for (const line of lines) {
                    const trimmed = line.trim()
                    if (!trimmed.startsWith('data:')) continue
                    const raw = trimmed.replace(/^data:\s*/, '').trim()
                    if (raw === '[DONE]') continue

                    try {
                        const data = JSON.parse(raw)
                        if (data.content !== undefined) finalContent += data.content
                        if (data.thinking !== undefined) finalThinking += data.thinking

                        setMessages(prev => prev.map(m =>
                            m.id === aiMsgId ? { ...m, content: finalContent, thinking: finalThinking } : m
                        ))
                    } catch (e) { /* skip partial lines */ }
                }
            }

            // Finalize message and update/create conversation
            setMessages(prev => prev.map(m =>
                m.id === aiMsgId ? { ...m, isStreaming: false, content: finalContent, thinking: finalThinking } : m
            ))

            const updatedMessages = [...newMessages, { role: 'assistant', content: finalContent, thinking: finalThinking, id: aiMsgId }]

            setConversations(prev => {
                if (!activeId) {
                    const id = Date.now().toString()
                    setActiveId(id)
                    return [{ id, title: text.slice(0, 50), messages: updatedMessages, updatedAt: new Date().toISOString() }, ...prev]
                } else {
                    return prev.map(c => c.id === activeId ? { ...c, messages: updatedMessages, updatedAt: new Date().toISOString() } : c)
                }
            })

        } catch (err) {
            if (err.name !== 'AbortError') setError(err.message)
            setMessages(prev => prev.filter(m => m.id !== aiMsgId))
        } finally {
            setIsLoading(false)
            abortControllerRef.current = null
        }
    }

    const handleStop = () => {
        if (abortControllerRef.current) abortControllerRef.current.abort()
    }

    return (
        <div className="app-shell">
            <Sidebar
                conversations={conversations}
                activeId={activeId}
                onSelect={handleSelectConv}
                onDelete={handleDeleteConv}
                onNewChat={handleNewChat}
            />
            <main className="main-area">
                {messages.length === 0 ? (
                    <WelcomeScreen onSuggestion={handleSend} />
                ) : (
                    <ChatWindow messages={messages} />
                )}

                <div className="input-section">
                    <ErrorBanner error={error} />
                    <InputArea
                        onSend={handleSend}
                        onStop={handleStop}
                        isLoading={isLoading}
                    />
                </div>
            </main>
        </div>
    )
}
