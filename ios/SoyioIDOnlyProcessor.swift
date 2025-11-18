import UIKit
import Foundation
import FaceTecSDK

// This class performs ID-Only validation (skips liveness check) using the Soyio backend API
class SoyioIDOnlyProcessor: NSObject, Processor, FaceTecIDScanProcessorDelegate, URLSessionTaskDelegate {
    var latestNetworkRequest: URLSessionTask!
    var success = false
    var fromViewController: UIViewController!
    var idScanResultCallback: FaceTecIDScanResultCallback!
    var sessionId: String = ""
    var apiErrorMessage: String?

    // Dynamic configuration parameters
    var baseUrl: String
    var facetecSessionToken: String
    var soyioAuthToken: String
    var disclosureRequestToken: String
    var completionHandler: ((Bool, String?) -> Void)?

    init(facetecSessionToken: String, soyioAuthToken: String, disclosureRequestToken: String, baseUrl: String, fromViewController: UIViewController, completionHandler: @escaping (Bool, String?) -> Void) {
        self.facetecSessionToken = facetecSessionToken
        self.soyioAuthToken = soyioAuthToken
        self.disclosureRequestToken = disclosureRequestToken
        self.baseUrl = baseUrl
        self.fromViewController = fromViewController
        self.completionHandler = completionHandler
        super.init()

        // Configure ID Scan upload messages
        FaceTecCustomization.setIDScanUploadMessageOverrides(
            frontSideUploadStarted: "Uploading\nEncrypted\nID Scan",
            frontSideStillUploading: "Still Uploading...\nSlow Connection",
            frontSideUploadCompleteAwaitingResponse: "Upload Complete",
            frontSideUploadCompleteAwaitingProcessing: "Processing\nID Scan",
            backSideUploadStarted: "Uploading\nEncrypted\nBack of ID",
            backSideStillUploading: "Still Uploading...\nSlow Connection",
            backSideUploadCompleteAwaitingResponse: "Upload Complete",
            backSideUploadCompleteAwaitingProcessing: "Processing\nBack of ID",
            userConfirmedInfoUploadStarted: "Saving\nYour Confirmed Info",
            userConfirmedInfoStillUploading: "Still Uploading...\nSlow Connection",
            userConfirmedInfoUploadCompleteAwaitingResponse: "Info Saved",
            userConfirmedInfoUploadCompleteAwaitingProcessing: "Processing",
            nfcUploadStarted: "Uploading Encrypted\nNFC Details",
            nfcStillUploading: "Still Uploading...\nSlow Connection",
            nfcUploadCompleteAwaitingResponse: "Upload Complete",
            nfcUploadCompleteAwaitingProcessing: "Processing\nNFC Details",
            skippedNFCUploadStarted: "Uploading Encrypted\nID Details",
            skippedNFCStillUploading: "Still Uploading...\nSlow Connection",
            skippedNFCUploadCompleteAwaitingResponse: "Upload Complete",
            skippedNFCUploadCompleteAwaitingProcessing: "Processing\nID Details"
        );

        // Create the FaceTec session - only ID scan, no liveness check
        let idScanViewController = FaceTec.sdk.createSessionVC(idScanProcessorDelegate: self, sessionToken: facetecSessionToken)
        fromViewController.present(idScanViewController, animated: true, completion: nil)
    }

