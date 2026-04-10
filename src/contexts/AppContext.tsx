import { createContext, useContext } from 'react';
import { useAppLogic } from '../hooks/useAppLogic';
import { useNavigate } from 'react-router-dom';
import { UseAppLogicReturn } from '../types';

const AppContext = createContext<UseAppLogicReturn | null>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const appLogic = useAppLogic(navigate);

    return (
        <AppContext.Provider value={appLogic}>
            {children}
        </AppContext.Provider>
    );
}

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}
