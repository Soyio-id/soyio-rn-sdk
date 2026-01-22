import { Platform } from 'react-native';
import type { WebView, WebViewMessageEvent } from 'react-native-webview';

import { handleFaceTecVerification } from '../bridges/facetec';
import { handlePasskeyAuthentication, handlePasskeyRequired } from '../bridges/passkey';
import type {
  AuthRequestParams,
  ConsentCheckboxChangeEvent,
  ConsentParams,
  DisclosureParams,
  FaceTecConfigRequired,
  FaceTecRequired,
  FaceTecThemeColors,
  PasskeyRegistrationRequired,
  SoyioWidgetOptions,
  TooltipEvent,
  WebViewEvent,
} from '../types';

import { computeFaceTecColors, isValidHexColor } from './color';
import { isAuthenticationRequest, isDisclosureRequest } from './type-guards';
import { resolveBaseUrl } from './url-builder';

interface MessageHandlerDependencies {
  options: SoyioWidgetOptions;
  webViewRef: React.RefObject<WebView>;
  requestParams: DisclosureParams | AuthRequestParams | ConsentParams;
  onSuccess?: () => void;
  onEvent?: (event: WebViewEvent) => void;
}

let cachedFaceTecTheme: FaceTecThemeColors | null = null;

export function postMessageToWebView(
  webViewRef: React.RefObject<WebView>,
  messageObject: object,
): void {
  const message = JSON.stringify(messageObject);
  const webView = webViewRef.current;

  if (!webView) {
    return;
  }

  if (Platform.OS === 'android') {
    webView.injectJavaScript(`
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
    webView.postMessage(message);
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
      uriScheme: options.uriScheme!,
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
    uriScheme: options.uriScheme!,
    isSandbox: options.isSandbox,
    developmentUrl: options.developmentUrl,
    onComplete: () => postMessageToWebView(webViewRef, { type: 'PASSKEY_AUTHENTICATED' }),
  });
}

function handleFaceTecConfigEvent(
  eventData: FaceTecConfigRequired,
): void {
  const { mainColor } = eventData;

  if (!isValidHexColor(mainColor)) return;

  cachedFaceTecTheme = computeFaceTecColors(mainColor);
}

function handleFaceTecRequiredEvent(
  eventData: FaceTecRequired,
  dependencies: MessageHandlerDependencies,
): void {
  const { options, webViewRef, requestParams } = dependencies;

  if (!isDisclosureRequest(requestParams)) return;

  const baseUrl = resolveBaseUrl(options);
  const isLivenessAndPhotoIDMode = eventData.type === 'FACETEC_LIVENESS_PHOTO_ID_REQUIRED';

  const config = isLivenessAndPhotoIDMode
    ? {
      mode: 'liveness-and-id' as const,
      soyioSessionToken: eventData.sessionToken,
      disclosureRequestToken: eventData.requestableToken,
      baseUrl,
      theme: cachedFaceTecTheme,
      onLivenessSuccess: () => postMessageToWebView(webViewRef, { type: 'FACETEC_LIVENESS_SUCCESS' }),
    }
    : {
      mode: 'id-only' as const,
      soyioSessionToken: eventData.sessionToken,
      disclosureRequestToken: eventData.requestableToken,
      baseUrl,
      theme: cachedFaceTecTheme,
    };

  handleFaceTecVerification(config).catch((error) => {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    postMessageToWebView(webViewRef, { type: 'FACETEC_ERROR', error: errorMessage });
  });
}

function handleConsentCheckboxChangeEvent(
  eventData: ConsentCheckboxChangeEvent,
  dependencies: MessageHandlerDependencies,
): void {
  const { onEvent } = dependencies;
  onEvent?.(eventData);
}

export function buildMessageHandler(
  options: SoyioWidgetOptions,
  webViewRef: React.RefObject<WebView>,
  requestParams: DisclosureParams | AuthRequestParams | ConsentParams,
  onSuccess?: () => void,
  onEvent?: (event: WebViewEvent) => void,
) {
  const dependencies: MessageHandlerDependencies = {
    options,
    webViewRef,
    requestParams,
    onSuccess,
    onEvent,
  };

  return (event: WebViewMessageEvent): void => {
    try {
      const eventData = JSON.parse(event.nativeEvent.data) as Record<string, unknown>;
      const eventType = (eventData.type || eventData.eventName) as string | undefined;

      if (!eventType) {
        return;
      }

      const typedEvent = eventData as unknown as WebViewEvent;

      switch (eventType) {
        case 'SUCCESS':
          handleSuccessEvent(onSuccess);
          break;

        case 'CONSENT_CHECKBOX_CHANGE':
        case 'CONSENT_STATE_CHANGE':
          handleConsentCheckboxChangeEvent(typedEvent as ConsentCheckboxChangeEvent, dependencies);
          break;

        case 'TOOLTIP_HOVER':
        case 'TOOLTIP_STATE_CHANGE':
          onEvent?.({
            ...typedEvent,
            type: 'TOOLTIP_STATE_CHANGE',
          } as TooltipEvent);
          break;

        case 'PASSKEY_REQUIRED':
          handlePasskeyRequiredEvent(typedEvent as PasskeyRegistrationRequired, dependencies);
          break;

        case 'PASSKEY_AUTHENTICATION_REQUIRED':
          handlePasskeyAuthenticationEvent(dependencies);
          break;

        case 'FACETEC_MAIN_THEME':
          handleFaceTecConfigEvent(typedEvent as FaceTecConfigRequired);
          break;

        case 'FACETEC_LIVENESS_PHOTO_ID_REQUIRED':
        case 'FACETEC_ID_ONLY_REQUIRED':
          handleFaceTecRequiredEvent(typedEvent as FaceTecRequired, dependencies);
          break;

        default:
          break;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        'Error parsing message from Soyio widget:',
        error,
      );
    }
  };
}
