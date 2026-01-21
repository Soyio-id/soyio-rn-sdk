const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const sdkRoot = path.resolve(__dirname, '../..');
const appNodeModules = path.resolve(__dirname, 'node_modules');

const config = {
  watchFolders: [sdkRoot],
  resolver: {
    blockList: exclusionList([
      new RegExp(`${sdkRoot}/node_modules/react/.*`),
      new RegExp(`${sdkRoot}/node_modules/react-native/.*`),
      new RegExp(`${sdkRoot}/package/.*`), // Block the compiled package folder
      new RegExp(`${appNodeModules}/@soyio/soyio-rn-sdk/node_modules/react/.*`),
      new RegExp(`${appNodeModules}/@soyio/soyio-rn-sdk/node_modules/react-native/.*`),
      new RegExp(`${appNodeModules}/@soyio/soyio-rn-sdk/package/.*`), // Block here too
    ]),
    disableHierarchicalLookup: true,
    nodeModulesPaths: [appNodeModules],
    extraNodeModules: {
      '@soyio/soyio-rn-sdk': sdkRoot,
      react: path.join(appNodeModules, 'react'),
      'react-native': path.join(appNodeModules, 'react-native'),
    },
    // Force resolution to src/ for SDK imports
    resolveRequest: (context, moduleName, platform) => {
      // Intercept SDK imports and point to src/
      if (moduleName === '@soyio/soyio-rn-sdk') {
        return {
          filePath: path.join(sdkRoot, 'index.ts'),
          type: 'sourceFile',
        };
      }
      // @env is handled by react-native-dotenv babel plugin
      // Point to our shim file that re-exports the env variables
      if (moduleName === '@env') {
        return {
          filePath: path.join(__dirname, 'src', 'env.js'),
          type: 'sourceFile',
        };
      }
      // Let Metro handle everything else
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
