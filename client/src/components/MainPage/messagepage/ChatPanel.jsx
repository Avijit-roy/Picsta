import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker, { Theme } from 'emoji-picker-react';

const ImageViewer = ({ src, onClose }) => {
    if (!src) return null;
    return (
        <div 
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.95)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                cursor: 'zoom-out',
                animation: 'fadeIn 0.2s ease-out'
            }}
            onClick={onClose}
        >
            <button 
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '25px',
                    background: 'rgba(0,0,0,0.5)',
                    border: 'none',
                    color: '#fff',
                    padding: '8px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000
                }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
            <img 
                src={src} 
                alt="Full preview" 
                style={{ 
                    maxWidth: '90%', 
                    maxHeight: '90%', 
                    objectFit: 'contain', 
                    borderRadius: '8px',
                    boxShadow: '0 0 40px rgba(0,0,0,0.5)',
                    animation: 'scaleIn 0.2s ease-out'
                }} 
            />
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}</style>
        </div>
    );
};

const SharedPost = ({ post, onPostClick }) => {
    if (!post) return <div style={{ color: '#888', fontStyle: 'italic', padding: '8px' }}>Post unavailable</div>;

    const authorAvatar = post.author?.profilePicture || "https://static.vecteezy.com/system/resources/previews/036/280/650/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg";
    const authorUsername = post.author?.username || 'User';
    const firstMedia = post.media && post.media[0];
    const postImage = post.image || (firstMedia?.type === 'video' ? firstMedia?.thumbnailUrl : firstMedia?.url);

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
                <ChatImage 
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

const ChatImage = ({ src, alt, style, isUploading, isFailed, onImageClick }) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    const isInvalid = !src || src.includes('undefined') || src === 'http://localhost:5000' || src.endsWith('null');

    // 5. Optimization: Apply Cloudinary transformations
    let displayImageUrl = src;
    if (src && typeof src === 'string' && src.includes('cloudinary.com') && !isUploading) {
        displayImageUrl = src.replace('/upload/', '/upload/w_500,q_auto,f_auto/');
    }

    return (
        <div className={`chat-image-container ${isUploading ? 'animate-pulse' : ''}`} style={{ 
            position: 'relative', 
            width: '100%', 
            maxWidth: '250px',
            minHeight: '150px',
            maxHeight: '380px',
            backgroundColor: '#0a0a0a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '24px',
            overflow: 'hidden',
            border: '1px solid #1a1a1a',
            ...style 
        }}>
            {/* Shimmer / Skeleton */}
            {(!loaded && !error && !isInvalid) || isUploading ? (
                <div className="skeleton-image" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 2,
                    pointerEvents: 'none',
                    backgroundColor: '#0d0d0d'
                }} />
            ) : null}

            {/* Uploading Spinner */}
            {isUploading && (
                <div style={{
                    position: 'absolute',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <div className="animate-spin" style={{
                        width: '32px',
                        height: '32px',
                        border: '3px solid rgba(255,255,255,0.05)',
                        borderTop: '3px solid #6200ee',
                        borderRadius: '50%'
                    }}></div>
                </div>
            )}
            
            {(error || isInvalid || isFailed) ? (
                <div style={{
                    padding: '20px',
                    color: isFailed ? '#ff4d4d' : '#666',
                    fontSize: '12px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    zIndex: 11
                }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                    <span style={{ fontWeight: 500 }}>{isFailed ? 'Upload Failed' : 'Image unavailable'}</span>
                </div>
            ) : (
                <img 
                    src={displayImageUrl} 
                    alt={alt} 
                    style={{ 
                        ...style, 
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block',
                        opacity: (loaded && !isUploading) ? 1 : (isUploading ? 0.3 : 0),
                        transition: 'opacity 0.4s ease-out'
                    }} 
                    onLoad={() => setLoaded(true)}
                    onError={() => {
                        console.error("Image load failed for:", src);
                        setError(true);
                    }}
                    onClick={() => !isUploading && !error && onImageClick?.(src)}
                    className="chat-image-hover"
                />
            )}
            <style jsx>{`
                .chat-image-hover {
                    cursor: pointer;
                    transition: filter 0.2s ease;
                }
                .chat-image-hover:hover {
                    filter: brightness(0.9);
                }
            `}</style>
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
    handleSendImage,
    messagesEndRef,
    user
}) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [viewerImage, setViewerImage] = useState(null);
    const pickerRef = useRef(null);
    const fileInputRef = useRef(null);

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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && handleSendImage) {
            handleSendImage(file);
        }
        // Reset input so the same file can be selected again
        e.target.value = '';
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
                .skeleton-image {
                    background: linear-gradient(90deg, #121212 25%, #1a1a1a 50%, #121212 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite linear;
                }
                .animate-pulse {
                    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes shimmer {
                    from { background-position: 200% 0; }
                    to { background-position: -200% 0; }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: .5; }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
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
                    const senderId = m.sender?._id || m.sender;
                    const userId = user?.id || user?._id;
                    const isMe = senderId?.toString() === userId?.toString();
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
                            ) : (m.type === 'image') ? (
                                <div style={{
                                    width: '100%',
                                    maxWidth: '250px',
                                    borderRadius: '24px',
                                    overflow: 'hidden',
                                    border: '1px solid #1a1a1a'
                                }}>
                                    <ChatImage 
                                        key={m.mediaUrl || m._id}
                                        src={m.mediaUrl || null} 
                                        alt="Message Attachment" 
                                        style={{ width: '100%', display: 'block' }}
                                        isUploading={m.isUploading}
                                        isFailed={m.isFailed}
                                        onImageClick={(url) => setViewerImage(url)}
                                    />
                                </div>

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
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    accept="image/*" 
                    onChange={handleFileChange} 
                />
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button 
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                padding: '0',
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer',
                                color: '#fff'
                            }}
                            title="Send Image"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <polyline points="21 15 16 10 5 21"/>
                            </svg>
                        </button>
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
                    </div>
                </form>
            </div>
            {/* Image Viewer Modal */}
            <ImageViewer src={viewerImage} onClose={() => setViewerImage(null)} />
        </div>
    );
};


export default ChatPanel;
