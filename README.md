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

- Install using npm! (or your favorite package manager)

```sh
# Using npm
npm install @soyio/soyio-rn-sdk

# Using yarn
yarn add @soyio/soyio-rn-sdk
```

- For **React Native CLI** projects, you'll also need to install `react-native-webview`:

```sh
# Using npm
npm install react-native-webview

# Using yarn
yarn add react-native-webview
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

## Usage

`Soyio React Native` exports a single component called `SoyioWidget`. This component renders a WebView that displays the Soyio verification flow within your app.

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
    forceError: "<error type>", // Optional
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
    forceError: "<error type>", // Optional
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

#### Attribute Descriptions

- **`uriScheme`**: (Required) The URI scheme for your application, used for deep linking and navigation.
- **`companyId`**: (Optional) The unique identifier for the company, must start with `'com_'`.
- **`userReference`**: (Optional) A reference identifier provided by the company for the user engaging with the widget. This identifier is used in events (`onEvent` and `webhooks`) to inform the company which user the events are associated with.
- **`userEmail`**: (Optional) The user's email address.
- **`forceError`**: (Optional) Triggers specific errors for testing or debugging. Used to simulate failure scenarios.
- **`templateId`**: (Required for new disclosure requests) Identifier of template. Specifies the order and quantity of documents requested from the user, as well as the mandatory data that the user is asked to share with the company. It must start with `'dtpl_'`.
- **`isSandbox`**: (Optional) Indicates if the widget should operate in sandbox mode, defaulting to `false`.
- **`developmentUrl`**: (Optional) Custom development URL for testing purposes.
- **`authRequestId`**: (Required for authentication requests) Identifier of auth request obtained when creating the `AuthRequest`. It must start with `'authreq_'`.
- **`disclosureRequestId`**: (Required for existing disclosure requests) Identifier of an existing disclosure request. It must start with `'dreq_'`.

#### Error types

The `forceError` parameter can simulate the following error conditions:

- `'user_exists'`: Triggers an error indicating that a user with the given credentials already exists in the system.
- `'facial_validation_error'`: Simulates a failure in the facial video liveness test, indicating the system could not verify the user's live presence.
- `'document_validation_error'`: Indicates an issue with validating the photos of the documents provided by the user.
- `'unknown_error'`: Generates a generic error, representing an unspecified problem.

#### TypeScript support

This package includes TypeScript declarations.

#### Developing

To develop the package, you need to use `yarn`. Install the dependencies:

```sh
yarn install
```

To test locally, I recommend packaging the app. Remember to build the library first:

```sh
yarn build
yarn pack
```

This will create a `soyio-soyio-rn-sdk-x.x.x.tgz` file (with the corresponding package version). Now, go to another directory and create a React Native app (using Expo, perhaps). After creating the new application, add the following dependency to its `package.json` file:

```json
{
  "dependencies": {
    ...,
    "@soyio/soyio-rn-sdk": "file:./path/to/soyio-soyio-rn-sdk-x.x.x.tgz",
    ...
  }
}
```

Where `./path/to/soyio-soyio-rn-sdk-x.x.x.tgz` corresponds to the path to the `.tgz` file created on the `yarn pack` step. After running `yarn install` on the new React Native app, you should be able to use the `SoyioWidget` component directly in your app.

If you want to create a new _release_, you can run:

```sh
git switch main
yarn bump! <major|minor|patch>
```

This will create a new branch with the updated version from `main`.

## Acknowledgements

This implementation was written based on the input and experience of [**fintoc**](https://github.com/fintoc-com/fintoc-react-native) integrating the WebView using React Native, which served as a good starting point for the general idea of this library.
