import React from 'react';

const PostFeed = ({ posts }) => {
    return (
        <div className="d-flex justify-content-center py-4">
            <div style={{ maxWidth: '470px', width: '100%', padding: '0 10px' }}>
                {posts.map(post => (
                    <div key={post.id} className="mb-4" style={{
                        backgroundColor: '#000',
                        borderBottom: '1px solid #262626'
                    }}>
                        {/* Post Header */}
                        <div className="d-flex align-items-center justify-content-between px-3 py-2">
                            <div className="d-flex align-items-center gap-2">
                                <div style={{
                                    background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                                    borderRadius: '50%',
                                    padding: '2px'
                                }}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        border: '2px solid #000',
                                    }}>
                                        <img src={post.avatar} alt={post.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="d-flex align-items-center gap-1">
                                        <span style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>{post.username}</span>
                                        {post.verified && (
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="#0095f6">
                                                <path d="M6 0l1.364 1.636L9.5 1.05l.414 2.136L12 4.5l-1.086 2.086L12 8.5l-2.086 1.314L9.5 12l-2.136-.414L6 13l-1.364-1.414L2.5 12l-.414-2.186L0 8.5l1.086-2.086L0 4.5l2.086-1.314L2.5 1.05l2.136.586z" />
                                                <path d="M4.5 6.5l1 1 2-2" stroke="white" fill="none" strokeWidth="1.5" />
                                            </svg>
                                        )}
                                        <span style={{ color: '#737373', fontSize: '14px' }}>• {post.timeAgo}</span>
                                    </div>
                                </div>
                            </div>
                            <button className="btn btn-link p-0" style={{ color: 'white' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                    <circle cx="12" cy="5" r="1.5" />
                                    <circle cx="12" cy="12" r="1.5" />
                                    <circle cx="12" cy="19" r="1.5" />
                                </svg>
                            </button>
                        </div>

                        {/* Post Image */}
                        <div style={{ position: 'relative', backgroundColor: '#000' }}>
                            <img src={post.image} alt="Post" style={{ width: '100%', display: 'block', maxHeight: '585px', objectFit: 'cover' }} />
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
                        <div className="px-3 pb-3">
                            {/* Action Buttons with Counts */}
                            <div className="d-flex align-items-center justify-content-between" style={{ paddingTop: '12px', paddingBottom: '12px' }}>
                                <div className="d-flex align-items-center" style={{ gap: '16px' }}>
                                    {/* Like Button with Count */}
                                    <button className="btn btn-link p-0 d-flex align-items-center" style={{ color: 'white', gap: '6px', textDecoration: 'none' }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                        </svg>
                                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#fff', textDecoration: 'none' }}>{post.likes}</span>
                                    </button>

                                    {/* Comment Button with Count */}
                                    <button className="btn btn-link p-0 d-flex align-items-center" style={{ color: 'white', gap: '6px', textDecoration: 'none' }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                        </svg>
                                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#fff', textDecoration: 'none' }}>{post.comments}</span>
                                    </button>

                                    {/* Share Button */}
                                    <button className="btn btn-link p-0" style={{ color: 'white' }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                            <line x1="22" y1="2" x2="11" y2="13" />
                                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Bookmark Button */}
                                <button className="btn btn-link p-0" style={{ color: 'white' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                                    </svg>
                                </button>
                            </div>

                            {/* Caption - Username and text on same line, left aligned */}
                            <div style={{
                                color: '#fff',
                                fontSize: '14px',
                                marginBottom: '8px',
                                lineHeight: '18px',
                                textAlign: 'left'
                            }}>
                                <span style={{ fontWeight: '600' }}>{post.username}</span>
                                {' '}
                                <span style={{ fontWeight: '400' }}>{post.caption}</span>
                            </div>

                            {/* View Comments Link */}
                            {post.comments > 0 && (
                                <div style={{
                                    color: '#737373',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    marginBottom: '12px',
                                    textAlign: 'left'
                                }}>
                                    View all {post.comments} comments
                                </div>
                            )}

                            {/* Add Comment */}
                            <div className="d-flex align-items-center gap-2" style={{
                                borderTop: '1px solid #262626',
                                paddingTop: '12px'
                            }}>
                                <img
                                    src="https://i.pravatar.cc/150?img=33"
                                    alt="Your avatar"
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        objectFit: 'cover'
                                    }}
                                />
                                <input
                                    type="text"
                                    placeholder="Add a comment..."
                                    className="form-control border-0 bg-transparent text-white"
                                    style={{
                                        fontSize: '14px',
                                        padding: '0',
                                        outline: 'none',
                                        boxShadow: 'none'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PostFeed;