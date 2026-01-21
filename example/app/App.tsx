/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import * as React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  ConsentBox,
  openAuthenticationRequest,
  openDisclosure,
  type ConsentBoxRef,
} from '@soyio/soyio-rn-sdk';
import {
  SOYIO_AUTH_DEV_URL,
  SOYIO_AUTH_REQUEST_ID,
  SOYIO_COMPANY_ID,
  SOYIO_CONSENT_DEV_URL,
  SOYIO_CONSENT_TEMPLATE_ID,
  SOYIO_DISCLOSURE_TEMPLATE_ID,
  SOYIO_DISCLOSURE_USER_EMAIL,
  SOYIO_IS_SANDBOX,
  SOYIO_URI_SCHEME,
  SOYIO_USER_REFERENCE,
} from '@env';

const options = {
  uriScheme: SOYIO_URI_SCHEME,
  companyId: SOYIO_COMPANY_ID,
  userReference: SOYIO_USER_REFERENCE,
  isSandbox: SOYIO_IS_SANDBOX === 'true',
};

const consentOptions = {
  isSandbox: SOYIO_IS_SANDBOX === 'true',
  developmentUrl: SOYIO_CONSENT_DEV_URL,
  companyId: SOYIO_COMPANY_ID,
};

const tabs = ['Consent', 'Disclosure', 'Auth'] as const;

type Tab = (typeof tabs)[number];

function App(): React.JSX.Element {
  console.log('App');
  const [activeTab, setActiveTab] = React.useState<Tab>('Consent');
  const [eventsByTab, setEventsByTab] = React.useState<Record<Tab, string[]>>({
    Consent: [],
    Disclosure: [],
    Auth: [],
  });
  const consentRef = React.useRef<ConsentBoxRef>(null);

  const appendEvent = React.useCallback((tab: Tab, message: string) => {
    setEventsByTab(prev => ({
      ...prev,
      [tab]: [...prev[tab], message],
    }));
  }, []);

  const clearEvents = React.useCallback((tab: Tab) => {
    setEventsByTab(prev => ({
      ...prev,
      [tab]: [],
    }));
  }, []);

  const handleDisclosure = async () => {
    await openDisclosure({
      options,
      requestParams: {
        templateId: SOYIO_DISCLOSURE_TEMPLATE_ID,
        userEmail: SOYIO_DISCLOSURE_USER_EMAIL,
      },
      onComplete: () => {
        console.log('Disclosure complete');
        appendEvent('Disclosure', 'Disclosure completed');
      },
      onCancel: () => {
        console.log('Disclosure cancelled');
        appendEvent('Disclosure', 'Disclosure cancelled');
      },
    });
  };

  const handleAuthRequest = async () => {
    await openAuthenticationRequest({
      options: {
        // uriScheme: SOYIO_URI_SCHEME,
        developmentUrl: SOYIO_AUTH_DEV_URL,
        isSandbox: SOYIO_IS_SANDBOX === 'true',
      },
      requestParams: {
        authRequestId: SOYIO_AUTH_REQUEST_ID,
      },
      onComplete: () => {
        console.log('Auth request complete');
        appendEvent('Auth', 'Auth request completed');
      },
      onCancel: () => {
        console.log('Auth request cancelled');
        appendEvent('Auth', 'Auth request cancelled');
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Soyio RN SDK Smoke Tests</Text>

        <View style={styles.tabRow}>
          {tabs.map(tab => {
            const isActive = tab === activeTab;
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}>
                <Text
                  style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {activeTab === 'Consent' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Consent</Text>
            <ConsentBox
              options={consentOptions}
              params={{templateId: SOYIO_CONSENT_TEMPLATE_ID}}
              onEvent={(event: unknown) => {
                const message = `Consent event: ${JSON.stringify(event)}`;
                console.log('Consent event', JSON.stringify(event));
                appendEvent('Consent', message);
              }}
              appearance={{theme: 'soyio'}}
              ref={consentRef}
            />
            <Pressable
              style={styles.actionButton}
              onPress={() => {
                const state = consentRef.current?.getState();
                console.log('Consent state:', state);
                appendEvent(
                  'Consent',
                  `Consent state: ${JSON.stringify(state)}`,
                );
              }}>
              <Text style={styles.actionButtonText}>Get Status</Text>
            </Pressable>
            <View style={styles.eventWindow}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventTitle}>Events</Text>
                <Pressable
                  onPress={() => clearEvents('Consent')}
                  style={styles.clearButton}>
                  <Text style={styles.clearButtonText}>Clear</Text>
                </Pressable>
              </View>
              <Text style={styles.eventText}>
                {eventsByTab.Consent.length > 0
                  ? eventsByTab.Consent.join('\n')
                  : 'No events yet.'}
              </Text>
            </View>
          </View>
        ) : null}

        {activeTab === 'Disclosure' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Disclosure</Text>
            <Text style={styles.helperText}>
              Use your disclosure template to open the Soyio flow.
            </Text>
            <Pressable style={styles.actionButton} onPress={handleDisclosure}>
              <Text style={styles.actionButtonText}>Open disclosure</Text>
            </Pressable>
            <View style={styles.eventWindow}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventTitle}>Events</Text>
                <Pressable
                  onPress={() => clearEvents('Disclosure')}
                  style={styles.clearButton}>
                  <Text style={styles.clearButtonText}>Clear</Text>
                </Pressable>
              </View>
              <Text style={styles.eventText}>
                {eventsByTab.Disclosure.length > 0
                  ? eventsByTab.Disclosure.join('\n')
                  : 'No events yet.'}
              </Text>
            </View>
          </View>
        ) : null}

        {activeTab === 'Auth' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Auth</Text>
            <Text style={styles.helperText}>
              Launch a request using your auth request ID.
            </Text>
            <Pressable style={styles.actionButton} onPress={handleAuthRequest}>
              <Text style={styles.actionButtonText}>Open auth request</Text>
            </Pressable>
            <View style={styles.eventWindow}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventTitle}>Events</Text>
                <Pressable
                  onPress={() => clearEvents('Auth')}
                  style={styles.clearButton}>
                  <Text style={styles.clearButtonText}>Clear</Text>
                </Pressable>
              </View>
              <Text style={styles.eventText}>
                {eventsByTab.Auth.length > 0
                  ? eventsByTab.Auth.join('\n')
                  : 'No events yet.'}
              </Text>
            </View>
          </View>
        ) : null}

        <Text style={styles.helperText}>
          Replace the placeholder IDs above with real values before testing.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  container: {
    padding: 10,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
  },
  tabButtonActive: {
    backgroundColor: '#111827',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  tabTextActive: {
    color: '#F9FAFB',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#111827',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  eventWindow: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    minHeight: 120,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#6B7280',
  },
  clearButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  clearButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  eventText: {
    fontSize: 12,
    color: '#111827',
    lineHeight: 18,
  },
});

export default App;
