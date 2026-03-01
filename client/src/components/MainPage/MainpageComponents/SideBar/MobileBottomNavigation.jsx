import React from 'react';
import { useAuth } from '../../../../context/AuthUtils';

const MobileBottomNavigation = ({ onProfileClick, onHomeClick, onSearchClick, onMessagesClick, onReelsClick, unreadMessages = 0 }) => {
    const { user } = useAuth();
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
            case 'messages':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                );
            case 'profile':
                return (
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
                );
            default:
                return null;
        }
    };

    return (
        <div
            className="d-md-none position-fixed bottom-0 w-100 d-flex justify-content-around align-items-center"
            style={{ backgroundColor: '#000', borderTop: '1px solid #262626', height: '50px', zIndex: 1400, left: 0 }}
        >
            <button className="btn btn-link p-0" style={{ color: 'white' }} onClick={onHomeClick}>
                {renderIcon('home', true)}
            </button>
            <button className="btn btn-link p-0" style={{ color: 'white' }} onClick={onSearchClick}>
                {renderIcon('search')}
            </button>
            <button className="btn btn-link p-0" style={{ color: 'white' }} onClick={onReelsClick}>
                {renderIcon('reels')}
            </button>
            <button className="btn btn-link p-0 position-relative" style={{ color: 'white' }} onClick={onMessagesClick}>
                {renderIcon('messages')}
                {unreadMessages > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        backgroundColor: '#ff3b30',
                        color: 'white',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        minWidth: '16px',
                        height: '16px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 3px',
                        border: '1.5px solid #000',
                        zIndex: 2
                    }}>
                        {unreadMessages > 10 ? '10+' : unreadMessages}
                    </span>
                )}
            </button>
            <button className="btn btn-link p-0" style={{ color: 'white' }} onClick={onProfileClick}>
                {renderIcon('profile')}
            </button>
        </div>
    );
};

export default MobileBottomNavigation;