import React from 'react';
import { marked } from 'marked';

const Message = ({ message }) => {
    if (message.role === 'user') {
        return (
            <div className="message user">
                <div className="avatar user">U</div>
                <div className="message-body">
                    <div className="message-content">{message.content}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="message assistant">
            <div className="avatar ai">🔥</div>
            <div className="message-body">
                {message.thinking && (
                    <div className="think-con">
                        <div className="thinking-block">
                            <div className="thinking-header">
                                <span>💭</span>
                                <span>Thinking</span>
                                <span className={`thinking-chevron ${message.streaming ? '' : 'open'}`}>▶</span>
                            </div>
                            <div className="thinking-content" style={{ display: message.streaming ? 'none' : 'block' }}>
                                {message.thinking}
                            </div>
                        </div>
                    </div>
                )}
                <div className="prose-con">
                    {message.content ? (
                        <div
                            className="prose"
                            dangerouslySetInnerHTML={{
                                __html: marked.parse(message.content + (message.streaming ? '<span class="cursor"></span>' : ''))
                            }}
                        />
                    ) : message.streaming ? (
                        <div className="loading-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default Message;