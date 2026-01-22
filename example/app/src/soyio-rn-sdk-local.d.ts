declare module '@soyio/soyio-rn-sdk' {
  import type React from 'react';

  export interface ConsentBoxRef {
    getState: () => {
      isSelected: boolean;
      actionToken: string | null;
    };
  }

  export const ConsentBox: React.ComponentType<any>;
  export function openDisclosure(params: any): Promise<void>;
  export function openAuthenticationRequest(params: any): Promise<void>;
}

declare module '@env' {
  export const SOYIO_URI_SCHEME: string;
  export const SOYIO_COMPANY_ID: string;
  export const SOYIO_USER_REFERENCE: string;
  export const SOYIO_DISCLOSURE_TEMPLATE_ID: string;
  export const SOYIO_AUTH_REQUEST_ID: string;
  export const SOYIO_CONSENT_TEMPLATE_ID: string;
  export const SOYIO_DISCLOSURE_USER_EMAIL: string;
  export const SOYIO_AUTH_DEV_URL: string;
  export const SOYIO_CONSENT_DEV_URL: string;
  export const SOYIO_IS_SANDBOX: string;
}
