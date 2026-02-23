import React from 'react';

const ChatEmptyState = () => {
    return (
        <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000',
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                {/* Paper-plane circle icon */}
                <div style={{
                    width: '90px', height: '90px', borderRadius: '50%',
                    border: '2px solid #e8e8e8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#e8e8e8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                </div>

                {/* Text */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
                        Your messages
                    </div>
                    <div style={{ fontSize: '14px', color: '#555', maxWidth: '240px', lineHeight: 1.5 }}>
                        Send a message to start a chat.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatEmptyState;
