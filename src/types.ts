export type SoyioErrors = 'user_exists' | 'facial_validation_error' | 'document_validation_error' | 'unknown_error';

export type SoyioWidgetParams = {
  companyId: string
  userReference?: string;
  uriScheme: string;
  isSandbox?: boolean;
  customColor?: string;
  developmentUrl?: string;
}

export type RegisterParams = {
  flowTemplateId: string;
  userEmail?: string;
  forceError?: SoyioErrors
}

export type AuthenticateParams = {
  identityId: string;
}

export type SoyioWidgetViewPropsType = {
  options: SoyioWidgetParams
  onEventChange?: (event: { type: string; url?: string }) => void;
}
