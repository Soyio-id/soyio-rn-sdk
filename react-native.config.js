module.exports = {
  dependency: {
    platforms: {
      ios: {},
      android: {
        sourceDir: './android',
        packageImportPath: 'import com.soyio.soyiorndk.AndroidFacetecSdkPackage;',
      },
    },
  },
  assets: ['./assets/fonts/'],
};
