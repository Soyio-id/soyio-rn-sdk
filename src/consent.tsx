import React, { useCallback } from 'react';
import type { ViewProps } from 'react-native';

import { SoyioWidget } from './webview';
import type {
  ConsentCheckboxChangeEvent,
  ConsentParams,
  SoyioWidgetConsentOptions,
  WebViewEvent,
} from './types';

export type ConsentBoxProps = ViewProps & {
  options: SoyioWidgetConsentOptions;
  params: ConsentParams;
  onEvent?: (event: ConsentCheckboxChangeEvent) => void;
};

export function ConsentBox({
  options,
  params,
  onEvent,
}: ConsentBoxProps) {
  const handleEvent = useCallback((event: WebViewEvent) => {
    if ('eventName' in event && event.eventName === 'CONSENT_CHECKBOX_CHANGE') {
      onEvent?.(event);
    }
  }, [onEvent]);

  return (
    <SoyioWidget
      options={options}
      requestType="consent"
      requestParams={params}
      onEvent={handleEvent}
    />
  );
}
