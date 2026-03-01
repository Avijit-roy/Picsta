import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthUtils';
import { usePageTitle } from '../../hooks/usePageTitle';
import postService from '../../services/postService';
import 'bootstrap/dist/css/bootstrap.min.css';
import StoriesSection from './MainpageComponents/StoriesSection/StoriesSection';
import Sidebar from './MainpageComponents/SideBar/SideBar';
import PostFeed from './MainpageComponents/PostFeed/PostFeed';
import MobileBottomNavigation from './MainpageComponents/SideBar/MobileBottomNavigation';
import ProfilePage from './ProfilePage';
import MessagesPage from './messagepage/MessagesPage';
import SearchPanel from './MainpageComponents/SideBar/SearchPanel';
import NotificationsPanel from './MainpageComponents/SideBar/NotificationsPanel';
import ReelsViewer from './MainpageComponents/ReelsSection/Reels';
import CreatePost from './MainpageComponents/CreatePost/CreatePost';
import PostItem from './MainpageComponents/PostFeed/PostItem';
import CustomAlert from './MainpageComponents/PostFeed/CustomAlert';
import PostSkeleton from './MainpageComponents/PostFeed/PostSkeleton';
import LogoutConfirmModal from './MainpageComponents/SideBar/LogoutConfirmModal';
import chatService from '../../services/chatService';
import notificationService from '../../services/notificationService';

