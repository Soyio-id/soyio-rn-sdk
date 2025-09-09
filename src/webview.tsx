import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { SOYIO_BASE_URLS } from './constants';
import type { SoyioWidgetProps } from './types';
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
}: SoyioWidgetProps) => {
  const webViewRef = useRef<WebView>(null);

  return (
  <View style={styles.wrapper}>
    <WebView
      ref={webViewRef}
      source={{ uri: buildUrl(options, requestType, requestParams) }}
      originWhitelist={[...SOYIO_BASE_URLS, options.developmentUrl].filter(Boolean)}
      onMessage={buildMessageHandler(options, webViewRef, requestParams, onSuccess)}
      javaScriptEnabled={true}
      />
    </View>
  );
};
