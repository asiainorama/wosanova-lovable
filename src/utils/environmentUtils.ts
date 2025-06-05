
/**
 * Utility functions to detect the current environment
 */

/**
 * Checks if the app is running inside Lovable's preview iframe
 */
export const isLovablePreview = (): boolean => {
  try {
    // Check if we're in an iframe
    const inIframe = window.self !== window.top;
    
    // Check if the parent URL contains lovable.dev
    let isLovableEnvironment = false;
    try {
      isLovableEnvironment = window.location.href.includes('lovable.dev') || 
                            (inIframe && window.top?.location.hostname.includes('lovable.dev'));
    } catch (e) {
      // If we can't access parent due to cross-origin, check our own URL
      isLovableEnvironment = window.location.href.includes('lovable.dev');
    }
    
    return inIframe && isLovableEnvironment;
  } catch (error) {
    // In case of any error, default to false
    console.log('Error detecting environment:', error);
    return false;
  }
};

/**
 * Returns true if authentication should be skipped (in Lovable preview environment)
 */
export const shouldSkipAuth = (): boolean => {
  return isLovablePreview();
};
