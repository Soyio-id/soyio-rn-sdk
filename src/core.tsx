import * as WebBrowser from 'expo-web-browser';
import { useCallback } from 'react';

import type {
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
  const disclosure = useCallback(async (registerParams: DisclosureParams) => {
    const disclosureBaseUri = getRequestUrl(options, 'disclosure');
    const disclosureUri = `${disclosureBaseUri}?${buildUrlParams(options, registerParams)}`;
    const redirectUrl = getRedirectUrl(options.uriScheme);
    const webBrowserOptions = await getBrowserOptions();

    if (onEventChange) onEventChange({ type: 'open_disclosure' });

    const disclosureResult = await WebBrowser.openAuthSessionAsync(
      disclosureUri,
      redirectUrl,
      webBrowserOptions,
    );

    if (onEventChange) {
      // 'success' type means that a redirection was triggered by Soyio,
      // but doesn't mean that the process was successful
      if (disclosureResult.type === 'success') {
        const urlParams = parseUrlResponseParams(disclosureResult.url);
        if (disclosureResult.url?.includes('error')) {
          onEventChange({ type: 'error', ...urlParams });
        } else {
          onEventChange({ type: 'success', ...urlParams });
        }
      } else {
        onEventChange(disclosureResult);
      }
    }
  }, [options, onEventChange]);

  return { disclosure };
};
