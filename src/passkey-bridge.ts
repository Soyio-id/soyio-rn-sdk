import { InAppBrowser } from 'react-native-inappbrowser-reborn';

import { PRODUCTION_URL, SANDBOX_URL } from './constants';

export interface PasskeyRequiredParams {
  companyId: string;
  sessionToken: string;
  uriScheme: string;
  isSandbox?: boolean;
  developmentUrl?: string;
  onComplete?: () => void;
}

export interface PasskeyAuthenticationParams {
  authRequestId: string;
  uriScheme: string;
  isSandbox?: boolean;
  developmentUrl?: string;
  onComplete?: () => void;
}

const IN_APP_BROWSER_OPTIONS = {
  // iOS Properties
  ephemeralWebSession: false,
  showTitle: false,
  // Android Properties
  enableUrlBarHiding: true,
  enableDefaultShare: false,
};

function getBaseUrl(developmentUrl?: string, isSandbox?: boolean): string {
  return developmentUrl || (isSandbox ? SANDBOX_URL : PRODUCTION_URL);
}

const openAuthBrowser = async (
  authUrl: string,
  uriScheme: string,
  onComplete?: () => void,
): Promise<void> => {
  const deepLink = `${uriScheme}://success`;

  if (!(await InAppBrowser.isAvailable())) {
    throw new Error('InAppBrowser is not available');
  }

  const result = await InAppBrowser.openAuth(authUrl, deepLink, IN_APP_BROWSER_OPTIONS);

  if (result.type === 'success') onComplete?.();
};

export const handlePasskeyRequired = async ({
  companyId,
  sessionToken,
  uriScheme,
  isSandbox = false,
  developmentUrl,
  onComplete,
}: PasskeyRequiredParams): Promise<void> => {
  const baseUrl = getBaseUrl(developmentUrl, isSandbox);

  const authUrl = new URL(`${baseUrl}/widget/register_passkey`);
  authUrl.searchParams.append('session_token', sessionToken);
  authUrl.searchParams.append('company_id', companyId);
  authUrl.searchParams.append('uriScheme', uriScheme);

  await openAuthBrowser(authUrl.toString(), uriScheme, onComplete);
};

export const handlePasskeyAuthentication = async ({
  authRequestId,
  uriScheme,
  isSandbox = false,
  developmentUrl,
  onComplete,
}: PasskeyAuthenticationParams): Promise<void> => {
  const baseUrl = getBaseUrl(developmentUrl, isSandbox);

  const authUrl = new URL(`${baseUrl}/widget/passkey_authentication`);
  authUrl.searchParams.append('requestable_id', authRequestId);
  authUrl.searchParams.append('uriScheme', uriScheme);

  await openAuthBrowser(authUrl.toString(), uriScheme, onComplete);
};
