import { Platform } from 'react-native';
import type { WebView, WebViewMessageEvent } from 'react-native-webview';

import { handleFaceTecVerification } from '../bridges/facetec';
import { handlePasskeyAuthentication, handlePasskeyRequired } from '../bridges/passkey';
import type {
  AuthRequestParams,
  DisclosureParams,
  FaceTecRequired,
  PasskeyRegistrationRequired,
  SoyioWidgetOptions,
  WebViewEvent,
} from '../types';

import { isAuthenticationRequest, isDisclosureRequest } from './type-guards';
import { determineBaseUrl } from './url-builder';

interface MessageHandlerDependencies {
  options: SoyioWidgetOptions;
  webViewRef: React.RefObject<WebView>;
  requestParams: DisclosureParams | AuthRequestParams;
  onSuccess?: () => void;
}

function postMessageToWebView(webViewRef: React.RefObject<WebView>, messageObject: object): void {
  const message = JSON.stringify(messageObject);

  if (Platform.OS === 'android') {
    webViewRef.current.injectJavaScript(`
      try {
        const message = ${JSON.stringify(message)};
        window.postMessage?.(message, '*');
        document.dispatchEvent?.(new MessageEvent('message', { data: message }));
      } catch (e) {
        console.warn('Failed to send message to WebView:', e);
      }
      true;
    `);
  } else {
    webViewRef.current.postMessage(message);
  }
}

function handleSuccessEvent(onSuccess?: () => void): void {
  onSuccess?.();
}

function handlePasskeyRequiredEvent(
  eventData: PasskeyRegistrationRequired,
  dependencies: MessageHandlerDependencies,
): void {
  const { options, webViewRef, requestParams } = dependencies;

  if (!isDisclosureRequest(requestParams)) return;

  if ('companyId' in options) {
    handlePasskeyRequired({
      companyId: options.companyId,
      sessionToken: eventData.sessionToken,
      uriScheme: options.uriScheme,
      isSandbox: options.isSandbox,
      developmentUrl: options.developmentUrl,
      onComplete: () => postMessageToWebView(webViewRef, { type: 'PASSKEY_REGISTERED' }),
    });
  }
}

function handlePasskeyAuthenticationEvent(
  dependencies: MessageHandlerDependencies,
): void {
  const { options, webViewRef, requestParams } = dependencies;

  if (!isAuthenticationRequest(requestParams)) return;

  handlePasskeyAuthentication({
    authRequestId: requestParams.authRequestId,
    uriScheme: options.uriScheme,
    isSandbox: options.isSandbox,
    developmentUrl: options.developmentUrl,
    onComplete: () => postMessageToWebView(webViewRef, { type: 'PASSKEY_AUTHENTICATED' }),
  });
}

function handleFaceTecRequiredEvent(
  eventData: FaceTecRequired,
  dependencies: MessageHandlerDependencies,
): void {
  const { options, webViewRef, requestParams } = dependencies;

  if (!isDisclosureRequest(requestParams)) return;

  const baseUrl = determineBaseUrl(options);
  const isLivenessAndPhotoIDMode = eventData.type === 'FACETEC_LIVENESS_PHOTO_ID_REQUIRED';

  const config = isLivenessAndPhotoIDMode
    ? {
      mode: 'liveness-and-id' as const,
      soyioSessionToken: eventData.sessionToken,
      disclosureRequestToken: eventData.requestableToken,
      baseUrl,
      onLivenessSuccess: () => postMessageToWebView(webViewRef, { type: 'FACETEC_LIVENESS_SUCCESS' }),
    }
    : {
      mode: 'id-only' as const,
      soyioSessionToken: eventData.sessionToken,
      disclosureRequestToken: eventData.requestableToken,
      baseUrl,
    };

  handleFaceTecVerification(config).catch((error) => {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    postMessageToWebView(webViewRef, { type: 'FACETEC_ERROR', error: errorMessage });
  });
}

export function buildMessageHandler(
  options: SoyioWidgetOptions,
  webViewRef: React.RefObject<WebView>,
  requestParams: DisclosureParams | AuthRequestParams,
  onSuccess?: () => void,
) {
  const dependencies: MessageHandlerDependencies = {
    options,
    webViewRef,
    requestParams,
    onSuccess,
  };

  return (event: WebViewMessageEvent): void => {
    try {
      const eventData = JSON.parse(event.nativeEvent.data) as WebViewEvent;

      switch (eventData.type) {
        case 'SUCCESS':
          handleSuccessEvent(onSuccess);
          break;

        case 'PASSKEY_REQUIRED':
          handlePasskeyRequiredEvent(eventData, dependencies);
          break;

        case 'PASSKEY_AUTHENTICATION_REQUIRED':
          handlePasskeyAuthenticationEvent(dependencies);
          break;

        case 'FACETEC_LIVENESS_PHOTO_ID_REQUIRED':
        case 'FACETEC_ID_ONLY_REQUIRED':
          handleFaceTecRequiredEvent(eventData, dependencies);
          break;

        default:
          break;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error parsing message from Soyio widget:', error);
    }
  };
}
