import * as WebBrowser from 'expo-web-browser';
import { useCallback } from 'react';

import type { AuthenticateParams, RegisterParams, SoyioWidgetViewPropsType } from './types';
import {
  buildUrlParams,
  ERROR_URL_REGEX,
  getBrowserOptions,
  getFlowUrl,
  getRedirectUrl,
} from './utils';

export const useSoyioAuth = ({ options, onEventChange }: SoyioWidgetViewPropsType) => {
  const register = useCallback(async (registerParams: RegisterParams) => {
    const registerBaseUri = getFlowUrl(options, 'register');
    const registerUri = `${registerBaseUri}?${buildUrlParams(options, registerParams)}`;
    const redirectUrl = getRedirectUrl(options.uriScheme);
    const webBrowserOptions = await getBrowserOptions();

    if (onEventChange) onEventChange({ type: 'open register' });

    const registerResult = await WebBrowser.openAuthSessionAsync(
      registerUri,
      redirectUrl,
      webBrowserOptions,
    );

    if ((registerResult.type === 'success') && (registerResult.url?.includes('error'))) {
      const errorMessage = registerResult.url.match(ERROR_URL_REGEX)[1];

      if (onEventChange) onEventChange({ type: 'error', message: errorMessage });
    } else if (onEventChange) onEventChange(registerResult);
  }, [options, onEventChange]);

  const authenticate = useCallback(async (authenticateParams: AuthenticateParams) => {
    const authenticateBaseUri = getFlowUrl(options, 'authenticate');
    const authenticateUri = `${authenticateBaseUri}?${buildUrlParams(options, authenticateParams)}`;
    const redirectUrl = getRedirectUrl(options.uriScheme);
    const webBrowserOptions = await getBrowserOptions();

    if (onEventChange) onEventChange({ type: 'open authenticate' });

    const authenticateResult = await WebBrowser.openAuthSessionAsync(
      authenticateUri,
      redirectUrl,
      webBrowserOptions,
    );
    if (onEventChange) onEventChange(authenticateResult);
  }, [options, onEventChange]);

  return { register, authenticate };
};
