import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthUtils';
import storyService from '../../../../services/storyService';
import StoryViewerModal from './StoryViewerModal';
import ImageCropper from '../ProfileSection/ImageCropper';
import StorySkeleton from './StorySkeleton';

const StoriesSection = () => {
    const { user } = useAuth();
    const [userGroups, setUserGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    
    // UI state
    const [visibleStartIndex, setVisibleStartIndex] = useState(0);
    const containerRef = useRef(null);
    const fileInputRef = useRef(null);
    const storiesPerView = 6;

    // View & Crop state
    const [viewerOpen, setViewerOpen] = useState(false);
    const [initialGroupIndex, setInitialGroupIndex] = useState(0);
    const [showCropper, setShowCropper] = useState(false);
    const [tempImage, setTempImage] = useState(null);

    const fetchStories = async () => {
        try {
            const data = await storyService.getActiveStories();
            if (data.success) {
                setUserGroups(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch stories:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStories();
    }, []);

    // Format the list of groups so "Your Story" is always first
    // Even if you have no active stories, you should have an entry to create one
    const getDisplayGroups = () => {
        const myId = user?.id || user?._id;
        const myGroup = userGroups.find(g => g.user._id === myId);
        const otherGroups = userGroups.filter(g => g.user._id !== myId);
        
        const myDisplayGroup = myGroup || {
            user: { _id: myId, username: 'Your Story', profilePicture: user?.profilePicture },
            stories: [],
            isPlaceholder: true
        };

        return [myDisplayGroup, ...otherGroups];
    };

    const displayGroups = getDisplayGroups();

    // Scroll logic
    const updateVisibleStories = () => {
        if (containerRef.current) {
            const container = containerRef.current;
            const scrollLeft = container.scrollLeft;
            const storyWidth = 114; // 90px width + 24px gap
            const newIndex = Math.round(scrollLeft / storyWidth);
            setVisibleStartIndex(newIndex);
        }
    };

    const scrollToStory = (index) => {
        if (containerRef.current) {
            const storyWidth = 114;
            const scrollLeft = index * storyWidth;
            containerRef.current.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            });
        }
    };

    const scrollStories = (direction) => {
        if (direction === 'right') {
            const newIndex = Math.min(visibleStartIndex + storiesPerView, displayGroups.length - storiesPerView);
            scrollToStory(newIndex);
        } else {
            const newIndex = Math.max(visibleStartIndex - storiesPerView, 0);
            scrollToStory(newIndex);
        }
    };

    const canScrollLeft = visibleStartIndex > 0;
    const canScrollRight = visibleStartIndex + storiesPerView < displayGroups.length;
    const firstVisibleIndex = visibleStartIndex;
    const lastVisibleIndex = Math.min(visibleStartIndex + storiesPerView - 1, displayGroups.length - 1);

    // Upload logic
    const handleAddStoryClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check if video or image
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
                setTempImage(reader.result);
                setShowCropper(true);
            };
            reader.readAsDataURL(file);
        } else if (file.type.startsWith('video/')) {
            // Check size (15MB)
            if (file.size > 15 * 1024 * 1024) {
                alert('Video must be less than 15MB');
                return;
            }
            // Upload immediately
            await handleUpload(file);
        } else {
            alert('Unsupported file type');
        }
        
        // Reset input
        e.target.value = '';
    };

    const handleCropComplete = async (croppedBlob) => {
        setShowCropper(false);
        const croppedFile = new File([croppedBlob], "story.jpg", { type: "image/jpeg" });
        await handleUpload(croppedFile);
    };

    const handleUpload = async (file) => {
        setUploading(true);
        try {
            await storyService.createStory(file);
            await fetchStories(); // Refresh stories
        } catch (error) {
            console.error('Error uploading story:', error);
            alert('Failed to upload story');
        } finally {
            setUploading(false);
        }
    };

    const handleStoryClick = (index, group) => {
        if (group.isPlaceholder) {
            handleAddStoryClick();
        } else {
            // Find index in userGroups (ignoring placeholder logic)
            const realIndex = userGroups.findIndex(g => g.user._id === group.user._id);
            if (realIndex !== -1) {
                setInitialGroupIndex(realIndex);
                setViewerOpen(true);
            }
        }
    };

    const handleViewed = (/* storyId */) => {
        // Optimistically update if needed, but fetch runs periodically or on close ideally.
        // For now, let's just trigger a refetch next time we need it or rely on the backend state.
    };

    const checkViewedStatus = (group) => {
        if (group.isPlaceholder || group.stories.length === 0) return 'none'; // My placeholder
        const myId = user?.id || user?._id;
        const allViewed = group.stories.every(s => s.viewers?.includes(myId));
        return allViewed ? 'viewed' : 'unseen';
    };


    const NavigationButton = ({ direction, onClick }) => (
        <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="btn"
            style={{
                width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(80, 80, 80, 0.95)',
                opacity: 0.7, border: '2px solid #000', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', padding: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                position: 'absolute', [direction === 'left' ? 'left' : 'right']: '-2px',
                top: '50%', transform: 'translateY(-50%)', zIndex: 10
            }}
        >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <polyline points={direction === 'left' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} />
            </svg>
        </button>
    );

    const StoryAvatar = ({ group, size = 'desktop', index, showButtons = true }) => {
        const dimensions = size === 'desktop'
            ? { outer: 80, inner: 74, plusSize: 24, plusIcon: 14 }
            : { outer: 70, inner: 64, plusSize: 22, plusIcon: 12 };

        const isMine = group.user._id === (user?.id || user?._id);
        const status = checkViewedStatus(group);

        let ringStyle = {};
        if (status === 'unseen') {
            ringStyle = { background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', padding: '3px' };
        } else if (status === 'viewed') {
            ringStyle = { background: '#444', padding: '2px' }; // Grey ring
        }

        return (
            <div className="mb-2 position-relative d-inline-block" onClick={() => handleStoryClick(index, group)}>
                <div style={{
                    ...ringStyle,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    position: 'relative'
                }}>
                    <div style={{
                        width: `${dimensions.inner}px`,
                        height: `${dimensions.inner}px`,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '3px solid #000',
                        backgroundColor: '#1a1a1a'
                    }}>
                        <img
                            src={group.user.profilePicture || "https://static.vecteezy.com/system/resources/previews/036/280/650/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg"}
                            alt={group.user.username}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: uploading && isMine ? 0.5 : 1 }}
                        />
                        {uploading && isMine && (
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div className="spinner-border spinner-border-sm text-light" role="status"></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Plus Button for "Your Story" (Placeholder or Mine) */}
                {isMine && (
                    <div 
                        onClick={(e) => { e.stopPropagation(); handleAddStoryClick(); }}
                        style={{
                            position: 'absolute', bottom: size === 'desktop' ? '2px' : '0', right: size === 'desktop' ? '2px' : '0',
                            width: `${dimensions.plusSize}px`, height: `${dimensions.plusSize}px`, borderRadius: '50%',
                            backgroundColor: '#0095f6', border: '3px solid #000', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', cursor: 'pointer'
                        }}
                    >
                        <svg width={dimensions.plusIcon} height={dimensions.plusIcon} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </div>
                )}

                {/* Navigation Buttons */}
                {showButtons && size === 'desktop' && (
                    <>
                        {index === firstVisibleIndex && canScrollLeft && (
                            <NavigationButton direction="left" onClick={() => scrollStories('left')} />
                        )}
                        {index === lastVisibleIndex && canScrollRight && (
                            <NavigationButton direction="right" onClick={() => scrollStories('right')} />
                        )}
                    </>
                )}
            </div>
        );
    };

    const StoryItem = ({ group, index, size = 'desktop', showButtons = true }) => {
        const maxWidth = size === 'desktop' ? '90px' : '80px';
        const minWidth = size === 'desktop' ? '90px' : '80px';

        return (
            <div className="text-center position-relative" style={{ minWidth, flexShrink: size === 'desktop' ? 0 : undefined }}>
                <StoryAvatar group={group} size={size} index={index} showButtons={showButtons} />
                <div style={{ fontSize: '12px', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth }}>
                    {group.user.username === user?.username ? 'Your Story' : group.user.username}
                </div>
            </div>
        );
    };

    return (
        <>
            <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept="image/*,video/*"
                onChange={handleFileChange}
            />

            {/* Desktop Stories Section */}
            <div className="d-none d-md-block py-4 position-relative" style={{ backgroundColor: '#000' }}>
                <style>{`
                    .scrollbar-hide::-webkit-scrollbar { display: none; }
                    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                `}</style>
                <div style={{ maxWidth: '690px', margin: '0 auto', overflow: 'hidden', position: 'relative' }}>
                    <div ref={containerRef} style={{ overflowX: 'auto', scrollBehavior: 'smooth', position: 'relative' }} className="scrollbar-hide" onScroll={updateVisibleStories}>
                        {loading ? (
                            <StorySkeleton />
                        ) : (
                            <div className="d-flex gap-4 align-items-center" style={{ position: 'relative', paddingLeft: '20px', paddingRight: '20px', justifyContent: 'flex-start' }}>
                                {displayGroups.map((group, index) => (
                                    <StoryItem key={group.user._id} group={group} index={index} size="desktop" showButtons={true} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Stories Section */}
            <div className="d-md-none py-4 px-3" style={{ backgroundColor: '#000', borderBottom: '1px solid #262626', overflowX: 'auto', whiteSpace: 'nowrap', scrollBehavior: 'smooth' }}>
                {loading ? (
                    <StorySkeleton />
                ) : (
                    <div className="d-flex gap-3">
                        {displayGroups.map((group, index) => (
                            <StoryItem key={group.user._id} group={group} index={index} size="mobile" showButtons={false} />
                        ))}
                    </div>
                )}
            </div>

            {/* Viewer Modal */}
            {viewerOpen && userGroups.length > 0 && (
                <StoryViewerModal 
                    userGroups={userGroups} 
                    initialGroupIndex={initialGroupIndex} 
                    onClose={() => {
                        setViewerOpen(false);
                        fetchStories(); // Refetch to update viewed status
                    }}
                    onViewed={handleViewed}
                />
            )}

            {/* Image Cropper Modal */}
            {showCropper && (
                <ImageCropper 
                    image={tempImage} 
                    onCropComplete={handleCropComplete} 
                    onCancel={() => setShowCropper(false)} 
                    aspect={9 / 16} // 9:16 aspect ratio for stories
                />
            )}
        </>
    );
};

export default StoriesSection;