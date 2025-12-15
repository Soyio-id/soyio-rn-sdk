import UIKit
import Foundation
import FaceTecSDK
import React

@objc(IOSFacetecSdk)
class IOSFacetecSdk: RCTEventEmitter {

    private var currentPhotoIDProcessor: SoyioPhotoIDMatchProcessor?
    private var currentIDOnlyProcessor: SoyioIDOnlyProcessor?

    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    override func supportedEvents() -> [String]! {
        return ["onLivenessSuccess"]
    }

    private func getStatusErrorMessage(_ status: FaceTecSDKStatus) -> String {
        switch status {
        case .neverInitialized:
            return "Initialize was never attempted"
        case .initialized:
            return "SDK initialized successfully"
        case .networkIssues:
            return "Could not verify credentials due to network issues"
        case .invalidDeviceKeyIdentifier:
            return "Invalid Device SDK Key Identifier"
        case .versionDeprecated:
            return "This version of FaceTec SDK is deprecated. Please update the SDK"
        case .offlineSessionsExceeded:
            return "Device SDK Key Identifier needs to be verified again"
        case .unknownError:
            return "An unknown error occurred"
        case .deviceLockedOut:
            return "Device is locked out due to too many failures"
        case .deviceInLandscapeMode:
            return "Device must be in portrait mode"
        case .deviceInReversePortraitMode:
            return "Device must be in portrait mode (not reverse portrait)"
        case .keyExpiredOrInvalid:
            return "Device SDK Key expired or invalid. Verify credentials at dev.facetec.com and check that Bundle ID matches"
        case .encryptionKeyInvalid:
            return "The public encryption key is invalid"
        @unknown default:
            return "Initialization failed with unknown status: \(status.rawValue)"
        }
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
              let productionKey = config["mobileProductionKey"] as? String else {
            rejecter("INVALID_CONFIG", "Missing required credentials parameters", nil)
            return
        }

        let status = FaceTec.sdk.getStatus()
        if status == .initialized {
            resolver(["success": true])
            return
        }

        // Apply customization before initializing (matching Android pattern)
        var themeColors: [String: String]? = nil
        if let theme = config["theme"] as? [String: Any] {
            themeColors = [
                "mainColor": theme["mainColor"] as? String ?? "",
                "highlightColor": theme["highlightColor"] as? String ?? "",
                "disabledColor": theme["disabledColor"] as? String ?? ""
            ]
        }
        FacetecConfig.apply(theme: themeColors)

        // Initialize SDK directly (matching Android pattern)
        FaceTec.sdk.initializeInProductionMode(
            productionKeyText: productionKey,
            deviceKeyIdentifier: deviceKey,
            faceScanEncryptionKey: publicKey,
            completion: { initializationSuccessful in
                if initializationSuccessful {
                    resolver(["success": true])
                } else {
                    let sdkStatus = FaceTec.sdk.getStatus()
                    print("[FaceTec] Initialization failed with status: \(sdkStatus.rawValue) (\(sdkStatus))")
                    let errorMessage = self.getStatusErrorMessage(sdkStatus)
                    resolver(["success": false, "error": errorMessage])
                }
            }
        )
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

        var topViewController = viewController
        while let presented = topViewController.presentedViewController {
            topViewController = presented
        }

        self.currentPhotoIDProcessor = SoyioPhotoIDMatchProcessor(
            facetecSessionToken: facetecSessionToken,
            soyioAuthToken: soyioSessionToken,
            disclosureRequestToken: disclosureRequestToken,
            baseUrl: baseUrl,
            fromViewController: topViewController,
            livenessSuccessHandler: { [weak self] in
                self?.sendEvent(withName: "onLivenessSuccess", body: [:])
            },
            completionHandler: { success, error in
                if success {
                    resolver(["success": true])
                } else {
                    resolver(["success": false, "error": error ?? "unknown_error"])
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

        var topViewController = viewController
        while let presented = topViewController.presentedViewController {
            topViewController = presented
        }

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
                    resolver(["success": false, "error": error ?? "unknown_error"])
                }
                self.currentIDOnlyProcessor = nil
            }
        )
    }
}
