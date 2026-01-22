// This file is used as the @env module resolution target.
// The react-native-dotenv Babel plugin will transform imports from this module
// into the actual environment variable values from .env at build time.
//
// NOTE: The exports below are placeholders - Babel replaces them during transformation.

export const SOYIO_URI_SCHEME = process.env.SOYIO_URI_SCHEME;
export const SOYIO_COMPANY_ID = process.env.SOYIO_COMPANY_ID;
export const SOYIO_USER_REFERENCE = process.env.SOYIO_USER_REFERENCE;
export const SOYIO_DISCLOSURE_TEMPLATE_ID = process.env.SOYIO_DISCLOSURE_TEMPLATE_ID;
export const SOYIO_AUTH_REQUEST_ID = process.env.SOYIO_AUTH_REQUEST_ID;
export const SOYIO_CONSENT_TEMPLATE_ID = process.env.SOYIO_CONSENT_TEMPLATE_ID;
export const SOYIO_DISCLOSURE_USER_EMAIL = process.env.SOYIO_DISCLOSURE_USER_EMAIL;
export const SOYIO_AUTH_DEV_URL = process.env.SOYIO_AUTH_DEV_URL;
export const SOYIO_CONSENT_DEV_URL = process.env.SOYIO_CONSENT_DEV_URL;
export const SOYIO_IS_SANDBOX = process.env.SOYIO_IS_SANDBOX;
