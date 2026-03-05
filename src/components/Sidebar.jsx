import React from 'react';

const Sidebar = ({ conversations, activeId, onNewChat, onLoadConversation, onDeleteConversation }) => {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo">
                    <div className="logo-icon">🔥</div>
                    <span className="logo-text">CozzyAI</span>
                </div>
                <button className="new-chat-btn" onClick={onNewChat}>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                        <path d="M7.5 1v13M1 7.5h13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    New chat
                </button>
            </div>

            <div className="sidebar-conversations">
                {conversations.length === 0 ? (
                    <div className="no-history">No history</div>
                ) : (
                    conversations.map(conv => (
                        <div
                            key={conv.id}
                            className={`conv-item ${conv.id === activeId ? 'active' : ''}`}
                            onClick={() => onLoadConversation(conv.id)}
                        >
                            <span className="conv-title">{conv.title}</span>
                            <button
                                className="conv-delete"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteConversation(conv.id);
                                }}
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
    );
};

export default Sidebar;