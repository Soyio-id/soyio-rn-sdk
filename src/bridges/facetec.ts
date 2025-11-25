import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

import { getFaceTecCredentials, getFaceTecSessionToken } from '../api/facetec';
import type { FaceTecVerificationConfig } from '../types';

interface FaceTecModuleInterface {
  initializeFaceTecSDK: (config: {
    deviceKey: string;
    publicKey: string;
    productionKey: string;
    theme?: {
      mainColor: string;
      highlightColor: string;
      disabledColor: string;
    } | null;
  }) => Promise<{ success: boolean; error?: string }>;
  startLivenessAndIDVerification: (config: {
    facetecSessionToken: string;
    soyioSessionToken: string;
    disclosureRequestToken: string;
    baseUrl: string;
  }) => Promise<{ success: boolean; error?: string }>;
  startIDOnlyVerification: (config: {
    facetecSessionToken: string;
    soyioSessionToken: string;
    disclosureRequestToken: string;
    baseUrl: string;
  }) => Promise<{ success: boolean; error?: string }>;
  addListener: (eventName: string) => void;
  removeListeners: (count: number) => void;
}

const FaceTecModule: FaceTecModuleInterface = Platform.OS === 'ios' ? NativeModules.IOSFacetecSdk : NativeModules.AndroidFacetecSdk;
const faceTecEmitter = new NativeEventEmitter(FaceTecModule);

export const handleFaceTecVerification = async (
  config: FaceTecVerificationConfig,
): Promise<void> => {
  if (!FaceTecModule) throw new Error('FaceTec module not available. Make sure the native module is properly linked.');

  const livenessSubscription = config.mode === 'liveness-and-id' && config.onLivenessSuccess
    ? faceTecEmitter.addListener('onLivenessSuccess', config.onLivenessSuccess)
    : null;

  try {
    const credentials = await getFaceTecCredentials(config.baseUrl, config.soyioSessionToken);

    const initResult = await FaceTecModule.initializeFaceTecSDK({
      deviceKey: credentials.deviceKey,
      publicKey: credentials.publicKey,
      productionKey: credentials.productionKey,
      theme: config.theme || null,
    });

    if (!initResult.success) throw new Error(initResult.error || 'Failed to initialize FaceTec SDK');

    const facetecSessionToken = await getFaceTecSessionToken(
      config.baseUrl,
      config.soyioSessionToken,
    );

    const verificationConfig = {
      facetecSessionToken,
      soyioSessionToken: config.soyioSessionToken,
      disclosureRequestToken: config.disclosureRequestToken,
      baseUrl: config.baseUrl,
    };

    const result = config.mode === 'liveness-and-id'
      ? await FaceTecModule.startLivenessAndIDVerification(verificationConfig)
      : await FaceTecModule.startIDOnlyVerification(verificationConfig);

    if (!result.success) {
      const errorType = config.mode === 'liveness-and-id' ? 'verification' : 'ID-only verification';
      throw new Error(result.error || `Unknown error during FaceTec ${errorType}`);
    }

    config.onComplete?.();
  } finally {
    livenessSubscription?.remove();
  }
};
