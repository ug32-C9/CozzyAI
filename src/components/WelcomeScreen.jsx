import React from 'react'

const SUGGESTIONS = [
    { icon: '🔍', title: 'Reverse Engineering', prompt: 'Help me understand Arm64, x64, MIPS, RISC-V assembly code for a decryption loop.' },
    { icon: '🎓', title: 'Academic Research', prompt: 'Explain the concept of quantum entanglement in simple terms.' },
    { icon: '💻', title: 'Vibe Coding', prompt: 'Create a beautiful login page using HTML and CSS with glassmorphism.' },
    { icon: '🎨', title: 'Creative Planning', prompt: 'Plan a 5-day road trip through Switzerland for a photographer.' },
];

export default function WelcomeScreen({ onSuggestion }) {
    return (
        <div className="welcome-screen">
            <div className="welcome-hero">
                <div className="welcome-logo">🔥</div>
                <h1 className="welcome-title">How can I help you?</h1>
                <p className="welcome-subtitle">Smart. Fast. Cozy. Your AI friend.</p>
            </div>
            <div className="welcome-cards">
                {SUGGESTIONS.map((s, idx) => (
                    <button
                        key={idx}
                        className="welcome-card"
                        onClick={() => onSuggestion(s.prompt)}
                    >
                        <span className="card-icon">{s.icon}</span>
                        <div className="card-title">{s.title}</div>
                    </button>
                ))}
            </div>
        </div>
    )
}
