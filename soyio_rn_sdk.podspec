require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = 'soyio_rn_sdk'
  s.version      = package['version']
  s.summary      = package['description']
  s.homepage     = package['homepage']
  s.license      = package['license']
  s.authors      = package['author']
  s.platforms    = { ios: '13.0' }
  s.source       = { git: 'https://github.com/Soyio-id/soyio-rn-sdk.git', tag: s.version.to_s }

  s.source_files = 'ios/**/*.{h,m,mm,swift}'

  # Font and image resources
  s.resource_bundles = {
    'SoyioRnSdk' => [
      'assets/fonts/**/*.ttf',
      'assets/images/SoyioRnSdk.xcassets'
    ]
  }

  # Vendored FaceTec framework
  s.vendored_frameworks = 'ios/Frameworks/FaceTecSDK.framework'

  # Framework search paths
  s.xcconfig = {
    'FRAMEWORK_SEARCH_PATHS' => '$(inherited) "$(PODS_TARGET_SRCROOT)/ios/Frameworks"'
  }

  # Pod target configuration
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_VERSION' => '5.0',
    'EXCLUDED_ARCHS[sdk=iphonesimulator*]' => 'arm64'
  }

  # User project configuration
  s.user_target_xcconfig = {
    'HEADER_SEARCH_PATHS' => '"$(PODS_ROOT)/Headers/Public/React-Core"'
  }

  # Swift version
  s.swift_version = '5.0'

  # React Native dependency
  s.dependency 'React-Core'
end
