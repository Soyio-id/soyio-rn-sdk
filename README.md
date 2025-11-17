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

### URI Scheme Setup

You need to configure a custom URI scheme for your application to handle deep linking properly:

```sh
npx uri-scheme add custom-uri-scheme
```

Replace `custom-uri-scheme` with your desired scheme name. This scheme should match the `uriScheme` parameter you use in the `SoyioWidget` options.

### iOS Permissions

Add the following permission to your `ios/YourApp/Info.plist` file to enable camera access for document verification:

```xml
<key>NSCameraUsageDescription</key>
<string>This app needs access to camera for document verification</string>
```

### Android Permissions
Add the following permission and feature declaration to your `android/app/src/main/AndroidManifest.xml` file within the `<manifest>` tag:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" android:required="true" />
```

### iOS FaceTec Native Integration

This SDK includes native FaceTec integration for iOS. After installing the package and peer dependencies, run:

```sh
cd ios && pod install
```

**Troubleshooting:**

If you encounter the error `SoyioFaceTecModule not available`, ensure:

1. You've run `pod install` in the iOS directory
2. Clean build folder in Xcode: **Product → Clean Build Folder**
3. Rebuild the app

The native module should be automatically linked via React Native autolinking.

## Usage

`Soyio React Native` provides two ways to integrate the Soyio verification flow:

1. **WebView Component**: A `SoyioWidget` component that renders a WebView within your app.
2. **InAppBrowser Functions**: Direct functions that open the verification flow in an in-app browser.

## WebView Integration

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

### Event Handling

The `SoyioWidget` component supports the following event handlers:

- **`onSuccess`**: Called when the verification/authentication process completes successfully

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

- **`uriScheme`**: (Required) The URI scheme for your application, used for deep linking and navigation.
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

#### Developing

To develop the package, you need to use `yarn`. Install the dependencies:

```sh
yarn install
```

To test locally, I recommend packaging the app. Remember to build the library first:

```sh
npm run build
npm pack
```
