import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthUtils';
import userService from '../../../../services/userService';
import postService from '../../../../services/postService';

/**
 * LikersModal Component
 * 
 * Displays a list of users who liked a post.
 * Features:
 * - Real-time search/filtering
 * - Follow/Unfollow toggle
 * - Dark premium theme matching Picsta design
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal visibility
 * @param {Function} props.onClose - Close handler
 * @param {string} props.postId - Post ID to fetch likers for
 * @param {Function} props.onUserClick - Handler for navigating to a user profile
 */
const LikersModal = ({ isOpen, onClose, postId, onUserClick }) => {
  const { user: authUser } = useAuth();
  const [likers, setLikers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [localFollowState, setLocalFollowState] = useState({});

  useEffect(() => {
    const fetchLikers = async () => {
      if (!isOpen || !postId) return;
      setLoading(true);
      try {
        const result = await postService.getLikers(postId);
        if (result.success) {
          setLikers(result.data);
          // Initialize local follow state
          const followState = {};
          result.data.forEach(user => {
            followState[user._id] = user.isFollowing;
          });
          setLocalFollowState(followState);
        }
      } catch (error) {
        console.error('Error fetching likers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLikers();
  }, [isOpen, postId]);

  useEffect(() => {
    if (!isOpen) return;

    const handleUserFollowUpdate = (e) => {
      const { userId, isFollowing } = e.detail;
      setLocalFollowState(prev => ({ ...prev, [userId]: isFollowing }));
    };

    window.addEventListener('USER_FOLLOW_UPDATED', handleUserFollowUpdate);
    return () => window.removeEventListener('USER_FOLLOW_UPDATED', handleUserFollowUpdate);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFollowToggle = async (e, userId) => {
    e.stopPropagation();
    const currentState = localFollowState[userId];
    setLocalFollowState(prev => ({ ...prev, [userId]: !currentState }));
    
    try {
      const result = await userService.toggleFollow(userId);
      if (result.success) {
        // Broadcast change
        userService.notifyUserFollowUpdate(userId, !currentState);
      } else {
        // Revert on failure
        setLocalFollowState(prev => ({ ...prev, [userId]: currentState }));
      }
    } catch (error) {
      console.error('Follow toggle error:', error);
      setLocalFollowState(prev => ({ ...prev, [userId]: currentState }));
    }
  };

  const filteredLikers = likers.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 5000,
      backdropFilter: 'blur(10px)',
      animation: 'fadeIn 0.2s ease-out'
    }} onClick={onClose}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .likers-modal-content { animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .liker-row:hover { background-color: rgba(255, 255, 255, 0.03); }
        .search-input::placeholder { color: #555; }
        .likers-scroll::-webkit-scrollbar { width: 4px; }
        .likers-scroll::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
      `}</style>

      <div 
        className="likers-modal-content"
        style={{
          width: '90%',
          maxWidth: '400px',
          backgroundColor: '#121212',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }} 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          position: 'relative'
        }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#fff', fontFamily: "'Outfit', sans-serif" }}>Likes</h3>
          <button 
            onClick={onClose}
            style={{
              position: 'absolute',
              right: '16px',
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '12px 16px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <svg style={{ position: 'absolute', left: '12px', color: '#555' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input 
              type="text"
              className="search-input"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#1a1a1a',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 12px 10px 38px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="likers-scroll" style={{
          flex: 1,
          overflowY: 'auto',
          paddingBottom: '12px'
        }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{
                width: '24px', height: '24px',
                border: '2px solid rgba(255,255,255,0.1)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'spin 1s linear infinite'
              }}></div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : filteredLikers.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#555', fontSize: '14px' }}>
              {searchQuery ? 'No results found' : 'No likes yet'}
            </div>
          ) : (
            filteredLikers.map(user => (
              <div 
                key={user._id}
                className="liker-row"
                style={{
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onClick={() => onUserClick(user.username)}
              >
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <img 
                    src={user.profilePicture || "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg"} 
                    alt={user.username}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.username}</div>
                  <div style={{ fontSize: '13px', color: '#888', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.name}</div>
                </div>
                {user._id !== authUser?.id && (
                  <button
                    onClick={(e) => handleFollowToggle(e, user._id)}
                    style={{
                      backgroundColor: localFollowState[user._id] ? '#1a1a1a' : '#7c3aed',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {localFollowState[user._id] ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LikersModal;
