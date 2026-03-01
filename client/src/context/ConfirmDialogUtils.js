import { createContext, useContext } from 'react';

const ConfirmDialogContext = createContext(null);

export const useConfirm = () => {
    const ctx = useContext(ConfirmDialogContext);
    if (!ctx) throw new Error('useConfirm must be used within ConfirmDialogProvider');
    return ctx.confirm;
};

export default ConfirmDialogContext;
