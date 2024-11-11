import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { PRODUCTION_URL, SANDBOX_URL } from './constants';
import { DisclosureParams, SignatureParams, SoyioWidgetParams } from './types';

type RequestUrlParams = { request: 'disclosure' } & DisclosureParams
  | { request: 'signature' } & SignatureParams;

function getPath(params: RequestUrlParams) {
  if (params.request === 'disclosure' && params.disclosureRequestId) {
    return `disclosures/${params.disclosureRequestId}`;
  }

  return params.request;
}

export function getRequestUrl(
  options: SoyioWidgetParams,
  params: RequestUrlParams,
): string {
  const baseUrl = options.developmentUrl || (options.isSandbox ? SANDBOX_URL : PRODUCTION_URL);
  const path = getPath(params);

  return `${baseUrl}/${path}`;
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

  const allParams = { ...baseParams, ...requestParams };

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
  const regex = /^([\w-]+):\/\/(\w+)\?(.+)$/;
  const match = url.match(regex);

  const [, , requestType, queryString] = match;

  const result: ParsedUrlParameters = {
    request: requestType as ParsedUrlParameters['request'],
  };

  queryString.split('&').forEach((pair) => {
    const [key, rawValue] = pair.split('=').map(decodeURIComponent);
    if (key) {
      const value = rawValue === 'null' ? null : rawValue;
      result[key] = value;
    }
  });

  return result;
}
