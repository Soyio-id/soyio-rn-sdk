//
// SoyioFaceTecModule.m - Objective-C bridge for React Native
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(SoyioFaceTecModule, NSObject)

RCT_EXTERN_METHOD(initializeFaceTecSDK:(NSDictionary *)config
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(startLivenessAndIDVerification:(NSDictionary *)config
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(startIDOnlyVerification:(NSDictionary *)config
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

@end
