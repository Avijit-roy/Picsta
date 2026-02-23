import React from 'react';

const GridIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);

const BookmarkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
);

/**
 * ProfileTabs Component
 * 
 * Provides the navigation interface for switching between the posts grid
 * and the saved posts view (for the owner). Includes a sliding indicator.
 * 
 * @param {Object} props
 * @param {string} props.tab - Currently active tab ('posts' or 'saved')
 * @param {Function} props.setTab - State setter to switch between tabs
 * @param {boolean} props.isOwnProfile - If true, displays the 'saved' tab option
 */
const ProfileTabs = ({ tab, setTab, isOwnProfile }) => {
  return (
    <div className="tabs" style={{
      display: 'flex',
      borderTop: '0.5px solid rgba(255, 255, 255, 0.05)',
      position: 'relative',
    }}>
      <button 
        className={`tab-item ${tab === "posts" ? "active" : ""}`} 
        onClick={() => setTab("posts")}
        style={{
          flex: 1,
          height: '48px',
          background: 'none',
          border: 'none',
          color: tab === "posts" ? '#fff' : '#444',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color 0.3s',
          position: 'relative',
        }}
      >
        <GridIcon />
      </button>
      {isOwnProfile && (
        <button 
          className={`tab-item ${tab === "saved" ? "active" : ""}`} 
          onClick={() => setTab("saved")}
          style={{
            flex: 1,
            height: '48px',
            background: 'none',
            border: 'none',
            color: tab === "saved" ? '#fff' : '#444',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.3s',
            position: 'relative',
          }}
        >
          <BookmarkIcon />
        </button>
      )}
      <div 
        className="tab-indicator" 
        style={{ 
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: isOwnProfile ? "50%" : "100%",
          height: '2px',
          background: '#fff',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 10,
          transform: `translateX(${tab === "posts" ? "0%" : "100%"})` 
        }}
      />
    </div>
  );
};

export default ProfileTabs;
