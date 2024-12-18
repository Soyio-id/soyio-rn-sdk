import * as WebBrowser from 'expo-web-browser';
import { useCallback } from 'react';

import type {
  AuthRequestParams,
  DisclosureParams,
  SoyioWidgetViewPropsType,
} from './types';
import {
  buildUrlParams,
  getBrowserOptions,
  getRedirectUrl,
  getRequestUrl,
  parseUrlResponseParams,
} from './utils';

export const useSoyioAuth = ({ options, onEventChange }: SoyioWidgetViewPropsType) => {
  const handleProcess = useCallback(
    async (baseUri: string, params: AuthRequestParams | DisclosureParams) => {
      const uri = `${baseUri}?${buildUrlParams(options, params)}`;
      const redirectUrl = getRedirectUrl(options.uriScheme);
      const webBrowserOptions = await getBrowserOptions();

      if (onEventChange) onEventChange({ type: 'open' });

      const result = await WebBrowser.openAuthSessionAsync(
        uri,
        redirectUrl,
        webBrowserOptions,
      );

      if (onEventChange) {
        // 'success' type means that a redirection was triggered by Soyio,
        // but doesn't mean that the process was successful
        if (result.type === 'success') {
          const urlParams = parseUrlResponseParams(result.url);
          if (result.url?.includes('error')) {
            onEventChange({ type: 'error', ...urlParams });
          } else {
            onEventChange({ type: 'success', ...urlParams });
          }
        } else {
          onEventChange(result);
        }
      }
    },
    [options, onEventChange],
  );

  const disclosure = useCallback(
    async (registerParams: DisclosureParams) => {
      const disclosureBaseUri = getRequestUrl(options, {
        request: 'disclosure',
        ...registerParams,
      });
      handleProcess(disclosureBaseUri, registerParams);
    },
    [options, handleProcess],
  );

  const authentication = useCallback(
    async (authRequestParams: AuthRequestParams) => {
      const authBaseUri = getRequestUrl(options, {
        request: 'authentication',
        ...authRequestParams,
      });
      handleProcess(authBaseUri, authRequestParams);
    },
    [options, handleProcess],
  );

  return { disclosure, authentication };
};
