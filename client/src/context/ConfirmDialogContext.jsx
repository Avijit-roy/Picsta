import React, { useState, useCallback, useRef } from 'react';
import ConfirmDialogContext from './ConfirmDialogUtils';

// --- Provider (the main component to wrap the app) ---
export const ConfirmDialogProvider = ({ children }) => {
    const [dialog, setDialog] = useState(null);
    const resolveRef = useRef(null);

    const confirm = useCallback((message, { title = 'Confirm', confirmText = 'Confirm', cancelText = 'Cancel', danger = true } = {}) => {
        return new Promise((resolve) => {
            resolveRef.current = resolve;
            setDialog({ message, title, confirmText, cancelText, danger });
        });
    }, []);

    const handleConfirm = () => {
        setDialog(null);
        resolveRef.current?.(true);
    };

    const handleCancel = () => {
        setDialog(null);
        resolveRef.current?.(false);
    };

    return (
        <ConfirmDialogContext.Provider value={{ confirm }}>
            {children}
            {dialog && (
                <ConfirmDialogUI
                    {...dialog}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}
        </ConfirmDialogContext.Provider>
    );
};

// --- UI Component ---
const ConfirmDialogUI = ({ title, message, confirmText, cancelText, danger, onConfirm, onCancel }) => {
    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 99999,
                backgroundColor: 'rgba(0,0,0,0.7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(4px)',
                animation: 'fadeIn 0.15s ease-out'
            }}
            onClick={onCancel}
        >
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to   { transform: translateY(0); opacity: 1; }
                }
                .confirm-dialog-btn {
                    cursor: pointer;
                    border: none;
                    border-radius: 8px;
                    padding: 10px 24px;
                    font-size: 14px;
                    font-weight: 600;
                    transition: opacity 0.15s ease, transform 0.15s ease;
                }
                .confirm-dialog-btn:hover {
                    opacity: 0.85;
                    transform: scale(1.03);
                }
                .confirm-dialog-btn:active {
                    transform: scale(0.97);
                }
            `}</style>
            <div
                style={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    borderRadius: '16px',
                    padding: '28px 28px 24px',
                    width: '100%',
                    maxWidth: '360px',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
                    animation: 'slideUp 0.2s ease-out'
                }}
                onClick={e => e.stopPropagation()}
            >
                <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '700', margin: '0 0 8px 0' }}>
                    {title}
                </h3>
                <p style={{ color: '#aaa', fontSize: '14px', margin: '0 0 24px 0', lineHeight: 1.5 }}>
                    {message}
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                        className="confirm-dialog-btn"
                        style={{ backgroundColor: '#2a2a2a', color: '#ccc' }}
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>
                    <button
                        className="confirm-dialog-btn"
                        style={{ backgroundColor: danger ? '#e53935' : '#6200ee', color: '#fff' }}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
