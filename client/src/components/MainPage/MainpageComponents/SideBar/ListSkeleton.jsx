import React from 'react';

const ListSkeleton = () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div style={{ padding: '0 20px' }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .skeleton-block {
          background: linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite linear;
          border-radius: 4px;
        }
      `}</style>
      {items.map((i) => (
        <div key={i} style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: '10px 0', 
          gap: '14px' 
        }}>
          {/* Avatar circle */}
          <div className="skeleton-block" style={{ width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0 }} />
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Primary bar */}
            <div className="skeleton-block" style={{ width: '70%', height: '14px', borderRadius: '10px' }} />
            {/* Secondary bar */}
            <div className="skeleton-block" style={{ width: '40%', height: '12px', opacity: 0.5, borderRadius: '10px' }} />
          </div>

          {/* Small action placeholder */}
          <div className="skeleton-block" style={{ width: '12px', height: '12px', borderRadius: '50%', opacity: 0.3, flexShrink: 0 }} />
        </div>
      ))}
    </div>
  );
};

export default ListSkeleton;
