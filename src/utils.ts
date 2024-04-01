import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { PRODUCTION_URL, SANDBOX_URL } from './constants';
import { AuthenticateParams, RegisterParams, SoyioWidgetParams } from './types';

export function getFlowUrl(
  options: SoyioWidgetParams,
  flow: 'authenticate' | 'register',
): string {
  const baseUrl = options.developmentUrl || (options.isSandbox ? SANDBOX_URL : PRODUCTION_URL);
  return `${baseUrl}/${flow}`;
}

export function buildUrlParams(
  widgetParams: SoyioWidgetParams,
  flowParams: RegisterParams | AuthenticateParams,
): string {
  // eslint-disable-next-line no-nested-ternary
  const platformSuffix = Platform.OS === 'android' ? '-android' : Platform.OS === 'ios' ? '-ios' : '';
  const baseParams = {
    platform: `rn${platformSuffix}`,
    uriScheme: widgetParams.uriScheme,
    companyId: widgetParams.companyId,
    userReference: widgetParams.userReference,
  };

  const allParams = { ...baseParams, ...flowParams };

  const queryParams = Object.entries(allParams)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  return queryParams;
}

export async function getBrowserOptions() {
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

export function getRedirectUrl(scheme: string) {
  return `${scheme}://`;
}
