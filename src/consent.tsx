import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { ViewProps } from 'react-native';

import { ConsentSkeleton } from './components';
import type {
  ConsentBoxRef,
  ConsentCheckboxChangeEvent,
  ConsentParams,
  ConsentState,
  SoyioAppearance,
  SoyioWidgetConsentOptions,
  WebViewEvent,
} from './types';
import { SoyioWidget } from './webview';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    minHeight: 112,
  },
});

export type ConsentBoxProps = ViewProps & {
  options: SoyioWidgetConsentOptions;
  params: ConsentParams;
  onEvent?: (event: ConsentCheckboxChangeEvent) => void;
  autoHeight?: boolean;
  showSkeleton?: boolean;
  appearance?: SoyioAppearance;
};

export const ConsentBox = React.forwardRef<ConsentBoxRef, ConsentBoxProps>(
  (
    {
      options,
      params,
      onEvent,
      autoHeight,
      showSkeleton = true,
      appearance,
      style,
      ...props
    },
    ref,
  ) => {
    const [isLoading, setIsLoading] = useState(true);
    const stateRef = React.useRef<ConsentState>({
      isSelected: false,
      actionToken: null,
    });

    React.useImperativeHandle(ref, () => ({
      getState: () => stateRef.current,
    }));

    const handleEvent = useCallback(
      (event: WebViewEvent) => {
        if (event.type === 'CONSENT_CHECKBOX_CHANGE') {
          const { isSelected, actionToken } = event;
          stateRef.current = { isSelected, actionToken: actionToken || null };
          onEvent?.(event as ConsentCheckboxChangeEvent);
        }
      },
      [onEvent],
    );

    const handleReady = useCallback(() => {
      setIsLoading(false);
    }, []);

    return (
      <View style={[styles.container, style]} {...props}>
        {showSkeleton && (
          <ConsentSkeleton theme={appearance?.theme} visible={isLoading} />
        )}
        <SoyioWidget
          options={options}
          requestType="consent"
          requestParams={params}
          onEvent={handleEvent}
          onReady={handleReady}
          autoHeight={autoHeight}
          appearance={appearance}
        />
      </View>
    );
  },
);
