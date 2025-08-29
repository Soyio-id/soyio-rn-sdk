import type { AuthRequestParams, DisclosureParams, ExistingDisclosureParams } from '../types';

/**
 * Type guard to check if request params are for disclosure
 */
export function isDisclosureRequest(
  params: DisclosureParams | AuthRequestParams,
): params is DisclosureParams {
  return 'disclosureRequestId' in params || 'templateId' in params;
}

/**
 * Type guard to check if request params are for authentication
 */
export function isAuthenticationRequest(
  params: DisclosureParams | AuthRequestParams,
): params is AuthRequestParams {
  return 'authRequestId' in params;
}

/**
 * Type guard to check if disclosure params are for existing disclosure request
 */
export function isExistingDisclosureRequest(
  params: DisclosureParams,
): params is ExistingDisclosureParams {
  return 'disclosureRequestId' in params && !!params.disclosureRequestId;
}
