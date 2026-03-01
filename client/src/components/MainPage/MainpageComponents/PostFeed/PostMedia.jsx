import React, { useRef, useEffect, useState } from 'react';

const PostMedia = ({ media, caption }) => {
    const videoRef = useRef(null);
    const [isMuted, setIsMuted] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (media.type !== 'video') return;

        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.6 // Play when 60% visible
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    videoRef.current?.play().catch(() => {
                        // Autoplay might be blocked if not muted
                        setIsMuted(true);
                    });
                } else {
                    videoRef.current?.pause();
                }
            });
        }, options);

        const currentVideo = videoRef.current;
        if (currentVideo) {
            observer.observe(currentVideo);
        }

        return () => {
            if (currentVideo) {
                observer.unobserve(currentVideo);
            }
        };
    }, [media.type]);

    const toggleMute = (e) => {
        e.stopPropagation();
        setIsMuted(!isMuted);
    };

    if (media.type === 'video') {
        return (
            <div style={{ position: 'relative', width: '100%', background: '#000', aspectRatio: '4/5' }}>
                <video
                    ref={videoRef}
                    src={media.url}
                    poster={media.thumbnailUrl}
                    muted={isMuted}
                    loop
                    playsInline
                    onLoadedData={() => setIsLoaded(true)}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                    }}
                />
                
                {/* Mute toggle button */}
                <button 
                    onClick={toggleMute}
                    style={{
                        position: 'absolute',
                        bottom: '12px',
                        right: '12px',
                        background: 'rgba(0,0,0,0.5)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        cursor: 'pointer',
                        zIndex: 2
                    }}
                >
                    {isMuted ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.03c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                        </svg>
                    ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                        </svg>
                    )}
                </button>

                {/* Initial Play Overlay if not playing */}
                {!isLoaded && (
                   <div style={{
                       position: 'absolute',
                       top: 0, left: 0, right: 0, bottom: 0,
                       display: 'flex', alignItems: 'center', justifyContent: 'center',
                       background: '#111'
                   }}>
                       <div className="shimmer" style={{ width: '100%', height: '100%' }}></div>
                   </div>
                )}
            </div>
        );
    }

    return (
        <div style={{ width: '100%', aspectRatio: '4/5', background: '#000', overflow: 'hidden' }}>
            <img 
                src={media.url} 
                alt={caption || 'Post media'} 
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    objectFit: 'contain'
                }}
                loading="lazy"
            />
        </div>
    );
};

export default PostMedia;
