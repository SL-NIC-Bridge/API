export type ClientType = 'web' | 'mobile' | 'unknown';

/**
 * Detects client type from request headers
 * @param userAgent - The User-Agent header value
 * @param clientTypeHeader - Custom X-Client-Type header (most reliable)
 * @returns The detected client type
 */
export const detectClientType = (userAgent: string = '', clientTypeHeader: string = ''): ClientType => {
  // Check custom header first (most reliable)
  const customType = clientTypeHeader.toLowerCase();
  if (customType === 'web' || customType === 'mobile') {
    return customType;
  }
  
  // Fallback to User-Agent detection
  const ua = userAgent.toLowerCase();
  
  // Mobile patterns (check these first as mobile browsers may contain desktop patterns)
  const mobilePatterns = [
    /android/,
    /iphone|ipad|ipod/,
    /windows phone/,
    /blackberry/,
    /mobile/,
    /react-native/,
    /cordova/,
    /ionic/,
    /flutter/,
    /expo/,
    /capacitor/,
    /dart/
  ];
  
  // Web patterns
  const webPatterns = [
    /chrome\/(?!.*mobile)/,  // Chrome desktop (not mobile)
    /firefox\/(?!.*mobile)/, // Firefox desktop (not mobile)
    /safari\/(?!.*mobile)/,  // Safari desktop (not mobile)
    /edge/,
    /opera/,
    /electron/
  ];
  
  // Check mobile first
  if (mobilePatterns.some(pattern => pattern.test(ua))) {
    return 'mobile';
  }
  
  // Then check web
  if (webPatterns.some(pattern => pattern.test(ua))) {
    return 'web';
  }
  
  return 'unknown';
};

/**
 * Validates if a user role is allowed to access from a specific client type
 * @param userRole - The user's role (DS, GN, etc.)
 * @param clientType - The detected client type
 * @returns true if access is allowed, false otherwise
 */
export const isRoleAllowedForClient = (userRole: string, clientType: ClientType): boolean => {
  switch (clientType) {
    case 'web':
      // Web: Only DS and GN roles allowed
      return ['DS', 'GN'].includes(userRole);
    
    case 'mobile':
      // Mobile: Only standard users (not DS or GN)
      return !['DS', 'GN'].includes(userRole);
    
    case 'unknown':
      // For unknown clients, be more restrictive - only allow DS and GN (web-like behavior)
      return ['DS', 'GN'].includes(userRole);
    
    default:
      return false;
  }
};
