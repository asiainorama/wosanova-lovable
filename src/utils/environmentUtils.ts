
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
    
    // Check if the current URL contains lovable.dev or lovable.app
    const currentUrl = window.location.href;
    const isLovableUrl = currentUrl.includes('lovable.dev') || currentUrl.includes('lovable.app');
    
    // Check if the hostname is a Lovable preview domain
    const hostname = window.location.hostname;
    const isLovableHostname = hostname.includes('lovable.dev') || 
                              hostname.includes('lovable.app') || 
                              hostname.includes('lovableproject.com');
    
    // Check for localhost development
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    
    // Additional check for Lovable's specific iframe context
    let parentIsLovable = false;
    try {
      if (inIframe && window.top) {
        const parentHostname = window.top.location.hostname;
        parentIsLovable = parentHostname.includes('lovable.dev') || 
                         parentHostname.includes('lovable.app');
      }
    } catch (e) {
      // Cross-origin restriction means we're likely in Lovable's iframe
      if (inIframe) {
        parentIsLovable = true;
      }
    }
    
    // Debug logging
    console.log('Environment check:', {
      inIframe,
      currentUrl,
      hostname,
      isLovableUrl,
      isLovableHostname,
      isLocalhost,
      parentIsLovable
    });
    
    // Return true for any Lovable environment or development
    return isLovableUrl || isLovableHostname || parentIsLovable || isLocalhost;
  } catch (error) {
    // In case of any error, default to true to be safe in development
    console.log('Error detecting environment, defaulting to development mode:', error);
    return true;
  }
};

/**
 * Returns true if authentication should be skipped (in Lovable preview environment)
 */
export const shouldSkipAuth = (): boolean => {
  const skipAuth = isLovablePreview();
  console.log('Should skip auth:', skipAuth);
  return skipAuth;
};
