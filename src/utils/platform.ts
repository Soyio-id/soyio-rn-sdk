import { Platform } from 'react-native';

export function getPlatformSuffix(): string {
  const platform = Platform.OS;
  return (platform === 'android' || platform === 'ios') ? `-${platform}` : '';
}
