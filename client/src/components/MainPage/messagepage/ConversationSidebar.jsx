import React from 'react';

const ConversationSidebar = ({ 
    search, 
    setSearch, 
    onBack, 
    conversations, 
    loading, 
    selected, 
    setSelected, 
    user, 
    handleDeleteConversation 
}) => {
    return (
        <div 
            className="messages-sidebar"
            style={{
                width: '340px',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                borderRight: '1px solid #262626',
                height: '100vh',
                overflow: 'hidden',
                backgroundColor: '#0f0f0f',
                zIndex: 10,
            }}
        >
            <style>{`
                .messages-sidebar div:hover .delete-conv-btn {
                    opacity: 1 !important;
                }
                @media (max-width: 767px) {
                    .messages-sidebar { 
                        display: ${selected ? 'none' : 'flex'} !important; 
                        width: 100% !important; 
                        border-right: none !important; 
                    }
                }
            `}</style>

            {/* Header */}
            <div style={{ padding: '22px 20px 10px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button 
                    className="d-md-none"
                    onClick={onBack}
                    style={{ background: 'transparent', border: 'none', color: '#fff', padding: 0 }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                </button>
                <span style={{ fontSize: '17px', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.username || 'Messages'}
                </span>
            </div>

            {/* Search */}
            <div style={{ padding: '0 16px 16px', display: 'flex', justifyContent: 'center' }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    backgroundColor: '#1e1e1e',
                    borderRadius: '10px',
                    padding: '9px 14px',
                    width: '100%',
                }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search"
                        style={{
                            background: 'transparent', border: 'none', outline: 'none',
                            color: '#fff', fontSize: '13px', flex: 1, caretColor: '#fff',
                        }}
                    />
                </div>
            </div>

            {/* Messages Label */}
            <div style={{ padding: '0 20px 10px', textAlign: 'left' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#888', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Messages
                </span>
            </div>

            {/* Conversation List */}
            <style>{`
                .messages-sidebar div:hover .delete-conv-btn {
                    opacity: 1 !important;
                }
                @keyframes unreadGlow {
                    0% { background-color: #0f0f0f; }
                    50% { background-color: #1a1a1a; }
                    100% { background-color: #0f0f0f; }
                }
                .unread-item-glow {
                    animation: unreadGlow 3s infinite ease-in-out;
                    border-left: 3px solid #6200ee !important;
                }
                @media (max-width: 767px) {
                    .messages-sidebar { 
                        display: ${selected ? 'none' : 'flex'} !important; 
                        width: 100% !important; 
                        border-right: none !important; 
                    }
                }
            `}</style>
            <div style={{ overflowY: 'auto', flex: 1, scrollbarWidth: 'thin', scrollbarColor: '#333 transparent' }}>
                {loading ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Loading...</div>
                ) : conversations.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No messages yet</div>
                ) : conversations.map(conv => {
                    const otherParticipant = !conv.isGroup ? conv.participants.find(p => p._id !== (user?.id || user?._id)) : null;
                    const avatar = conv.isGroup ? (conv.groupAvatar || 'https://i.pravatar.cc/150?img=9') : (otherParticipant?.profilePicture || 'https://i.pravatar.cc/150?img=33');
                    const name = conv.isGroup ? (conv.name || 'Group Chat') : (otherParticipant?.name || otherParticipant?.username || 'Unknown');
                    const preview = conv.lastMessage?.content || (conv.isGroup ? 'Group created' : 'Start a conversation');
                    const time = conv.updatedAt ? new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                    const unreadCountObj = conv.unreadCounts?.find(u => u.user === (user?.id || user?._id));
                    const unreadCount = unreadCountObj?.count || 0;
                    const isUnread = unreadCount > 0;

                    return (
                        <div
                            key={conv._id}
                            onClick={() => setSelected(conv._id)}
                            className={isUnread && selected !== conv._id ? 'unread-item-glow' : ''}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '12px',
                                padding: '10px 16px',
                                cursor: 'pointer',
                                backgroundColor: selected === conv._id ? '#1a1a1a' : 'transparent',
                                transition: 'background 0.15s, border 0.2s',
                                position: 'relative',
                            }}
                            onMouseEnter={e => { if (selected !== conv._id) e.currentTarget.style.background = '#141414'; }}
                            onMouseLeave={e => { if (selected !== conv._id) e.currentTarget.style.background = 'transparent'; }}
                        >
                            {/* Avatar */}
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                                <img
                                    src={avatar.startsWith('http') ? avatar : `http://localhost:5000${avatar}`}
                                    alt={name}
                                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                                />
                                {isUnread && (
                                    <div style={{
                                        position: 'absolute', top: -2, right: -2,
                                        minWidth: '18px', height: '18px', borderRadius: '10px',
                                        backgroundColor: '#ff3b30', border: '2px solid #0f0f0f',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        padding: '0 4px', fontSize: '10px', fontWeight: 800, color: '#fff',
                                        zIndex: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                    }}>
                                        {unreadCount > 10 ? '10+' : unreadCount}
                                    </div>
                                )}
                            </div>

                            {/* Text */}
                            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: isUnread ? 700 : 500,
                                    color: '#fff',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                }}>
                                    {name}
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    marginTop: '2px',
                                }}>
                                    <div style={{
                                        fontSize: '12px',
                                        color: isUnread ? '#aaa' : '#888',
                                        fontWeight: isUnread ? 600 : 400,
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        flex: 1
                                    }}>
                                        {preview}
                                    </div>
                                    {time && (
                                        <div style={{
                                            fontSize: '12px',
                                            color: '#666',
                                            fontWeight: 400,
                                            flexShrink: 0
                                        }}>
                                            · {time}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Delete Button (X) */}
                            <button
                                onClick={(e) => handleDeleteConversation(e, conv._id)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#555',
                                    padding: '4px',
                                    cursor: 'pointer',
                                    opacity: 0,
                                    transition: 'opacity 0.2s, color 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                className="delete-conv-btn"
                                onMouseEnter={e => e.currentTarget.style.color = '#ff4d4d'}
                                onMouseLeave={e => e.currentTarget.style.color = '#555'}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ConversationSidebar;