const MainPage = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showMessages, setShowMessages] = useState(false);
    const [showReels, setShowReels] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [mobilePanelOpen, setMobilePanelOpen] = useState(null); // null | 'search' | 'notifications'
    const { user, setUser, logout } = useAuth();
    const [realPosts, setRealPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [alert, setAlert] = useState(null);
    const [viewingUser, setViewingUser] = useState(null); // String username of the profile to view
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
    const [selectedChat, setSelectedChat] = useState(null);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [navigationStack, setNavigationStack] = useState([]);

    // Dynamic Title Logic
    const currentTitle = React.useMemo(() => {
        if (showMessages) return 'Messages';
        if (showReels) return 'Reels';
        if (showCreate) return 'Create Post';
        if (mobilePanelOpen === 'search') return 'Search';
        if (mobilePanelOpen === 'notifications') return 'Notifications';
        if (showProfile) return null; // ProfilePage will handle its own title
        return null; // Default to App Name via TitleHandler/Base hook
    }, [showMessages, showReels, showCreate, mobilePanelOpen, showProfile]);

    usePageTitle(currentTitle);

    const goHome = () => { 
        setShowProfile(false); 
        setShowMessages(false); 
        setShowReels(false); 
        setShowCreate(false); 
        setMobilePanelOpen(null); 
        setViewingUser(null);
        setSelectedChat(null);
        setSelectedPost(null);
        setNavigationStack([]); // Clear history when going home
    };

    const handleBack = () => {
        if (navigationStack.length === 0) {
            goHome();
            return;
        }

        const lastState = navigationStack[navigationStack.length - 1];
        setNavigationStack(prev => prev.slice(0, -1));

        setShowProfile(lastState.showProfile);
        setViewingUser(lastState.viewingUser);
        setShowMessages(lastState.showMessages);
        setShowReels(lastState.showReels);
        setShowCreate(lastState.showCreate);
        setMobilePanelOpen(lastState.mobilePanelOpen);
        setSelectedChat(lastState.selectedChat);
        setSelectedPost(lastState.selectedPost);
    };


    const handleUserClick = (username) => {
        // Save current state before navigating
        setNavigationStack(prev => [...prev, {
            showProfile,
            viewingUser,
            showMessages,
            showReels,
            showCreate,
            mobilePanelOpen,
            selectedChat,
            selectedPost
        }]);

        setViewingUser(username);
        setShowProfile(true);
        setShowMessages(false);
        setShowReels(false);
        setShowCreate(false);
        setMobilePanelOpen(null);
        setSelectedPost(null);
    };


    // Fetch unread counts
    useEffect(() => {
        const fetchUnreadCounts = async () => {
            if (!user) return;
            try {
                // Fetch chats to sum unread messages
                const chatRes = await chatService.getChats();
                if (chatRes?.success && Array.isArray(chatRes?.data)) {
                    const totalUnread = chatRes.data.reduce((acc, chat) => {
                        const userUnread = chat.unreadCounts?.find(u => u.user === (user.id || user._id))?.count || 0;
                        return acc + userUnread;
                    }, 0);
                    setUnreadMessages(totalUnread);
                }

                // Fetch notifications for unread count
                const notifRes = await notificationService.getNotifications();
                if (notifRes?.success && Array.isArray(notifRes?.data)) {
                    const unreadNotif = notifRes.data.filter(n => !n.isRead).length;
                    setUnreadNotifications(unreadNotif);
                }
            } catch (error) {
                console.error("Failed to fetch unread counts:", error);
            }
        };

        fetchUnreadCounts();
        const interval = setInterval(fetchUnreadCounts, 30000); // Update every 30s
        return () => clearInterval(interval);
    }, [user]);

    // Body Scroll Locking logic
    useEffect(() => {
        const isAnyOverlayOpen = selectedPost || showMessages || showReels || showCreate || mobilePanelOpen;
        if (isAnyOverlayOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.height = '100vh';
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.height = 'auto';
        }
        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.height = 'auto';
        };
    }, [selectedPost, showMessages, showReels, showCreate, mobilePanelOpen]);

    // Fetch real posts on mount
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoadingPosts(true);
                const result = await postService.getPosts();
                if (result.success) {
                    setRealPosts(result.data);
                }
            } catch (error) {
                console.error("Failed to fetch posts:", error);
            } finally {
                setLoadingPosts(false);
            }
        };

        fetchPosts();
    }, []);

    // Global Post Update Listener
    useEffect(() => {
        const handlePostUpdate = (e) => {
            const { postId, likesCount, isLiked, isSaved, commentsCount } = e.detail;
            
            setRealPosts(prev => prev.map(p => {
                if (p._id === postId || p.id === postId) {
                    const update = {};
                    if (likesCount !== undefined) update.likesCount = likesCount;
                    if (isLiked !== undefined) {
                        update.isLiked = isLiked;
                        // Also sync likes array if it exists
                        if (Array.isArray(p.likes) && user) {
                            const currentUserId = user.id || user._id;
                            update.likes = isLiked 
                                ? [...new Set([...p.likes, currentUserId])]
                                : p.likes.filter(id => id.toString() !== currentUserId.toString());
                        }
                    }
                    if (isSaved !== undefined) update.isSaved = isSaved;
                    if (commentsCount !== undefined) update.commentsCount = commentsCount;
                    return { ...p, ...update };
                }
                return p;
            }));

            if (selectedPost && (selectedPost._id === postId || selectedPost.id === postId)) {
                setSelectedPost(prev => {
                    const update = {};
                    if (likesCount !== undefined) update.likesCount = likesCount;
                    if (isLiked !== undefined) {
                        update.isLiked = isLiked;
                        if (Array.isArray(prev.likes) && user) {
                            const currentUserId = user.id || user._id;
                            update.likes = isLiked 
                                ? [...new Set([...prev.likes, currentUserId])]
                                : prev.likes.filter(id => id.toString() !== currentUserId.toString());
                        }
                    }
                    if (isSaved !== undefined) update.isSaved = isSaved;
                    if (commentsCount !== undefined) update.commentsCount = commentsCount;
                    return { ...prev, ...update };
                });
            }
        };

        const handleUserFollowUpdate = (e) => {
            const { userId, isFollowing } = e.detail;
            setRealPosts(prev => prev.map(p => {
                if (p.author?._id === userId || p.author === userId) {
                    return { ...p, isFollowing };
                }
                return p;
            }));

            if (selectedPost && (selectedPost.author?._id === userId || selectedPost.author === userId)) {
                setSelectedPost(prev => ({ ...prev, isFollowing }));
            }
        };

        window.addEventListener('POST_UPDATED', handlePostUpdate);
        window.addEventListener('USER_FOLLOW_UPDATED', handleUserFollowUpdate);
        return () => {
            window.removeEventListener('POST_UPDATED', handlePostUpdate);
            window.removeEventListener('USER_FOLLOW_UPDATED', handleUserFollowUpdate);
        };
    }, [selectedPost, user]);

    const handleNewPost = (newPost) => {
        setRealPosts(prev => [newPost, ...prev]);
    };

    const handleDeletePost = async (postId) => {
        try {
            const result = await postService.deletePost(postId);
            if (result.success) {
                setRealPosts(prev => prev.filter(p => p._id !== postId));
                setSelectedPost(null);
                setAlert({ message: "Post deleted successfully", type: "success" });
                
                // Keep global post count in sync
                if (user) {
                    setUser(prev => ({
                        ...prev,
                        postsCount: Math.max(0, (prev.postsCount || 1) - 1)
                    }));
                }
            }
        } catch (error) {
            console.error("Failed to delete post:", error);
            setAlert({ message: "Error deleting post. Please try again.", type: "error" });
        }
    };

    const handleUpdatePost = (updatedPost) => {
        setRealPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
        setSelectedPost(updatedPost);
    };

    const handleLikeToggle = async (postId) => {
        try {
            const result = await postService.toggleLike(postId);
            if (result.success) {
                // Update the post in realPosts feed
                const currentUserId = user?.id || user?._id;
                setRealPosts(prev => prev.map(p => {
                    if (p._id === postId) {
                        return {
                            ...p,
                            likesCount: result.likesCount,
                            isLiked: result.isLiked,
                            likes: result.isLiked 
                                ? [...(p.likes || []), currentUserId] 
                                : (p.likes || []).filter(id => id !== currentUserId)
                        };
                    }
                    return p;
                }));

                // Update selected post if it's the one being liked
                if (selectedPost && (selectedPost._id === postId || selectedPost.id === postId)) {
                    setSelectedPost(prev => ({
                        ...prev,
                        likesCount: result.likesCount,
                        isLiked: result.isLiked,
                        likes: result.isLiked 
                            ? [...(prev.likes || []), currentUserId] 
                            : (prev.likes || []).filter(id => id !== currentUserId)
                    }));
                }
                
                // Notify other components (like Reels)
                postService.notifyPostUpdate(postId, {
                    likesCount: result.likesCount,
                    isLiked: result.isLiked
                });
            }
        } catch (error) {
            console.error("Failed to toggle like:", error);
        }
    };


    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#000' }}>


            {/* Mobile full-screen overlays for Search & Notifications (hidden on md+) */}
            {mobilePanelOpen === 'search' && (
                <div className="d-md-none" style={{
                    position: 'fixed', inset: 0, zIndex: 2000,
                    backgroundColor: '#000', overflowY: 'auto'
                }}>
                    <SearchPanel 
                        onClose={() => setMobilePanelOpen(null)} 
                        mobile 
                        onUserClick={handleUserClick}
                    />
                </div>
            )}
            {mobilePanelOpen === 'notifications' && (
                <div className="d-md-none" style={{
                    position: 'fixed', inset: 0, zIndex: 2000,
                    backgroundColor: '#000', overflowY: 'auto'
                }}>
                    <NotificationsPanel 
                        onClose={() => setMobilePanelOpen(null)} 
                        mobile 
                        onUserClick={handleUserClick}
                        onPostClick={setSelectedPost}
                    />
                </div>
            )}


            {/* Main Content Area */}

            <div style={{
                marginLeft: 0,
                width: '100%',
                paddingBottom: '60px'
            }}
                className="main-content-wrapper"
            >
                <style>
                    {`
                        @media (max-width: 767px) {
                            .main-content-wrapper {
                                padding-top: 52px !important;
                            }
                        }
                        @media (min-width: 768px) {
                            .main-content-wrapper {
                                margin-left: 72px !important;
                                width: calc(100% - 72px) !important;
                            }
                        }
                    `}
                </style>

                {/* Stories + Feed or Profile Page */}
                {showProfile ? (
                    <ProfilePage 
                        onLogout={() => setIsLogoutConfirmOpen(true)} 
                        onBack={handleBack} 
                        viewingUsername={viewingUser}

                        onUpdatePost={handleUpdatePost}
                        onDeletePost={handleDeletePost}
                        onLikeToggle={handleLikeToggle}
                        onUserClick={handleUserClick}
                        onMessagesClick={(chat) => { 
                            setSelectedChat(chat);
                            setShowMessages(true); 
                            setShowProfile(false); 
                            setShowReels(false); 
                            setShowCreate(false); 
                        }}
                    />
                ) : (
                    <>
                        {/* Stories Section Component */}
                        <StoriesSection />

                        {/* Post Feed Component */}
                        {loadingPosts ? (
                            <div className="d-flex justify-content-center py-4">
                                <div style={{ maxWidth: '470px', width: '100%', padding: '0 10px' }}>
                                    {[1, 2, 3].map(i => <PostSkeleton key={i} />)}
                                </div>
                            </div>
                        ) : realPosts.length > 0 ? (
                            <PostFeed 
                                posts={realPosts} 
                                onPostClick={setSelectedPost} 
                                onUserClick={handleUserClick} 
                                onLikeToggle={handleLikeToggle} 
                                onDelete={handleDeletePost}
                                onUpdate={handleUpdatePost}
                            />
                        ) : (
                            <div className="text-center py-5" style={{ color: '#737373' }}>
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-3">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                    <circle cx="8.5" cy="8.5" r="1.5"/>
                                    <polyline points="21 15 16 10 5 21"/>
                                </svg>
                                <h4>No posts yet</h4>
                                <p>When people you follow share photos, they'll appear here.</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {showReels && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1500 }}>
                    <ReelsViewer onClose={goHome} onUserClick={handleUserClick} />
                </div>
            )}

            {showMessages && (
                <div 
                    className="messages-overlay"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 1500,
                    }}
                >
                    <style>{`
                        @media (min-width: 768px) {
                            .messages-overlay { left: 72px !important; }
                        }
                    `}</style>
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                    }}>
                        <MessagesPage 
                            onBack={goHome} 
                            initialChat={selectedChat} 
                            onUserClick={handleUserClick}
                            onPostClick={setSelectedPost}
                        />
                    </div>
                </div>
            )}

            {showCreate && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1500 }}>
                    <CreatePost 
                        onBack={goHome} 
                        onPost={(newPost) => {
                            handleNewPost(newPost);
                            goHome();
                        }}
                    />
                </div>
            )}

            {selectedPost && (
                <div 
                    className="post-detail-overlay"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.95)',
                        zIndex: 2000,
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        overflowY: 'auto',
                        padding: '40px 0',
                        animation: 'fadeIn 0.2s ease-out',
                        backdropFilter: 'blur(5px)'
                    }}
                    onClick={() => setSelectedPost(null)}
                >
                    <style>{`
                        @media (max-width: 767px) {
                            .post-detail-overlay {
                                padding: 0 !important;
                            }
                        }
                    `}</style>
                    <div 
                        style={{ width: '100%', maxWidth: '470px', padding: '0 10px' }} 
                        onClick={e => e.stopPropagation()}
                    >
                        <PostItem 
                            post={selectedPost} 
                            isDetail={true}
                            onClose={() => setSelectedPost(null)}
                            onDelete={handleDeletePost}
                            onUpdate={handleUpdatePost}
                            onLikeToggle={handleLikeToggle}
                            onUserClick={handleUserClick}
                        />
                    </div>
                </div>
            )}

            {alert && (
                <CustomAlert 
                    message={alert.message} 
                    type={alert.type} 
                    onClose={() => setAlert(null)} 
                />
            )}

            <LogoutConfirmModal 
                isOpen={isLogoutConfirmOpen}
                onClose={() => setIsLogoutConfirmOpen(false)}
                onConfirm={logout}
            />

            {/* Desktop Sidebar Component */}
            <Sidebar
                isDrawerOpen={isDrawerOpen}
                setIsDrawerOpen={setIsDrawerOpen}
                onProfileClick={() => { setViewingUser(null); setShowProfile(true); setShowMessages(false); setShowReels(false); }}
                onHomeClick={goHome}
                onMessagesClick={() => { setShowMessages(true); setShowProfile(false); setShowReels(false); setShowCreate(false); }}
                onReelsClick={() => { setShowReels(true); setShowProfile(false); setShowMessages(false); setShowCreate(false); }}
                onCreateClick={() => { setShowCreate(true); setShowProfile(false); setShowMessages(false); setShowReels(false); }}
                onLogout={() => setIsLogoutConfirmOpen(true)}
                onUserClick={handleUserClick}
                onPostClick={setSelectedPost}
                messagesOpen={showMessages}
                unreadMessages={unreadMessages}
                unreadNotifications={unreadNotifications}
            />

            {/* Mobile Bottom Navigation Component */}
            <MobileBottomNavigation
                onProfileClick={() => { setViewingUser(null); setShowProfile(true); setShowMessages(false); setShowReels(false); setMobilePanelOpen(null); }}
                onHomeClick={goHome}
                onSearchClick={() => setMobilePanelOpen('search')}
                onMessagesClick={() => { setShowMessages(true); setShowProfile(false); setShowReels(false); setMobilePanelOpen(null); setShowCreate(false); }}
                onReelsClick={() => { setShowReels(true); setShowProfile(false); setShowMessages(false); setMobilePanelOpen(null); setShowCreate(false); }}
                onCreateClick={() => { setShowCreate(true); setShowProfile(false); setShowMessages(false); setShowReels(false); setMobilePanelOpen(null); }}
                unreadMessages={unreadMessages}
            />

            {/* Mobile Top Header (hidden on md+) */}
            <div
                className="d-md-none position-fixed top-0 w-100 d-flex align-items-center justify-content-between"
                style={{
                    backgroundColor: '#000',
                    borderBottom: '1px solid #262626',
                    height: '52px',
                    zIndex: 1400,
                    left: 0,
                    padding: '0 16px',
                }}
            >
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img
                        src="/Picsta_bw.png"
                        alt="Picsta Logo"
                        style={{ width: '40px', height: '40px', objectFit: 'contain', display: 'block' }}
                    />
                    <span style={{ fontSize: '22px', fontWeight: 'bold', color: 'white', fontFamily: 'cursive' }}>
                        Picsta
                    </span>
                </div>

                {/* Right side icons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                    {/* Create / Plus */}
                    <button 
                        className="btn btn-link p-0" 
                        style={{ color: 'white', lineHeight: 0 }}
                        onClick={() => setShowCreate(true)}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </button>
                    {/* Notifications */}
                    <button
                        className="btn btn-link p-0 position-relative"
                        style={{ color: 'white', lineHeight: 0 }}
                        onClick={() => setMobilePanelOpen('notifications')}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        {unreadNotifications > 0 && (
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
                                {unreadNotifications > 10 ? '10+' : unreadNotifications}
                            </span>
                        )}
                    </button>
                    {/* Logout - Profile Only */}
                    {showProfile && (
                        <button
                            className="btn btn-link p-0"
                            style={{ color: 'white', lineHeight: 0 }}
                            onClick={() => setIsLogoutConfirmOpen(true)}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MainPage;