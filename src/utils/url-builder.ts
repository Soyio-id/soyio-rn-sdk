import { PRODUCTION_URL, SANDBOX_URL } from '../constants';
import type {
  AuthRequestParams,
  ConsentParams,
  DisclosureParams,
  SoyioWidgetOptions,
} from '../types';

import { getPlatformSuffix } from './platform';
import { isExistingDisclosureRequest } from './type-guards';

const WIDGET_PATH_PREFIX = 'widget';
const EMBED_PATH_PREFIX = 'embed';

export function resolveBaseUrl(options: SoyioWidgetOptions): string {
  if (options.developmentUrl) {
    return options.developmentUrl;
  }
  return options.isSandbox ? SANDBOX_URL : PRODUCTION_URL;
}

function determineRequestPath(
  requestType: 'disclosure' | 'authentication_request' | 'consent',
  requestParams: DisclosureParams | AuthRequestParams | ConsentParams,
): string {
  if (requestType === 'disclosure') {
    const disclosureParams = requestParams as DisclosureParams;
    if (isExistingDisclosureRequest(disclosureParams)) {
      return `${WIDGET_PATH_PREFIX}/disclosures/${disclosureParams.disclosureRequestId}`;
    }
    return `${WIDGET_PATH_PREFIX}/disclosure`;
  }

  if (requestType === 'consent') {
    const consentParams = requestParams as ConsentParams;
    return `${EMBED_PATH_PREFIX}/consents/${consentParams.templateId}`;
  }

  return `${WIDGET_PATH_PREFIX}/authentication_request`;
}

function buildQueryParams(params: Record<string, unknown>): string {
  const queryPairs = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);

  return queryPairs.join('&');
}

function createBaseParams(
  options: SoyioWidgetOptions,
  isWebview = true,
): Record<string, string> {
  const baseParams: Record<string, string> = { sdk: `rn${getPlatformSuffix()}` };

  if (options.uriScheme) baseParams.uriScheme = options.uriScheme;
  if (isWebview) baseParams.rn_webview = 'true';

  if ('companyId' in options) baseParams.companyId = options.companyId;
  if ('userReference' in options) baseParams.userReference = options.userReference;

  return baseParams;
}

export function buildUrl(
  options: SoyioWidgetOptions,
  requestType: 'disclosure' | 'authentication_request' | 'consent',
  requestParams: DisclosureParams | AuthRequestParams | ConsentParams,
  isWebview = true,
): string {
  const baseUrl = resolveBaseUrl(options);
  const path = determineRequestPath(requestType, requestParams);
  const fullPath = `${baseUrl}/${path}`;

  const baseParams = createBaseParams(options, isWebview);
  const allParams = { ...baseParams, ...requestParams };
  const queryString = buildQueryParams(allParams);

  return `${fullPath}?${queryString}`;
}
