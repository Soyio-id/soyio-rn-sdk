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
  let baseParams = `platform=rn&companyId=${widgetParams.companyId}`;
  if (widgetParams.userReference) {
    baseParams += `&userReference=${widgetParams.userReference}`;
  }
  const dynamicParams = Object.entries(flowParams)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  return `${baseParams}&${dynamicParams}`;
}
