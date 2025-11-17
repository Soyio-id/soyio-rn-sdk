//
// SoyioFaceTecModule - React Native Native Module for FaceTec Integration
//

import UIKit
import Foundation
import FaceTecSDK
import React

@objc(SoyioFaceTecModule)
class SoyioFaceTecModule: RCTEventEmitter {

    private var currentPhotoIDProcessor: SoyioPhotoIDMatchProcessor?
    private var currentIDOnlyProcessor: SoyioIDOnlyProcessor?
    private var isSDKInitialized = false

    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    override func supportedEvents() -> [String]! {
        return ["onLivenessSuccess"]
    }

    @objc
    func startLivenessAndIDVerification(_ config: NSDictionary,
                          resolver: @escaping RCTPromiseResolveBlock,
                          rejecter: @escaping RCTPromiseRejectBlock) {

        guard let facetecSessionToken = config["facetecSessionToken"] as? String,
              let soyioSessionToken = config["soyioSessionToken"] as? String,
              let disclosureRequestToken = config["disclosureRequestToken"] as? String,
              let baseUrl = config["baseUrl"] as? String else {
            rejecter("INVALID_CONFIG", "Missing required configuration parameters", nil)
            return
        }

        DispatchQueue.main.async {
            self.startLivenessAndIDVerificationFlow(
                facetecSessionToken: facetecSessionToken,
                soyioSessionToken: soyioSessionToken,
                disclosureRequestToken: disclosureRequestToken,
                baseUrl: baseUrl,
                resolver: resolver,
                rejecter: rejecter
            )
        }
    }

    @objc
    func initializeFaceTecSDK(_ config: NSDictionary,
                             resolver: @escaping RCTPromiseResolveBlock,
                             rejecter: @escaping RCTPromiseRejectBlock) {

        guard let deviceKey = config["deviceKey"] as? String,
              let publicKey = config["publicKey"] as? String,
              let productionKey = config["productionKey"] as? String else {
            rejecter("INVALID_CONFIG", "Missing required credentials parameters", nil)
            return
        }

        // Check if already initialized
        let status = FaceTec.sdk.getStatus()
        if status == .initialized {
            self.isSDKInitialized = true
            resolver(["success": true])
            return
        }

        // Initialize SDK with custom credentials
        FacetecConfig.initializeWithCustomCredentials(
            deviceKey: deviceKey,
            publicKey: publicKey,
            productionKey: productionKey
        ) { success in
            if success {
                self.isSDKInitialized = true
                resolver(["success": true])
            } else {
                let sdkStatus = FaceTec.sdk.getStatus()
                resolver(["success": false, "error": "SDK initialization failed with status: \(sdkStatus.rawValue)"])
            }
        }
    }

    private func startLivenessAndIDVerificationFlow(facetecSessionToken: String,
                                      soyioSessionToken: String,
                                      disclosureRequestToken: String,
                                      baseUrl: String,
                                      resolver: @escaping RCTPromiseResolveBlock,
                                      rejecter: @escaping RCTPromiseRejectBlock) {

        guard let viewController = UIApplication.shared.windows.first?.rootViewController else {
            rejecter("NO_VIEW_CONTROLLER", "Could not find root view controller", nil)
            return
        }

        // Find the topmost presented view controller
        var topViewController = viewController
        while let presented = topViewController.presentedViewController {
            topViewController = presented
        }

        // Create and start the processor
        self.currentPhotoIDProcessor = SoyioPhotoIDMatchProcessor(
            facetecSessionToken: facetecSessionToken,
            soyioAuthToken: soyioSessionToken,
            disclosureRequestToken: disclosureRequestToken,
            baseUrl: baseUrl,
            fromViewController: topViewController,
            livenessSuccessHandler: { [weak self] in
                // Emit event to React Native when liveness check succeeds
                self?.sendEvent(withName: "onLivenessSuccess", body: [:])
            },
            completionHandler: { success, error in
                if success {
                    resolver(["success": true])
                } else {
                    resolver(["success": false, "error": error ?? "Unknown error"])
                }
                self.currentPhotoIDProcessor = nil
            }
        )
    }

    @objc
    func startIDOnlyVerification(_ config: NSDictionary,
                                resolver: @escaping RCTPromiseResolveBlock,
                                rejecter: @escaping RCTPromiseRejectBlock) {

        guard let facetecSessionToken = config["facetecSessionToken"] as? String,
              let soyioSessionToken = config["soyioSessionToken"] as? String,
              let disclosureRequestToken = config["disclosureRequestToken"] as? String,
              let baseUrl = config["baseUrl"] as? String else {
            rejecter("INVALID_CONFIG", "Missing required configuration parameters", nil)
            return
        }

        DispatchQueue.main.async {
            self.startIDOnlyVerificationFlow(
                facetecSessionToken: facetecSessionToken,
                soyioSessionToken: soyioSessionToken,
                disclosureRequestToken: disclosureRequestToken,
                baseUrl: baseUrl,
                resolver: resolver,
                rejecter: rejecter
            )
        }
    }

    private func startIDOnlyVerificationFlow(facetecSessionToken: String,
                                            soyioSessionToken: String,
                                            disclosureRequestToken: String,
                                            baseUrl: String,
                                            resolver: @escaping RCTPromiseResolveBlock,
                                            rejecter: @escaping RCTPromiseRejectBlock) {

        guard let viewController = UIApplication.shared.windows.first?.rootViewController else {
            rejecter("NO_VIEW_CONTROLLER", "Could not find root view controller", nil)
            return
        }

        // Find the topmost presented view controller
        var topViewController = viewController
        while let presented = topViewController.presentedViewController {
            topViewController = presented
        }

        // Create and start the ID-only processor
        self.currentIDOnlyProcessor = SoyioIDOnlyProcessor(
            facetecSessionToken: facetecSessionToken,
            soyioAuthToken: soyioSessionToken,
            disclosureRequestToken: disclosureRequestToken,
            baseUrl: baseUrl,
            fromViewController: topViewController,
            completionHandler: { success, error in
                if success {
                    resolver(["success": true])
                } else {
                    resolver(["success": false, "error": error ?? "Unknown error"])
                }
                self.currentIDOnlyProcessor = nil
            }
        )
    }
}
