import { Platform } from 'react-native';

/**
 * Gets the platform-specific suffix for SDK identification
 */
export function getPlatformSuffix(): string {
  const platform = Platform.OS;
  return (platform === 'android' || platform === 'ios') ? `-${platform}` : '';
}
