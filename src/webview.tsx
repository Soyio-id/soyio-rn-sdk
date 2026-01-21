import React, {
  useCallback, useMemo, useRef,
} from 'react';
import {
  Animated,
  LayoutAnimation,
  Platform,
  StyleSheet,
  UIManager,
} from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';

import { SOYIO_BASE_URLS } from './constants';
import type {
  AuthRequestParams,
  ConsentParams,
  SoyioWidgetProps,
} from './types';
import { buildMessageHandler, buildUrl } from './utils';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});

export const SoyioWidget = ({
  options,
  requestType,
  requestParams,
  onSuccess,
  onEvent,
  onReady,
  appearance,
  autoHeight = true,
  style,
}: SoyioWidgetProps) => {
  const webViewRef = useRef<WebView>(null);
  const heightAnim = useRef(new Animated.Value(0)).current;

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

  const sendMessageToWebView = useCallback((messageObject: object) => {
    const message = JSON.stringify(messageObject);
    const script = `
      try {
        const message = ${JSON.stringify(message)};
        window.postMessage?.(message, '*');
        document.dispatchEvent?.(new MessageEvent('message', { data: message }));
      } catch (e) {
        console.warn('Failed to send message to WebView:', e);
      }
      true;
    `;

    webViewRef.current?.injectJavaScript(script);
  }, []);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      const rawData = event.nativeEvent.data;

      if (autoHeight) {
        try {
          const payload = JSON.parse(rawData) as { eventName?: string; height?: number };

          // Only use IFRAME_HEIGHT_CHANGE from monolith for reliable height
          if (payload.eventName === 'IFRAME_HEIGHT_CHANGE' && typeof payload.height === 'number') {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            Animated.timing(heightAnim, {
              toValue: payload.height,
              duration: 200,
              useNativeDriver: false,
            }).start();
          }
        } catch {
          // fall through to existing handler
        }
      }

      buildMessageHandler(options, webViewRef, requestParams, onSuccess, onEvent)(event);
    },
    [autoHeight, onEvent, onSuccess, options, requestParams],
  );

  React.useEffect(() => {
    if (appearance && webViewRef.current) {
      const identifier = getIdentifier();
      if (!identifier) return;

      sendMessageToWebView({
        eventName: 'APPEARANCE_CONFIG',
        identifier,
        appearance,
      });
    }
  }, [appearance, getIdentifier, sendMessageToWebView]);

  const wrapperStyle = useMemo(() => {
    const baseStyle = [style, styles.wrapper];
    if (!autoHeight) return [...baseStyle, styles.fill];
    return baseStyle;
  }, [autoHeight, style]);

  const animatedStyle = useMemo(() => {
    if (!autoHeight) return {};
    return { height: heightAnim };
  }, [autoHeight, heightAnim]);

  const webViewUrl = buildUrl(options, requestType, requestParams);

  return (
    <Animated.View style={[wrapperStyle, animatedStyle]}>
      <WebView
        ref={webViewRef}
        source={{ uri: webViewUrl }}
        originWhitelist={[...SOYIO_BASE_URLS, options.developmentUrl].filter(Boolean) as string[]}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        scrollEnabled={!autoHeight}
        onLoadEnd={() => {
          onReady?.();
        }}
        onError={(e) => console.error('[SoyioWidget DEBUG] WebView error:', e.nativeEvent)}
      />
    </Animated.View>
  );
};
