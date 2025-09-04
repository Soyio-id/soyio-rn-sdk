import type { AuthRequestParams, DisclosureParams, ExistingDisclosureParams } from '../types';

export function isDisclosureRequest(
  params: DisclosureParams | AuthRequestParams,
): params is DisclosureParams {
  return 'disclosureRequestId' in params || 'templateId' in params;
}

export function isAuthenticationRequest(
  params: DisclosureParams | AuthRequestParams,
): params is AuthRequestParams {
  return 'authRequestId' in params;
}

export function isExistingDisclosureRequest(
  params: DisclosureParams,
): params is ExistingDisclosureParams {
  return 'disclosureRequestId' in params && !!params.disclosureRequestId;
}
