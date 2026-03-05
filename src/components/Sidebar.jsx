import React from 'react'

export default function Sidebar({ conversations, activeId, onSelect, onDelete, onNewChat }) {
    // Sort by date
    const sorted = [...conversations].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo">
                    <div className="logo-icon">🔥</div>
                    <span className="logo-text">CozzyAI</span>
                </div>
                <button onClick={onNewChat} className="new-chat-btn">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    New chat
                </button>
            </div>

            <div className="sidebar-conversations">
                {sorted.length === 0 ? (
                    <div style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center' }}>
                        No recent chats
                    </div>
                ) : (
                    sorted.map(c => (
                        <div
                            key={c.id}
                            className={`conv-item ${c.id === activeId ? 'active' : ''}`}
                            onClick={() => onSelect(c.id)}
                        >
                            <span className="conv-title">{c.title}</span>
                            <button
                                className="conv-delete"
                                onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
                                title="Delete Chat"
                            >
                                ✕
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div className="sidebar-footer">
                <div className="model-badge">
                    <div className="model-dot"></div>
                    <div className="model-info">
                        <div className="model-name">C-1T</div>
                        <div className="model-sub">Free Plan</div>
                    </div>
                </div>
            </div>
        </aside>
    )
}
