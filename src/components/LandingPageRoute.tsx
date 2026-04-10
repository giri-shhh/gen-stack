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
        handleAuthSuccess,
        setGetStartedModalOpen,
        setAuthModalOpen,
    } = useAppContext();

    return (
        <>
            <LandingPage
                onGetStarted={handleGetStarted}
            />
            <GetStartedModal
                isOpen={getStartedModalOpen}
                onClose={() => setGetStartedModalOpen(false)}
                onSignUp={handleGetStartedSignUp}
                onContinueAsTemp={handleContinueAsTemp}
            />
            {authModalOpen && (
                <AuthModal
                    isOpen={authModalOpen}
                    mode={authModalMode}
                    onClose={() => setAuthModalOpen(false)}
                    onAuthSuccess={handleAuthSuccess}
                />
            )}
        </>
    );
}
