import React, { useState, useEffect, useRef } from 'react';
import storyService from '../../../../services/storyService';
import { useAuth } from '../../../../context/AuthUtils';
import { useConfirm } from '../../../../context/ConfirmDialogUtils';
import ListSkeleton from '../SideBar/ListSkeleton';

const StoryViewerModal = ({
    userGroups,
    initialGroupIndex = 0,
    onClose,
    onViewed
}) => {
    const { user: authUser } = useAuth();
    const confirm = useConfirm();
    const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [videoDurations, setVideoDurations] = useState({});
    const [showViewers, setShowViewers] = useState(false);
    const [viewers, setViewers] = useState([]);
    const [loadingViewers, setLoadingViewers] = useState(false);
    const videoRef = useRef(null);

    const currentUserGroup = userGroups[currentGroupIndex];
    const currentStory = currentUserGroup?.stories?.[currentStoryIndex];
    
    // Auto-close if no valid story group
    useEffect(() => {
        if (!currentUserGroup || currentUserGroup.stories.length === 0) {
            onClose();
        }
    }, [currentUserGroup, onClose]);

    const isVideo = currentStory?.mediaType === 'video';
    const isOwner = currentUserGroup?.user?._id?.toString() === (authUser?.id || authUser?._id)?.toString();
    const currentVideoDuration = isVideo ? videoDurations[currentStory?._id] || 0 : 0;
    const duration = isVideo && currentVideoDuration
        ? currentVideoDuration * 1000
        : 5000;

    // Handle view tracking
    useEffect(() => {
        const userId = (authUser?.id || authUser?._id)?.toString();
        if (currentStory && !isOwner && !currentStory.viewers?.some(v => (v._id || v)?.toString() === userId)) {
            // Mark as viewed
            storyService.markAsViewed(currentStory._id).catch(err => console.error(err));
            if (onViewed) {
                onViewed(currentStory._id);
            }
        }
    }, [currentStory, isOwner, authUser, onViewed]);

    const handleNext = React.useCallback(() => {
        setProgress(0);
        if (currentStoryIndex < currentUserGroup.stories.length - 1) {
            setCurrentStoryIndex(prev => prev + 1);
        } else if (currentGroupIndex < userGroups.length - 1) {
            setCurrentGroupIndex(prev => prev + 1);
            setCurrentStoryIndex(0);
        } else {
            onClose();
        }
    }, [currentStoryIndex, currentUserGroup.stories.length, currentGroupIndex, userGroups.length, onClose]);

    // Handle progress and auto-advance
    useEffect(() => {
        if (isPaused || !currentStory) return;

        const updateInterval = 50; // update progress every 50ms
        let timer;

        if (!isVideo || (isVideo && videoRef.current && videoRef.current.readyState >= 3)) {
            timer = setInterval(() => {
                setProgress(prev => {
                    const newProgress = prev + (updateInterval / duration) * 100;
                    if (newProgress >= 100) {
                        clearInterval(timer);
                        handleNext();
                        return 100;
                    }
                    return newProgress;
                });
            }, updateInterval);
        }
        
        return () => clearInterval(timer);
    }, [isPaused, duration, isVideo, currentStory, handleNext]);

    if (!currentUserGroup || !currentStory) {
        return null;
    }

    const handlePrevious = () => {
        setProgress(0);
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(prev => prev - 1);
        } else if (currentGroupIndex > 0) {
            setCurrentGroupIndex(prev => prev - 1);
            setCurrentStoryIndex(userGroups[currentGroupIndex - 1].stories.length - 1);
        } else {
            // First story of first user, stay or close
            setProgress(0);
        }
    };

    const handleTap = (e) => {
        const { clientX } = e;
        const width = window.innerWidth;
        if (clientX < width / 3) {
            handlePrevious();
        } else {
            handleNext();
        }
    };

    const formatTimestamp = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diff = (now - d) / 1000;
        if (diff < 60) return "Just now";
        if (diff < 3600) return `${Math.floor(diff / 60)}m`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
        return `${Math.floor(diff / 86400)}d`;
    };

    const fetchViewers = async () => {
        if (!currentStory || !isOwner) return;
        setLoadingViewers(true);
        setIsPaused(true);
        try {
            const response = await storyService.getStoryViewers(currentStory._id);
            if (response.success) {
                setViewers(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch viewers", error);
        } finally {
            setLoadingViewers(false);
        }
    };

    const handleOpenViewers = () => {
        setShowViewers(true);
        fetchViewers();
    };

    const handleCloseViewers = () => {
        setShowViewers(false);
        setIsPaused(false);
    };

    return (
        <div 
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                backgroundColor: '#111', display: 'flex', 
                justifyContent: 'center', alignItems: 'center'
            }}
            onClick={onClose}
        >
            <style>{`
                .story-container {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    background-color: #000;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                @media (min-width: 768px) {
                    .story-container {
                        max-width: 450px;
                        height: 90vh;
                        border-radius: 12px;
                        box-shadow: 0 0 40px rgba(0,0,0,0.8);
                    }
                }
            `}</style>
            
            {/* Desktop Close Button outside container */}
            <button 
                onClick={onClose}
                className="d-none d-md-flex align-items-center justify-content-center"
                style={{
                    position: 'absolute', top: '24px', right: '24px', 
                    background: 'rgba(255,255,255,0.1)', border: 'none', 
                    color: 'white', borderRadius: '50%', width: '40px', height: '40px',
                    cursor: 'pointer', zIndex: 10000, backdropFilter: 'blur(5px)'
                }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>

            <div className="story-container" onClick={(e) => e.stopPropagation()}>
                {/* Header / Info overlay */}
                <div 
                    style={{
                        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
                        padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '8px'
                    }}
                >
                    {/* Progress bars */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {currentUserGroup.stories.map((s, idx) => (
                            <div key={s._id} style={{
                                flex: 1, height: '2px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '1px', overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: idx < currentStoryIndex ? '100%' : idx === currentStoryIndex ? `${progress}%` : '0%',
                                    height: '100%', backgroundColor: '#fff', transition: 'width 0.1s linear'
                                }} />
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img 
                                src={currentUserGroup.user.profilePicture || "https://static.vecteezy.com/system/resources/previews/036/280/650/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg"} 
                                alt={currentUserGroup.user.username}
                                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{currentUserGroup.user.username}</span>
                            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{formatTimestamp(currentStory.createdAt)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <button onClick={onClose} className="d-md-none" style={{
                                background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '4px'
                            }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div 
                    style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', overflow: 'hidden' }}
                    onClick={handleTap}
                    onMouseDown={() => setIsPaused(true)}
                    onMouseUp={() => setIsPaused(false)}
                    onTouchStart={() => setIsPaused(true)}
                    onTouchEnd={() => setIsPaused(false)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    {isVideo ? (
                        <video 
                            ref={videoRef}
                            src={currentStory.mediaUrl} 
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            autoPlay 
                            playsInline
                            muted={false}
                            onEnded={handleNext}
                            onLoadedMetadata={(e) => {
                                setVideoDurations(prev => ({
                                    ...prev,
                                    [currentStory._id]: e.target.duration
                                }));
                            }}
                            onTimeUpdate={() => {
                                if (videoRef.current) {
                                    setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
                                }
                            }}
                        />
                    ) : (
                        <img 
                            src={currentStory.mediaUrl} 
                            alt="Story" 
                            style={{ width: '100%', height: '100%', objectFit: 'contain', userSelect: 'none' }} 
                            draggable={false}
                        />
                    )}
                </div>

                {/* Footer for Owner */}
                {isOwner && (
                    <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
                        padding: '24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div 
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.5)', cursor: 'pointer' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenViewers();
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            <span style={{ fontWeight: '500', fontSize: '14px' }}>
                                {[...new Set(currentStory.viewers?.map(v => (v._id || v)?.toString()))].length} Viewers
                            </span>
                        </div>
                        <button 
                            onClick={async (e) => {
                                e.stopPropagation();
                                const ok = await confirm('This action cannot be undone.', {
                                    title: 'Delete this story?',
                                    confirmText: 'Delete',
                                    cancelText: 'Cancel',
                                    danger: true
                                });
                                if (ok) {
                                    setIsPaused(true);
                                    try {
                                        await storyService.deleteStory(currentStory._id);
                                        // Small delay then close/next
                                        if (currentUserGroup.stories.length === 1) {
                                            onClose();
                                        } else {
                                            handleNext();
                                        }
                                    } catch (error) {
                                        console.error("Failed to delete", error);
                                        setIsPaused(false);
                                    }
                                }
                            }}
                            style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            <span style={{ fontWeight: '600' }}>Delete</span>
                        </button>
                    </div>
                )}

                {/* Viewers List Overlay */}
                {showViewers && (
                    <div 
                        style={{
                            position: 'absolute', inset: 0, zIndex: 100,
                            backgroundColor: 'rgba(0,0,0,0.95)', display: 'flex', flexDirection: 'column',
                            animation: 'slideUp 0.3s ease-out'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <style>{`
                            @keyframes slideUp {
                                from { transform: translateY(100%); }
                                to { transform: translateY(0); }
                            }
                        `}</style>
                        <div style={{ padding: '20px 16px', borderBottom: '1px solid #262626', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ color: 'white', fontSize: '16px', margin: 0 }}>Viewers</h3>
                            <button onClick={handleCloseViewers} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
                            {loadingViewers ? (
                                <ListSkeleton />
                            ) : viewers.length === 0 ? (
                                <div style={{ color: '#888', textAlign: 'center', marginTop: '40px' }}>No views yet</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {viewers.map(viewer => (
                                        <div key={viewer._id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <img 
                                                src={viewer.profilePicture || "https://static.vecteezy.com/system/resources/previews/036/280/650/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg"} 
                                                alt={viewer.username}
                                                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                            />
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>{viewer.username}</span>
                                                <span style={{ color: '#888', fontSize: '13px' }}>{viewer.name}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoryViewerModal;
