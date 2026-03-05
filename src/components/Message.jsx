import React, { useState, useMemo } from 'react'
import { marked } from 'marked'
import hljs from 'highlight.js'

// Configure marked
marked.setOptions({
    breaks: true,
    gfm: true,
    highlight: (code, lang) => {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
    }
});

const renderer = new marked.Renderer();
renderer.code = (token) => {
    const { text, lang } = token;
    const language = lang || 'text';
    const highlighted = hljs.getLanguage(language)
        ? hljs.highlight(text, { language }).value
        : hljs.highlightAuto(text).value;
    return `
    <pre><div class="code-header"><span class="code-lang">${language}</span><button class="copy-btn">Copy</button></div><code class="hljs language-${language}">${highlighted}</code></pre>
  `;
};
marked.use({ renderer });

export default function Message({ message }) {
    const { role, content, thinking, isStreaming } = message
    const [isThinkingOpen, setIsThinkingOpen] = useState(false)

    const html = useMemo(() => {
        if (!content) return ''
        return marked.parse(content)
    }, [content])

    return (
        <div className={`message ${role}`}>
            <div className={`avatar ${role === 'user' ? 'user' : 'ai'}`}>
                {role === 'user' ? 'U' : '🔥'}
            </div>
            <div className="message-body">
                {thinking && (
                    <div className="thinking-block">
                        <div
                            className="thinking-header"
                            onClick={() => setIsThinkingOpen(!isThinkingOpen)}
                        >
                            <span>💭</span>
                            <span>Thinking</span>
                            <span className={`thinking-chevron ${isThinkingOpen ? 'open' : ''}`}>▶</span>
                        </div>
                        {isThinkingOpen && (
                            <div className="thinking-content">{thinking}</div>
                        )}
                    </div>
                )}

                {content ? (
                    <div className="prose">
                        <div dangerouslySetInnerHTML={{ __html: html }} />
                        {isStreaming && <span className="cursor" />}
                    </div>
                ) : isStreaming ? (
                    <div className="loading-dots"><span></span><span></span><span></span></div>
                ) : null}
            </div>
        </div>
    )
}
