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

To use the Soyio hook, use the following _snippet_:

```js
import { useSoyioAuth } from "@soyio/soyio-rn-sdk";
```

After retrieving the `useSoyioAuth` hook, you are ready to instantiate the widget:

```jsx
export default function App() {
  const options = {
    companyId: "<company id>", // Starts with 'com_'
    uriScheme: "<company custom uri scheme>"
    userReference: "<company identifier of user>", // OPTIONAL
    isSandbox: true, // Optional. Default is false
  };

  // For registering a new identity
  const registerParams = {
    flowTemplateId: "<flow template id>", // Starts with 'vft_'
    userEmail: "<user email>", // OPTIONAL
    forceError: 'no_error', // OPTIONAL
  };

  // For authenticate existing identity
  const authenticateParams = {
    identityId: "<identity id>", // Starts with 'id_'
  };

  const onEventChange = (event) => {
    console.log("Event:", event);
  };

  const { register, authenticate } = useSoyioAuth({ options, onEventChange });

  const registerNewIdentity = () => {
    register(registerParams);
  };

  const authenticateIdentity = () => {
    authenticate(authenticateParams);
  };

  return (
    <View>
      <Button title="Register new user" onPress={registerNewIdentity} />
      <Button title="Authenticate identity" onPress={authenticateIdentity} />
    </View>
  );
}
```

In this implementation, the `WebBrowser` will not open until either `register()` or `authenticate()` is invoked.

The `onEventChange` function returns an object with the following properties:

- `type`: Indicates the type of event being triggered. Possible values are:

  - `"open register"`: Triggered when the user initiates the `register` method.
  - `"open authenticate"`: Triggered when the user initiates the `authenticate` method.
  - `"dismiss"`: Triggered when the user closes the `WebBrowser`.
  - `"success"`: Triggered when the authentication flow is successfully completed.

- `url` (optional): URL associated only with the `success` event.

  - For registration: `"<uriScheme>://registered?userReference=<company user reference>&id=<identity_id>"`
  - For authentication: `"<uriScheme>://authenticated?userReference=<company user reference>&id=<identity_id>"`

  where `<identity_id>` is the unique identifier of the newly registered or authenticated user, respectively.

#### Attribute Descriptions

- **`companyId`**: The unique identifier for the company, must start with `'com_'`.
- **`userReference`**: (Optional) A reference identifier provided by the company for the user engaging with the widget. This identifier is used in events (`onEvent` and `webhooks`) to inform the company which user the events are associated with.
- **`userEmail`**: The user's email address. This field is optional when the flow is `'register'`, where if not provided, Soyio will prompt the user to enter their email. However, for the `'authenticate'` flow, this field should not be provided.
- **`flowTemplateId`**: Required only in the `'register'` flow, this identifier specifies the order and quantity of documents requested from the user. It must start with `'vft_'`.
- **`identityId`**: Necessary only in the `'authenticate'` flow, this identifier must start with `'id_'` and signifies the user's identity.
- **`isSandbox`**: (Optional) Indicates if the widget should operate in sandbox mode, defaulting to `false`.
- **`uriScheme`**: The unique redirect scheme you've set with `npx uri-scheme add ...`, critical for redirect handling in your app.


#### Simulating a failed registration
To simulate a failed validation flow (useful for handling failure case during integration), simply add 
```js
forceError: 'validation_error'
```
 to the `registerParams` object. This only works in the `sandbox` environment.

#### TypeScript support

This package includes TypeScript declarations..

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
