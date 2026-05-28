import React from 'react';

const ChatEmptyState = () => {
    return (
        <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000',
            width: '100%',
            height: '100%'
        }}>
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center'
            }}>
                {/* Paper-plane icon */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '24px'
                }}>
                    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#e8e8e8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                </div>

                {/* Text */}
                <div style={{ fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '8px', textAlign: 'center' }}>
                    Your messages
                </div>
                <div style={{ fontSize: '14px', color: '#a8a8a8', maxWidth: '240px', lineHeight: 1.5, textAlign: 'center', marginBottom: '16px' }}>
                    Send a message to start a chat.
                </div>
                
                {/* Send Message Button */}
                <button 
                    style={{
                        backgroundColor: '#0095f6',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                    onClick={() => {
                        // Action to be implemented
                    }}
                >
                    Send message
                </button>
            </div>
        </div>
    );
};

export default ChatEmptyState;
