import React from 'react';

const ReelsSkeleton = () => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#000',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      padding: '20px'
    }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .sk-reel {
          background: linear-gradient(90deg, #1a1a1a 25%, #262626 50%, #1a1a1a 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite linear;
          border-radius: 4px;
        }
        .sk-circle {
          border-radius: 50%;
        }
        .reel-bg-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80%;
          height: 60%;
          background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 70%);
          pointer-events: none;
        }
      `}</style>
      
      {/* Central Glow Background */}
      <div className="reel-bg-glow" />

      {/* Main Content Area (Bottom Left) */}
      <div style={{ zIndex: 2, marginBottom: '40px', maxWidth: '80%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
          <div className="sk-reel sk-circle" style={{ width: '40px', height: '40px' }} />
          <div className="sk-reel" style={{ width: '120px', height: '14px', borderRadius: '10px' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="sk-reel" style={{ width: '100%', height: '12px' }} />
          <div className="sk-reel" style={{ width: '70%', height: '12px' }} />
        </div>
      </div>

      {/* Right Sidebar UI */}
      <div style={{
        position: 'absolute',
        right: '15px',
        bottom: '100px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        zIndex: 2
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="sk-reel" style={{ width: '28px', height: '28px', marginBottom: '4px' }} />
          <div className="sk-reel" style={{ width: '20px', height: '10px', margin: '0 auto' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div className="sk-reel" style={{ width: '28px', height: '28px', marginBottom: '4px' }} />
          <div className="sk-reel" style={{ width: '20px', height: '10px', margin: '0 auto' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div className="sk-reel" style={{ width: '28px', height: '28px', marginBottom: '4px' }} />
          <div className="sk-reel" style={{ width: '25px', height: '10px', margin: '0 auto' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div className="sk-reel" style={{ width: '24px', height: '28px', marginBottom: '4px' }} />
          <div className="sk-reel" style={{ width: '20px', height: '10px', margin: '0 auto' }} />
        </div>
        <div className="sk-reel" style={{ width: '4px', height: '12px', marginTop: '5px' }} />
      </div>

      {/* Top Left Menu (Partial) */}
      <div style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
         <div className="sk-reel sk-circle" style={{ width: '4px', height: '4px', marginBottom: '4px' }} />
         <div className="sk-reel sk-circle" style={{ width: '4px', height: '4px', marginBottom: '4px' }} />
         <div className="sk-reel sk-circle" style={{ width: '4px', height: '4px' }} />
      </div>
    </div>
  );
};

export default ReelsSkeleton;
