
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

  return (
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
  );
};

export default Auth;
