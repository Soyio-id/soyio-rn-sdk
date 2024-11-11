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

- Add custom uri scheme to your project:

```bash
npx uri-scheme add custom-uri-scheme
```

Here, `custom-uri-scheme` is a unique scheme used for redirecting within Android applications, ensuring links open in the correct app without prompting the user to choose. It should be structured uniquely for your application. For example, for a company with name `Test`, a custom uri scheme could be `soyio-test` or simply `test`.

**IMPORTANT:**
For developers integrating with a **bare React Native** application, it's crucial to prepare your project for Expo modules:

`npx install-expo-modules`: This command installs Expo modules in your React Native project, allowing you to use Expo's powerful library of APIs and components without needing to eject from the Expo managed workflow.

## Usage

`Soyio React Native` exports a single hook called `useSoyioAuth`. This is a hook that opens a `WebBrowser` using the `openAuthSessionAsync` method by [expo](https://docs.expo.dev/versions/latest/sdk/webbrowser/#webbrowseropenauthsessionasyncurl-redirecturl-options).

### 1. Disclosure Request

A **`disclosure_request`** is a process that a user goes through where they are verified, and then they share the necessary data as required by each company.
This verification can happen in one of the following two ways:

1. **Validation**: Through document validation and facial video. This occurs when a user has never been verified before with Soyio.

2. **Authentication**: Through an access key (passkey) or facial video. This can occur when a user has already been validated previously with Soyio.

To instantiate this process in the code, you have two options:

#### 1.a Disclosure request on-the-fly:

This doesn't require any previous setup. Given your company and disclosure template IDs, you can create disclosure requests freely when the user starts the widget:

```jsx
import { useSoyioAuth } from "@soyio/soyio-rn-sdk";

export default function App() {
  const options = {
    companyId: "<company id>",                     // Starts with 'com_'
    uriScheme: "<company custom uri scheme>"
    userReference: "<company identifier of user>", // Optional
    customColor: "<custom color>",                 // Optional
    isSandbox: true,                               // Optional
  };

  // For initialize a disclosure request
  const disclosureParams = {
    templateId: "<template id>",          // Starts with 'dtpl_'
    userEmail: "<user email>",            // Optional
    forceError: '<error type>',           // Optional
  };

  const onEventChange = (event) => {
    console.log("Event:", event);
  };

  const { disclosure } = useSoyioAuth({ options, onEventChange });

  const initDisclosureRequest = () => {
    disclosure(disclosureParams);
  };

  return (
    <View>
      <Button title="Disclosure request" onPress={initDisclosureRequest} />
    </View>
  );
}
```

#### 1.b Created disclosure request:

You can alternatively create a disclosure request beforehand with some **matchers** to make sure the person completing the request matches the one that your application thinks it is.

For more details about the use case, please refer to [the documentation](https://docs.soyio.id/).

To use this option, simply specify the disclosure request ID along with any optional parameters:

```jsx
import { useSoyioAuth } from "@soyio/soyio-rn-sdk";

export default function App() {
  const options = {
    uriScheme: "<company custom uri scheme>"
    customColor: "<custom color>",                 // Optional
    isSandbox: true,                               // Optional
  };

  // For initialize a disclosure request
  const disclosureParams = {
    disclosureRequestId: "<disclosure request id>",  // Starts with 'dreq_'
    userEmail: "<user email>",                       // Optional
    forceError: '<error type>',                      // Optional
  };

  const onEventChange = (event) => {
    console.log("Event:", event);
  };

  const { disclosure } = useSoyioAuth({ options, onEventChange });

  const initDisclosureRequest = () => {
    disclosure(disclosureParams);
  };

  return (
    <View>
      <Button title="Disclosure request" onPress={initDisclosureRequest} />
    </View>
  );
}
```

Note that user and template properties are not specified here because they must be specified when creating the disclosure request beforehand.

### 2. Signature attempt (coming soon...)

The **`signature_attempt`** is a process where, using a previously created `signature_attempt_id`, a request is initiated in which a user can digitally sign a document. To sign the document, the user must be authenticated. This authentication can occur either through an access key or facial video. It's important to note that for this request, the user must have been previously verified with Soyio.

```jsx
import { useSoyioAuth } from "@soyio/soyio-rn-sdk";

export default function App() {
  const options = {
    companyId: "<company id>",                     // Starts with 'com_'
    uriScheme: "<company custom uri scheme>"
    userReference: "<company identifier of user>", // Optional
    customColor: "<custom color>",                 // Optional
    isSandbox: true,                               // Optional
  };

  // For signing documents
  const signatureParams = {
    signatureTemplateId: "<signature template id>" // Starts with 'st_'
    identityId: "<identity id>",                   // Starts with 'id_'
  }

  const onEventChange = (event) => {
    console.log("Event:", event);
  };

  const { signature } = useSoyioAuth({ options, onEventChange });

  const initSignatureAttempt = () => {
    signature(signatureParams);
  };

  return (
    <View>
      <Button title="Signature Request" onPress={initSignatureAttempt} />
    </View>
  );
}
```

The `onEventChange` function can return the following objects:

1. When disclosure request is successful:

```js
{
  type: "success",
  request: "disclosure",
  verificationKind: "validation" | "authentication",
  userReference: "<company-user-reference>",
  identityId: "<soyio-identity-id-of-user>",
}
```

2. When webview is opened:

```js
{
  type: "open_disclosure";
}
```

3. When webview is closed:

```js
{
  type: "cancel";
}
```

4. When user exits because of error:

```js
{
  type: "error",
  request: "disclosure",
  error: "DENIED_CAMERA_PERMISSIONS" | "UNEXPECTED_ERROR"
}
```

#### Attribute Descriptions

- **`companyId`**: The unique identifier for the company, must start with `'com_'`.
- **`userReference`**: (Optional) A reference identifier provided by the company for the user engaging with the widget. This identifier is used in events (`onEvent` and `webhooks`) to inform the company which user the events are associated with.
- **`userEmail`**: The user's email address.
- **`forceError`**: (Optional) Triggers specific errors for testing or debugging. Used to simulate failure scenarios.
- **`templateId`**: Identifier of template. Specifies the order and quantity of documents requested from the user, as well as the mandatory data that the user is asked to share with the company. It must start with `'datmp_'`.
- **`customColor`**: (Optional) A hex code string that specifies the base color of the interface
- **`isSandbox`**: (Optional) Indicates if the widget should operate in sandbox mode, defaulting to `false`.
- **`uriScheme`**: The unique redirect scheme you've set with `npx uri-scheme add ...`, critical for redirect handling in your app.
- **`signatureTemplateId`**: Identifier of template. Specifies the order and quantity of documents to sign. It must start with `'st_'`.

#### Error types

The `forceError` parameter can simulate the following error conditions:

- `'user_exists'`: Triggers an error indicating that a user with the given credentials already exists in the system.
- `'facial_validation_error'`: Simulates a failure in the facial video liveness test, indicating the system could not verify the user's live presence.
- `'document_validation_error'`: Indicates an issue with validating the photos of the documents provided by the user.
- `'unknown_error'`: Generates a generic error, representing an unspecified problem.

#### TypeScript support

This package includes TypeScript declarations.

#### Developing

To develop the package, you need to use `npm`. Install the dependencies:

```sh
npm install
```

To test locally, I recommend packaging the app. Remember to build the library first:

```sh
npm run build
npm pack
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

Where `./path/to/soyio-soyio-rn-sdk-x.x.x.tgz` corresponds to the path to the `.tgz` file created on the `npm pack` step. After running `npm install` on the new React Native app, you should be able to use Soyio React Native to import the Soyio View.

If you want to create a new _release_, you can run:

```sh
git switch main
npm run bump! <major|minor|patch>
```

This will create a new branch with the updated version from `main`.

## Acknowledgements

This implementation was written based on the input and experience of [**fintoc**](https://github.com/fintoc-com/fintoc-react-native) integrating the WebView using React Native, which served as a good starting point for the general idea of this library.
