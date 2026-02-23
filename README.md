<h1 align="center">Soyio React Native</h1>

<p align="center">
    <em>
        Use the Soyio widget within your React Native application as a View.
    </em>
</p>

<p align="center">
<a href="https://www.npmjs.com/package/@soyio/soyio-rn-sdk" target="_blank">
    <img src="https://img.shields.io/npm/v/@soyio/soyio-rn-sdk?label=version&logo=nodedotjs&logoColor=%23fff&color=306998" alt="NPM - Version">
</a>
</p>

## Installation

- Install using npm (or your favorite package manager)

```sh
# Using npm
npm install @soyio/soyio-rn-sdk

# Using yarn
yarn add @soyio/soyio-rn-sdk
```

- You'll also need to install the required peer dependencies:

```sh
# Using npm
npm install react-native-webview react-native-inappbrowser-reborn

# Using yarn
yarn add react-native-webview react-native-inappbrowser-reborn
```

**iOS Setup:** Run `cd ios && pod install` to install native dependencies.

**Android Setup:** For React Native 0.60+, auto-linking should handle Android setup automatically. For older versions, follow the [manual linking guide](https://github.com/react-native-webview/react-native-webview/blob/master/docs/Getting-Started.md).

## Android setup (repositories, permissions, deep links)

Add these to your app so bundled native dependencies and deep linking work when consuming the SDK from npm.

1) Repositories (`android/settings.gradle`) - **Only required if you want to use NFC validation**

```gradle
dependencyResolutionManagement {
  repositoriesMode.set(RepositoriesMode.PREFER_SETTINGS)
  repositories {
    // Keep your normal repositories here (e.g., google(), mavenCentral()) as appropriate for your project/architecture.
    // Add this flatDir so bundled native dependencies are resolvable:
    flatDir {
      dirs(
        "$rootDir/../node_modules/@soyio/soyio-rn-sdk/android/libs",
      )
    }
  }
}
```

2) Manifest entries (`android/app/src/main/AndroidManifest.xml` inside `<manifest>`)

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" android:required="true" />
```

If you want to enable NFC validation with the `SoyioWidget`, also add:

```xml
<uses-permission android:name="android.permission.NFC" />
<uses-feature android:name="android.hardware.nfc" android:required="false" />
```

3) Deep link for returning from the in-app browser: add an intent filter in your main `<activity>` with your chosen scheme (must match `uriScheme` passed to the SDK)

```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="your-app-scheme" />
</intent-filter>
```

After changes, rebuild the Android app (`cd android && ./gradlew :app:assembleDebug` or `yarn android`).

## iOS Setup (permissions, NFC, deep links)

Add these to your app so native dependencies, NFC scanning, and deep linking work when consuming the SDK from npm.

### 1. Native Dependencies

After installing the package and peer dependencies, run:

```sh
cd ios && pod install
```

### 2. Apple Silicon Simulator Compatibility

`FaceTecSDK.framework` ships with `x86_64` for simulator and `arm64` for physical devices. On Apple Silicon Macs, iOS simulator builds may fail when Xcode tries to link the device `arm64` slice.

From this SDK version onward, the podspec excludes `arm64` for `iphonesimulator` builds so simulator builds use `x86_64`.

If you are integrating an older SDK version, add this to your app `Podfile`:

```ruby
post_install do |installer|
  installer.pods_project.targets.each do |target|
    if target.name == 'soyio_rn_sdk'
      target.build_configurations.each do |config|
        config.build_settings['EXCLUDED_ARCHS[sdk=iphonesimulator*]'] = 'arm64'
      end
    end
  end
end
```

### 3. Permissions

Add the following permissions to your `ios/YourApp/Info.plist` file:

```xml
<key>NSCameraUsageDescription</key>
<string>This app needs access to camera for document verification</string>
```

If you want to enable NFC validation with the `SoyioWidget`, also add:

```xml
<key>NFCReaderUsageDescription</key>
<string>This app needs access to NFC for identity document verification</string>

<key>com.apple.developer.nfc.readersession.iso7816.select-identifiers</key>
<array>
    <string>A0000002471001</string>
    <string>A0000002472001</string>
</array>
```

### 4. NFC Entitlements

For NFC to work, you also need to create (or update) your entitlements file at `ios/YourApp/YourApp.entitlements`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.developer.nfc.readersession.formats</key>
    <array>
        <string>TAG</string>
    </array>
</dict>
</plist>
```

Then, in Xcode, ensure the entitlements file is linked to your target:
1. Select your project in Xcode
2. Go to your app target's **Signing & Capabilities** tab
3. Add **Near Field Communication Tag Reading** capability (if not already added)
4. Verify the entitlements file path is set in **Build Settings → Code Signing Entitlements**


