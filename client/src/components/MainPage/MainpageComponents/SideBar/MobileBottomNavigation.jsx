import React from 'react';

const MobileBottomNavigation = () => {
    const renderIcon = (iconName, filled = false) => {
        switch (iconName) {
            case 'home':
                return filled ? (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                        <path d="M9.005 16.545a2.997 2.997 0 0 1 2.997-2.997A2.997 2.997 0 0 1 15 16.545V22h7V11.543L12 2 2 11.543V22h7.005z" />
                    </svg>
                ) : (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                );
            case 'search':
                return (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                );
            case 'reels':
                return (
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
                );
            case 'profile':
                return (
                    <div style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '2px solid white'
                    }}>
                        <img src="https://i.pravatar.cc/150?img=33" alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div
            className="d-md-none position-fixed bottom-0 w-100 d-flex justify-content-around align-items-center"
            style={{
                backgroundColor: '#000',
                borderTop: '1px solid #262626',
                height: '50px',
                zIndex: 1000,
                left: 0
            }}
        >
            <button className="btn btn-link p-0" style={{ color: 'white' }}>
                {renderIcon('home', true)}
            </button>
            <button className="btn btn-link p-0" style={{ color: 'white' }}>
                {renderIcon('search')}
            </button>
            <button className="btn btn-link p-0" style={{ color: 'white' }}>
                {renderIcon('reels')}
            </button>
            <button className="btn btn-link p-0 position-relative" style={{ color: 'white' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-chat-left-text" viewBox="0 0 16 16">
                    <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
                    <path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5M3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6m0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5" />
                </svg>
                <span className="position-absolute badge rounded-pill bg-danger" style={{
                    fontSize: '9px',
                    padding: '2px 5px',
                    top: '-2px',
                    right: '-5px',
                    minWidth: '18px'
                }}>
                    1
                </span>
            </button>
            <button className="btn btn-link p-0" style={{ color: 'white' }}>
                {renderIcon('profile')}
            </button>
        </div>
    );
};

export default MobileBottomNavigation;