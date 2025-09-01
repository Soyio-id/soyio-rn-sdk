import { InAppBrowser } from 'react-native-inappbrowser-reborn';

import type {
  AuthRequestParams,
  DisclosureParams,
  SoyioWidgetOptions,
} from './types';
import { buildUrl } from './utils/url-builder';

export interface OpenDisclosureParams {
  options: SoyioWidgetOptions;
  requestParams: DisclosureParams;
  onComplete?: () => void;
  onCancel?: () => void;
}

export interface OpenAuthRequestParams {
  options: SoyioWidgetOptions;
  requestParams: AuthRequestParams;
  onComplete?: () => void;
  onCancel?: () => void;
}

export const IN_APP_BROWSER_OPTIONS = {
  // iOS Properties
  ephemeralWebSession: false,
  showTitle: false,
  // Android Properties
  enableUrlBarHiding: true,
  enableDefaultShare: false,
};

const openInAppBrowser = async (
  url: string,
  uriScheme: string,
  onComplete?: () => void,
  onCancel?: () => void,
): Promise<void> => {
  const deepLink = `${uriScheme}://success`;

  if (!(await InAppBrowser.isAvailable())) {
    throw new Error('InAppBrowser is not available');
  }

  const result = await InAppBrowser.openAuth(url, deepLink, IN_APP_BROWSER_OPTIONS);

  if (result.type === 'success') {
    onComplete?.();
  } else if (result.type === 'cancel') {
    onCancel?.();
  }
};

export const openDisclosure = async ({
  options,
  requestParams,
  onComplete,
  onCancel,
}: OpenDisclosureParams): Promise<void> => {
  const url = buildUrl(options, 'disclosure', requestParams, false);
  await openInAppBrowser(url, options.uriScheme, onComplete, onCancel);
};

export const openAuthenticationRequest = async ({
  options,
  requestParams,
  onComplete,
  onCancel,
}: OpenAuthRequestParams): Promise<void> => {
  const url = buildUrl(options, 'authentication_request', requestParams, false);
  await openInAppBrowser(url, options.uriScheme, onComplete, onCancel);
};
