import { PRODUCTION_URL, SANDBOX_URL } from '../constants';
import type {
  AuthRequestParams,
  DisclosureParams,
  SoyioWidgetOptions,
} from '../types';

import { getPlatformSuffix } from './platform';
import { isExistingDisclosureRequest } from './type-guards';

const WIDGET_PATH_PREFIX = 'widget';

function determineBaseUrl(options: SoyioWidgetOptions): string {
  if (options.developmentUrl) {
    return options.developmentUrl;
  }
  return options.isSandbox ? SANDBOX_URL : PRODUCTION_URL;
}

function determineRequestPath(
  requestType: 'disclosure' | 'authentication_request',
  requestParams: DisclosureParams | AuthRequestParams,
): string {
  if (requestType === 'disclosure') {
    const disclosureParams = requestParams as DisclosureParams;
    if (isExistingDisclosureRequest(disclosureParams)) {
      return `disclosures/${disclosureParams.disclosureRequestId}`;
    }
    return 'disclosure';
  }

  return 'authentication_request';
}

function buildQueryParams(params: Record<string, unknown>): string {
  const queryPairs = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);

  return queryPairs.join('&');
}

function createBaseParams(options: SoyioWidgetOptions): Record<string, string> {
  const baseParams: Record<string, string> = {
    sdk: `rn${getPlatformSuffix()}`,
    rn_webview: 'true',
  };

  if ('companyId' in options) baseParams.companyId = options.companyId;
  if ('userReference' in options) baseParams.userReference = options.userReference;

  return baseParams;
}

/**
 * Builds the complete URL for Soyio widget with query parameters
 */
export function buildUrl(
  options: SoyioWidgetOptions,
  requestType: 'disclosure' | 'authentication_request',
  requestParams: DisclosureParams | AuthRequestParams,
): string {
  const baseUrl = determineBaseUrl(options);
  const path = determineRequestPath(requestType, requestParams);
  const fullPath = `${baseUrl}/${WIDGET_PATH_PREFIX}/${path}`;

  const baseParams = createBaseParams(options);
  const allParams = { ...baseParams, ...requestParams };
  const queryString = buildQueryParams(allParams);

  return `${fullPath}?${queryString}`;
}
