import React, { useState, useEffect, useMemo } from 'react';
import chatService from '../../../../services/chatService';
import messageService from '../../../../services/messageService';

/**
 * ShareModal Component
 * 
 * A premium floating modal for sharing posts via Direct Messages.
 * Features:
 * - Real-time search for conversations
 * - Selection of multiple recipients
 * - High-quality grid layout with avatars
 * - Direct "Send" action with success/error feedback
 */
const ShareModal = ({ isOpen, onClose, post, currentUser }) => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedChats, setSelectedChats] = useState([]);
    const [customMessage, setCustomMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sendSuccess, setSendSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchChats();
            setSelectedChats([]);
            setCustomMessage('');
            setSendSuccess(false);
            setSearchQuery('');
        }
    }, [isOpen]);

    const fetchChats = async () => {
        try {
            setLoading(true);
            const result = await chatService.getChats();
            if (result.success) {
                setChats(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch chats:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredChats = useMemo(() => {
        if (!searchQuery.trim()) return chats;
        const query = searchQuery.toLowerCase();
        return chats.filter(chat => {
            if (chat.isGroup) {
                return (chat.name || '').toLowerCase().includes(query);
            }
            const other = chat.participants.find(p => p._id !== currentUser.id);
            return (other?.name || other?.username || '').toLowerCase().includes(query);
        });
    }, [chats, searchQuery, currentUser.id]);

    const toggleSelectChat = (chatId) => {
        setSelectedChats(prev => 
            prev.includes(chatId) 
                ? prev.filter(id => id !== chatId) 
                : [...prev, chatId]
        );
    };

    const handleShare = async () => {
        if (selectedChats.length === 0 || isSending) return;
        
        setIsSending(true);
        try {
            await Promise.all(selectedChats.map(async (chatId) => {
                // Send the post card message
                await messageService.sendMessage(chatId, null, 'post', post._id);
                
                // If there's a custom message, send it as a separate text message
                if (customMessage.trim()) {
                    await messageService.sendMessage(chatId, customMessage.trim(), 'text');
                }
            }));

            setSendSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (error) {
            console.error('Failed to share post:', error);
            alert('Failed to share post. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            style={{
                position: 'fixed', inset: 0, zIndex: 3000,
                backgroundColor: 'rgba(0,0,0,0.85)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                animation: 'fadeIn 0.2s ease-out'
            }}
            onClick={onClose}
        >
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .share-modal-content {
                    animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    scrollbar-width: none;
                }
                .share-modal-content::-webkit-scrollbar { display: none; }
                .chat-grid-item:hover { transform: translateY(-2px); }
                .share-footer {
                    border-top: 1px solid #363636;
                    padding: 16px;
                    background: #262626;
                    animation: slideUp 0.2s ease-out;
                }
            `}</style>
            
            <div 
                className="share-modal-content"
                style={{
                    backgroundColor: '#262626',
                    width: '100%',
                    maxWidth: '540px',
                    maxHeight: '90vh',
                    borderRadius: '15px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                    color: 'white'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    padding: '16px',
                    borderBottom: '1px solid #363636',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                }}>
                    <button 
                        onClick={onClose}
                        style={{ position: 'absolute', left: '16px', background: 'none', border: 'none', color: 'white', padding: 0, cursor: 'pointer' }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                    <span style={{ fontWeight: 700, fontSize: '18px' }}>Share</span>
                </div>

                {/* Search */}
                <div style={{ padding: '12px 16px' }}>
                    <div style={{
                        backgroundColor: '#1e1e1e',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px 14px',
                        gap: '12px'
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8e8e8e" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                        <input 
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                background: 'none', border: 'none', outline: 'none',
                                color: 'white', fontSize: '14px', flex: 1
                            }}
                        />
                    </div>
                </div>

                {/* Grid of Users */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '20px',
                    minHeight: '300px'
                }}>
                    {loading ? (
                        <div style={{ gridColumn: 'span 4', textAlign: 'center', padding: '40px', color: '#8e8e8e' }}>
                            Loading...
                        </div>
                    ) : filteredChats.length === 0 ? (
                        <div style={{ gridColumn: 'span 4', textAlign: 'center', padding: '40px', color: '#8e8e8e' }}>
                            No chats found
                        </div>
                    ) : filteredChats.map(chat => {
                        const otherParticipant = !chat.isGroup ? chat.participants.find(p => p._id !== currentUser.id) : null;
                        const avatar = chat.isGroup 
                            ? (chat.groupAvatar || 'https://i.pravatar.cc/150?img=9') 
                            : (otherParticipant?.profilePicture || "https://static.vecteezy.com/system/resources/previews/036/280/650/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg");
                        const name = chat.isGroup 
                            ? (chat.name || 'Group Chat') 
                            : (otherParticipant?.name || otherParticipant?.username || 'User');
                        const isSelected = selectedChats.includes(chat._id);

                        return (
                            <div 
                                key={chat._id}
                                className="chat-grid-item"
                                onClick={() => toggleSelectChat(chat._id)}
                                style={{
                                    display: 'flex', flexDirection: 'column', 
                                    alignItems: 'center', gap: '8px',
                                    cursor: 'pointer', transition: 'transform 0.2s',
                                    position: 'relative'
                                }}
                            >
                                <div style={{ 
                                    width: '72px', height: '72px', 
                                    borderRadius: '50%', overflow: 'hidden',
                                    border: isSelected ? '2px solid #3897f0' : '2px solid transparent',
                                    padding: isSelected ? '4px' : 0,
                                    transition: 'border 0.2s'
                                }}>
                                    <img 
                                        src={avatar.startsWith('http') ? avatar : `http://localhost:5000${avatar}`} 
                                        alt={name}
                                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                </div>
                                <span style={{ 
                                    fontSize: '11px', textAlign: 'center', 
                                    fontWeight: isSelected ? 700 : 400,
                                    color: isSelected ? '#fff' : '#efefef',
                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden', textOverflow: 'ellipsis',
                                    height: '2.4em'
                                }}>
                                    {name}
                                </span>
                                {isSelected && (
                                    <div style={{
                                        position: 'absolute', top: 50, right: 10,
                                        width: '20px', height: '20px', borderRadius: '50%',
                                        backgroundColor: '#3897f0', border: '2px solid #262626',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer with Message Input and Send Button */}
                {selectedChats.length > 0 && (
                    <div className="share-footer">
                        <div style={{ marginBottom: '16px' }}>
                            <input 
                                type="text"
                                placeholder="Write a message..."
                                value={customMessage}
                                onChange={(e) => setCustomMessage(e.target.value)}
                                style={{
                                    width: '100%',
                                    background: 'none',
                                    border: 'none',
                                    outline: 'none',
                                    color: 'white',
                                    fontSize: '15px'
                                }}
                            />
                        </div>
                        <button 
                            onClick={handleShare}
                            disabled={isSending || sendSuccess}
                            style={{ 
                                width: '100%',
                                backgroundColor: '#6200ee', 
                                border: 'none',
                                borderRadius: '12px',
                                padding: '12px',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '16px',
                                cursor: 'pointer',
                                transition: 'opacity 0.2s, transform 0.1s',
                                opacity: isSending ? 0.7 : 1,
                            }}
                            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            {isSending ? 'Sending...' : sendSuccess ? 'Sent!' : 'Send'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShareModal;
