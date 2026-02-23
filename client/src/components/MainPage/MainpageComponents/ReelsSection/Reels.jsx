import { useState, useRef, useEffect } from "react";

const reels = [
  {
    id: 1,
    user: "anmol_archives",
    avatar: "https://i.pravatar.cc/40?img=11",
    caption: "Covering a cover song! That alone tells you how deep this feeling goes...",
    text: ["tujhse baat karne ke baad hum", "teri ki hui baaton se baat karte hain"],
    emoji: "💗",
    likes: "44.1K",
    comments: "174",
    bg: "linear-gradient(160deg, #0d0d0f 0%, #1a1018 40%, #0f0a14 100%)",
    accent: "#ff6eb4",
    textColor: "#f0e6f6",
  },
  {
    id: 2,
    user: "midnight.feels",
    avatar: "https://i.pravatar.cc/40?img=23",
    caption: "3am thoughts hit different 🌙",
    text: ["raat ke andhere mein", "teri yaad hi meri roshni hai"],
    emoji: "🌙",
    likes: "82.3K",
    comments: "341",
    bg: "linear-gradient(160deg, #050510 0%, #0c0c2a 50%, #080818 100%)",
    accent: "#a78bfa",
    textColor: "#e8e0ff",
  },
  {
    id: 3,
    user: "poetrywall.in",
    avatar: "https://i.pravatar.cc/40?img=37",
    caption: "For everyone driving alone at night with music on full volume 🚗",
    text: ["raaste wahi hain", "magar hum ab wahi nahi"],
    emoji: "🛣️",
    likes: "121K",
    comments: "892",
    bg: "linear-gradient(160deg, #0a0a0a 0%, #101820 50%, #0a0e14 100%)",
    accent: "#38bdf8",
    textColor: "#e0f2fe",
  },
  {
    id: 4,
    user: "dil.ki.baat",
    avatar: "https://i.pravatar.cc/40?img=45",
    caption: "Some words live rent free in your head forever...",
    text: ["kuch lafz aise hote hain", "jo dil mein ghar kar jaate hain"],
    emoji: "🏡",
    likes: "56.7K",
    comments: "228",
    bg: "linear-gradient(160deg, #0d0805 0%, #1a1008 50%, #0d0a05 100%)",
    accent: "#fb923c",
    textColor: "#fff1e6",
  },
  {
    id: 5,
    user: "shayari.zone",
    avatar: "https://i.pravatar.cc/40?img=58",
    caption: "Missing someone you can't even call anymore 🥀",
    text: ["woh bhi kya waqt tha", "jab hum ek duje ke the"],
    emoji: "🥀",
    likes: "93.4K",
    comments: "560",
    bg: "linear-gradient(160deg, #0a0505 0%, #1a0808 50%, #0d0505 100%)",
    accent: "#f87171",
    textColor: "#ffe4e4",
  },
];

