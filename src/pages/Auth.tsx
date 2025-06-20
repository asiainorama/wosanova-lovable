
import React, { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { AuthBackground } from '@/components/auth/AuthBackground';
import { AuthLoadingScreen } from '@/components/auth/AuthLoadingScreen';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuthState } from '@/hooks/useAuthState';

const Auth = () => {
  const { mode } = useTheme();
  const {
    isLoading,
    isAuthenticating,
    authError,
    inDevMode,
    randomBackground,
    handleGoogleSignIn,
    handleDevModeEnter
  } = useAuthState();

  // Determine if we should use dark mode based on the theme context
  const isDarkMode = mode === 'dark' || mode === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Effect to update the theme when mode changes
  useEffect(() => {
    console.log("Auth page - current theme mode:", mode);
  }, [mode]);

  // Fix viewport height on mobile to ensure background is visible
  useEffect(() => {
    const setVhProperty = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVhProperty();
    window.addEventListener('resize', setVhProperty);
    window.addEventListener('orientationchange', setVhProperty);

    return () => {
      window.removeEventListener('resize', setVhProperty);
      window.removeEventListener('orientationchange', setVhProperty);
    };
  }, []);

  return (
    <div style={{ 
      minHeight: 'calc(var(--vh, 1vh) * 100)',
      width: '100vw',
      overflow: 'hidden'
    }}>
      <AuthBackground background={randomBackground}>
        {isAuthenticating ? (
          <AuthLoadingScreen background={randomBackground} inDevMode={inDevMode} />
        ) : (
          <AuthForm
            background={randomBackground}
            authError={authError}
            inDevMode={inDevMode}
            isLoading={isLoading}
            onGoogleSignIn={handleGoogleSignIn}
            onDevModeEnter={handleDevModeEnter}
          />
        )}
      </AuthBackground>
    </div>
  );
};

export default Auth;
