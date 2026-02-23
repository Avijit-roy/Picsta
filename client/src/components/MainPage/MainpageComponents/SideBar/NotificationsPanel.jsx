import React, { useState, useEffect, useCallback } from 'react';
import notificationService from '../../../../services/notificationService';

const NotificationsPanel = ({ onClose, mobile = false, onUserClick, onPostClick }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const result = await notificationService.getNotifications();
            if (result.success) {
                setNotifications(result.data);
                // Mark as read when panel is opened
                await notificationService.markAsRead();
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleClearAll = async () => {
        if (!window.confirm('Clear all notifications?')) return;
        try {
            await notificationService.clearAllNotifications();
            setNotifications([]);
        } catch (error) {
            console.error('Failed to clear notifications:', error);
        }
    };

    const handleDeleteOne = async (e, id) => {
        e.stopPropagation();
        try {
            await notificationService.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const handleNotificationClick = (notif) => {
        if (notif.type === 'follow') {
            onUserClick?.(notif.sender.username);
        } else if (notif.post) {
            onPostClick?.(notif.post);
        }
        if (mobile) onClose();
    };

    const groupNotifications = (notifs) => {
        const groups = {
            'Today': [],
            'This week': [],
            'This month': [],
            'Earlier': []
        };

        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;
        const oneWeek = 7 * oneDay;
        const oneMonth = 30 * oneDay;

        notifs.forEach(n => {
            const date = new Date(n.createdAt);
            const diff = now - date;

            if (diff < oneDay) groups['Today'].push(n);
            else if (diff < oneWeek) groups['This week'].push(n);
            else if (diff < oneMonth) groups['This month'].push(n);
            else groups['Earlier'].push(n);
        });

        return Object.entries(groups).filter(([, items]) => items.length > 0);
    };

    const getNotificationText = (n) => {
        const sender = <strong onClick={(e) => { e.stopPropagation(); onUserClick?.(n.sender.username); }} style={{ cursor: 'pointer' }}>{n.sender.username}</strong>;
        switch (n.type) {
            case 'like':
                return <>{sender} liked your post.</>;
            case 'comment':
                return <>{sender} commented on your post.</>;
            case 'follow':
                return <>{sender} started following you.</>;
            default:
                return <>{sender} interacted with you.</>;
        }
    };

    const getTimeDisplay = (date) => {
        const now = new Date();
        const past = new Date(date);
        const diffInSeconds = Math.floor((now - past) / 1000);

        if (diffInSeconds < 60) return 'now';
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d`;
        
        const diffInWeeks = Math.floor(diffInDays / 7);
        if (diffInWeeks < 4) return `${diffInWeeks}w`;

        return past.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <div style={{
            width: mobile ? '100vw' : '320px',
            height: '100vh',
            backgroundColor: '#000000ff',
            borderRight: mobile ? 'none' : '1px solid #1e1e1e',
            borderRadius: mobile ? '0' : '0 16px 16px 0',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: mobile ? 'none' : '4px 0 24px rgba(0,0,0,0.7)',
            overflow: 'hidden',
            paddingBottom: mobile ? '70px' : '0',
            zIndex: 10,
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '24px 16px 16px',
                flexShrink: 0,
            }}>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#fff', letterSpacing: '0.02em' }}>
                    Notifications
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {notifications.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            style={{
                                background: 'transparent', border: 'none', cursor: 'pointer',
                                color: '#0095f6', fontSize: '12px', fontWeight: 600, padding: '4px 8px'
                            }}
                        >
                            Clear all
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '4px', borderRadius: '50%', transition: 'color 0.2s', lineHeight: 0,
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#aaa'}
                        onMouseLeave={e => e.currentTarget.style.color = '#555'}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Scrollable List */}
            <div style={{ overflowY: 'auto', flex: 1, scrollbarWidth: 'none' }}>
                {loading ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#555', fontSize: '13px' }}>
                        Loading notifications...
                    </div>
                ) : notifications.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>No notifications yet</div>
                        <div style={{ fontSize: '12px', color: '#444' }}>When someone likes or comments on your posts, or follows you, you'll see them here.</div>
                    </div>
                ) : groupNotifications(notifications).map(([section, items]) => (
                    <div key={section}>
                        <div style={{
                            padding: '10px 16px 6px',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#444',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                        }}>
                            {section}
                        </div>

                        {items.map(notif => (
                            <div
                                key={notif._id}
                                onClick={() => handleNotificationClick(notif)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px 16px',
                                    cursor: 'pointer',
                                    transition: 'background 0.15s',
                                    position: 'relative',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = '#121212';
                                    e.currentTarget.querySelector('.delete-notif').style.opacity = '1';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.querySelector('.delete-notif').style.opacity = '0';
                                }}
                            >
                                {/* Unread dot */}
                                {!notif.isRead && (
                                    <div style={{
                                        position: 'absolute', left: '6px', top: '50%', transform: 'translateY(-50%)',
                                        width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0095f6'
                                    }} />
                                )}

                                {/* Avatar */}
                                <div style={{ flexShrink: 0 }} onClick={(e) => { e.stopPropagation(); onUserClick?.(notif.sender.username); }}>
                                    <img
                                        src={notif.sender.profilePicture || 'https://i.pravatar.cc/150?img=33'}
                                        alt=""
                                        style={{
                                            width: '44px',
                                            height: '44px',
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                        }}
                                    />
                                </div>

                                {/* Text + Time */}
                                <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                                    <div style={{ fontSize: '13px', color: '#efefef', lineHeight: '1.4' }}>
                                        {getNotificationText(notif)}
                                        <span style={{ color: '#8e8e8e', marginLeft: '6px' }}>
                                            {getTimeDisplay(notif.createdAt)}
                                        </span>
                                    </div>
                                </div>

                                {/* Post preview or Delete UI */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                    {notif.post && notif.post.media && notif.post.media[0] && (
                                        <img 
                                            src={notif.post.media[0].url} 
                                            alt="Post" 
                                            style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '4px' }}
                                        />
                                    )}
                                    <button
                                        className="delete-notif"
                                        onClick={(e) => handleDeleteOne(e, notif._id)}
                                        style={{
                                            background: 'transparent', border: 'none', color: '#555',
                                            padding: '4px', cursor: 'pointer', opacity: 0, transition: 'opacity 0.2s',
                                            display: 'flex', alignItems: 'center'
                                        }}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotificationsPanel;