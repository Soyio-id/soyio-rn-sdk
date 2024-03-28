import * as WebBrowser from 'expo-web-browser';
import { useCallback } from 'react';
import { Platform } from 'react-native';

import { SOYIO_REDIRECT_URL } from './constants';
import type { AuthenticateParams, RegisterParams, SoyioWidgetViewPropsType } from './types';
import { buildUrlParams, getFlowUrl } from './utils';

async function getBrowserOptions() {
  const webBrowserOptions: WebBrowser.AuthSessionOpenOptions = {
    dismissButtonStyle: 'cancel',
    createTask: false,
    enableBarCollapsing: true,
    showTitle: true,
  };

  if (Platform.OS === 'android') {
    const { preferredBrowserPackage } = await WebBrowser.getCustomTabsSupportingBrowsersAsync();
    webBrowserOptions.browserPackage = preferredBrowserPackage;
  }

  return webBrowserOptions;
}

export const useSoyioAuth = ({ options, onEventChange }: SoyioWidgetViewPropsType) => {
  const register = useCallback(async (registerParams: RegisterParams) => {
    const registerBaseUri = getFlowUrl(options, 'register');
    const registerUri = `${registerBaseUri}?${buildUrlParams(options, registerParams)}`;

    if (onEventChange) onEventChange({ type: 'open register' });
    const webBrowserOptions = await getBrowserOptions();

    const registerResult = await WebBrowser.openAuthSessionAsync(
      registerUri,
      SOYIO_REDIRECT_URL,
      webBrowserOptions,
    );

    if (onEventChange) onEventChange(registerResult);
  }, [options, onEventChange]);

  const authenticate = useCallback(async (authenticateParams: AuthenticateParams) => {
    const authenticateBaseUri = getFlowUrl(options, 'authenticate');
    const authenticateUri = `${authenticateBaseUri}?${buildUrlParams(options, authenticateParams)}`;

    if (onEventChange) onEventChange({ type: 'open authenticate' });
    const webBrowserOptions = await getBrowserOptions();

    const authenticateResult = await WebBrowser.openAuthSessionAsync(
      authenticateUri,
      SOYIO_REDIRECT_URL,
      webBrowserOptions,
    );
    if (onEventChange) onEventChange(authenticateResult);
  }, [options, onEventChange]);

  return { register, authenticate };
};
