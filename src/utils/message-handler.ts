import { Platform } from 'react-native';
import type { WebView, WebViewMessageEvent } from 'react-native-webview';

import { handlePasskeyAuthentication, handlePasskeyRequired } from '../passkey-bridge';
import type {
  AuthRequestParams,
  DisclosureParams,
  PasskeyRegistrationRequired,
  SoyioWidgetOptions,
  WebViewEvent,
} from '../types';

import { isAuthenticationRequest, isDisclosureRequest } from './type-guards';

interface MessageHandlerDependencies {
  options: SoyioWidgetOptions;
  webViewRef: React.RefObject<WebView>;
  requestParams: DisclosureParams | AuthRequestParams;
  onSuccess?: () => void;
}

function postMessageToWebView(webViewRef: React.RefObject<WebView>, messageType: string): void {
  const message = JSON.stringify({ type: messageType });

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
      onComplete: () => postMessageToWebView(webViewRef, 'PASSKEY_REGISTERED'),
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
    onComplete: () => postMessageToWebView(webViewRef, 'PASSKEY_AUTHENTICATED'),
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

        default:
          break;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error parsing message from Soyio widget:', error);
    }
  };
}