## URI Scheme Setup

You need to configure a custom URI scheme for your application to handle deep linking properly:

```sh
npx uri-scheme add custom-uri-scheme
```

Replace `custom-uri-scheme` with your desired scheme name. This scheme should match the `uriScheme` parameter you use in the `SoyioWidget` options. It is essential for the Disclosure and Auth flows to return control to your application once they finish (especially when using the In-App Browser or Passkeys). It is not needed if you are only using the `ConsentBox`.

## Usage

`Soyio React Native` provides two ways to integrate the Soyio verification flow:

1. **Component**: A `SoyioWidget` component that renders a WebView within your app.
2. **InAppBrowser Functions**: Direct functions that open the verification flow in an in-app browser.

> ℹ️ **NFC validation** is only available when you integrate with the `SoyioWidget` component (WebView). The InAppBrowser mode does not support NFC.

## Component Integration

### 1. Disclosure Request

A **`disclosure_request`** is a process that a user goes through where they are verified, and then they share the necessary data as required by each company.
This verification can happen in one of the following two ways:

1. **Validation**: Through document validation and facial video. This occurs when a user has never been verified before with Soyio.

2. **Authentication**: Through an access key (passkey) or facial video. This can occur when a user has already been validated previously with Soyio.

To instantiate this process in the code, you have two options:

#### 1.a Disclosure request on-the-fly:

This doesn't require any previous setup. Given your company and disclosure template IDs, you can create disclosure requests freely when the user starts the widget:

```jsx
import { View, StyleSheet } from "react-native";
import { SoyioWidget } from "@soyio/soyio-rn-sdk";

export default function App() {
  const options = {
    uriScheme: "<your-app-scheme>", // Required: Your app's URI scheme
    companyId: "<company id>", // Optional: Starts with 'com_'
    userReference: "<company identifier of user>", // Optional
    isSandbox: true, // Optional
  };

  // For initialize a disclosure request
  const disclosureParams = {
    templateId: "<template id>", // Starts with 'dtpl_'
    userEmail: "<user email>", // Optional
  };

  const handleSuccess = () => {
    console.log("Verification successful!");
  };

  return (
    <View style={styles.container}>
      <SoyioWidget
        options={options}
        requestType="disclosure"
        requestParams={disclosureParams}
        onSuccess={handleSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

#### 1.b Created disclosure request:

You can alternatively create a disclosure request beforehand with some **matchers** to make sure the person completing the request matches the one that your application thinks it is.

For more details about the use case, please refer to [the documentation](https://docs.soyio.id/).

To use this option, simply specify the disclosure request ID along with any optional parameters:

```jsx
import { View, StyleSheet } from "react-native";
import { SoyioWidget } from "@soyio/soyio-rn-sdk";

