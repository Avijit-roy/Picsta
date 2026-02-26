import React from 'react';

const PostSkeleton = () => (
    <div style={{
        backgroundColor: '#121212',
        marginBottom: '0',
        borderBottom: '1px solid #1c1c1c',
        padding: '16px 0',
    }}>
        <style>{`
            @keyframes shimmer {
                0%   { background-position: -600px 0; }
                100% { background-position: 600px 0; }
            }
            .sk {
                background: linear-gradient(
                    90deg,
                    #1e1e1e 25%,
                    #2a2a2a 50%,
                    #1e1e1e 75%
                );
                background-size: 600px 100%;
                animation: shimmer 1.4s ease-in-out infinite;
                border-radius: 6px;
            }
        `}</style>

        {/* Header: avatar + username */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 16px 12px' }}>
            {/* Avatar */}
            <div className="sk" style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0 }} />
            {/* Name + sub-line */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="sk" style={{ height: 12, width: '40%' }} />
                <div className="sk" style={{ height: 10, width: '25%' }} />
            </div>
            {/* Options dots */}
            <div className="sk" style={{ width: 20, height: 6, borderRadius: 4 }} />
        </div>

        {/* Image placeholder */}
        <div
            className="sk"
            style={{
                width: '100%',
                aspectRatio: '1 / 1',
                borderRadius: 0,
                margin: 0,
            }}
        />

        {/* Action row  */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 8px' }}>
            <div style={{ display: 'flex', gap: 14 }}>
                {[22, 22, 22, 22].map((w, i) => (
                    <div key={i} className="sk" style={{ width: w, height: w, borderRadius: 5 }} />
                ))}
            </div>
            <div className="sk" style={{ width: 22, height: 22, borderRadius: 5 }} />
        </div>

        {/* Likes / caption line */}
        <div style={{ padding: '0 16px 6px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="sk" style={{ height: 11, width: '30%' }} />
            <div className="sk" style={{ height: 11, width: '65%' }} />
            <div className="sk" style={{ height: 11, width: '45%' }} />
        </div>

        {/* Comment input bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px 0' }}>
            <div className="sk" style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0 }} />
            <div className="sk" style={{ height: 11, flex: 1 }} />
        </div>
    </div>
);

export default PostSkeleton;
