import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker, { Theme } from 'emoji-picker-react';

const SharedPost = ({ post, onPostClick }) => {
    if (!post) return <div style={{ color: '#888', fontStyle: 'italic', padding: '8px' }}>Post unavailable</div>;

    const authorAvatar = post.author?.profilePicture || "https://static.vecteezy.com/system/resources/previews/036/280/650/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg";
    const authorUsername = post.author?.username || 'User';
    const postImage = post.image || (post.media && post.media[0]?.url);

    return (
        <div 
            onClick={(e) => {
                e.stopPropagation();
                onPostClick?.(post);
            }}
            style={{
                width: '100%',
                maxWidth: '300px',
                backgroundColor: '#1a1a1a',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid #333',
                transition: 'transform 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
            {/* Header */}
            <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #262626' }}>
                <img 
                    src={authorAvatar.startsWith('http') ? authorAvatar : `http://localhost:5000${authorAvatar}`} 
                    alt={authorUsername} 
                    style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{authorUsername}</span>
            </div>
            
            {/* Image */}
            <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#000', position: 'relative' }}>
                <img 
                    src={postImage?.startsWith('http') ? postImage : `http://localhost:5000${postImage}`} 
                    alt="Post" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </div>
            
            {/* Bottom info */}
            <div style={{ padding: '10px 12px', fontSize: '13px', color: '#fff', textAlign: 'left' }}>
                <div style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    <span style={{ fontWeight: 600, marginRight: '6px' }}>{authorUsername}</span>
                    <span style={{ fontWeight: 400, color: '#efefef' }}>{post.caption}</span>
                </div>
            </div>
        </div>
    );
};

const ChatPanel = ({ 
    selected, 
    setSelected, 
    otherParticipant, 
    onUserClick, 
    onPostClick,
    messages, 
    loadingMessages, 
    newMessage, 
    setNewMessage, 
    handleSendMessage, 
    messagesEndRef,
    user
}) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const pickerRef = useRef(null);

    // Close picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const onEmojiClick = (emojiData) => {
        setNewMessage(prev => prev + emojiData.emoji);
        // We don't close the picker here so user can add multiple emojis
    };

    return (
        <div 
            className="messages-right-panel"
            style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#000',
            }}
        >
            <style>{`
                @media (max-width: 767px) {
                    .messages-right-panel { 
                        display: ${selected ? 'flex' : 'none'} !important; 
                        width: 100% !important;
                    }
                }
            `}</style>
            
            {/* Chat Header */}
            <div style={{
                padding: '12px 20px',
                borderBottom: '1px solid #262626',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
            }}>
                {/* Back Button for Mobile */}
                <button 
                    className="d-md-none"
                    onClick={() => setSelected(null)}
                    style={{ background: 'transparent', border: 'none', color: '#fff', padding: '0 8px 0 0' }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                </button>

                <img
                    src={otherParticipant?.profilePicture?.startsWith('http') ? otherParticipant.profilePicture : `http://localhost:5000${otherParticipant?.profilePicture || 'https://i.pravatar.cc/150?img=33'}`}
                    alt={otherParticipant?.name || 'User'}
                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => otherParticipant && onUserClick?.(otherParticipant.username)}
                />
                <div 
                    style={{ cursor: 'pointer' }}
                    onClick={() => otherParticipant && onUserClick?.(otherParticipant.username)}
                >
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>
                        {otherParticipant?.name || otherParticipant?.username || 'Chat'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#888' }}>
                        Active now
                    </div>
                </div>
            </div>

            {/* Message List */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                scrollbarWidth: 'thin',
                scrollbarColor: '#333 transparent'
            }}>
                {loadingMessages ? (
                    <div style={{ textAlign: 'center', color: '#888', padding: '20px' }}>Loading messages...</div>
                ) : messages.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '15px' }}>
                         <img
                            src={otherParticipant?.profilePicture?.startsWith('http') ? otherParticipant.profilePicture : `http://localhost:5000${otherParticipant?.profilePicture || 'https://i.pravatar.cc/150?img=33'}`}
                            alt={otherParticipant?.name || 'User'}
                            style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }}
                            onClick={() => otherParticipant && onUserClick?.(otherParticipant.username)}
                        />
                        <div 
                            style={{ textAlign: 'center', cursor: 'pointer' }}
                            onClick={() => otherParticipant && onUserClick?.(otherParticipant.username)}
                        >
                            <div style={{ fontSize: '18px', fontWeight: 700 }}>{otherParticipant?.name}</div>
                            <div style={{ fontSize: '14px', color: '#888' }}>@{otherParticipant?.username}</div>
                        </div>
                        <button 
                            style={{ 
                                backgroundColor: '#333', border: 'none', color: '#fff', 
                                padding: '6px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
                                cursor: 'pointer'
                            }}
                            onClick={() => otherParticipant && onUserClick?.(otherParticipant.username)}
                        >
                            View Profile
                        </button>
                    </div>
                ) : messages.map((m, idx) => {
                    const isMe = (m.sender?._id || m.sender) === (user?.id || user?._id);
                    return (
                        <div key={m._id || idx} style={{
                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                            maxWidth: '85%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isMe ? 'flex-end' : 'flex-start',
                            marginBottom: '4px'
                        }}>
                            {m.type === 'post' ? (
                                <SharedPost post={m.post} onPostClick={onPostClick} />
                            ) : (
                                <div style={{
                                    padding: '10px 16px',
                                    borderRadius: '20px',
                                    backgroundColor: isMe ? '#6200ee' : '#262626',
                                    color: '#fff',
                                    fontSize: '15px',
                                    lineHeight: '1.4',
                                    wordBreak: 'break-word',
                                    overflowWrap: 'anywhere',
                                    textAlign: 'left',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                    {m.content}
                                </div>
                            )}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div style={{ padding: '20px', position: 'relative' }}>
                {showEmojiPicker && (
                    <div 
                        ref={pickerRef}
                        style={{ 
                            position: 'absolute', 
                            bottom: '80px', 
                            left: '20px', 
                            zIndex: 1000,
                            boxShadow: '0 5px 15px rgba(0,0,0,0.5)'
                        }}
                    >
                        <EmojiPicker 
                            onEmojiClick={onEmojiClick}
                            theme={Theme.DARK}
                            width={300}
                            height={400}
                        />
                    </div>
                )}
                <form 
                    onSubmit={handleSendMessage}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        backgroundColor: 'transparent',
                        border: '1px solid #262626',
                        borderRadius: '24px',
                        padding: '8px 16px',
                    }}
                >
                    <button 
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            padding: '0',
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            color: '#fff'
                        }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
                        </svg>
                    </button>
                    <input
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Message..."
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: '#fff',
                            fontSize: '14px'
                        }}
                    />
                    {newMessage.trim() && (
                        <button 
                            type="submit"
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#0095f6',
                                fontWeight: 700,
                                fontSize: '14px',
                                cursor: 'pointer'
                            }}
                        >
                            Send
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ChatPanel;