export default function App() {
  const options = {
    uriScheme: "<your-app-scheme>", // Required: Your app's URI scheme
    isSandbox: false, // Optional
  };

  // For initialize a disclosure request
  const disclosureParams = {
    disclosureRequestId: "<disclosure request id>", // Starts with 'dreq_'
  };

  const handleSuccess = () => {
    console.log("Verification successful!");
  };

  return (
    <View style={styles.container}>
      <SoyioWidget
        options={options}
        requestType="disclosure"
        requestParams={disclosureParams}
        onSuccess={handleSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

Note that user and template properties are not specified here because they must be specified when creating the disclosure request beforehand.

### 2. Auth Request

The **`auth_request`** is a process where, using a previously created `auth_request_id`, a request is initiated in which a user can authenticate with Soyio. This authentication can occur either through an access key or facial video.

```jsx
import { View, StyleSheet } from "react-native";
import { SoyioWidget } from "@soyio/soyio-rn-sdk";

export default function App() {
  const options = {
    uriScheme: "<your-app-scheme>", // Required: Your app's URI scheme
    isSandbox: false, // Optional
  };

  const authRequestParams = {
    authRequestId: "<auth request id>", // Starts with 'authreq_'
  };

  const handleSuccess = () => {
    console.log("Authentication successful!");
  };

  return (
    <View style={styles.container}>
      <SoyioWidget
        options={options}
        requestType="authentication_request"
        requestParams={authRequestParams}
        onSuccess={handleSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

### 3. Consent

> 📖 [Integration Guide](https://docs.soyio.id/docs/integration-guide/consent/introduction)

A **`consent`** is a component that renders a checkbox with a legal text, which the user can check to give their consent to a specific agreement.

```jsx
import { View, StyleSheet } from "react-native";
import { ConsentBox } from "@soyio/soyio-rn-sdk";

export default function App() {
  const options = {
    // uriScheme: "<your-app-scheme>", // Not required for consent
    isSandbox: true, // Optional
  };

  const consentParams = {
    templateId: "<consent template id>", // Starts with 'constpl_'
    // actionToken: "<action token>", // Optional: To restore state
    // entityId: "<entity id>", // Optional: To check existing consent
    // context: "<context>", // Optional: Additional context
    // optionalReconsentBehavior: "notice", // Optional
    // mandatoryReconsentBehavior: "notice", // Optional
    // allowGranularScopeSelection: true, // Optional
  };

  const handleEvent = (event) => {
    // Check if the event is a consent change
    if (event.eventName === 'CONSENT_CHECKBOX_CHANGE') {
      console.log('Is Selected:', event.isSelected);
      console.log('Action Token:', event.actionToken);
    }
  };

  return (
    <View style={styles.container}>
      <ConsentBox
        options={options}
        params={consentParams}
        onEvent={handleEvent}
        appearance={{ theme: 'night' }}  // Optional: Customize appearance
        showSkeleton={true}  // Optional: Show loading skeleton (default: true)
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

### Consent Events

The `onEvent` callback receives events with the following structure:

```typescript
{
  eventName: 'CONSENT_CHECKBOX_CHANGE',
  isSelected: boolean,
  actionToken?: string,
  identifier: string
}
```

- **`isSelected`**: Boolean value indicating whether the consent checkbox is selected.
- **`actionToken`**: Token corresponding to the current state. You can use this to restore the consent state later or validate it server-side.

### ConsentBox Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `SoyioWidgetConsentOptions` | Required | Widget options (uriScheme, isSandbox, etc.) |
| `params` | `ConsentParams` | Required | Consent parameters (templateId, etc.) |
| `onEvent` | `(event) => void` | - | Callback for consent events |
| `appearance` | `SoyioAppearance` | - | Appearance customization |
| `showSkeleton` | `boolean` | `true` | Show loading skeleton while content loads |
| `autoHeight` | `boolean` | `true` | Auto-adjust height based on content |

### Consent Attribute Descriptions

- **`templateId`**: (Required) Identifier of consent template. It must start with `'constpl_'`.
- **`actionToken`**: (Optional) In case of losing the state of the consent (i.e. app restart), you can use a previously generated `actionToken` to restore the state of the consent.
- **`entityId`**: (Optional) Identifier of the `entity` associated with a `ConsentAction`. If provided and a consent was previously granted by this entity, the UI will display a message indicating that consent has already been given.
- **`context`**: (Optional) Additional information that will be saved with the consent. Useful when you want to track the consent from a specific context.
- **`optionalReconsentBehavior`**: (Optional) Behavior when consent is already given on an optional category (`notice`, `askAgain`, `hide`).
- **`mandatoryReconsentBehavior`**: (Optional) Behavior when consent is already given on a mandatory category (`notice`, `askAgain`).
- **`allowGranularScopeSelection`**: (Optional) If `true`, users can grant consent for individual scopes (for example products or branches) when the consent template supports multi-scope selection.

### 4. Customizing Appearance

The `ConsentBox` (and other components) can be customized to match your application's look and feel using the `appearance` prop.

#### Available Themes

| Theme | Description |
|-------|-------------|
| `'soyio'` | Default Soyio theme |
| `'night'` | Dark mode theme |
| `'flat'` | Flat minimal theme |

```jsx
<ConsentBox
  options={options}
  params={consentParams}
  appearance={{
    theme: 'night',
    variables: {
      colorPrimary: '#6366f1',
      colorBackground: '#0f172a',
      borderRadius: '8px',
    },
  }}
/>
```

#### TypeScript Types

```typescript
import type { SoyioAppearance, SoyioTheme } from '@soyio/soyio-rn-sdk';
```

For a full list of available customization options and examples, please refer to the [Appearance Customization Guide](https://docs.soyio.id/integration-guide/appearance).

### Event Handling

The `SoyioWidget` component supports the following event handlers:

- **`onSuccess`**: Called when the verification/authentication process completes successfully
- **`onEvent`**: Called for widget events (e.g., consent checkbox changes, tooltip state updates)
- **`onReady`**: Called when the webview finishes loading

## InAppBrowser Integration

For cases where you prefer to open the verification flow in an in-app browser instead of a WebView, you can use the direct function approach.

### 1. Disclosure Request (InAppBrowser)

#### 1.a Disclosure request on-the-fly:

```jsx
import { openDisclosure } from "@soyio/soyio-rn-sdk";

const handleDisclosure = async () => {
  const options = {
    uriScheme: "<your-app-scheme>", // Required: Your app's URI scheme
    companyId: "<company id>", // Optional: Starts with 'com_'
    userReference: "<company identifier of user>", // Optional
    isSandbox: true, // Optional
  };

  const disclosureParams = {
    templateId: "<template id>", // Starts with 'dtpl_'
    userEmail: "<user email>", // Optional
  };

  await openDisclosure({
    options,
    requestParams: disclosureParams,
    onComplete: () => console.log("Disclosure completed successfully!"),
    onCancel: () => console.log("Disclosure was cancelled by user"),
  });
};
```

#### 1.b Created disclosure request:

```jsx
import { openDisclosure } from "@soyio/soyio-rn-sdk";

const handleDisclosure = async () => {
  const options = {
    uriScheme: "<your-app-scheme>", // Required: Your app's URI scheme
    isSandbox: false, // Optional
  };

  const disclosureParams = {
    disclosureRequestId: "<disclosure request id>", // Starts with 'dreq_'
  };

  await openDisclosure({
    options,
    requestParams: disclosureParams,
    onComplete: () => console.log("Disclosure completed successfully!"),
    onCancel: () => console.log("Disclosure was cancelled by user"),
  });
};
```

### 2. Auth Request (InAppBrowser)

```jsx
import { openAuthenticationRequest } from "@soyio/soyio-rn-sdk";

const handleAuthRequest = async () => {
  const options = {
    uriScheme: "<your-app-scheme>", // Required: Your app's URI scheme
    isSandbox: false, // Optional
  };

  const authRequestParams = {
    authRequestId: "<auth request id>", // Starts with 'authreq_'
  };

  await openAuthenticationRequest({
    options,
    requestParams: authRequestParams,
    onComplete: () => console.log("Authentication completed successfully!"),
    onCancel: () => console.log("Authentication was cancelled by user"),
  });
};
```

### Event Handling (InAppBrowser)

The InAppBrowser functions support the following callback handlers:

- **`onComplete`**: Called when the verification/authentication process completes successfully
- **`onCancel`**: Called when the user cancels the process or navigates away

#### Attribute Descriptions

- **`uriScheme`**: (Required for Disclosure and Auth) The URI scheme for your application. It is used to return control to your app after completing the flow in an In-App Browser or when using external authentication flows like Passkeys. The monolith uses this scheme to build the redirect URL (e.g., `<your-app-scheme>://success`) when the verification process finishes. Not used in the `ConsentBox`.
- **`companyId`**: (Optional) The unique identifier for the company, must start with `'com_'`.
- **`userReference`**: (Optional) A reference identifier provided by the company for the user engaging with the widget. This identifier is used in events (`onEvent` and `webhooks`) to inform the company which user the events are associated with.
- **`userEmail`**: (Optional) The user's email address.
- **`templateId`**: (Required for new disclosure requests) Identifier of template. Specifies the order and quantity of documents requested from the user, as well as the mandatory data that the user is asked to share with the company. It must start with `'dtpl_'`.
- **`isSandbox`**: (Optional) Indicates if the widget should operate in sandbox mode, defaulting to `false`.
- **`developmentUrl`**: (Optional) Custom development URL for testing purposes.
- **`authRequestId`**: (Required for authentication requests) Identifier of auth request obtained when creating the `AuthRequest`. It must start with `'authreq_'`.
- **`disclosureRequestId`**: (Required for existing disclosure requests) Identifier of an existing disclosure request. It must start with `'dreq_'`.

#### TypeScript support

This package includes TypeScript declarations.

### Development & Testing

#### 1. Installation

To develop the package, use `yarn` to install dependencies:

```sh
yarn install
```

#### 2. Building

Build the package using:

```sh
yarn build # Runs both ESM and CJS builds
```

#### 3. Smoke Testing / Local Development

This repo includes a React Native app under `example/app` to smoke test the SDK during development.

1. Install the example app dependencies:
   ```sh
   cd example/app
   yarn install
   ```
2. (Optional) Use the helper script:
   ```sh
   yarn smoke:setup
   ```
3. Replace the placeholder IDs in `example/app/App.tsx`.
4. Run the platform helper scripts if you prefer:
   ```sh
   yarn smoke:ios
   yarn smoke:android
   ```

**iOS**

1. Install pods:
   ```sh
   cd example/app/ios
   bundle install
   bundle exec pod install
   ```
2. Run the app:
   ```sh
   cd ..
   yarn ios
   ```

**Android**

1. Ensure you have an emulator or device running.
2. JDK 17 is required for Android builds.
3. Run the app:
   ```sh
   yarn smoke:android
   ```

Notes:

- The app pulls the SDK from `file:../..`, so local changes are reflected immediately.
- Metro is configured to watch the repo root (`example/app/metro.config.js`).
