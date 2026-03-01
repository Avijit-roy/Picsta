import React from 'react';

const StorySkeleton = () => {
    const items = [1, 2, 3, 4, 5, 6];

    return (
        <div style={{ display: 'flex', gap: '24px', padding: '0 20px', overflow: 'hidden' }}>
            <style>{`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                .skeleton-circle {
                    background: linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite linear;
                    border-radius: 50%;
                }
                .skeleton-text {
                    background: linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite linear;
                    height: 12px;
                    border-radius: 6px;
                    margin-top: 10px;
                    width: 70px;
                }
            `}</style>

            {items.map((i, index) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '90px' }}>
                    <div style={{ position: 'relative' }}>
                        {/* Main circular placeholder */}
                        <div 
                            className="skeleton-circle" 
                            style={{ 
                                width: '74px', 
                                height: '74px',
                                border: '3px solid #000'
                            }} 
                        />
                        
                        {/* Plus button placeholder for the first item */}
                        {index === 0 && (
                            <div 
                                className="skeleton-circle" 
                                style={{ 
                                    position: 'absolute',
                                    bottom: '2px',
                                    right: '2px',
                                    width: '24px',
                                    height: '24px',
                                    border: '3px solid #000',
                                    background: '#222' // Slightly different to stand out
                                }} 
                            />
                        )}
                    </div>
                    {/* Username text placeholder */}
                    <div className="skeleton-text" />
                </div>
            ))}
        </div>
    );
};

export default StorySkeleton;
