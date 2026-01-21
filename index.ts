export { SoyioWidget } from './src/webview';
export { ConsentBox } from './src/consent';

export {
  openDisclosure,
  openAuthenticationRequest,
} from './src/inapp-browser';

export type {
  SoyioWidgetOptions,
  DisclosureParams,
  AuthRequestParams,
  ConsentParams,
  ConsentCheckboxChangeEvent,
  SoyioWidgetProps,
  SoyioAppearance,
  SoyioTheme,
} from './src/types';

export type {
  OpenDisclosureParams,
  OpenAuthRequestParams,
} from './src/inapp-browser';
