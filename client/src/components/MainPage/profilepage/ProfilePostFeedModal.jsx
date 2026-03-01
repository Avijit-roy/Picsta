import React, { useEffect, useRef, useState } from 'react';
import PostItem from '../MainpageComponents/PostFeed/PostItem';

/**
 * ProfilePostFeedModal
 *
 * A full-screen modal that renders an Instagram-like scrollable feed
 * of a user's posts, starting at the tapped post index.
 * Posts render in feed style (not detail mode), matching the main feed look.
 */
const ProfilePostFeedModal = ({
    posts,
    startIndex,
    onClose,
    onLikeToggle,
    onDelete,
    onUpdate,
    onUserClick,
    user
}) => {
    const itemRefs = useRef([]);
    const [localPosts, setLocalPosts] = useState(posts);
    const [detailPost, setDetailPost] = useState(null);

    // Sync incoming post updates to localPosts
    useEffect(() => {
        setLocalPosts(posts);
    }, [posts]);

    // Scroll to the tapped post after the modal mounts
    useEffect(() => {
        const el = itemRefs.current[startIndex];
        if (el) {
            el.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
    }, [startIndex]);

    const handleUpdate = (updatedPost) => {
        setLocalPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
        if (detailPost?._id === updatedPost._id) setDetailPost(updatedPost);
        onUpdate?.(updatedPost);
    };

    const handleLikeToggle = async (postId) => {
        await onLikeToggle?.(postId);
    };

    const handleDelete = async (postId) => {
        await onDelete?.(postId);
        setDetailPost(null);
    };

    return (
        <>
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 2000,
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(10px)',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    scrollbarWidth: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
                onClick={onClose}
            >
                {/* Content Container (Constrained Width) */}
                <div 
                    style={{ 
                        width: '100%', 
                        maxWidth: '480px', 
                        background: '#000', 
                        minHeight: '100vh',
                        position: 'relative',
                        boxShadow: '0 0 40px rgba(0,0,0,0.5)'
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    <style>{`
                        .profile-feed-scroll::-webkit-scrollbar { display: none; }
                    `}</style>

                    {/* Sticky header */}
                    <div style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 2100,
                        backgroundColor: 'rgba(0,0,0,0.92)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderBottom: '1px solid #262626'
                    }}>
                        <span style={{ color: '#fff', fontSize: '16px', fontWeight: '700' }}>Posts</span>
                        <button
                            onClick={onClose}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', padding: '4px' }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    {/* Feed - uses feed mode (isDetail=false) to match main feed look */}
                    <div className="profile-feed-scroll">
                        {localPosts.map((post, idx) => (
                            <div
                                key={post._id}
                                ref={el => itemRefs.current[idx] = el}
                            >
                                <PostItem
                                    post={post}
                                    isDetail={false}
                                    user={user}
                                    onDelete={handleDelete}
                                    onUpdate={handleUpdate}
                                    onUserClick={onUserClick}
                                    onLikeToggle={handleLikeToggle}
                                    onPostClick={(p) => setDetailPost(p)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Single post detail overlay (opens on comment tap) */}
            {detailPost && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 3000,
                        backgroundColor: 'rgba(0,0,0,0.95)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        overflowY: 'auto'
                    }}
                    onClick={() => setDetailPost(null)}
                >
                    <div
                        style={{ width: '100%', maxWidth: '470px' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <PostItem
                            post={detailPost}
                            isDetail={true}
                            user={user}
                            onClose={() => setDetailPost(null)}
                            onDelete={handleDelete}
                            onUpdate={handleUpdate}
                            onUserClick={onUserClick}
                            onLikeToggle={handleLikeToggle}
                            onPostClick={() => {}}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default ProfilePostFeedModal;
