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