    //
    // Handling the Result of an ID Scan
    //
    func processIDScanWhileFaceTecSDKWaits(idScanResult: FaceTecIDScanResult, idScanResultCallback: FaceTecIDScanResultCallback) {
        self.idScanResultCallback = idScanResultCallback

        // Safely unwrap sessionId
        guard let sessionId = idScanResult.sessionId else {
            idScanResultCallback.onIDScanResultCancel()
            return
        }
        self.sessionId = sessionId

        // Handle early exit scenarios
        if idScanResult.status != FaceTecIDScanStatus.success {
            if latestNetworkRequest != nil {
                latestNetworkRequest.cancel()
            }
            idScanResultCallback.onIDScanResultCancel()
            return
        }

        // Prepare request data
        var parameters: [String : Any] = [:]
        parameters["id_scan"] = idScanResult.idScanBase64
        if idScanResult.frontImagesCompressedBase64?.isEmpty == false {
            parameters["id_scan_front_image"] = idScanResult.frontImagesCompressedBase64![0]
        }
        if idScanResult.backImagesCompressedBase64?.isEmpty == false {
            parameters["id_scan_back_image"] = idScanResult.backImagesCompressedBase64![0]
        }

        // Make the networking call to Soyio backend
        let endpoint = "\(baseUrl)/api/internal/disclosure_requests/\(disclosureRequestToken)/facetec/id_check"
        let request = NSMutableURLRequest(url: NSURL(string: endpoint)! as URL)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try! JSONSerialization.data(withJSONObject: parameters, options: JSONSerialization.WritingOptions(rawValue: 0))
        request.addValue(soyioAuthToken, forHTTPHeaderField: "Authorization")
        request.addValue(self.sessionId, forHTTPHeaderField: "X-Facetec-Session-Id")
        request.addValue(FaceTec.sdk.createFaceTecAPIUserAgentString(self.sessionId), forHTTPHeaderField: "X-Facetec-User-Agent")
        request.addValue(SoyioUtils.getCurrentDateISO(), forHTTPHeaderField: "X-Api-Version")

        let session = URLSession(configuration: URLSessionConfiguration.default, delegate: self, delegateQueue: OperationQueue.main)
        latestNetworkRequest = session.dataTask(with: request as URLRequest, completionHandler: { data, response, error in

            guard let data = data else {
                idScanResultCallback.onIDScanResultCancel()
                return
            }

            guard let responseJSON = try? JSONSerialization.jsonObject(with: data, options: JSONSerialization.ReadingOptions.allowFragments) as! [String: AnyObject] else {
                idScanResultCallback.onIDScanResultCancel()
                return
            }

            if let error = responseJSON["error"] as? Bool {
                if (error) {
                    self.apiErrorMessage = responseJSON["errorMessage"] as? String
                    idScanResultCallback.onIDScanResultCancel()
                    return
                }
            }

            guard let scanResultBlob = responseJSON["scanResultBlob"] as? String,
                  let wasProcessed = responseJSON["wasProcessed"] as? Bool else {
                idScanResultCallback.onIDScanResultCancel()
                return
            }

            if wasProcessed == true {
                // Configure result screen messages
                FaceTecCustomization.setIDScanResultScreenMessageOverrides(
                    successFrontSide: "Front Scan Complete",
                    successFrontSideBackNext: "Front of ID\nScanned",
                    successFrontSideNFCNext: "Front of ID\nScanned",
                    successBackSide: "ID Scan Complete",
                    successBackSideNFCNext: "Back of ID\nScanned",
                    successPassport: "Passport Scan Complete",
                    successPassportNFCNext: "Passport Scanned",
                    successUserConfirmation: "Photo ID Scan\nComplete",
                    successNFC: "ID Scan Complete",
                    successAdditionalReview: "ID Photo Capture\nComplete",
                    retryFaceDidNotMatch: "Face Didn't Match\nHighly Enough",
                    retryIDNotFullyVisible: "ID Document\nNot Fully Visible",
                    retryOCRResultsNotGoodEnough: "ID Text Not Legible",
                    retryIDTypeNotSupported: "ID Type Mismatch\nPlease Try Again",
                    skipOrErrorNFC: "ID Details\nUploaded"
                )

                self.success = idScanResultCallback.onIDScanResultProceedToNextStep(scanResultBlob: scanResultBlob)
            }
            else {
                idScanResultCallback.onIDScanResultCancel()
            }
        })

        latestNetworkRequest.resume()
    }

    //
    // URLSessionTaskDelegate function to get progress while performing the upload
    //
    func urlSession(_ session: URLSession, task: URLSessionTask, didSendBodyData bytesSent: Int64, totalBytesSent: Int64, totalBytesExpectedToSend: Int64) {
        let uploadProgress: Float = Float(totalBytesSent) / Float(totalBytesExpectedToSend)
        idScanResultCallback.onIDScanUploadProgress(uploadedPercent: uploadProgress)
    }

    //
    // This function gets called after the FaceTec SDK is completely done
    //
    func onFaceTecSDKCompletelyDone() {
        // Dismiss the view controller to return to the main UI
        fromViewController.dismiss(animated: true, completion: {
            // Notify completion
            if self.success {
                self.completionHandler?(true, nil)
            } else {
                let errorMessage = self.apiErrorMessage ?? "FaceTec ID verification did not complete successfully"
                self.completionHandler?(false, errorMessage)
            }
        })
    }

    func isSuccess() -> Bool {
        return success
    }
}
