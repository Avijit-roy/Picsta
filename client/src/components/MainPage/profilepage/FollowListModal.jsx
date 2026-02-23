import React from 'react';

/**
 * FollowListModal Component
 * 
 * A floating modal that displays a list of users (followers or following).
 * Features a tabbed interface to switch between Followers and Following.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Handler to close the modal
 * @param {string} props.activeTab - Currently active tab ('followers' or 'following')
 * @param {Function} props.onTabChange - Handler for switching tabs
 * @param {Array} props.users - List of user objects to display
 * @param {boolean} props.loading - If true, shows a loading state
 * @param {Function} props.onUserClick - Handler for when a user is clicked
 */
const FollowListModal = ({ isOpen, onClose, activeTab, onTabChange, users, loading, onUserClick }) => {
  if (!isOpen) return null;

  const tabs = [
    { id: 'followers', label: 'Followers' },
    { id: 'following', label: 'Following' }
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3000,
      backdropFilter: 'blur(4px)',
      animation: 'fadeIn 0.2s ease-out'
    }} onClick={onClose}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .modal-content {
          animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .user-row:hover {
          background-color: #1a1a1a;
        }
        .tab-btn:hover {
          color: #fff !important;
        }
      `}</style>
      
      <div 
        className="modal-content"
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#000',
          borderRadius: '12px',
          border: '1px solid #262626',
          maxHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }} 
        onClick={e => e.stopPropagation()}
      >
        {/* Header & Tabs */}
        <div style={{
          borderBottom: '1px solid #262626',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 600,
              margin: 0,
              color: '#fff',
              fontFamily: "'Outfit', sans-serif"
            }}>User Lists</h3>
            
            <button 
              onClick={onClose}
              style={{
                position: 'absolute',
                right: '12px',
                background: 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Tab Bar */}
          <div style={{
            display: 'flex',
            position: 'relative',
            padding: '0 8px'
          }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                className="tab-btn"
                onClick={() => onTabChange(tab.id)}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  background: 'none',
                  border: 'none',
                  color: activeTab === tab.id ? '#fff' : '#888',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                  position: 'relative'
                }}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '25%',
                    width: '50%',
                    height: '2px',
                    backgroundColor: '#fff',
                    borderRadius: '2px'
                  }} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* List Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 0',
          scrollbarWidth: 'none'
        }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>
              <div className="spinner-border spinner-border-sm" role="status" style={{
                width: '24px',
                height: '24px',
                border: '2px solid #fff',
                borderRightColor: 'transparent',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'spin 0.8s linear infinite'
              }}></div>
              <style>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
              <p style={{ marginTop: '16px', fontSize: '14px' }}>Loading {activeTab}...</p>
            </div>
          ) : users.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>
              <p style={{ fontSize: '14px' }}>No {activeTab} yet.</p>
            </div>
          ) : (
            users.map(user => (
              <div 
                key={user._id || user.id}
                className="user-row"
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
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  <img 
                    src={user.profilePicture || "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg"} 
                    alt={user.username}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#fff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {user.username}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#888',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {user.name}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowListModal;
