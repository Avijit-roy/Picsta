import React, { useState, useRef } from 'react';

const StoriesSection = ({ stories }) => {
    const [visibleStartIndex, setVisibleStartIndex] = useState(0);
    const containerRef = useRef(null);
    const storiesPerView = 6;

    // Calculate which stories should be visible based on scroll position
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
            const newIndex = Math.min(visibleStartIndex + storiesPerView, stories.length - storiesPerView);
            scrollToStory(newIndex);
        } else {
            const newIndex = Math.max(visibleStartIndex - storiesPerView, 0);
            scrollToStory(newIndex);
        }
    };

    // Check if we can scroll
    const canScrollLeft = visibleStartIndex > 0;
    const canScrollRight = visibleStartIndex + storiesPerView < stories.length;

    // Get the first and last visible story indices
    const firstVisibleIndex = visibleStartIndex;
    const lastVisibleIndex = Math.min(visibleStartIndex + storiesPerView - 1, stories.length - 1);

    // Reusable Navigation Button Component
    const NavigationButton = ({ direction, onClick }) => (
        <button
            onClick={onClick}
            className="btn"
            style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'rgba(80, 80, 80, 0.95)',
                opacity: 0.7,
                border: '2px solid #000',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                position: 'absolute',
                [direction === 'left' ? 'left' : 'right']: '-2px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10
            }}
        >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <polyline points={direction === 'left' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} />
            </svg>
        </button>
    );

    // Reusable Story Avatar Component
    const StoryAvatar = ({ story, size = 'desktop', index, showButtons = true }) => {
        const dimensions = size === 'desktop'
            ? { outer: 80, inner: 74, plusSize: 24, plusIcon: 14 }
            : { outer: 70, inner: 64, plusSize: 22, plusIcon: 12 };

        return (
            <div className="mb-2 position-relative d-inline-block">
                {story.isYourStory ? (
                    <div style={{ position: 'relative', cursor: 'pointer' }}>
                        <div style={{
                            width: `${dimensions.outer}px`,
                            height: `${dimensions.outer}px`,
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: '2px solid #262626',
                            backgroundColor: '#1a1a1a'
                        }}>
                            <img
                                src={story.avatar}
                                alt={story.username}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                        {/* Plus Button */}
                        <div style={{
                            position: 'absolute',
                            bottom: size === 'desktop' ? '2px' : '0',
                            right: size === 'desktop' ? '2px' : '0',
                            width: `${dimensions.plusSize}px`,
                            height: `${dimensions.plusSize}px`,
                            borderRadius: '50%',
                            backgroundColor: '#0095f6',
                            border: '3px solid #000',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}>
                            <svg width={dimensions.plusIcon} height={dimensions.plusIcon} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        </div>
                        {/* Navigation Buttons (desktop only) */}
                        {showButtons && size === 'desktop' && index === firstVisibleIndex && canScrollLeft && (
                            <NavigationButton direction="left" onClick={() => scrollStories('left')} />
                        )}
                    </div>
                ) : (
                    <div style={{
                        background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                        borderRadius: '50%',
                        padding: '3px',
                        cursor: 'pointer',
                        position: 'relative'
                    }}>
                        <div style={{
                            width: `${dimensions.inner}px`,
                            height: `${dimensions.inner}px`,
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: '3px solid #000'
                        }}>
                            <img
                                src={story.avatar}
                                alt={story.username}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                        {/* Navigation Buttons (desktop only) */}
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
                )}
            </div>
        );
    };

    // Reusable Story Item Component
    const StoryItem = ({ story, index, size = 'desktop', showButtons = true }) => {
        const maxWidth = size === 'desktop' ? '90px' : '80px';
        const minWidth = size === 'desktop' ? '90px' : '80px';

        return (
            <div
                className="text-center position-relative"
                style={{
                    minWidth,
                    flexShrink: size === 'desktop' ? 0 : undefined
                }}
            >
                <StoryAvatar story={story} size={size} index={index} showButtons={showButtons} />
                <div style={{
                    fontSize: '12px',
                    color: '#fff',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth
                }}>
                    {story.username}
                </div>
            </div>
        );
    };

    return (
        <>
            {/* Desktop Stories Section */}
            <div className="d-none d-md-block py-4 position-relative" style={{ backgroundColor: '#000' }}>
                <style>{`
                    .scrollbar-hide::-webkit-scrollbar {
                        display: none;
                    }
                    .scrollbar-hide {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}</style>

                {/* Container with fixed width for 6 stories */}
                <div style={{
                    maxWidth: '690px',
                    margin: '0 auto',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    <div
                        ref={containerRef}
                        style={{
                            overflowX: 'auto',
                            scrollBehavior: 'smooth',
                            position: 'relative'
                        }}
                        className="scrollbar-hide"
                        onScroll={updateVisibleStories}
                    >
                        <div className="d-flex gap-4 align-items-center" style={{
                            position: 'relative',
                            paddingLeft: '20px',
                            paddingRight: '20px',
                            justifyContent: 'flex-start'
                        }}>
                            {stories.map((story, index) => (
                                <StoryItem
                                    key={story.id}
                                    story={story}
                                    index={index}
                                    size="desktop"
                                    showButtons={true}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Stories Section */}
            <div className="d-md-none py-4 px-3" style={{
                backgroundColor: '#000',
                borderBottom: '1px solid #262626',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
                scrollBehavior: 'smooth'
            }}>
                <div className="d-flex gap-3">
                    {stories.map((story) => (
                        <StoryItem
                            key={story.id}
                            story={story}
                            index={-1}
                            size="mobile"
                            showButtons={false}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};

export default StoriesSection;