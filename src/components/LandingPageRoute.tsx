import React, { useEffect } from 'react';
import LandingPage from './LandingPage';
import GetStartedModal from './GetStartedModal';
import AuthModal from './AuthModal';
import { useAppContext } from '../contexts/AppContext';

export default function LandingPageRoute() {
    const {
        authModalOpen,
        authModalMode,
        getStartedModalOpen,
        handleGetStarted,
        handleContinueAsTemp,
        handleGetStartedSignUp,
        setGetStartedModalOpen,
        setAuthModalOpen,
        setUser,
        setAuthModalMode,
    } = useAppContext() as any;

    const onLocalAuthSuccess = (userObj: any) => {
        localStorage.setItem('user', JSON.stringify(userObj));
        if (setUser) {
            setUser(userObj);
        } else {
            window.location.reload();
        }
        setAuthModalOpen(false);
        setGetStartedModalOpen(false);
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
            window.history.replaceState({}, document.title, window.location.pathname);
            handleGithubCallback(code);
        }
    }, []);

    const handleGithubCallback = async (code: string) => {
        try {
            const backendUrl = import.meta.env.VITE_AUTH_BACKEND_URL || '/api/auth/github';
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });
            if (!response.ok) throw new Error('Failed to exchange GitHub code');
            const data = await response.json();
            const user = {
                id: `github_${data.id || Date.now()}`,
                name: data.name || data.login || 'GitHub User',
                email: data.email || '',
                avatar: data.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || data.login || 'GitHub User')}&background=24292e&color=fff`,
            };
            onLocalAuthSuccess(user);
        } catch (err) {
            console.error('GitHub authentication failed or backend not configured:', err);
            const fallbackUser = {
                id: `github_${Date.now()}`,
                name: 'GitHub User',
                email: 'user@github.com',
                avatar: `https://ui-avatars.com/api/?name=GitHub+User&background=24292e&color=fff`,
            };
            onLocalAuthSuccess(fallbackUser);
        }
    };

    const onLocalContinueAsTemp = () => {
        const tempUser = {
            id: `temp_${Date.now()}`,
            name: 'Temporary User',
            email: '',
            avatar: `https://ui-avatars.com/api/?name=Temporary+User&background=6366f1&color=fff`,
            isTemporary: true
        };
        localStorage.setItem('user', JSON.stringify(tempUser));
        if (setUser) setUser(tempUser);
        else window.location.reload();
        setGetStartedModalOpen(false);
    };

    return (
        <>
            <LandingPage
                onGetStarted={handleGetStarted} 
                onSignIn={() => {
                    if (setAuthModalMode) setAuthModalMode('signin');
                    setAuthModalOpen(true);
                }} 
                onSignUp={() => {
                    if (handleGetStartedSignUp) handleGetStartedSignUp();
                    else {
                        if (setAuthModalMode) setAuthModalMode('signup');
                        setAuthModalOpen(true);
                    }
                }}            
            />
            <GetStartedModal
                isOpen={getStartedModalOpen}
                onClose={() => setGetStartedModalOpen(false)}
                onSignUp={handleGetStartedSignUp}
                onContinueAsTemp={onLocalContinueAsTemp}
                onAuthSuccess={onLocalAuthSuccess}
            />
            {authModalOpen && (
                <AuthModal
                    isOpen={authModalOpen}
                    mode={authModalMode}
                    onClose={() => setAuthModalOpen(false)}
                    onAuthSuccess={onLocalAuthSuccess}
                />
            )}
        </>
    );
}
