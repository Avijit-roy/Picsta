import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import DeleteConfirmModal from './DeleteConfirmModal';
import postService from '../../../../services/postService';
import ShareModal from './ShareModal';
import PostMedia from './PostMedia';

const PostItem = ({ post, onPostClick, onUserClick, onLikeToggle, user, isDetail = false, onClose, onDelete, onUpdate }) => {
    const { user: authUser } = useAuth();
    const currentUser = user || authUser;
    
    const [showLargeHeart, setShowLargeHeart] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedCaption, setEditedCaption] = useState(post.caption || '');
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [comments, setComments] = useState([]);
    const [isFetchingComments, setIsFetchingComments] = useState(isDetail);
    const [isPostingComment, setIsPostingComment] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null); // { id, username }
    const [expandedComments, setExpandedComments] = useState({}); // { commentId: boolean }
    const lastTap = useRef(0);
    const timerRef = useRef(null);
    const editInputRef = useRef(null);

    const isOwner = currentUser?.id === post.author?._id || currentUser?.id === post.author;
    const authorUsername = post.username || (post.author && post.author.username);
    const authorAvatar = authorAvatarFromPost(post);
    const isLiked = post.isLiked || (Array.isArray(post.likes) && currentUser && post.likes.includes(currentUser.id));
    const isSaved = post.isSaved !== undefined ? post.isSaved : (Array.isArray(post.saves) && currentUser && post.saves.includes(currentUser.id));

    function authorAvatarFromPost(p) {
        return p.avatar || (p.author && p.author.profilePicture) || "https://static.vecteezy.com/system/resources/previews/036/280/650/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg";
    }

    // Auto-focus edit field
    useEffect(() => {
        if (isEditing && editInputRef.current) {
            editInputRef.current.focus();
            // Move cursor to end
            const length = editInputRef.current.value.length;
            editInputRef.current.setSelectionRange(length, length);
        }
    }, [isEditing]);

    // Fetch comments if in detail mode
    useEffect(() => {
        if (isDetail && post?._id) {
            const fetchComments = async () => {
                try {
                    const result = await postService.getComments(post._id);
                    if (result.success) {
                        setComments(result.data);
                    }
                } catch (error) {
                    console.error('Failed to fetch comments:', error);
                } finally {
                    setIsFetchingComments(false);
                }
            };
            fetchComments();
        }
    }, [isDetail, post?._id]);

    const handleTap = useCallback((e) => {
        e.stopPropagation();
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;

        if (now - lastTap.current < DOUBLE_TAP_DELAY) {
            // Double Tap detected
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            
            if (!isLiked) {
                onLikeToggle?.(post._id);
            }
            setShowLargeHeart(true);
            setTimeout(() => setShowLargeHeart(false), 1000);
            lastTap.current = 0; // Reset to prevent triple-tap complications
        } else {
            // First Tap detected
            lastTap.current = now;
            
            // Clean up any existing timer
            if (timerRef.current) clearTimeout(timerRef.current);
            
            timerRef.current = setTimeout(() => {
                // Single Tap action: open post detail if not already in detail mode
                if (!isDetail) {
                    onPostClick?.(post);
                }
                timerRef.current = null;
                lastTap.current = 0;
            }, DOUBLE_TAP_DELAY);
        }
    }, [isLiked, onLikeToggle, post, isDetail, onPostClick]);

    const handleLikeClick = (e) => {
        e.stopPropagation();
        onLikeToggle?.(post._id);
    };

    const handleSaveClick = async (e) => {
        e.stopPropagation();
        try {
            const result = await postService.toggleSave(post._id);
            if (result.success && onUpdate) {
                // We update the post object in the parent component to reflect the save status
                // If it's the Saved tab, it might need to be removed from the list, but 
                // typically we just update the UI state.
                onUpdate({ ...post, isSaved: result.isSaved });
            }
        } catch (error) {
            console.error('Failed to toggle save:', error);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || isPostingComment) return;

        setIsPostingComment(true);
        try {
            const result = await postService.addComment(post._id, newComment, replyingTo?.id);
            if (result.success) {
                setComments(prev => [result.data, ...prev]);
                setNewComment('');
                setReplyingTo(null);
                if (replyingTo) {
                    // Automatically expand parent if replying
                    setExpandedComments(prev => ({ ...prev, [replyingTo.id]: true }));
                }
                if (onUpdate) {
                    onUpdate({ ...post, commentsCount: (post.commentsCount || 0) + 1 });
                }
            }
        } catch (error) {
            console.error('Failed to post comment:', error);
        } finally {
            setIsPostingComment(false);
        }
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        setIsConfirmOpen(true);
        setShowOptions(false);
    };

    const handleEditPostClick = (e) => {
        e.stopPropagation();
        setIsEditing(true);
        setEditedCaption(post.caption || '');
        setShowOptions(false);
    };

    const handleSaveEdit = async () => {
        if (isSavingEdit) return;
        setIsSavingEdit(true);
        try {
            const result = await postService.updatePost(post._id, { caption: editedCaption });
            if (result.success) {
                if (onUpdate) {
                    onUpdate(result.data);
                }
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Failed to update post:', error);
            alert('Failed to update post. Please try again.');
        } finally {
            setIsSavingEdit(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedCaption(post.caption || '');
    };

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        try {
            await onDelete?.(post._id);
        } catch (error) {
            console.error('Failed to delete post:', error);
        } finally {
            setIsDeleting(false);
            setIsConfirmOpen(false);
        }
    };

    const formatTimestamp = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diff = (now - d) / 1000;
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    return (
        <div className={`post-item-container ${isDetail ? "detail-modal" : "mb-4"}`} style={{
            backgroundColor: '#000',
            borderBottom: isDetail ? 'none' : '1px solid #262626',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: isDetail ? '100%' : 'none'
        }}>
            <style>{`
                @keyframes heartPop {
                    0% { transform: scale(1); }
                    15% { transform: scale(1.3); }
                    30% { transform: scale(0.95); }
                    45% { transform: scale(1.1); }
                    60% { transform: scale(0.98); }
                    100% { transform: scale(1); }
                }
                .heart-pop-active { animation: heartPop 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                @keyframes largeHeartIn {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                    50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.9; }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
                }
                .large-heart-overlay {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 10;
                    pointer-events: none;
                    animation: largeHeartIn 0.8s ease-out forwards;
                }
                .options-menu {
                    position: absolute;
                    top: 40px;
                    right: 0;
                    background: #262626;
                    border-radius: 12px;
                    padding: 8px 0;
                    min-width: 150px;
                    z-index: 2100;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                }
                .menu-item {
                    padding: 12px 16px;
                    font-size: 14px;
                    cursor: pointer;
                    color: white;
                    text-align: left;
                }
                .menu-item:hover { background: #363636; }
                .menu-item.danger { color: #ed4956; font-weight: 600; }
                .comments-container {
                    flex: 1;
                    overflow-y: auto;
                    scrollbar-width: none;
                }
                .comments-container::-webkit-scrollbar { display: none; }
                .comment-list-scroll {
                    max-height: 380px;
                    overflow-y: auto;
                    scrollbar-width: thin;
                    scrollbar-color: #333 transparent;
                    padding-right: 4px;
                }
                .comment-list-scroll::-webkit-scrollbar {
                    width: 4px;
                }
                .comment-list-scroll::-webkit-scrollbar-thumb {
                    background-color: #333;
                    border-radius: 4px;
                }
                .edit-caption-textarea {
                    width: 100%;
                    background: #1a1a1a;
                    border: 1px solid #363636;
                    border-radius: 4px;
                    color: white;
                    padding: 8px;
                    font-size: 14px;
                    margin: 8px 0;
                    resize: none;
                    outline: none;
                }
                .edit-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    margin-top: 4px;
                }
                .edit-btn {
                    font-size: 12px;
                    font-weight: 600;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 4px 8px;
                }
                .edit-btn.save { color: #0095f6; }
                .edit-btn.cancel { color: #737373; }

                /* Mobile Optimization */
                @media (max-width: 767px) {
                    .post-item-container.detail-modal {
                        height: 100dvh !important;
                        max-height: 100dvh !important;
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        z-index: 2000;
                        border-radius: 0 !important;
                    }
                    .detail-modal .post-header {
                        padding-top: max(16px, env(safe-area-inset-top)) !important;
                    }
                    .detail-modal .post-image-container {
                        max-height: 45vh !important;
                    }
                    .detail-modal .post-image {
                        max-height: 45vh !important;
                        object-fit: contain !important;
                        background: #000;
                    }
                }
            `}</style>

            {/* Post Header */}
            <div className={`d-flex align-items-center justify-content-between px-3 py-2 post-header ${isDetail ? 'border-bottom border-dark' : ''}`} style={{ borderColor: '#262626 !important' }}>
                <div className="d-flex align-items-center gap-2">
                    <div 
                        style={{
                            background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                            borderRadius: '50%',
                            padding: '2px',
                            cursor: 'pointer'
                        }}
                        onClick={() => onUserClick?.(authorUsername)}
                    >
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: '2px solid #000',
                        }}>
                            <img src={authorAvatar} alt={authorUsername} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    </div>
                    <div>
                        <div className="d-flex align-items-center gap-1">
                            <span 
                                style={{ color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                                onClick={() => onUserClick?.(authorUsername)}
                            >
                                {authorUsername}
                            </span>
                            {post.verified && (
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="#0095f6">
                                    <path d="M6 0l1.364 1.636L9.5 1.05l.414 2.136L12 4.5l-1.086 2.086L12 8.5l-2.086 1.314L9.5 12l-2.136-.414L6 13l-1.364-1.414L2.5 12l-.414-2.186L0 8.5l1.086-2.086L0 4.5l2.086-1.314L2.5 1.05l2.136.586z" />
                                    <path d="M4.5 6.5l1 1 2-2" stroke="white" fill="none" strokeWidth="1.5" />
                                </svg>
                            )}
                            <span style={{ color: '#737373', fontSize: '14px' }}>• {post.timeAgo || (post.createdAt && new Date(post.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }))}</span>
                        </div>
                    </div>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <div style={{ position: 'relative' }}>
                        <button className="btn btn-link p-0" style={{ color: 'white' }} onClick={() => setShowOptions(!showOptions)}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                <circle cx="12" cy="5" r="1.5" />
                                <circle cx="12" cy="12" r="1.5" />
                                <circle cx="12" cy="19" r="1.5" />
                            </svg>
                        </button>
                        {showOptions && (
                            <div className="options-menu">
                                {isOwner ? (
                                    <>
                                        <div className="menu-item" onClick={handleEditPostClick}>Edit Post</div>
                                        <div className="menu-item danger" onClick={handleDeleteClick}>Delete</div>
                                    </>
                                ) : (
                                    <div className="menu-item">Report</div>
                                )}
                                <div className="menu-item" onClick={() => setShowOptions(false)}>Cancel</div>
                            </div>
                        )}
                    </div>
                    {isDetail && (
                        <button 
                            className="btn btn-link p-0" 
                            style={{ color: 'white' }} 
                            onClick={(e) => {
                                e.stopPropagation();
                                onClose?.();
                            }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Scroll Container for Detail Mode */}
            <div className={isDetail ? "comments-container" : ""}>
                {/* Post Image */}
                <div 
                    className="post-image-container"
                    style={{ position: 'relative', backgroundColor: '#000', cursor: 'pointer' }}
                    onClick={handleTap}
                >
                     <PostMedia 
                        media={post.media && post.media[0] ? post.media[0] : { url: post.image, type: 'image' }} 
                        caption={post.caption}
                    />
                    
                    {showLargeHeart && (
                        <div className="large-heart-overlay">
                            <svg width="100" height="100" viewBox="0 0 24 24" fill="white" style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}>
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                        </div>
                     )}

                    {post.hasAudio && (
                        <div style={{
                            position: 'absolute',
                            bottom: '10px',
                            right: '10px',
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
                                <line x1="1" y1="1" x2="23" y2="23" stroke="white" strokeWidth="2" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Post Actions and Info */}
                <div className="px-3">
                    {/* Action Buttons with Counts */}
                    <div className="d-flex align-items-center justify-content-between" style={{ paddingTop: '12px', paddingBottom: '12px' }}>
                        <div className="d-flex align-items-center" style={{ gap: '16px' }}>
                            {/* Like Button with Count */}
                            <button 
                                className="btn btn-link p-0 d-flex align-items-center" 
                                style={{ color: 'white', gap: '6px', textDecoration: 'none' }}
                                onClick={handleLikeClick}
                            >
                                <svg 
                                    className={isLiked ? "heart-pop-active" : ""}
                                    width="24" height="24" viewBox="0 0 24 24" fill={isLiked ? "#ff3040" : "none"} stroke={isLiked ? "#ff3040" : "white"} strokeWidth="2"
                                >
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                                 <span style={{ fontSize: '14px', fontWeight: '600', color: '#fff', textDecoration: 'none' }}>
                                    {post.likesCount !== undefined ? post.likesCount : (Array.isArray(post.likes) ? post.likes.length : 0)}
                                 </span>
                            </button>

                            {/* Comment Button with Count */}
                            <button 
                                className="btn btn-link p-0 d-flex align-items-center" 
                                style={{ color: 'white', gap: '6px', textDecoration: 'none' }}
                                onClick={() => !isDetail && onPostClick?.(post)}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                                 <span style={{ fontSize: '14px', fontWeight: '600', color: '#fff', textDecoration: 'none' }}>
                                    {post.commentsCount !== undefined ? post.commentsCount : (Array.isArray(post.comments) ? post.comments.length : 0)}
                                 </span>
                            </button>

                            {/* Share Button */}
                            <button 
                                className="btn btn-link p-0" 
                                style={{ color: 'white' }}
                                onClick={() => setShowShareModal(true)}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                    <line x1="22" y1="2" x2="11" y2="13" />
                                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                </svg>
                            </button>
                        </div>

                        {/* Bookmark Button */}
                        <button 
                            className="btn btn-link p-0" 
                            style={{ color: 'white' }}
                            onClick={handleSaveClick}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill={isSaved ? "white" : "none"} stroke="white" strokeWidth="2">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                            </svg>
                        </button>
                    </div>

                    {/* Caption - Inline Editing Support */}
                    <div style={{
                        color: '#fff',
                        fontSize: '14px',
                        marginBottom: '8px',
                        lineHeight: '18px',
                        textAlign: 'left'
                    }}>
                        {!isEditing ? (
                            <>
                                <span 
                                    style={{ fontWeight: '600', cursor: 'pointer' }}
                                    onClick={() => onUserClick?.(authorUsername)}
                                >
                                    {authorUsername}
                                </span>
                                {' '}
                                <span style={{ fontWeight: '400' }}>{post.caption}</span>
                                {post.isEdited && (
                                    <span style={{ fontSize: '10px', color: '#737373', marginLeft: '6px' }}>(edited)</span>
                                )}
                            </>
                        ) : (
                            <div>
                                <span style={{ fontWeight: '600' }}>{authorUsername}</span>
                                <textarea 
                                    ref={editInputRef}
                                    className="edit-caption-textarea"
                                    rows="2"
                                    value={editedCaption}
                                    onChange={(e) => setEditedCaption(e.target.value)}
                                    placeholder="Edit caption..."
                                />
                                <div className="edit-actions">
                                    <button 
                                        className="edit-btn cancel" 
                                        onClick={handleCancelEdit}
                                        disabled={isSavingEdit}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        className="edit-btn save" 
                                        onClick={handleSaveEdit}
                                        disabled={isSavingEdit || editedCaption === post.caption}
                                    >
                                        {isSavingEdit ? 'Saving...' : 'Done'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* View Comments Link (Only in Feed Mode) */}
                    {!isDetail && (post.commentsCount > 0 || post.comments?.length > 0) && (
                        <div 
                            style={{
                                color: '#737373',
                                fontSize: '14px',
                                cursor: 'pointer',
                                marginBottom: '12px',
                                textAlign: 'left'
                            }}
                            onClick={() => onPostClick?.(post)}
                        >
                            View all {post.commentsCount || post.comments?.length} comments
                        </div>
                    )}

                    {/* Full Comments List (Only in Detail Mode) */}
                    {isDetail && (
                        <div style={{ borderTop: '1px solid #1a1a1a', marginTop: '16px', paddingTop: '12px' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#8e8e8e', marginBottom: '12px', textAlign: 'left' }}>
                                Comments ({comments.length})
                            </div>
                            {isFetchingComments ? (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#737373' }}>Loading comments...</div>
                            ) : (
                                <div className="comment-list-scroll">
                                    {(() => {
                                        const parentComments = comments.filter(c => !c.parentComment);
                                        const replies = comments.filter(c => c.parentComment);
                                        
                                        return parentComments.map((comment) => {
                                            const commentReplies = replies.filter(r => r.parentComment === comment._id || r.parentComment?._id === comment._id);
                                            const isExpanded = expandedComments[comment._id];

                                            return (
                                                <div key={comment._id} className="mb-3">
                                                    <div style={{ display: 'flex', gap: '12px', padding: '10px 0' }}>
                                                        <div 
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => onUserClick?.(comment.author?.username)}
                                                        >
                                                            <img 
                                                                src={comment.author?.profilePicture || "https://static.vecteezy.com/system/resources/previews/036/280/650/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg"} 
                                                                alt={comment.author?.username} 
                                                                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                                                            />
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: '14px', color: 'white', textAlign: 'left', lineHeight: '1.4' }}>
                                                                <span 
                                                                    style={{ fontWeight: '600', marginRight: '6px', cursor: 'pointer' }}
                                                                    onClick={() => onUserClick?.(comment.author?.username)}
                                                                >
                                                                    {comment.author?.username}
                                                                </span>
                                                                <span style={{ fontWeight: '400', wordBreak: 'break-word' }}>{comment.text}</span>
                                                            </div>
                                                            <div style={{ fontSize: '12px', color: '#737373', marginTop: '4px', textAlign: 'left', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                                <span>{formatTimestamp(comment.createdAt)}</span>
                                                                <span 
                                                                    style={{ cursor: 'pointer', fontWeight: '600' }}
                                                                    onClick={() => {
                                                                        setReplyingTo({ id: comment._id, username: comment.author?.username });
                                                                    }}
                                                                >
                                                                    Reply
                                                                </span>
                                                            </div>

                                                            {commentReplies.length > 0 && (
                                                                <div style={{ marginTop: '12px' }}>
                                                                    <div 
                                                                        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: '#737373', fontSize: '12px', fontWeight: '600' }}
                                                                        onClick={() => setExpandedComments(prev => ({ ...prev, [comment._id]: !prev[comment._id] }))}
                                                                    >
                                                                        <div style={{ width: '24px', height: '1px', backgroundColor: '#262626' }}></div>
                                                                        {isExpanded ? 'Hide replies' : `View replies (${commentReplies.length})`}
                                                                    </div>
                                                                    
                                                                    {isExpanded && (
                                                                        <div style={{ marginTop: '12px', marginLeft: '44px', borderLeft: '1px solid #262626' }}>
                                                                            {commentReplies.map(reply => (
                                                                                <div key={reply._id} style={{ display: 'flex', gap: '12px', padding: '8px 0' }}>
                                                                                    <div 
                                                                                        style={{ cursor: 'pointer' }}
                                                                                        onClick={() => onUserClick?.(reply.author?.username)}
                                                                                    >
                                                                                        <img 
                                                                                            src={reply.author?.profilePicture || "https://static.vecteezy.com/system/resources/previews/036/280/650/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg"} 
                                                                                            alt={reply.author?.username} 
                                                                                            style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                                                                                        />
                                                                                    </div>
                                                                                    <div style={{ flex: 1 }}>
                                                                                        <div style={{ fontSize: '14px', color: 'white', textAlign: 'left', lineHeight: '1.4' }}>
                                                                                            <span 
                                                                                                style={{ fontWeight: '600', marginRight: '6px', cursor: 'pointer' }}
                                                                                                onClick={() => onUserClick?.(reply.author?.username)}
                                                                                            >
                                                                                                {reply.author?.username}
                                                                                            </span>
                                                                                            <span style={{ fontWeight: '400', wordBreak: 'break-word' }}>{reply.text}</span>
                                                                                        </div>
                                                                                        <div style={{ fontSize: '12px', color: '#737373', marginTop: '4px', textAlign: 'left', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                                                            <span>{formatTimestamp(reply.createdAt)}</span>
                                                                                            <span 
                                                                                                style={{ cursor: 'pointer', fontWeight: '600' }}
                                                                                                onClick={() => {
                                                                                                    setReplyingTo({ id: comment._id, username: reply.author?.username });
                                                                                                }}
                                                                                            >
                                                                                                Reply
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                    {comments.length === 0 && (
                                        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#737373' }}>
                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-2">
                                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                            </svg>
                                            <div style={{ fontSize: '14px' }}>No comments yet.</div>
                                            <div style={{ fontSize: '12px' }}>Start the conversation.</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Comment Area (Bottom) */}
            <div className="px-3 pb-3">
                {isDetail ? (
                    <form 
                        onSubmit={handleAddComment}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            borderTop: '1px solid #262626',
                            paddingTop: '12px'
                        }}
                    >
                        <img
                            src={currentUser?.profilePicture || "https://static.vecteezy.com/system/resources/previews/036/280/650/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg"}
                            alt="Your avatar"
                            style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1 }}>
                            {replyingTo && (
                                <div style={{ fontSize: '12px', color: '#737373', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    Replying to @{replyingTo.username}
                                    <span 
                                        style={{ cursor: 'pointer', color: '#0095f6', fontWeight: '600' }} 
                                        onClick={() => setReplyingTo(null)}
                                    >
                                        Cancel
                                    </span>
                                </div>
                            )}
                            <input
                                type="text"
                                placeholder="Add a comment..."
                                className="form-control border-0 bg-transparent text-white"
                                style={{ fontSize: '14px', padding: '0', outline: 'none', boxShadow: 'none' }}
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={!newComment.trim() || isPostingComment}
                            style={{ background: 'none', border: 'none', color: '#0095f6', fontWeight: '600', fontSize: '14px', padding: 0, opacity: (!newComment.trim() || isPostingComment) ? 0.5 : 1 }}
                        >
                            {isPostingComment ? '...' : 'Post'}
                        </button>
                    </form>
                ) : (
                    <div className="d-flex align-items-center gap-2" style={{
                        borderTop: '1px solid #262626',
                        paddingTop: '12px',
                        cursor: 'pointer'
                    }} onClick={() => !isEditing && onPostClick?.(post)}>
                        <img
                            src={currentUser?.profilePicture || "https://static.vecteezy.com/system/resources/previews/036/280/650/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg"}
                            alt="Your avatar"
                            style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <span style={{ color: '#737373', fontSize: '14px' }}>Add a comment...</span>
                    </div>
                )}
            </div>

            <DeleteConfirmModal 
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                loading={isDeleting}
            />

            <ShareModal 
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                post={post}
                currentUser={currentUser}
            />
        </div>
    );
};

export default PostItem;
