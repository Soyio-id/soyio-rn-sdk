export type SoyioWidgetParams = {
  companyId: string
  userReference?: string;
  isSandbox?: boolean;
  developmentUrl?: string;
}

export type RegisterParams = {
  flowTemplateId: string;
  userEmail?: string;
  forceError?: 'no_error' | 'validation_error'
}

export type AuthenticateParams = {
  identityId: string;
}

export type SoyioWidgetViewPropsType = {
  options: SoyioWidgetParams
  onEventChange?: (event: { type: string; url?: string }) => void;
}
