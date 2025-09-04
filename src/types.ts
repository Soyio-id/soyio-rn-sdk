export type SoyioErrors =
  | 'user_exists'
  | 'facial_validation_error'
  | 'document_validation_error'
  | 'unknown_error';

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

export type WidgetDisclosureEvents =
  | WebviewSuccessEvent
  | PasskeyRegistrationRequired;

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
