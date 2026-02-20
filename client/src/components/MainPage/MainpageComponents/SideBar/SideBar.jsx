import React from 'react';

const Sidebar = ({ isDrawerOpen, setIsDrawerOpen }) => {
    const navItems = [
        { name: 'Home', icon: 'home', filled: true },
        { name: 'Search', icon: 'search' },
        { name: 'Explore', icon: 'explore' },
        { name: 'Reels', icon: 'reels' },
        { name: 'Messages', icon: 'messages', badge: 1 },
        { name: 'Notifications', icon: 'notifications' },
        { name: 'Create', icon: 'create' },
        { name: 'Profile', icon: 'profile' }
    ];

    const bottomItems = [
        { name: 'Profile', icon: 'profile' },
        { name: 'More', icon: 'more' }
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
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-chat-left-text" viewBox="0 0 16 16">
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
            profile: (
                <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '2px solid white'
                }}>
                    <img src="https://i.pravatar.cc/150?img=33" alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
    const NavButton = ({ item, showBadge = false }) => (
        <button
            className="btn btn-link p-0 position-relative"
            style={{
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                height: '48px',
                paddingLeft: isDrawerOpen ? '12px' : '23px',
                paddingRight: isDrawerOpen ? '12px' : '23px',
                textDecoration: 'none',
                borderRadius: '8px',
                transition: 'background-color 0.2s, padding 0.3s ease',
                justifyContent: isDrawerOpen ? 'flex-start' : 'center',
                width: '100%'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a1a1a'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
            <div style={{
                minWidth: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
            }}>
                {renderIcon(item.icon, item.filled)}
                {showBadge && item.badge && (
                    <span className="badge rounded-pill bg-danger" style={{
                        fontSize: '9px',
                        padding: '2px 5px',
                        position: 'absolute',
                        top: '-6px',
                        right: '-8px',
                        minWidth: '18px'
                    }}>
                        {item.badge}
                    </span>
                )}
            </div>
            {isDrawerOpen && (
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

    return (
        <div
            className="d-none d-md-flex flex-column align-items-start"
            onMouseEnter={() => setIsDrawerOpen(true)}
            onMouseLeave={() => setIsDrawerOpen(false)}
            style={{
                width: isDrawerOpen ? '240px' : '72px',
                backgroundColor: '#000',
                position: 'fixed',
                height: '100vh',
                left: 0,
                top: 0,
                paddingTop: '20px',
                paddingBottom: '20px',
                paddingLeft: isDrawerOpen ? '12px' : '0',
                paddingRight: isDrawerOpen ? '12px' : '0',
                transition: 'width 0.3s ease, padding 0.3s ease',
                zIndex: 1000,
                overflow: 'hidden'
            }}
        >
            {/* Logo */}
            <div style={{
                marginBottom: '44px',
                paddingLeft: isDrawerOpen ? '12px' : '23px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isDrawerOpen ? 'flex-start' : 'center',
                transition: 'padding 0.3s ease'
            }}>
                {isDrawerOpen ? (
                    <div style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: 'white',
                        fontFamily: 'cursive'
                    }}>
                        Picsta
                    </div>
                ) : (
                    <img
                        src="/Picsta_bw.png"
                        alt="Picsta Logo"
                        style={{
                            width: '40px',
                            height: '40px',
                            objectFit: 'contain',
                            display: 'block'
                        }}
                    />
                )}
            </div>

            {/* Main Navigation */}
            <nav className="d-flex flex-column mb-auto" style={{ gap: '8px', width: '100%', paddingTop: "5rem" }}>
                {navItems.slice(0, -1).map((item, index) => (
                    <NavButton key={index} item={item} showBadge={true} />
                ))}
            </nav>

            {/* Bottom Navigation */}
            <div className="d-flex flex-column" style={{ gap: '8px', width: '100%' }}>
                {bottomItems.map((item, index) => (
                    <NavButton key={index} item={item} showBadge={false} />
                ))}
            </div>
        </div>
    );
};

export default Sidebar;