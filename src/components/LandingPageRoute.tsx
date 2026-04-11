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
                onGetStarted={handleGetStarted} onSignIn={function (): void {
                    throw new Error('Function not implemented.');
                } } onSignUp={function (): void {
                    throw new Error('Function not implemented.');
                } }            />
            <GetStartedModal
                isOpen={getStartedModalOpen}
                onClose={() => setGetStartedModalOpen(false)}
                onSignUp={handleGetStartedSignUp}
                onContinueAsTemp={handleContinueAsTemp}
                onAuthSuccess={handleAuthSuccess}
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
