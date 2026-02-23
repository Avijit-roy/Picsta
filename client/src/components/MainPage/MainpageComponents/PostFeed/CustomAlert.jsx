import React, { useEffect } from 'react';

const CustomAlert = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: type === 'success' ? '#0095f6' : '#ed4956',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            zIndex: 4000,
            animation: 'slideUpFade 0.3s ease-out'
        }}>
            <style>{`
                @keyframes slideUpFade {
                    from { transform: translate(-50%, 20px); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
            `}</style>
            {message}
        </div>
    );
};

export default CustomAlert;
