export type SoyioErrors =
  | 'user_exists'
  | 'facial_validation_error'
  | 'document_validation_error'
  | 'unknown_error';

export interface FaceTecCredentials {
  deviceKey: string;
  publicKey: string;
  productionKey: string;
}

export interface FaceTecCredentialsResponse {
  device_key_identifier: string;
  public_face_scan_encryption_key: string;
  production_key: string;
}

export interface FaceTecSessionTokenResponse {
  sessionToken: string;
}

export interface FaceTecBaseParams {
  soyioSessionToken: string;
  disclosureRequestToken: string;
  baseUrl: string;
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

/** @deprecated Use FaceTecLivenessConfig instead */
export interface FaceTecLivenessParams {
  soyioSessionToken: string;
  disclosureRequestToken: string;
  baseUrl: string;
  onLivenessSuccess?: () => void;
  onComplete?: () => void;
}

/** @deprecated Use FaceTecIDOnlyConfig instead */
export interface FaceTecIDOnlyParams {
  soyioSessionToken: string;
  disclosureRequestToken: string;
  baseUrl: string;
  onComplete?: () => void;
}

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

export type SoyioWidgetBaseOptions = {
  uriScheme: string;
  isSandbox?: boolean;
  developmentUrl?: string;
}

export type SoyioWidgetDisclosureOptions = SoyioWidgetBaseOptions & {
  companyId: string;
  userReference: string;
}

export type SoyioWidgetAuthenticationOptions = SoyioWidgetBaseOptions;

export type SoyioWidgetOptions =
  | SoyioWidgetDisclosureOptions
  | SoyioWidgetAuthenticationOptions;

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

export type WidgetDisclosureEvents =
  | WebviewSuccessEvent
  | PasskeyRegistrationRequired
  | FaceTecRequired;

export type WidgetAuthRequestEvents =
  | WebviewSuccessEvent
  | PasskeyAuthRequired;

export type WebViewEvent =
  | WidgetDisclosureEvents
  | WidgetAuthRequestEvents;

export type SoyioWidgetProps = {
  options: SoyioWidgetOptions;
  requestType: 'disclosure' | 'authentication_request';
  requestParams: DisclosureParams | AuthRequestParams;
  onSuccess?: () => void;
};
