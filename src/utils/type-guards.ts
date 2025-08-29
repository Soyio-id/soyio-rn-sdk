import type { AuthRequestParams, DisclosureParams } from '../types';

/**
 * Type guard to check if request params are for disclosure
 */
export function isDisclosureRequest(
  params: DisclosureParams | AuthRequestParams,
): params is DisclosureParams {
  return 'disclosureRequestId' in params;
}
