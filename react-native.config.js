module.exports = {
  dependency: {
    platforms: {
      ios: {
        podspecPath: './soyio_rn_sdk.podspec',
      },
      android: {
        sourceDir: './android',
        packageImportPath: 'import com.soyio.soyiorndk.SoyioRnSdkPackage;',
      },
    },
  },
};
