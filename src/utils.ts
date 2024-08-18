import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { PRODUCTION_URL, SANDBOX_URL } from './constants';
import { DisclosureParams, SoyioWidgetParams } from './types';

export function getFlowUrl(
  options: SoyioWidgetParams,
  request: 'disclosure' | 'signature',
): string {
  const baseUrl = options.developmentUrl || (options.isSandbox ? SANDBOX_URL : PRODUCTION_URL);
  return `${baseUrl}/${flow}`;
}

export function buildUrlParams(
  widgetParams: SoyioWidgetParams,
  requestParams: DisclosureParams,
): string {
  const sdkSuffix = (Platform.OS === 'android' || Platform.OS === 'ios') ? `-${Platform.OS}` : '';

  const baseParams = {
    sdk: `rn${sdkSuffix}`,
    uriScheme: widgetParams.uriScheme,
    companyId: widgetParams.companyId,
    userReference: widgetParams.userReference,
    customColor: widgetParams.customColor,
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

type ParsedUrlParameters = {
  request: 'data_access' | 'signature';
  [key: string]: string;
};

export function parseUrlResponseParams(url: string): ParsedUrlParameters {
  const regex = /^(\w+):\/\/(\w+)\?(.+)$/;
  const match = url.match(regex);

  const [, , requestType, queryString] = match;

  const params = new URLSearchParams(queryString);
  const result: ParsedUrlParameters = {
    request: requestType as 'data_access' | 'signature',
  };

  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}
