import type { WebView, WebViewMessageEvent } from 'react-native-webview';

import { handlePasskeyAuthentication, handlePasskeyRequired } from '../passkey-bridge';
import type {
  AuthRequestParams,
  DisclosureParams,
  SoyioWidgetOptions,
  WebViewEvent,
  WebviewPasskeyRequestEvent,
} from '../types';

interface MessageHandlerDependencies {
  options: SoyioWidgetOptions;
  webViewRef: React.RefObject<WebView>;
  requestParams: DisclosureParams | AuthRequestParams;
  onSuccess?: () => void;
}

function postMessageToWebView(webViewRef: React.RefObject<WebView>, messageType: string): void {
  const message = JSON.stringify({ type: messageType });
  webViewRef.current?.postMessage(message);
}

function handleSuccessEvent(onSuccess?: () => void): void {
  onSuccess?.();
}

function handlePasskeyEvent(
  eventData: WebviewPasskeyRequestEvent,
  dependencies: MessageHandlerDependencies,
): void {
  const { options, webViewRef } = dependencies;

  handlePasskeyRequired({
    companyId: options.companyId || '',
    sessionToken: eventData.sessionToken,
    uriScheme: options.uriScheme,
    isSandbox: options.isSandbox,
    developmentUrl: options.developmentUrl,
    onComplete: () => postMessageToWebView(webViewRef, 'PASSKEY_REGISTERED'),
  });
}

function handlePasskeyAuthenticationEvent(
  dependencies: MessageHandlerDependencies,
): void {
  const { options, webViewRef, requestParams } = dependencies;

  if ('authRequestId' in requestParams) {
    handlePasskeyAuthentication({
      authRequestId: requestParams.authRequestId,
      uriScheme: options.uriScheme,
      isSandbox: options.isSandbox,
      developmentUrl: options.developmentUrl,
      onComplete: () => postMessageToWebView(webViewRef, 'PASSKEY_AUTHENTICATED'),
    });
  }
}

/**
 * Creates a message handler for WebView events
 */
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
    const eventData = JSON.parse(event.nativeEvent.data) as WebViewEvent;

    switch (eventData.type) {
      case 'SUCCESS':
        handleSuccessEvent(onSuccess);
        break;

      case 'PASSKEY_REQUIRED':
        handlePasskeyEvent(eventData, dependencies);
        break;

      case 'PASSKEY_AUTHENTICATION_REQUIRED':
        handlePasskeyAuthenticationEvent(dependencies);
        break;

      default:
        break;
    }
  };
}
