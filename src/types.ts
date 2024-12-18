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

export type SoyioWidgetParams = {
  companyId?: string
  userReference?: string;
  uriScheme: string;
  isSandbox?: boolean;
  customColor?: string;
  developmentUrl?: string;
}

export type DisclosureParams = NewDisclosureParams | ExistingDisclosureParams;

export type SoyioWidgetViewPropsType = {
  options: SoyioWidgetParams
  onEventChange?: (event: { type: string; url?: string, message?: string }) => void;
}
