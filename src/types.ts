export type SoyioErrors = 'user_exists' | 'facial_validation_error' | 'document_validation_error' | 'unknown_error';

type NewDisclosureParams = {
  templateId: string;
  disclosureRequestId?: never;
  userEmail?: string;
  forceError?: SoyioErrors;
}

type ExistingDisclosureParams = {
  templateId?: never;
  disclosureRequestId: string;
  userEmail?: never;
  forceError?: SoyioErrors;
}

export type AuthRequestParams = {
  authRequestId: `authreq_${string}`;
}

export type SoyioWidgetOptions = {
  uriScheme: string;
  companyId?: string
  userReference?: string;
  isSandbox?: boolean;
  developmentUrl?: string;
}

export type DisclosureParams = NewDisclosureParams | ExistingDisclosureParams;

export type WebviewSuccessEvent = {
  type: 'SUCCESS';
}

export type WebviewPasskeyRequestEvent = {
  type: 'PASSKEY_REQUIRED';
  sessionToken: string;
}

export type WebviewPasskeyAuthenticationRequiredEvent = {
  type: 'PASSKEY_AUTHENTICATION_REQUIRED';
}

export type WebViewEvent =
  | WebviewSuccessEvent
  | WebviewPasskeyRequestEvent
  | WebviewPasskeyAuthenticationRequiredEvent;

export type SoyioWidgetProps = {
  options: SoyioWidgetOptions;
  requestType: 'disclosure' | 'authentication_request';
  requestParams: DisclosureParams | AuthRequestParams;
  onSuccess?: () => void;
};
