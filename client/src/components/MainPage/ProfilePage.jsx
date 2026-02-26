import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import EditProfileModal from "./MainpageComponents/ProfileSection/EditProfileModal";
import userService from "../../services/userService";
import chatService from "../../services/chatService";
import PostItem from "./MainpageComponents/PostFeed/PostItem";
import postService from "../../services/postService";
import CustomAlert from "./MainpageComponents/PostFeed/CustomAlert";

// Sub-components
import ProfileHeader from "./profilepage/ProfileHeader";
import ProfileInfo from "./profilepage/ProfileInfo";
import ProfileTabs from "./profilepage/ProfileTabs";
import ProfilePostGrid from "./profilepage/ProfilePostGrid";
import FollowListModal from "./profilepage/FollowListModal";

/**
 * ProfilePage Component
 * 
 * The main container for user profiles. Handles data fetching for both
 * own and others' profiles, state management for posts/saved tabs,
 * and coordinates interactions with sub-components.
 * 
 * @param {Object} props
 * @param {Function} props.onLogout - Callback for logging out
 * @param {string} props.viewingUsername - The username of the profile to display (optional, defaults to current user)
 * @param {Function} props.onBack - Callback for handling back navigation
 * @param {Function} props.onMessagesClick - Callback to initiate chat with the profile user
 */
