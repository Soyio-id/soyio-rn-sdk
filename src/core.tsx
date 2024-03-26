import { useCallback } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { getFlowUrl, buildUrlParams } from './utils';
import { SOYIO_REDIRECT_URL } from './constants';

import type { SoyioWidgetViewPropsType, RegisterParams, AuthenticateParams } from './types';

export const useSoyioAuth = ({ options, onEventChange }: SoyioWidgetViewPropsType) => {
  const webBrowserOptions: WebBrowser.AuthSessionOpenOptions = {
    dismissButtonStyle: 'cancel',
    createTask: false,
    enableBarCollapsing: true,
    showTitle: true,
  };

  const register = useCallback(async (registerParams: RegisterParams) => {
    const registerBaseUri = getFlowUrl(options, 'register');
    const registerUri = `${registerBaseUri}?${buildUrlParams(options, registerParams)}`;

    if (onEventChange) onEventChange({ type: 'open register' });

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
    const authenticateResult = await WebBrowser.openAuthSessionAsync(
      authenticateUri,
      SOYIO_REDIRECT_URL,
      webBrowserOptions,
    );
    if (onEventChange) onEventChange(authenticateResult);
  }, [options, onEventChange]);

  return { register, authenticate };
};
