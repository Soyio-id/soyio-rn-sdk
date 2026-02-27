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
  s.exclude_files = 'ios/Frameworks/**/*', 'ios/Frameworks-dev/**/*'

  s.resource_bundles = {
    'SoyioRnSdk' => [
      'assets/fonts/**/*.ttf',
      'assets/images/SoyioRnSdk.xcassets'
    ]
  }

  # FaceTecSDK is a dynamic xcframework. CocoaPods doesn't fully handle
  # vendored xcframeworks in pods with source files, so we use a script phase
  # to extract the correct slice and patch the consumer's embed script.
  # See scripts/prepare-facetec-xcframework.sh for details.
  s.vendored_frameworks = 'ios/Frameworks/FaceTecSDK.xcframework'

  s.script_phase = {
    :name => 'Extract and prepare FaceTecSDK XCFramework',
    :script => 'bash "${PODS_TARGET_SRCROOT}/scripts/prepare-facetec-xcframework.sh"',
    :execution_position => :before_compile
  }

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_VERSION' => '5.0',
    'FRAMEWORK_SEARCH_PATHS' => '$(inherited) "${PODS_XCFRAMEWORKS_BUILD_DIR}/soyio_rn_sdk"'
  }

  # Propagate FaceTecSDK to consumer so the linker resolves symbols
  s.user_target_xcconfig = {
    'HEADER_SEARCH_PATHS' => '"$(PODS_ROOT)/Headers/Public/React-Core"',
    'FRAMEWORK_SEARCH_PATHS' => '$(inherited) "${PODS_XCFRAMEWORKS_BUILD_DIR}/soyio_rn_sdk"',
    'OTHER_LDFLAGS' => '$(inherited) -framework "FaceTecSDK"'
  }

  s.swift_version = '5.0'
  s.dependency 'React-Core'
end
