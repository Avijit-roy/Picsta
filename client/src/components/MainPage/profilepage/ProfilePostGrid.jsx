import React from 'react';

/**
 * ProfilePostGrid Component
 * 
 * Renders a responsive 3-column grid of post thumbnails. 
 * Handles loading states and provides informative empty states 
 * for both dynamic post feeds and saved collections.
 * 
 * @param {Object} props
 * @param {boolean} props.loadingPosts - If true, displays a loading indicator
 * @param {Array} props.displayPosts - Array of post objects to render in the grid
 * @param {Function} props.onPostClick - Handler for clicking/selecting a post thumbnail
 * @param {string} props.tab - Contextual info to customize the empty state message
 */
const ProfilePostGrid = ({ loadingPosts, displayPosts, onPostClick, tab }) => {
  return (
    <div className="posts-grid" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '12px',
      padding: '16px'
    }}>
      {loadingPosts ? (
        <div className="empty-view" style={{
          padding: '100px 0',
          textAlign: 'center',
          color: '#333',
          fontSize: '13px',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          gridColumn: 'span 3'
        }}>Loading...</div>
      ) : displayPosts.length === 0 ? (
        <div className="empty-view" style={{
          padding: '100px 0',
          textAlign: 'center',
          color: '#333',
          fontSize: '13px',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          gridColumn: 'span 3'
        }}>
          {tab === "posts" ? "No posts" : "Saved empty"}
        </div>
      ) : (
        displayPosts.map(post => {
          const firstMedia = post.media && post.media[0];
          const isVideo = firstMedia?.type === 'video';
          const displayUrl = isVideo ? (firstMedia.thumbnailUrl || firstMedia.url) : (firstMedia?.url || "");
          
          return (
            <div 
              key={post._id} 
              className="grid-post"
              onClick={() => onPostClick(post)}
              style={{
                aspectRatio: '1',
                background: '#111',
                overflow: 'hidden',
                cursor: 'pointer',
                borderRadius: '12px',
                position: 'relative'
              }}
            >
              <img 
                src={displayUrl} 
                alt={post.caption} 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease, opacity 0.3s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.opacity = '0.9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1'; }}
              />
              
              {isVideo && (
                <>
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    color: 'white',
                    dropShadow: '0 0 10px rgba(0,0,0,0.5)'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  {firstMedia.duration && (
                    <div style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      background: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: '600'
                    }}>
                      {Math.floor(firstMedia.duration / 60)}:{Math.floor(firstMedia.duration % 60).toString().padStart(2, '0')}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default ProfilePostGrid;