export default function ProfilePage({ viewingUsername, onBack, onMessagesClick, onUpdatePost, onDeletePost, onUserClick }) {


  const { user, setUser } = useAuth();
  const [tab, setTab] = useState("posts");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userPosts, setUserPosts] = useState([]);

  const [savedPosts, setSavedPosts] = useState([]); 
  const [loadingPosts, setLoadingPosts] = useState(false);
  
  // Follow list modal state
  const [followModal, setFollowModal] = useState({
    isOpen: false,
    type: 'followers', // 'followers' or 'following'
    users: [],
    loading: false
  });
  const [selectedPost, setSelectedPost] = useState(null);
  const [alert, setAlert] = useState(null);

  const isOwnProfile = useMemo(() => {
    if (!viewingUsername) return true;
    if (!user) return false;
    const normalizedViewing = viewingUsername.startsWith('@') ? viewingUsername : `@${viewingUsername}`;
    const normalizedOwn = user.username.startsWith('@') ? user.username : `@${user.username}`;
    return normalizedViewing.toLowerCase() === normalizedOwn.toLowerCase();
  }, [viewingUsername, user]);
  
  const [userData, setUserData] = useState({
    name: "",
    username: "",
    bio: "",
    profilePicture: "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg",
    isFollowing: false
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let result;

        
        if (isOwnProfile) {
          result = await userService.getProfile();
        } else {
          result = await userService.getUserProfileByUsername(viewingUsername);
        }

        if (result.success) {
          const profileData = result.data;
          if (profileData.dob) {
            profileData.dob = new Date(profileData.dob).toISOString().split('T')[0];
          }
          
          setUserData({
            ...profileData,
            profilePicture: profileData.profilePicture 
              ? (profileData.profilePicture.startsWith('http') 
                  ? profileData.profilePicture 
                  : `http://localhost:5000${profileData.profilePicture}`)
              : "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg"
          });

          fetchUserPosts(profileData.username);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setAlert({ message: "Failed to load profile. Please try again.", type: "error" });
      }


    };

    const fetchUserPosts = async (username) => {
      try {
        setLoadingPosts(true);
        const result = await postService.getUserPosts(username);
        if (result.success) {
          setUserPosts(result.data);
        }
      } catch (error) {
        console.error("Error fetching user posts:", error);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchProfile();
  }, [viewingUsername, isOwnProfile]);

  useEffect(() => {
    if (tab === "saved" && isOwnProfile) {
      const fetchSavedPosts = async () => {
        try {
          setLoadingPosts(true);
          const result = await postService.getSavedPosts();
          if (result.success) {
            setSavedPosts(result.data);
          }
        } catch (error) {
          console.error("Error fetching saved posts:", error);
        } finally {
          setLoadingPosts(false);
        }
      };
      fetchSavedPosts();
    }
  }, [tab, isOwnProfile]);

  const handleFollowClick = async (type) => {
    if (!userData?.id) return;
    
    setFollowModal(prev => ({ ...prev, isOpen: true, type, loading: true, users: [] }));
    
    try {
      const response = type === 'followers' 
        ? await userService.getFollowers(userData.id)
        : await userService.getFollowing(userData.id);
        
      setFollowModal(prev => ({ ...prev, users: response.data, loading: false }));
    } catch (err) {
      console.error(`Error fetching ${type}:`, err);
      setFollowModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleUserClickFromList = (username) => {
    setFollowModal(prev => ({ ...prev, isOpen: false }));
    // Navigate to profile
    if (viewingUsername === username) return; // Already on this profile
    if (onUserClick) {
      onUserClick(username);
    } else {
      window.location.hash = `/profile/${username.replace(/^@/, '')}`;
    }

  };

  const handleFollowToggle = async () => {
    try {
      const result = await userService.toggleFollow(userData.id);
      if (result.success) {
        setUserData(prev => ({
          ...prev,
          isFollowing: result.isFollowing,
          followersCount: result.followersCount
        }));
      }
    } catch (error) {
      console.error("Toggle follow error:", error);
      setAlert({ message: "Failed to update follow status. Please try again.", type: "error" });
    }
  };

  const handleMessageClick = async () => {
    try {
      const result = await chatService.createOrGetChat(userData.id);
      if (result.success) {
        if (onMessagesClick) {
          onMessagesClick(result.data);
        }
      }
    } catch (error) {
      console.error("Error initiating chat:", error);
      setAlert({ message: "Failed to start chat. Please try again.", type: "error" });
    }
  };

  const displayPosts = useMemo(() => {
    return tab === "posts" ? userPosts : savedPosts;
  }, [tab, userPosts, savedPosts]);

  const handleProfileUpdate = async (newData) => {
    try {
      const { profilePictureFile, ...profileData } = newData;


      let finalProfilePictureUrl = userData.profilePicture;

      if (profilePictureFile) {
        const uploadResult = await userService.uploadProfilePicture(profilePictureFile);
        if (uploadResult.success) {
          finalProfilePictureUrl = uploadResult.profilePicture;
        }
      }

      const updateResult = await userService.updateProfile({
        ...profileData,
        profilePicture: finalProfilePictureUrl
      });

      if (updateResult.success) {
        const updatedUser = updateResult.data;
        if (updatedUser.dob) {
          updatedUser.dob = new Date(updatedUser.dob).toISOString().split('T')[0];
        }

        const formattedPic = updatedUser.profilePicture 
          ? (updatedUser.profilePicture.startsWith('http') 
              ? updatedUser.profilePicture 
              : `http://localhost:5000${updatedUser.profilePicture}`)
          : userData.profilePicture;

        setUserData({
          ...updatedUser,
          profilePicture: formattedPic
        });
        setUser((prev) => ({
          ...prev,
          ...updatedUser,
          profilePicture: formattedPic
        }));
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      setAlert({ message: error.response?.data?.message || "Error updating profile.", type: "error" });
    }


  };

  const handleDeletePost = async (postId) => {
    try {
      const result = await postService.deletePost(postId);
      if (result.success) {
        setUserPosts(prev => prev.filter(p => p._id !== postId));
        setUserData(prev => ({ ...prev, postsCount: Math.max(0, (prev.postsCount || 1) - 1) }));
        setUser(prev => prev ? { ...prev, postsCount: Math.max(0, (prev.postsCount || 1) - 1) } : prev);
        
        // Notify MainPage
        if (onDeletePost) {
          onDeletePost(postId);
        }

        setSelectedPost(null);
        setAlert({ message: "Post deleted successfully", type: "success" });
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  const handleUpdatePost = (updatedPost) => {
    // Update user posts (own posts)
    setUserPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
    
    // Update saved posts - remove if unsaved
    setSavedPosts(prev => {
      if (updatedPost.isSaved === false) {
        return prev.filter(p => p._id !== updatedPost._id);
      }
      return prev.map(p => p._id === updatedPost._id ? updatedPost : p);
    });
    
    // Notify MainPage
    if (onUpdatePost) {
      onUpdatePost(updatedPost);
    }
    
    setSelectedPost(updatedPost);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#000000ff",
      fontFamily: "'Outfit', sans-serif",
      color: "#e8e8e8",
      display: "flex",
      justifyContent: "center",
      width: "100%",
    }}>
      <div style={{ width: "100%", maxWidth: "480px", background: "#000", minHeight: "100vh" }}>
        {/* Top Navigation Bar with Back Button */}
        <div style={{
          position: 'sticky',
          top: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          padding: '12px 16px',
          zIndex: 100,
          borderBottom: '1px solid #262626'
        }}>
          <button 
            onClick={onBack}
            className="btn btn-link p-0" 
            style={{ color: 'white', display: 'flex', alignItems: 'center' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
            {userData.username || (viewingUsername ? (viewingUsername.startsWith('@') ? viewingUsername : `@${viewingUsername}`) : 'Profile')}
          </span>
        </div>

        {/* Header Section */}
        <ProfileHeader 
          userData={userData} 
          onFollowersClick={() => handleFollowClick('followers')}
          onFollowingClick={() => handleFollowClick('following')}
        />
        
        {/* User Info & Bio */}
        <ProfileInfo 
          userData={userData}
          isOwnProfile={isOwnProfile}
          onEditClick={() => setIsEditModalOpen(true)}
          onFollowToggle={handleFollowToggle}
          onMessageClick={handleMessageClick}
        />

        {/* Tabs */}
        <ProfileTabs 
          tab={tab} 
          setTab={setTab} 
          isOwnProfile={isOwnProfile} 
        />

        {/* Post Grid */}
        <ProfilePostGrid 
          loadingPosts={loadingPosts} 
          displayPosts={displayPosts} 
          onPostClick={setSelectedPost}
          tab={tab}
        />
      </div>

      {/* Modals */}
      {isEditModalOpen && (
        <EditProfileModal 
          user={user} 
          onClose={() => setIsEditModalOpen(false)} 
          onUpdate={handleProfileUpdate}
        />
      )}

      <FollowListModal 
        isOpen={followModal.isOpen}
        onClose={() => setFollowModal(prev => ({ ...prev, isOpen: false }))}
        activeTab={followModal.type}
        onTabChange={handleFollowClick}
        users={followModal.users}
        loading={followModal.loading}
        onUserClick={handleUserClickFromList}
      />

      {selectedPost && (
        <div 
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 2000,
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto',
            padding: window.innerWidth < 768 ? '0' : '40px 0', backdropFilter: 'blur(5px)'
          }}
          onClick={() => setSelectedPost(null)}
        >
          <div 
            style={{ 
              width: '100%', maxWidth: '470px', padding: window.innerWidth < 768 ? '0' : '0 10px',
              marginTop: window.innerWidth < 768 ? '0' : '20px'
            }} 
            onClick={e => e.stopPropagation()}
          >
            <PostItem 
              post={selectedPost}
              isDetail={true}
              user={user}
              onDelete={handleDeletePost}
              onUpdate={handleUpdatePost}
              onClose={() => setSelectedPost(null)}
              onUserClick={() => setSelectedPost(null)}
              onLikeToggle={async (postId) => {
                try {
                  const result = await postService.toggleLike(postId);
                  if (result.success) {
                    const updateList = (list) => list.map(p => 
                      p._id === postId ? { ...p, isLiked: result.isLiked, likesCount: result.likesCount } : p
                    );
                    setUserPosts(updateList);
                    setSavedPosts(updateList);
                    
                    // Notify MainPage
                    if (onUpdatePost) {
                      const postToUpdate = userPosts.find(p => p._id === postId) || savedPosts.find(p => p._id === postId);
                      if (postToUpdate) {
                        onUpdatePost({ ...postToUpdate, isLiked: result.isLiked, likesCount: result.likesCount });
                      }
                    }

                    setSelectedPost(prev => prev?._id === postId ? { ...prev, isLiked: result.isLiked, likesCount: result.likesCount } : prev);
                  }
                } catch (error) {
                  console.error("Like error:", error);
                }
              }}
              onPostClick={() => {}} 
            />
          </div>
        </div>
      )}

      {alert && (
        <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />
      )}
    </div>
  );
}