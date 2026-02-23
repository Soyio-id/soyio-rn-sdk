import type { StyleProp, ViewStyle } from 'react-native';

export type SoyioErrors =
  | 'user_exists'
  | 'facial_validation_error'
  | 'document_validation_error'
  | 'unknown_error';

export interface FaceTecCredentials {
  deviceKey: string;
  publicKey: string;
  mobileProductionKey: string;
}

export interface FaceTecCredentialsResponse {
  device_key_identifier: string;
  public_face_scan_encryption_key: string;
  browser_production_key?: string;
  mobile_production_key?: string;
}

export interface FaceTecSessionTokenResponse {
  sessionToken: string;
}

export interface FaceTecThemeColors {
  mainColor: string;
  highlightColor: string;
  disabledColor: string;
}

export interface FaceTecBaseParams {
  soyioSessionToken: string;
  disclosureRequestToken: string;
  baseUrl: string;
  theme?: FaceTecThemeColors | null;
  onComplete?: () => void;
}

export type FaceTecLivenessConfig = FaceTecBaseParams & {
  mode: 'liveness-and-id';
  onLivenessSuccess?: () => void;
};

export type FaceTecIDOnlyConfig = FaceTecBaseParams & {
  mode: 'id-only';
};

export type FaceTecVerificationConfig = FaceTecLivenessConfig | FaceTecIDOnlyConfig;

type NewDisclosureParams = {
  templateId: string;
  disclosureRequestId?: never;
  userEmail?: string;
  forceError?: SoyioErrors;
}

export type ExistingDisclosureParams = {
  templateId?: never;
  disclosureRequestId: string;
  userEmail?: never;
  forceError?: SoyioErrors;
}

export type DisclosureParams = NewDisclosureParams | ExistingDisclosureParams;

export type AuthRequestParams = {
  authRequestId: `authreq_${string}`;
}

export type ConsentParams = {
  templateId: `constpl_${string}`;
  actionToken?: string;
  entityId?: `ent_${string}`;
  context?: string;
  optionalReconsentBehavior?: 'notice' | 'askAgain' | 'hide';
  mandatoryReconsentBehavior?: 'notice' | 'askAgain';
  allowGranularScopeSelection?: boolean;
}

export type SoyioWidgetBaseOptions = {
  uriScheme?: string;
  isSandbox?: boolean;
  developmentUrl?: string;
}

export type SoyioWidgetDisclosureOptions = SoyioWidgetBaseOptions & {
  companyId: string;
  userReference: string;
}

export type SoyioWidgetAuthenticationOptions = SoyioWidgetBaseOptions;

export type SoyioWidgetConsentOptions = SoyioWidgetBaseOptions;

export type SoyioWidgetOptions =
  | SoyioWidgetDisclosureOptions
  | SoyioWidgetAuthenticationOptions
  | SoyioWidgetConsentOptions;

export type WebviewSuccessEvent = {
  type: 'SUCCESS';
}

export type PasskeyRegistrationRequired = {
  type: 'PASSKEY_REQUIRED';
  sessionToken: string;
}

export type PasskeyAuthRequired = {
  type: 'PASSKEY_AUTHENTICATION_REQUIRED';
}

export type FaceTecRequired = {
  type: 'FACETEC_LIVENESS_PHOTO_ID_REQUIRED' | 'FACETEC_ID_ONLY_REQUIRED';
  sessionToken: string;
  requestableToken: string;
}

export type FaceTecConfigRequired = {
  type: 'FACETEC_MAIN_THEME';
  mainColor: string;
}

export type WidgetDisclosureEvents =
  | WebviewSuccessEvent
  | PasskeyRegistrationRequired
  | FaceTecConfigRequired
  | FaceTecRequired;

export type WidgetAuthRequestEvents =
  | WebviewSuccessEvent
  | PasskeyAuthRequired;

export type ConsentState = {
  isSelected: boolean;
  actionToken: string | null;
}

export type ConsentCheckboxChangeEvent = {
  type: 'CONSENT_CHECKBOX_CHANGE';
  isSelected: boolean;
  actionToken?: string;
  identifier: string;
}

export type WidgetConsentEvents = ConsentCheckboxChangeEvent;

export interface ConsentBoxRef {
  getState: () => ConsentState;
}

export type TooltipEvent = {
  type: 'TOOLTIP_STATE_CHANGE';
  text: string;
  coordinates: {
    x: number;
    y: number;
  };
  isVisible: boolean;
  identifier: string;
};

export type WebViewEvent =
  | WidgetDisclosureEvents
  | WidgetAuthRequestEvents
  | WidgetConsentEvents
  | TooltipEvent;

// Appearance types aligned with web widget (soy-io-widget)
export type SoyioTheme = 'soyio' | 'night' | 'flat';

export interface SoyioAppearanceVariables {
  fontFamily?: string;
  colorPrimary?: string;
  colorBackground?: string;
  colorSurface?: string;
  colorText?: string;
  colorTextSecondary?: string;
  colorBorder?: string;
  borderRadius?: string;
  [key: string]: string | undefined;
}

export interface SoyioAppearance {
  theme?: SoyioTheme;
  variables?: SoyioAppearanceVariables;
  rules?: Record<string, Record<string, string | number>>;
  config?: Record<string, unknown>;
}

export type SoyioWidgetProps = {
  options: SoyioWidgetOptions;
  requestType: 'disclosure' | 'authentication_request' | 'consent';
  requestParams: DisclosureParams | AuthRequestParams | ConsentParams;
  onSuccess?: () => void;
  onEvent?: (event: WebViewEvent) => void;
  onReady?: () => void;
  appearance?: SoyioAppearance;
  autoHeight?: boolean;
  style?: StyleProp<ViewStyle>;
};
