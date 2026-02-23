import React from 'react';

/**
 * ProfileHeader Component
 * 
 * Renders the top section of the profile, including the user's avatar
 * and statistics (posts count, followers, and following).
 * 
 * @param {Object} props
 * @param {Object} props.userData - Object containing profilePicture, postsCount, followersCount, and followingCount
 * @param {Function} props.onFollowersClick - Handler for clicking followers count
 * @param {Function} props.onFollowingClick - Handler for clicking following count
 */
const ProfileHeader = ({ userData, onFollowersClick, onFollowingClick }) => {
  return (
    <div className="profile-intro" style={{
      display: 'flex',
      alignItems: 'center',
      gap: '32px',
      marginBottom: '16px'
    }}>
      <div className="avatar-container" style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0
      }}>
        <img
          className="avatar-img"
          src={userData.profilePicture || "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg"}
          alt="profile"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      
      <div className="stats-row" style={{
        display: 'flex',
        justifyContent: 'space-between',
        flex: 1
      }}>
        {[
          { val: userData.postsCount || 0, lbl: "Posts", handler: null },
          { val: userData.followersCount || 0, lbl: "Followers", handler: onFollowersClick },
          { val: userData.followingCount || 0, lbl: "Following", handler: onFollowingClick },
        ].map(s => (
          <div 
            key={s.lbl} 
            className="stat-item" 
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: s.handler ? 'pointer' : 'default'
            }}
            onClick={s.handler ? s.handler : undefined}
          >
            <div className="stat-val" style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '16px',
              fontWeight: 700,
              color: '#fff'
            }}>{s.val}</div>
            <div className="stat-lbl" style={{
              fontSize: '12px',
              color: '#888',
              fontWeight: 400,
              marginTop: '2px'
            }}>{s.lbl}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileHeader;
