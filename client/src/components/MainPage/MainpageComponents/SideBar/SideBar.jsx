import React, { useState } from 'react';
import { useAuth } from "../../../../context/AuthUtils";
import SearchPanel from './SearchPanel';
import NotificationsPanel from './NotificationsPanel';

const Sidebar = ({ 
    isDrawerOpen, 
    setIsDrawerOpen, 
    onProfileClick, 
    onHomeClick, 
    onMessagesClick, 
    onReelsClick, 
    onCreateClick, 
    onLogout, 
    onUserClick, 
    onPostClick, 
    unreadMessages = 0,
    unreadNotifications = 0
}) => {
    const { user } = useAuth();
    const [searchOpen, setSearchOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    // When search or notifications are open, force sidebar to icon-only (collapsed) mode
    // Messages page allows the drawer to expand on hover
    const isPanelActive = searchOpen || notificationsOpen;
    const drawerEffective = isPanelActive ? false : isDrawerOpen;

    const navItems = [
        { name: 'Home', icon: 'home', filled: true },
        { name: 'Search', icon: 'search' },
        { name: 'Reels', icon: 'reels' },
        { 
            name: 'Messages', 
            icon: 'messages', 
            badge: unreadMessages > 0 ? (unreadMessages > 10 ? '10+' : unreadMessages) : null 
        },
        { 
            name: 'Notifications', 
            icon: 'notifications', 
            badge: unreadNotifications > 0 ? (unreadNotifications > 10 ? '10+' : unreadNotifications) : null 
        },
        { name: 'Create', icon: 'create' },
    ];

    const bottomItems = [
        { name: 'Profile', icon: 'profile' },
        { name: 'Logout', icon: 'logout' }
    ];

    // Icon rendering function
    const renderIcon = (iconName, filled = false) => {
        const icons = {
            home: filled ? (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                    <path d="M9.005 16.545a2.997 2.997 0 0 1 2.997-2.997A2.997 2.997 0 0 1 15 16.545V22h7V11.543L12 2 2 11.543V22h7.005z" />
                </svg>
            ) : (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
            ),
            search: (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                </svg>
            ),
            explore: (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
            ),
            reels: (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                    <line x1="7" y1="2" x2="7" y2="22" />
                    <line x1="17" y1="2" x2="17" y2="22" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <line x1="2" y1="7" x2="7" y2="7" />
                    <line x1="2" y1="17" x2="7" y2="17" />
                    <line x1="17" y1="17" x2="22" y2="17" />
                    <line x1="17" y1="7" x2="22" y2="7" />
                </svg>
            ),
            messages: (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
                    <path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5M3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6m0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5" />
                </svg>
            ),
            notifications: (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
            ),
            create: (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
            ),
            logout: (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
            ),
            profile: (
                <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '1.5px solid white',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}>
                    <img 
                        src={user?.profilePicture || "https://static.vecteezy.com/system/resources/previews/036/280/650/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg"} 
                        alt="Profile" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                        onError={(e) => { e.target.src = "https://static.vecteezy.com/system/resources/previews/036/280/650/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg"; }}
                    />
                </div>
            ),
            more: (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
            )
        };

        return icons[iconName] || null;
    };

    // Reusable Navigation Button Component
    const NavButton = ({ item, onClick, active = false }) => (
        <button
            className="btn btn-link p-0 position-relative"
            onClick={onClick}
            style={{
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                height: '48px',
                paddingLeft: drawerEffective ? '12px' : '23px',
                paddingRight: drawerEffective ? '12px' : '23px',
                textDecoration: 'none',
                borderRadius: '8px',
                transition: 'background-color 0.2s, padding 0.3s ease',
                justifyContent: drawerEffective ? 'flex-start' : 'center',
                width: '100%',
                backgroundColor: active ? '#1a1a1a' : 'transparent',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a1a1a'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = active ? '#1a1a1a' : 'transparent'}
        >
            <div style={{
                minWidth: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
            }}>
                {renderIcon(item.icon, item.filled)}
                {item.badge && (
                    <span style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-10px',
                        backgroundColor: '#ff3b30',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: '800',
                        minWidth: '18px',
                        height: '18px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 4px',
                        border: '2px solid #000',
                        zIndex: 2,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}>
                        {item.badge}
                    </span>
                )}
            </div>
            {drawerEffective && (
                <span style={{
                    marginLeft: '16px',
                    fontSize: '16px',
                    whiteSpace: 'nowrap'
                }}>
                    {item.name}
                </span>
            )}
        </button>
    );

    const handleNavClick = (item) => {
        if (item.name === 'Search') {
            setNotificationsOpen(false);
            setSearchOpen(true);
        } else if (item.name === 'Notifications') {
            setSearchOpen(false);
            setNotificationsOpen(true);
        } else if (item.name === 'Home') {
            setSearchOpen(false);
            setNotificationsOpen(false);
            onHomeClick?.();
        } else if (item.name === 'Messages') {
            setSearchOpen(false);
            setNotificationsOpen(false);
            onMessagesClick?.();
        } else if (item.name === 'Reels') {
            setSearchOpen(false);
            setNotificationsOpen(false);
            onReelsClick?.();
        } else if (item.name === 'Create') {
            setSearchOpen(false);
            setNotificationsOpen(false);
            onCreateClick?.();
        }
    };

    const handleCloseSearch = () => { setSearchOpen(false); };
    const handleCloseNotifications = () => { setNotificationsOpen(false); };

    return (
        <>
            {/* Sidebar Rail */}
            <div
                className="d-none d-md-flex flex-column align-items-start"
                onMouseEnter={() => { if (!isPanelActive) setIsDrawerOpen(true); }}
                onMouseLeave={() => { if (!isPanelActive) setIsDrawerOpen(false); }}
                style={{
                    width: drawerEffective ? '240px' : '72px',
                    backgroundColor: '#000',
                    position: 'fixed',
                    height: '100vh',
                    left: 0,
                    top: 0,
                    paddingTop: '20px',
                    paddingBottom: '20px',
                    paddingLeft: drawerEffective ? '12px' : '0',
                    paddingRight: drawerEffective ? '12px' : '0',
                    transition: 'width 0.3s ease, padding 0.3s ease',
                    zIndex: 1600,
                    overflow: 'hidden',
                    borderRight: isPanelActive ? '1px solid #262626' : 'none',
                }}
            >
                {/* Logo */}
                <div style={{
                    marginBottom: '44px',
                    paddingLeft: drawerEffective ? '12px' : '5px',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: drawerEffective ? 'flex-start' : 'center',
                    transition: 'padding 0.3s ease'
                }}>
                    {drawerEffective ? (
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', fontFamily: 'cursive' }}>
                            Picsta
                        </div>
                    ) : (
                        <img
                            src="/Picsta_bw.png"
                            alt="Picsta Logo"
                            style={{ width: '40px', height: '40px', objectFit: 'contain', display: 'block' }}
                        />
                    )}
                </div>

                {/* Main Navigation */}
                <nav className="d-flex flex-column mb-auto" style={{ gap: '8px', width: '100%', paddingTop: '5rem' }}>
                    {navItems.map((item, index) => (
                        <NavButton
                            key={index}
                            item={item}
                            active={(searchOpen && item.name === 'Search') || (notificationsOpen && item.name === 'Notifications')}
                            onClick={() => handleNavClick(item)}
                        />
                    ))}
                </nav>

                {/* Bottom Navigation */}
                <div className="d-flex flex-column position-relative" style={{ gap: '8px', width: '100%' }}>
                    {bottomItems.map((item, index) => (
                        <div key={index} className="position-relative">
                            <NavButton
                                item={item}
                                showBadge={false}
                                onClick={
                                    item.name === 'Profile'
                                        ? onProfileClick
                                        : item.name === 'Logout'
                                            ? onLogout
                                            : undefined
                                }
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Slide-out panel — Search or Notifications */}
            <div
                className="d-none d-md-block"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: '72px',
                    height: '100vh',
                    zIndex: 1700,
                    width: isPanelActive ? '380px' : '0',
                    overflow: 'hidden',
                    transition: 'width 0.3s ease',
                }}
            >
                {searchOpen && <SearchPanel onClose={handleCloseSearch} onUserClick={onUserClick} />}
                {notificationsOpen && (
                    <NotificationsPanel 
                        onClose={handleCloseNotifications} 
                        onUserClick={onUserClick}
                        onPostClick={onPostClick}
                    />
                )}
            </div>
        </>
    );
};

export default Sidebar;