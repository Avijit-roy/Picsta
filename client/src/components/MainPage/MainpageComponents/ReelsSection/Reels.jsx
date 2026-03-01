import { useState, useRef, useEffect, useCallback } from "react";
import postService from "../../../../services/postService";
import userService from "../../../../services/userService";
import { useAuth } from "../../../../context/AuthUtils";
import ReelsSkeleton from "./ReelsSkeleton";
import ShareModal from "../PostFeed/ShareModal";
import LikersModal from "../PostFeed/LikersModal";
import DeleteConfirmModal from "../PostFeed/DeleteConfirmModal";

export default function ReelsViewer({ onClose, onUserClick }) {
  const { user: authUser } = useAuth();
  const [reels, setReels] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState("up");
  const containerRef = useRef(null);
  const startY = useRef(null);
  const lastTap = useRef(0);
  const [isMuted, setIsMuted] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showLargeHeart, setShowLargeHeart] = useState(false);
  const [isLikersModalOpen, setIsLikersModalOpen] = useState(false);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);

  // Comments State
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [isFetchingComments, setIsFetchingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null); // { id, username }
  const [expandedComments, setExpandedComments] = useState({});
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    const fetchReels = async () => {
      try {
        setLoading(true);
        const response = await postService.getReels();
        if (response.success) {
          setReels(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch reels:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReels();
  }, []);

  const reel = reels[currentIndex];

  // Fetch comments when opening comments sheet
  useEffect(() => {
    if (showComments && reel?._id) {
      const fetchComments = async () => {
        setIsFetchingComments(true);
        try {
          const result = await postService.getComments(reel._id);
          if (result.success) {
            setComments(result.data);
          }
        } catch (error) {
          console.error("Failed to fetch comments:", error);
        } finally {
          setIsFetchingComments(false);
        }
      };
      fetchComments();
    }
  }, [showComments, reel?._id]);

  const goTo = useCallback((dir) => {
    if (animating || loading || reels.length === 0 || showComments) return;
    const next =
      dir === "up"
        ? Math.min(currentIndex + 1, reels.length)
        : Math.max(currentIndex - 1, 0);
    if (next === currentIndex) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex(next);
      setAnimating(false);
      setShowComments(false); // Close comments on scroll
      setComments([]);
    }, 350);
  }, [animating, loading, reels.length, currentIndex, showComments]);

  useEffect(() => {
    const handleWheel = (e) => {
      if (Math.abs(e.deltaY) > 30) {
        goTo(e.deltaY > 0 ? "up" : "down");
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [currentIndex, animating, loading, reels.length, goTo]);

  // Global Post Update Listener
  useEffect(() => {
    const handlePostUpdate = (e) => {
      const { postId, likesCount, isLiked, isSaved, commentsCount } = e.detail;
      setReels(prev => prev.map(r => {
        if (r._id === postId || r.id === postId) {
          const update = {};
          if (likesCount !== undefined) update.likesCount = likesCount;
          if (isLiked !== undefined) update.isLiked = isLiked;
          if (isSaved !== undefined) update.isSaved = isSaved;
          if (commentsCount !== undefined) update.commentsCount = commentsCount;
          return { ...r, ...update };
        }
        return r;
      }));
    };

    const handleUserFollowUpdate = (e) => {
      const { userId, isFollowing } = e.detail;
      setReels(prev => prev.map(r => {
        if (r.author?._id === userId || r.author === userId) {
          return { ...r, author: { ...r.author, isFollowing } };
        }
        return r;
      }));
    };

    window.addEventListener('POST_UPDATED', handlePostUpdate);
    window.addEventListener('USER_FOLLOW_UPDATED', handleUserFollowUpdate);
    return () => {
      window.removeEventListener('POST_UPDATED', handlePostUpdate);
      window.removeEventListener('USER_FOLLOW_UPDATED', handleUserFollowUpdate);
    };
  }, []);

  const handleTouchStart = (e) => {
    if (showComments) return;
    startY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e) => {
    if (startY.current === null || showComments) return;
    const diff = startY.current - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 40) {
      goTo(diff > 0 ? "up" : "down");
    }
    startY.current = null;
  };

  const handleToggleLike = async (postId) => {
    try {
      const result = await postService.toggleLike(postId);
      if (result.success) {
        setReels(prev => prev.map((r, i) => i === currentIndex ? { ...r, isLiked: result.isLiked, likesCount: result.likesCount } : r));
        
        // Notify other components (like Feed)
        postService.notifyPostUpdate(postId, {
          likesCount: result.likesCount,
          isLiked: result.isLiked
        });
      }
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  const handleToggleSave = async (postId) => {
    try {
      const result = await postService.toggleSave(postId);
      if (result.success) {
        setReels(prev => prev.map((r, i) => i === currentIndex ? { ...r, isSaved: result.isSaved } : r));

        // Notify other components
        postService.notifyPostUpdate(postId, {
          isSaved: result.isSaved
        });
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleDoubleTap = (e) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (!reel.isLiked) {
        handleToggleLike(reel._id);
      }
      setShowLargeHeart(true);
      setTimeout(() => setShowLargeHeart(false), 800);
    }
    lastTap.current = now;
    setIsMuted(!isMuted);
  };

  const handleFollowToggle = async () => {
    if (!reel?.author?._id || isFollowLoading) return;
    setIsFollowLoading(true);
    try {
      const result = await userService.toggleFollow(reel.author._id);
      if (result.success) {
        setReels(prev => prev.map(r => 
          r.author._id === reel.author._id ? { ...r, author: { ...r.author, isFollowing: result.isFollowing } } : r
        ));

        // Notify other components
        userService.notifyUserFollowUpdate(reel.author._id, result.isFollowing);
      }
    } catch (error) {
      console.error("Follow error:", error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleDeletePost = async () => {
    setIsDeleting(true);
    try {
      const result = await postService.deletePost(reel._id);
      if (result.success) {
        setReels(prev => prev.filter((_, i) => i !== currentIndex));
        if (currentIndex >= reels.length - 1 && currentIndex > 0) {
           setCurrentIndex(currentIndex - 1);
        }
        setIsConfirmOpen(false);
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isPostingComment) return;

    setIsPostingComment(true);
    try {
      const result = await postService.addComment(reel._id, newComment, replyingTo?.id);
      if (result.success) {
        setComments(prev => [result.data, ...prev]);
        setNewComment("");
        setReplyingTo(null);
        if (replyingTo) {
          setExpandedComments(prev => ({ ...prev, [replyingTo.id]: true }));
        }
        const newCommentsCount = (reel.commentsCount || 0) + 1;
        setReels(prev => prev.map((r, i) => i === currentIndex ? { ...r, commentsCount: newCommentsCount } : r));
        
        // Notify other components
        postService.notifyPostUpdate(reel._id, {
          commentsCount: newCommentsCount
        });
      }
    } catch (error) {
      console.error("Comment error:", error);
    } finally {
      setIsPostingComment(false);
    }
  };

  const formatTimestamp = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  if (loading && reels.length === 0) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", width: "100vw", background: "#000" }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '400px', 
        height: '100%', 
        maxHeight: '100vh',
        borderRadius: '8px', 
        overflow: 'hidden' 
      }}>
        <ReelsSkeleton />
      </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100dvh",
        width: "100vw",
        background: "#000",
        fontFamily: "'DM Sans', sans-serif",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600\u0026display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .reel-card {
          position: relative;
          width: 438px;
          height: 813px;
          border-radius: 18px;
          overflow: hidden;
          transition: transform 0.35s cubic-bezier(.77,0,.18,1), opacity 0.35s ease;
          user-select: none;
          box-shadow: 0 24px 80px rgba(0,0,0,0.8);
          background: #000;
          opacity: 1;
        }

        @media (max-width: 767px) {
          .reel-card {
            width: 100%;
            height: 100%;
            border-radius: 0;
          }
          .nav-dots { display: none !important; }
        }

        .reel-card.slide-up { animation: slideUp 0.35s cubic-bezier(.77,0,.18,1) forwards; }
        .reel-card.slide-down { animation: slideDown 0.35s cubic-bezier(.77,0,.18,1) forwards; }
        @keyframes slideUp {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(-60px); opacity: 0; }
        }
        @keyframes slideDown {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(60px); opacity: 0; }
        }
        .reel-card.entering { animation: enterUp 0.35s cubic-bezier(.77,0,.18,1) forwards; }
        @keyframes enterUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          transition: transform 0.15s ease;
          color: white;
        }
        .action-btn:hover { transform: scale(1.1); }
        .action-btn svg { filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); }

        .dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.3); transition: all 0.3s ease; }
        .dot.active { background: white; width: 18px; border-radius: 3px; }

        .close-btn {
          position: absolute;
          top: 30px;
          left: 20px;
          z-index: 1000;
          color: white;
          background: none;
          border: none;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .close-btn:hover { transform: scale(1.1); }


        .large-heart {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1000;
          color: white;
          opacity: 0;
          pointer-events: none;
          animation: heartPop 0.8s ease-out;
        }

        @keyframes heartPop {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.9; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }

        .options-menu {
          position: absolute;
          bottom: 151px;
          right: 60px;
          background: #262626;
          border-radius: 12px;
          padding: 8px 0;
          min-width: 150px;
          z-index: 2100;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        }
        .menu-item {
          padding: 12px 16px;
          font-size: 14px;
          cursor: pointer;
          color: white;
          text-align: left;
        }
        .menu-item:hover { background: #363636; }
        .menu-item.danger { color: #ed4956; font-weight: 600; }

        /* Comments Bottom Sheet */
        .comments-sheet {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60%;
          background: #1a1a1a;
          border-top-left-radius: 24px;
          border-top-right-radius: 24px;
          z-index: 2000;
          display: flex;
          flex-direction: column;
          animation: slideUpSheet 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards;
          color: white;
        }

        @keyframes slideUpSheet {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        .comment-item {
          display: flex;
          gap: 12px;
          padding: 12px 16px;
          align-items: flex-start;
          text-align: left;
        }

        .comment-input-area {
          padding: 16px;
          border-top: 1px solid #333;
          display: flex;
          align-items: center;
          gap: 12px;
          background: #1a1a1a;
        }

        .comment-input {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          font-size: 14px;
          outline: none;
          padding: 8px 0;
        }

        .comment-scroll {
          flex: 1;
          overflow-y: auto;
          scrollbar-width: none;
          text-align: left;
        }
        .comment-scroll::-webkit-scrollbar { display: none; }

        .reply-btn {
          background: none;
          border: none;
          color: #888;
          font-size: 12px;
          font-weight: 600;
          margin-top: 8px;
          cursor: pointer;
          padding: 0;
        }
      `}</style>

      {/* Header Overlay */}
      <button className="close-btn" onClick={onClose}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <div className="reels-wrapper" style={{ position: "relative", display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Dots navigation */}
        <div className="nav-dots" style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
          {reels.map((_, i) => (
            <div
              key={i}
              className={`dot ${i === currentIndex ? "active" : ""}`}
              onClick={() => {
                if (animating) return;
                setDirection(i > currentIndex ? "up" : "down");
                setAnimating(true);
                setTimeout(() => { setCurrentIndex(i); setAnimating(false); }, 350);
              }}
              style={{ cursor: "pointer" }}
            />
          ))}
          <div className={`dot ${currentIndex === reels.length ? "active" : ""}`} />
        </div>

        {/* Main reel card/End state */}
        <div
          ref={containerRef}
          className={`reel-card ${animating ? (direction === "up" ? "slide-up" : "slide-down") : "entering"}`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {currentIndex < reels.length ? (
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
              {/* Video Element */}
              <video
                key={reel._id}
                src={reel.media[0].url}
                poster={reel.media[0].thumbnailUrl}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  background: "#000"
                }}
              />

              {/* Mute Toggle Overlay */}
              <div 
                style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1, pointerEvents: "none", opacity: isMuted ? 0.7 : 0 }}
                onClick={() => setIsMuted(!isMuted)}
              >
                  {isMuted && (
                    <div style={{ background: 'rgba(0,0,0,0.5)', padding: '12px', borderRadius: '50%' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                        <path d="M11 5L6 9H2V15H6L11 19V5Z" />
                        <line x1="23" y1="9" x2="17" y2="15" stroke="white" strokeWidth="2" />
                        <line x1="17" y1="9" x2="23" y2="15" stroke="white" strokeWidth="2" />
                      </svg>
                    </div>
                  )}
              </div>

              {/* Click Surface for Playback/Like */}
              <div 
                style={{ position: "absolute", inset: 0, zIndex: 5 }} 
                onClick={handleDoubleTap}
              />

              {showLargeHeart && (
                <div className="large-heart">
                  <svg width="100" height="100" viewBox="0 0 24 24" fill="white">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
              )}

              {/* Overlays */}
              <div style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.6) 100%)",
                pointerEvents: "none",
                zIndex: 6
              }} />

              {/* Bottom Actions & Caption */}
              <div style={{
                position: "absolute", bottom: "40px", left: "16px", right: "70px",
                zIndex: 10
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                   <img 
                      src={reel.author.profilePicture || "https://static.vecteezy.com/system/resources/previews/036/280/650/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg"} 
                      alt="" style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1.5px solid white", objectFit: "cover" }} 
                   />
                   <span style={{ color: "white", fontWeight: "600", fontSize: "14px", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
                     {reel.author.username}
                   </span>
                   {authUser?.id !== reel.author._id && (
                     <button 
                       onClick={(e) => { e.stopPropagation(); handleFollowToggle(); }}
                       disabled={isFollowLoading}
                       style={{
                         background: "none", border: "1px solid white", color: "white",
                         borderRadius: "8px", padding: "4px 12px", fontSize: "12px", fontWeight: "600",
                         display: "flex", alignItems: "center", justifyContent: "center", minWidth: "80px",
                         gap: "6px"
                       }}
                     >
                       {isFollowLoading ? (
                         <div style={{
                           width: "12px", height: "12px", border: "2px solid rgba(255,255,255,0.3)",
                           borderTopColor: "white", borderRadius: "50%", animation: "spin 0.6s linear infinite"
                         }} />
                       ) : (
                         reel.author.isFollowing ? "Following" : "Follow"
                       )}
                       <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                     </button>
                   )}
                </div>
                <p style={{ color: "white", fontSize: "15px", lineHeight: "1.4", fontWeight: "400", textShadow: "0 1px 2px rgba(0,0,0,0.5)", textAlign: "left" }}>
                  {isCaptionExpanded || !reel.caption || reel.caption.length <= 80 ? (
                    reel.caption
                  ) : (
                    <>
                      {reel.caption.substring(0, 80)}
                      <span 
                        onClick={(e) => { e.stopPropagation(); setIsCaptionExpanded(true); }}
                        style={{ color: "#888", cursor: "pointer", marginLeft: "4px" }}
                      >
                        ... more
                      </span>
                    </>
                  )}
                </p>
              </div>

              {/* Right Sidebar Actions */}
              <div style={{
                position: "absolute", right: "12px", bottom: "40px",
                display: "flex", flexDirection: "column", gap: "20px",
                zIndex: 20
              }}>
                <div className="action-btn">
                  <div 
                    onClick={(e) => { e.stopPropagation(); handleToggleLike(reel._id); }}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill={reel.isLiked ? "#ff2953" : "none"} stroke={reel.isLiked ? "#ff2953" : "white"} strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </div>
                  <span 
                    onClick={(e) => { e.stopPropagation(); setIsLikersModalOpen(true); }}
                    style={{ fontSize: "13px", fontWeight: "600", cursor: "pointer", userSelect: 'none' }}
                  >
                    {(reel.likesCount || (reel.likes ? reel.likes.length : 0)) >= 1000 ? `${((reel.likesCount || reel.likes.length) / 1000).toFixed(1)}K` : (reel.likesCount || (reel.likes ? reel.likes.length : 0))}
                  </span>
                </div>
                <div className="action-btn" onClick={(e) => { e.stopPropagation(); setShowComments(true); }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span style={{ fontSize: "13px", fontWeight: "600" }}>{reel.commentsCount}</span>
                </div>
                <div className="action-btn" onClick={(e) => { e.stopPropagation(); setShowShareModal(true); }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                  <span style={{ fontSize: "12px", fontWeight: "600", marginTop: "-2px" }}>Share</span>
                </div>
                <div className="action-btn" onClick={(e) => { e.stopPropagation(); handleToggleSave(reel._id); }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill={reel.isSaved ? "white" : "none"} stroke="white" strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span style={{ fontSize: "12px", fontWeight: "600" }}>Save</span>
                </div>
                <div className="action-btn" onClick={(e) => { e.stopPropagation(); setShowOptions(!showOptions); }}>
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <circle cx="12" cy="5" r="1.5" />
                      <circle cx="12" cy="12" r="1.5" />
                      <circle cx="12" cy="19" r="1.5" />
                  </svg>
                </div>

                {showOptions && (
                  <div className="options-menu">
                    {authUser?.id === reel.author._id ? (
                      <div className="menu-item danger" onClick={() => { setIsConfirmOpen(true); setShowOptions(false); }}>Delete</div>
                    ) : (
                      <div className="menu-item">Report</div>
                    )}
                    <div className="menu-item" onClick={() => setShowOptions(false)}>Cancel</div>
                  </div>
                )}
              </div>

              {/* Comments Sheet */}
              {showComments && (
                <div className="comments-sheet">
                  {/* Sheet Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", borderBottom: "1px solid #333" }}>
                    <div style={{ width: "32px" }} />
                    <span style={{ fontWeight: "700", fontSize: "16px" }}>Comments</span>
                    <button style={{ background: "none", border: "none", color: "white", cursor: "pointer" }} onClick={() => setShowComments(false)}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>

                  {/* Comment List */}
                  <div className="comment-scroll">
                    {isFetchingComments ? (
                      <div style={{ padding: "40px", textAlign: "center", color: "#888" }}>Loading comments...</div>
                    ) : comments.length === 0 ? (
                      <div style={{ padding: "40px", textAlign: "center", color: "#888" }}>No comments yet.</div>
                    ) : (
                      comments.filter(c => !c.parentComment).map(comment => {
                        const commentReplies = comments.filter(r => r.parentComment === comment._id || r.parentComment?._id === comment._id);
                        const isExpanded = expandedComments[comment._id];

                        return (
                          <div key={comment._id}>
                            <div className="comment-item">
                              <img 
                                src={comment.author?.profilePicture || "https://static.vecteezy.com/system/resources/previews/036/280/650/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg"} 
                                style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", cursor: "pointer" }}
                                onClick={() => onUserClick?.(comment.author?.username)}
                              />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                                  <span 
                                    style={{ fontWeight: "bold", cursor: "pointer" }}
                                    onClick={() => onUserClick?.(comment.author?.username)}
                                  >
                                    {comment.author?.username}
                                  </span>
                                  <span style={{ color: "#888", fontSize: "11px" }}>{formatTimestamp(comment.createdAt)}</span>
                                </div>
                                <div style={{ fontSize: "14px", lineHeight: "1.4", wordBreak: "break-word" }}>{comment.text}</div>
                                <button className="reply-btn" onClick={() => setReplyingTo({ id: comment._id, username: comment.author?.username })}>
                                  Reply
                                </button>

                                {commentReplies.length > 0 && (
                                  <div style={{ marginTop: "12px" }}>
                                    <div 
                                      style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "#888", fontSize: "12px", fontWeight: "600" }}
                                      onClick={() => setExpandedComments(prev => ({ ...prev, [comment._id]: !prev[comment._id] }))}
                                    >
                                      <div style={{ width: "24px", height: "1px", backgroundColor: "#333" }}></div>
                                      {isExpanded ? 'Hide replies' : `View replies (${commentReplies.length})`}
                                    </div>
                                    
                                    {isExpanded && commentReplies.map(reply => (
                                      <div key={reply._id} className="comment-item" style={{ paddingLeft: 0, paddingRight: 0, marginTop: "12px" }}>
                                        <img 
                                          src={reply.author?.profilePicture || "https://static.vecteezy.com/system/resources/previews/036/280/650/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg"} 
                                          style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover", cursor: "pointer" }}
                                          onClick={() => onUserClick?.(reply.author?.username)}
                                        />
                                          <div style={{ flex: 1 }}>
                                            {reply.replyToUser && reply.replyToUser.username !== comment.author?.username && (
                                              <div style={{ fontSize: "10px", color: "#a8a8a8", marginBottom: "2px" }}>
                                                Replying to <span 
                                                  style={{ color: "#0095f6", fontWeight: "500", cursor: "pointer" }}
                                                  onClick={() => onUserClick?.(reply.replyToUser.username)}
                                                >
                                                  @{reply.replyToUser.username}
                                                </span>
                                              </div>
                                            )}
                                            <div style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                                              <span 
                                                style={{ fontWeight: "bold", cursor: "pointer" }}
                                                onClick={() => onUserClick?.(reply.author?.username)}
                                              >
                                                {reply.author?.username}
                                              </span>
                                              <span style={{ color: "#888", fontSize: "10px" }}>{formatTimestamp(reply.createdAt)}</span>
                                            </div>
                                         <div style={{ fontSize: "13px", lineHeight: "1.4", wordBreak: "break-word" }}>{reply.text}</div>
                                          <button className="reply-btn" onClick={() => setReplyingTo({ id: comment._id, username: reply.author?.username })}>
                                            Reply
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Input Area */}
                  <div className="comment-input-area">
                    <img 
                      src={authUser?.profilePicture || "https://static.vecteezy.com/system/resources/previews/036/280/650/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg"} 
                      style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
                    />
                    <div style={{ flex: 1 }}>
                      {replyingTo && (
                        <div style={{ fontSize: "11px", color: "#0095f6", marginBottom: "4px", textAlign: "left", display: "flex", alignItems: "center", gap: "4px" }}>
                          Replying to {replyingTo.username} <span onClick={() => setReplyingTo(null)} style={{ cursor: "pointer", fontSize: "14px" }}>×</span>
                        </div>
                      )}
                      <form onSubmit={handleAddComment} style={{ display: "flex", alignItems: "center", background: "#262626", borderRadius: "20px", padding: "4px 16px" }}>
                        <input 
                          className="comment-input" 
                          placeholder="Add a comment..." 
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                        />
                        <button 
                          type="submit"
                          disabled={!newComment.trim() || isPostingComment}
                          style={{ background: "none", border: "none", color: "#0095f6", fontWeight: "700", opacity: !newComment.trim() ? 0.5 : 1, cursor: "pointer", marginLeft: "8px" }}
                        >
                          Post
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* End state: You're all caught up */
            <div style={{
              height: "100%", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", padding: "40px",
              textAlign: "center", background: "linear-gradient(to bottom, #111, #000)"
            }}>
              <div style={{
                width: "80px", height: "80px", borderRadius: "50%",
                background: "linear-gradient(135deg, #0095f6, #00ba7c)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "24px", boxShadow: "0 10px 30px rgba(0,149,246,0.3)"
              }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h2 style={{ color: "white", fontSize: "22px", marginBottom: "12px", fontWeight: "bold" }}>You're All Caught Up</h2>
              <p style={{ color: "#888", fontSize: "14px", marginBottom: "32px" }}>
                There are no more new reels to show right now. Check back later!
              </p>
              <button
                onClick={() => {
                  setDirection("down");
                  setAnimating(true);
                  setTimeout(() => { setCurrentIndex(0); setAnimating(false); }, 350);
                }}
                style={{
                  background: "white", color: "black", border: "none",
                  padding: "12px 32px", borderRadius: "30px", fontSize: "14px",
                  fontWeight: "bold", cursor: "pointer", transition: "transform 0.2s"
                }}
              >
                Back to Start
              </button>
            </div>
          )}
        </div>
      </div>

        {/* Share Modal */}
        {reels[currentIndex] && (
          <ShareModal 
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            post={reels[currentIndex]}
            currentUser={authUser}
          />
        )}

        {/* Likers Modal */}
        <LikersModal 
          isOpen={isLikersModalOpen}
          onClose={() => setIsLikersModalOpen(false)}
          postId={reels[currentIndex]?._id}
          onUserClick={() => {
            onClose?.(); // Close reels viewer
          }}
        />

      <DeleteConfirmModal 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)} 
        onConfirm={handleDeletePost} 
        loading={isDeleting}
      />
    </div>
  );
}