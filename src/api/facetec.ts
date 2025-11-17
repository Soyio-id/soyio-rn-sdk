import type {
  FaceTecCredentials,
  FaceTecCredentialsResponse,
  FaceTecSessionTokenResponse,
} from '../types';
import { getCurrentDateISO } from '../utils/date';

export async function getFaceTecCredentials(
  baseUrl: string,
  soyioSessionToken: string,
): Promise<FaceTecCredentials> {
  const endpoint = `${baseUrl}/api/internal/facetec/credentials`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Authorization: soyioSessionToken,
      'X-Api-Version': getCurrentDateISO(),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch FaceTec credentials: ${response.status} ${response.statusText}`);
  }

  const json = await response.json() as FaceTecCredentialsResponse;

  if (
    json.device_key_identifier == null
    || json.public_face_scan_encryption_key == null
    || json.production_key == null
  ) {
    throw new Error('Invalid credentials response: missing required fields');
  }

  return {
    deviceKey: json.device_key_identifier,
    publicKey: json.public_face_scan_encryption_key,
    productionKey: json.production_key,
  };
}

export async function getFaceTecSessionToken(
  baseUrl: string,
  soyioSessionToken: string,
): Promise<string> {
  const endpoint = `${baseUrl}/api/internal/facetec/generate_session_token`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Authorization: soyioSessionToken,
      'X-Api-Version': getCurrentDateISO(),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch FaceTec session token: ${response.status} ${response.statusText}`);
  }

  const json = await response.json() as FaceTecSessionTokenResponse;

  if (!json.sessionToken) {
    throw new Error('Invalid session token response: missing sessionToken field');
  }

  return json.sessionToken;
}
