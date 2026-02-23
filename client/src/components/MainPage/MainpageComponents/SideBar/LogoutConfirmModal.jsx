import React from 'react';

const LogoutConfirmModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div 
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                zIndex: 3000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(5px)',
                animation: 'fadeIn 0.2s ease-out'
            }}
            onClick={onClose}
        >
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .confirm-modal-content {
                    background: #262626;
                    width: 400px;
                    border-radius: 12px;
                    overflow: hidden;
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .confirm-btn {
                    width: 100%;
                    padding: 12px;
                    border: none;
                    background: none;
                    color: #ff3b30;
                    font-weight: 700;
                    font-size: 14px;
                    border-bottom: 1px solid #363636;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .confirm-btn:hover { background: rgba(255, 59, 48, 0.05); }
                .cancel-btn {
                    width: 100%;
                    padding: 12px;
                    border: none;
                    background: none;
                    color: white;
                    font-size: 14px;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .cancel-btn:hover { background: rgba(255, 255, 255, 0.05); }
            `}</style>
            
            <div 
                className="confirm-modal-content"
                onClick={e => e.stopPropagation()}
            >
                <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                    <h5 style={{ color: 'white', marginBottom: '8px', fontSize: '18px' }}>Logging out?</h5>
                    <p style={{ color: '#737373', fontSize: '14px', margin: 0 }}>
                        Are you sure you want to log out of your account?
                    </p>
                </div>
                
                <button 
                    className="confirm-btn" 
                    onClick={onConfirm}
                >
                    Log Out
                </button>
                <button className="cancel-btn" onClick={onClose}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default LogoutConfirmModal;
