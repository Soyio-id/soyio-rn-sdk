import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { SOYIO_BASE_URLS } from './constants';
import type {
  AuthRequestParams,
  ConsentParams,
  DisclosureParams,
  SoyioWidgetDisclosureOptions,
  SoyioWidgetProps,
} from './types';
import { buildMessageHandler, buildUrl } from './utils';

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    height: '100%',
  },
});

export const SoyioWidget = ({
  options,
  requestType,
  requestParams,
  onSuccess,
  onEvent,
  appearance,
}: SoyioWidgetProps) => {
  const webViewRef = useRef<WebView>(null);

  const getIdentifier = (): string | undefined => {
    if (requestType === 'consent') {
      return (requestParams as ConsentParams).templateId;
    }
    if (requestType === 'disclosure') {
      const params = requestParams as any;
      return params.templateId || params.disclosureRequestId;
    }
    if (requestType === 'authentication_request') {
      return (requestParams as AuthRequestParams).authRequestId;
    }
    return undefined;
  };

  React.useEffect(() => {
    if (appearance && webViewRef.current) {
      const identifier = getIdentifier();
      if (!identifier) return;

      const message = JSON.stringify({
        eventName: 'APPEARANCE_CONFIG',
        identifier,
        appearance,
      });

      const script = `
        window.postMessage(${JSON.stringify(message)}, '*');
        document.dispatchEvent(new MessageEvent('message', { data: ${JSON.stringify(message)} }));
      `;

      webViewRef.current.injectJavaScript(script);
    }
  }, [appearance, getIdentifier]);

  return (
    <View style={styles.wrapper}>
      <WebView
        ref={webViewRef}
        source={{ uri: buildUrl(options, requestType, requestParams) }}
        originWhitelist={[...SOYIO_BASE_URLS, options.developmentUrl].filter(Boolean)}
        onMessage={buildMessageHandler(options, webViewRef, requestParams, onSuccess, onEvent)}
        javaScriptEnabled={true}
      />
    </View>
  );
};
