export type SoyioErrors = 'user_exists' | 'facial_validation_error' | 'document_validation_error' | 'unknown_error';

export type SoyioWidgetParams = {
  companyId: string
  userReference?: string;
  uriScheme: string;
  isSandbox?: boolean;
  customColor?: string;
  developmentUrl?: string;
}

export type DisclosureParams = {
  templateId: string;
  userEmail?: string;
  forceError?: SoyioErrors
}

export type SignatureParams = {
  signatureTemplateId: string;
  identityId: string;
}

export type SoyioWidgetViewPropsType = {
  options: SoyioWidgetParams
  onEventChange?: (event: { type: string; url?: string, message?: string }) => void;
}
