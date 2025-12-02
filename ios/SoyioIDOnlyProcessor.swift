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
    var flowCancelledErrorMessage: String = "FLOW_CANCELLED"
    var unknownErrorMessage: String = "unknown_error"
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
            self.apiErrorMessage = self.flowCancelledErrorMessage
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
        request.addValue(ApiDate.iso, forHTTPHeaderField: "X-Api-Version")

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
                    if self.apiErrorMessage?.isEmpty ?? true {
                        self.apiErrorMessage = self.unknownErrorMessage
                    }
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
                    successFrontSideBackNext: "Lado frontal de la cédula\ncapturado",
                    successFrontSideNFCNext: "Frente de la cédula\ncapturado",
                    successBackSide: "Ambos lados fueron\ncapturados y verificados",
                    successBackSideNFCNext: "Ambos lados fueron\ncapturados y verificados",
                    successPassport: "Pasaporte capturado",
                    successPassportNFCNext: "Pasaporte capturado",
                    successUserConfirmation: "Cédula capturada",
                    successNFC: "Cédula capturada",
                    successAdditionalReview: "Cédula capturada",
                    retryFaceDidNotMatch: "El rostro no coincide\nlo suficiente",
                    retryIDNotFullyVisible: "La cédula\nno es totalmente visible",
                    retryOCRResultsNotGoodEnough: "El texto de la cédula no es legible",
                    retryIDTypeNotSupported: "No se admite este tipo de identificación\nUtiliza una identificación diferente",
                    skipOrErrorNFC: "Información de la cédula\nsubida"
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
                let errorMessage = self.apiErrorMessage ?? self.unknownErrorMessage
                self.completionHandler?(false, errorMessage)
            }
        })
    }

    func isSuccess() -> Bool {
        return success
    }
}