export default function ReelsViewer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState({});
  const [saved, setSaved] = useState({});
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState("up");
  const containerRef = useRef(null);
  const startY = useRef(null);

  const reel = reels[currentIndex];

  const goTo = (dir) => {
    if (animating) return;
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
    }, 350);
  };

  useEffect(() => {
    const handleWheel = (e) => {
      if (e.deltaY > 30) goTo("up");
      else if (e.deltaY < -30) goTo("down");
    };
    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [currentIndex, animating]);

  const handleTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e) => {
    if (startY.current === null) return;
    const diff = startY.current - e.changedTouches[0].clientY;
    if (diff > 40) goTo("up");
    else if (diff < -40) goTo("down");
    startY.current = null;
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100dvh",
        width: "100vw",
        background: "#111",
        fontFamily: "'DM Sans', sans-serif",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Noto+Serif+Devanagari:wght@400;600&display=swap');

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
            max-width: 100vw;
            max-height: 100vh;
            max-height: 100dvh;
            border-radius: 0;
          }
          .nav-dots { display: none !important; }
          .nav-arrows { display: none !important; }
          .reel-content { 
            padding-top: 52px; 
            padding-bottom: 50px; 
            height: 100%;
            width: 100%;
            position: relative;
          }
          .reels-wrapper { 
            width: 100%; 
            width: 100vw;
            height: 100%;
            height: 100vh; 
            height: 100dvh; 
            gap: 0 !important; 
          }
          .reel-top-bar { top: 52px !important; }
          .reel-actions { bottom: 70px !important; }
          .reel-caption { bottom: 50px !important; }
          .reel-poetry { bottom: 210px !important; }
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
        }
        .action-btn:hover { transform: scale(1.15); }
        .action-btn:active { transform: scale(0.9); }
        .action-btn svg { filter: drop-shadow(0 2px 8px rgba(0,0,0,0.5)); }

        .like-pop { animation: likePop 0.3s ease; }
        @keyframes likePop {
          0% { transform: scale(1); }
          50% { transform: scale(1.4); }
          100% { transform: scale(1); }
        }

        .poetry-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 18px;
          font-weight: 300;
          letter-spacing: 0.02em;
          line-height: 1.7;
        }

        @media (max-width: 480px) {
          .poetry-text { font-size: 16px; }
        }

        .dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.3); transition: all 0.3s ease; }
        .dot.active { background: white; width: 18px; border-radius: 3px; }

        .nav-arrow {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 50%;
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
          backdrop-filter: blur(4px);
          z-index: 10;
        }
        .nav-arrow:hover { background: rgba(255,255,255,0.18); }
      `}</style>

      <div className="reels-wrapper" style={{ position: "relative", display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Dots navigation */}
        <div className="nav-dots" style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
          {[...reels, { id: 'end' }].map((_, i) => (
            <div
              key={i}
              className={`dot ${i === currentIndex ? "active" : ""}`}
              onClick={() => {
                setDirection(i > currentIndex ? "up" : "down");
                setAnimating(true);
                setTimeout(() => { setCurrentIndex(i); setAnimating(false); }, 350);
              }}
              style={{ cursor: "pointer" }}
            />
          ))}
        </div>

        {/* Main reel card/End state */}
        <div
          ref={containerRef}
          className={`reel-card ${animating ? (direction === "up" ? "slide-up" : "slide-down") : "entering"}`}
          style={{ background: currentIndex < reels.length ? reel.bg : "#0a0a0a" }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {currentIndex < reels.length ? (
            <div className="reel-content">
              {/* Atmospheric grain overlay */}
              <div style={{
                position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
                opacity: 0.5,
              }} />

              {/* Glow effect */}
              <div style={{
                position: "absolute", bottom: "20%", left: "50%", transform: "translateX(-50%)",
                width: "200px", height: "200px", borderRadius: "50%",
                background: reel.accent, filter: "blur(80px)", opacity: 0.12,
                zIndex: 0, pointerEvents: "none",
              }} />

              {/* Top bar */}
              <div className="reel-top-bar" style={{
                position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
                padding: "16px 16px 24px",
                background: "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "50%",
                      border: `2px solid ${reel.accent}`,
                      overflow: "hidden", flexShrink: 0,
                    }}>
                      <img src={reel.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div>
                      <div style={{ color: "white", fontWeight: "500", fontSize: "14px" }}>{reel.user}</div>
                      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px" }}>Reels</div>
                    </div>
                  </div>
                  <button style={{
                    background: "transparent", border: `1px solid ${reel.accent}`,
                    color: reel.accent, borderRadius: "20px", padding: "6px 16px",
                    fontSize: "13px", fontWeight: "500", cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                  }}>Follow</button>
                </div>
              </div>

              {/* Center content – poetry */}
              <div className="reel-poetry" style={{
                position: "absolute", bottom: "160px", left: "20px", right: "72px",
                zIndex: 10,
              }}>
                <div className="poetry-text" style={{ color: reel.textColor }}>
                  {reel.text.map((line, i) => (
                    <div key={i} style={{ marginBottom: "2px" }}>{line}</div>
                  ))}
                </div>
                <div style={{ fontSize: "26px", marginTop: "12px" }}>{reel.emoji}</div>
              </div>

              {/* Bottom caption */}
              <div className="reel-caption" style={{
                position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10,
                padding: "48px 16px 20px",
                background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
              }}>
                <p style={{
                  color: "rgba(255,255,255,0.75)", fontSize: "13px", lineHeight: "1.5",
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}>
                  {reel.caption}
                </p>
              </div>

              {/* Right actions */}
              <div className="reel-actions" style={{
                position: "absolute", right: "14px", bottom: "90px", zIndex: 20,
                display: "flex", flexDirection: "column", gap: "20px",
              }}>
                <div className="action-btn" onClick={() => setLiked(l => ({ ...l, [currentIndex]: !l[currentIndex] }))}>
                  <svg className={liked[currentIndex] ? "like-pop" : ""} width="28" height="28" viewBox="0 0 24 24" fill={liked[currentIndex] ? reel.accent : "none"} stroke={liked[currentIndex] ? reel.accent : "white"} strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  <span style={{ color: "white", fontSize: "12px" }}>{liked[currentIndex] ? "❤️" : reel.likes}</span>
                </div>
                <div className="action-btn">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  <span style={{ color: "white", fontSize: "12px" }}>{reel.comments}</span>
                </div>
                <div className="action-btn">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  <span style={{ color: "white", fontSize: "12px" }}>Share</span>
                </div>
                <div className="action-btn" onClick={() => setSaved(s => ({ ...s, [currentIndex]: !s[currentIndex] }))}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill={saved[currentIndex] ? "white" : "none"} stroke="white" strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <div className="action-btn">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                    <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            /* End state: You're all caught up */
            <div style={{
              height: "100%", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", padding: "40px",
              textAlign: "center", position: "relative", zIndex: 10,
            }}>
              <div style={{
                width: "80px", height: "80px", borderRadius: "50%",
                background: "linear-gradient(135deg, #1d9bf0, #00ba7c)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "24px", boxShadow: "0 0 40px rgba(0,186,124,0.3)",
              }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h2 style={{ color: "white", fontSize: "22px", marginBottom: "12px", fontWeight: "600" }}>You're All Caught Up</h2>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", marginBottom: "32px" }}>
                You've seen all the newest poetry from the last few days.
              </p>
              <button
                onClick={() => {
                  setDirection("down");
                  setAnimating(true);
                  setTimeout(() => { setCurrentIndex(0); setAnimating(false); }, 350);
                }}
                style={{
                  background: "white", color: "black", border: "none",
                  padding: "12px 24px", borderRadius: "30px", fontSize: "14px",
                  fontWeight: "600", cursor: "pointer", transition: "transform 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              >
                Back to Start
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}