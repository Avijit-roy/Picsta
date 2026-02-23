import React from 'react';

/**
 * ProfileInfo Component
 * 
 * Displays user identity information (name, @username, bio) and 
 * contextual action buttons based on whether the profile is the user's own.
 * 
 * @param {Object} props
 * @param {Object} props.userData - User profile data (name, username, bio, isFollowing)
 * @param {boolean} props.isOwnProfile - Flag determining if this is the logged-in user's profile
 * @param {Function} props.onEditClick - Handler for opening the edit profile modal
 * @param {Function} props.onFollowToggle - Handler for follow/unfollow actions
 * @param {Function} props.onMessageClick - Handler for initiating a message/chat
 */
const ProfileInfo = ({ userData, isOwnProfile, onEditClick, onFollowToggle, onMessageClick }) => {
  return (
    <>
      <div className="user-info" style={{ marginBottom: '24px', textAlign: 'left' }}>
        <div className="name-bold" style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '16px',
          fontWeight: 600,
          color: '#fff',
          textAlign: 'left'
        }}>{userData.name}</div>
        <div className="handle-muted" style={{
          fontSize: '13px',
          color: '#888',
          marginTop: '1px',
          textAlign: 'left'
        }}>@{userData.username?.replace(/^@/, '')}</div>
      </div>

      {/* Bio */}
      {userData.bio && (
        <div style={{ marginBottom: '24px', textAlign: 'left' }}>
          <p style={{ fontSize: '14px', color: '#ccc', lineHeight: '1.4', fontWeight: '400' }}>
            {userData.bio}
          </p>
        </div>
      )}

      {/* Edit Button or Follow/Message Buttons */}
      <div className="edit-btn-container" style={{
        marginBottom: '32px',
        display: 'flex',
        gap: '8px'
      }}>
        {isOwnProfile ? (
          <button 
            className="btn-full-width" 
            onClick={onEditClick}
            style={{
              width: '100%',
              background: '#262626',
              color: '#fff',
              border: 'none',
              height: '38px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            Edit Profile
          </button>
        ) : (
          <>
            <button 
              className="btn-full-width" 
              style={{ 
                backgroundColor: userData.isFollowing ? '#262626' : '#0095f6', 
                color: '#fff',
                flex: 1,
                width: '100%',
                border: 'none',
                height: '38px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onClick={onFollowToggle}
            >
              {userData.isFollowing ? 'Following' : 'Follow'}
            </button>
            <button 
              className="btn-full-width" 
              style={{ 
                backgroundColor: '#262626', 
                color: '#fff',
                flex: 1,
                width: '100%',
                border: 'none',
                height: '38px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onClick={onMessageClick}
            >
              Message
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default ProfileInfo;
