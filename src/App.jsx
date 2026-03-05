import React, { useState, useEffect, useRef, useCallback } from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import './App.css';

import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import InputArea from './components/InputArea';
import ErrorBanner from './components/ErrorBanner';

const SUGGESTIONS = [
    { icon: '🔍', title: 'Reverse Engineering', prompt: 'Help me understand x64 assembly code for a decryption loop.' },
    { icon: '🎓', title: 'Academic Research', prompt: 'Explain the concept of quantum entanglement in simple terms.' },
    { icon: '💻', title: 'Vibe Coding', prompt: 'Create a beautiful login page using HTML and CSS with glassmorphism.' },
    { icon: '🎨', title: 'Creative Planning', prompt: 'Plan a 5-day road trip through Switzerland for a photographer.' },
];

marked.setOptions({
    breaks: true,
    gfm: true,
    highlight: (code, lang) => {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
    }
});

const renderer = new marked.Renderer();
renderer.code = ({ text, lang }) => {
    const language = lang || 'text';
    const highlighted = hljs.getLanguage(language)
        ? hljs.highlight(text, { language }).value
        : hljs.highlightAuto(text).value;
    return `<pre><div class="code-header"><span class="code-lang">${language}</span><button class="copy-btn" data-code="${encodeURIComponent(text)}">Copy</button></div><code class="hljs language-${language}">${highlighted}</code></pre>`;
};
marked.use({ renderer });

function App() {
    const [conversations, setConversations] = useState(() => {
        return JSON.parse(localStorage.getItem('cozzy_chats') || '[]');
    });
    const [activeId, setActiveId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const abortControllerRef = useRef(null);
    const messagesEndRef = useRef(null);

    const activeConversation = conversations.find(c => c.id === activeId);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const saveToLocalStorage = useCallback((newConversations) => {
        localStorage.setItem('cozzy_chats', JSON.stringify(newConversations));
        setConversations(newConversations);
    }, []);

    const createNewChat = () => {
        setActiveId(null);
        setMessages([]);
        setError(null);
    };

    const loadConversation = (id) => {
        const conv = conversations.find(c => c.id === id);
        if (conv) {
            setActiveId(id);
            setMessages([...conv.messages]);
            setError(null);
        }
    };

    const deleteConversation = (id) => {
        const newConversations = conversations.filter(c => c.id !== id);
        saveToLocalStorage(newConversations);
        if (activeId === id) {
            createNewChat();
        }
    };

    const sendMessage = async (overrideText) => {
        const text = overrideText || document.getElementById('chat-textarea').value.trim();
        if (!text || isLoading) return;

        // Clear input
        const textarea = document.getElementById('chat-textarea');
        if (textarea) textarea.value = '';

        setIsLoading(true);
        setError(null);

        // Hide welcome, show chat
        const newUserMsg = { role: 'user', content: text };
        const updatedMessages = [...messages, newUserMsg];
        setMessages(updatedMessages);

        const aiId = Date.now().toString();
        const aiMsg = { id: aiId, role: 'assistant', content: '', thinking: '', streaming: true };
        const messagesWithAi = [...updatedMessages, aiMsg];
        setMessages(messagesWithAi);

        try {
            abortControllerRef.current = new AbortController();

            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: updatedMessages }),
                signal: abortControllerRef.current.signal
            });

            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let content = '', thinking = '', buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop();

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed.startsWith('data:')) continue;

                    const raw = trimmed.replace(/^data:\s*/, '').trim();
                    if (raw === '[DONE]') continue;

                    try {
                        const delta = JSON.parse(raw);
                        if (delta.content) content += delta.content;
                        if (delta.thinking) thinking += delta.thinking;

                        setMessages(prev => {
                            const newMessages = [...prev];
                            const lastMsg = newMessages[newMessages.length - 1];
                            if (lastMsg && lastMsg.id === aiId) {
                                lastMsg.content = content;
                                lastMsg.thinking = thinking;
                                lastMsg.streaming = true;
                            }
                            return newMessages;
                        });
                    } catch { }
                }
            }

            // Final update
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMsg = newMessages[newMessages.length - 1];
                if (lastMsg && lastMsg.id === aiId) {
                    lastMsg.content = content;
                    lastMsg.thinking = thinking;
                    lastMsg.streaming = false;
                }
                return newMessages;
            });

            // Save conversation
            const finalMessages = [...updatedMessages, { role: 'assistant', content, thinking }];

            if (!activeId) {
                const newId = Date.now().toString();
                const newConv = {
                    id: newId,
                    title: text.slice(0, 40),
                    messages: finalMessages,
                    updatedAt: new Date().toISOString()
                };
                const newConversations = [newConv, ...conversations];
                saveToLocalStorage(newConversations);
                setActiveId(newId);
            } else {
                const newConversations = conversations.map(c =>
                    c.id === activeId
                        ? { ...c, messages: finalMessages, updatedAt: new Date().toISOString() }
                        : c
                );
                saveToLocalStorage(newConversations);
            }

        } catch (e) {
            if (e.name !== 'AbortError') {
                setError(e.message);
            }
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };

    const stopGeneration = () => {
        abortControllerRef.current?.abort();
    };

    const copyCode = (btn) => {
        navigator.clipboard.writeText(decodeURIComponent(btn.dataset.code)).then(() => {
            btn.textContent = 'Copied!';
            setTimeout(() => btn.textContent = 'Copy', 2000);
        });
    };

    const toggleThinking = (header) => {
        const content = header.nextElementSibling;
        const chevron = header.querySelector('.thinking-chevron');
        if (content) {
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
            chevron?.classList.toggle('open');
        }
    };

    return (
        <div className="app-shell">
            <Sidebar
                conversations={conversations}
                activeId={activeId}
                onNewChat={createNewChat}
                onLoadConversation={loadConversation}
                onDeleteConversation={deleteConversation}
            />
            <main className="main-area">
                <ChatWindow
                    messages={messages}
                    suggestions={SUGGESTIONS}
                    onSuggestionClick={sendMessage}
                    showWelcome={messages.length === 0}
                    messagesEndRef={messagesEndRef}
                    onCopyCode={copyCode}
                    onToggleThinking={toggleThinking}
                />
                <ErrorBanner error={error} />
                <InputArea
                    onSend={sendMessage}
                    onStop={stopGeneration}
                    isLoading={isLoading}
                />
            </main>
        </div>
    );
}

export default App;