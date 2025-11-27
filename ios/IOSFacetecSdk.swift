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

        var themeColors: [String: String]? = nil
        if let theme = config["theme"] as? [String: Any] {
            themeColors = [
                "mainColor": theme["mainColor"] as? String ?? "",
                "highlightColor": theme["highlightColor"] as? String ?? "",
                "disabledColor": theme["disabledColor"] as? String ?? ""
            ]
        }

        let status = FaceTec.sdk.getStatus()
        if status == .initialized {
            resolver(["success": true])
            return
        }

        FacetecConfig.initializeWithCustomCredentials(
            deviceKey: deviceKey,
            publicKey: publicKey,
            productionKey: productionKey,
            themeColors: themeColors
        ) { success in
            if success {
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
