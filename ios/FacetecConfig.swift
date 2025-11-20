import UIKit
import Foundation
import FaceTecSDK

class FacetecConfig {

    private static func customFont(size: CGFloat, weight: UIFont.Weight) -> UIFont {
        let fontName: String
        switch weight {
        case .regular:
            fontName = "RobotoFlex"
        case .medium:
            fontName = "RobotoFlex"
        case .semibold:
            fontName = "RobotoFlex"
        case .bold:
            fontName = "RobotoFlex"
        default:
            fontName = "RobotoFlex"
        }

        if let customFont = UIFont(name: fontName, size: size) {
            let descriptor = customFont.fontDescriptor.addingAttributes([
                .traits: [UIFontDescriptor.TraitKey.weight: weight.rawValue]
            ])
            return UIFont(descriptor: descriptor, size: size)
        }

        return UIFont.systemFont(ofSize: size, weight: weight)
    }

    static func initializeWithCustomCredentials(deviceKey: String, publicKey: String, productionKey: String, completion: @escaping (Bool)->()) {
        FaceTec.sdk.initializeInDevelopmentMode(deviceKeyIdentifier: deviceKey, faceScanEncryptionKey: publicKey, completion: { initializationSuccessful in
            let status = FaceTec.sdk.getStatus()
            if initializationSuccessful {
                FaceTec.sdk.setDynamicStrings(FacetecStrings.spanish)
                FaceTec.sdk.setCustomization(FacetecConfig.currentCustomization)
                FaceTec.sdk.setLowLightCustomization(FacetecConfig.currentCustomization)
                FaceTec.sdk.setDynamicDimmingCustomization(FacetecConfig.currentCustomization)
            } else {
                FaceTec.sdk.auditTrailType = .fullResolution
                FaceTec.sdk.setMaxAuditTrailImages(.upToSix)
            }

            completion(initializationSuccessful)
        })
    }


    public static func retrieveConfigurationWizardCustomization() -> FaceTecCustomization {
        let outerBackgroundColor = UIColor(hexString: "#ffffff")
        let frameColor = UIColor(hexString: "#ffffff")
        let borderColor = UIColor(hexString: "#ffffff")
        let ovalColor = UIColor(hexString: "#3340CF")
        let dualSpinnerColor = UIColor(hexString: "#3340CF")
        let textColor = UIColor(hexString: "#000000")
        let buttonAndFeedbackBarColor =  UIColor(hexString: "#3340CF")
        let buttonAndFeedbackBarTextColor = UIColor(hexString: "#ffffff")
        let buttonColorHighlight =  UIColor(hexString: "#2A35B0")
        let buttonColorDisabled =  UIColor(hexString: "#9BA3D8")
        let feedbackBackgroundLayer = CAGradientLayer.init()
        feedbackBackgroundLayer.colors = [buttonAndFeedbackBarColor.cgColor, buttonAndFeedbackBarColor.cgColor]
        feedbackBackgroundLayer.locations = [0,1]
        feedbackBackgroundLayer.startPoint = CGPoint.init(x: 0, y: 0)
        feedbackBackgroundLayer.endPoint = CGPoint.init(x: 1, y: 0)

        // For Frame Corner Radius Customization
        let frameCornerRadius: Int32 = 20

        let cancelImage = UIImage(named: "FaceTec_cancel")
        let cancelButtonLocation: FaceTecCancelButtonLocation = .topLeft

        // For Image Customization
        let securityWatermarkImage: FaceTecSecurityWatermarkImage = .faceTec

        // Set a Default Customization
        let defaultCustomization = FaceTecCustomization()


        // Set Frame Customization
        defaultCustomization.frameCustomization.cornerRadius = frameCornerRadius
        defaultCustomization.frameCustomization.backgroundColor = frameColor
        defaultCustomization.frameCustomization.borderColor = borderColor

        // Set Overlay Customization
        defaultCustomization.overlayCustomization.showBrandingImage = false
        defaultCustomization.overlayCustomization.backgroundColor = outerBackgroundColor

        // Set Guidance Customization
        defaultCustomization.guidanceCustomization.backgroundColors = [frameColor, frameColor]
        defaultCustomization.guidanceCustomization.foregroundColor = textColor
        defaultCustomization.guidanceCustomization.buttonBackgroundNormalColor = buttonAndFeedbackBarColor
        defaultCustomization.guidanceCustomization.buttonBackgroundDisabledColor = buttonColorDisabled
        defaultCustomization.guidanceCustomization.buttonBackgroundHighlightColor = buttonColorHighlight
        defaultCustomization.guidanceCustomization.buttonTextNormalColor = buttonAndFeedbackBarTextColor
        defaultCustomization.guidanceCustomization.buttonTextDisabledColor = buttonAndFeedbackBarTextColor
        defaultCustomization.guidanceCustomization.buttonTextHighlightColor = buttonAndFeedbackBarTextColor
        defaultCustomization.guidanceCustomization.retryScreenImageBorderColor = borderColor
        defaultCustomization.guidanceCustomization.retryScreenOvalStrokeColor = borderColor

        // Set Oval Customization
        defaultCustomization.ovalCustomization.strokeColor = ovalColor
        defaultCustomization.ovalCustomization.progressColor1 = dualSpinnerColor
        defaultCustomization.ovalCustomization.progressColor2 = dualSpinnerColor

        // Set Feedback Customization
        defaultCustomization.feedbackCustomization.backgroundColor = feedbackBackgroundLayer
        defaultCustomization.feedbackCustomization.textColor = buttonAndFeedbackBarTextColor

        // Set Cancel Customization
        defaultCustomization.cancelButtonCustomization.customImage = cancelImage
        defaultCustomization.cancelButtonCustomization.location = cancelButtonLocation

        // Set Result Screen Customization
        defaultCustomization.resultScreenCustomization.backgroundColors = [frameColor, frameColor]
        defaultCustomization.resultScreenCustomization.foregroundColor = textColor
        defaultCustomization.resultScreenCustomization.activityIndicatorColor = buttonAndFeedbackBarColor
        defaultCustomization.resultScreenCustomization.resultAnimationBackgroundColor = buttonAndFeedbackBarColor
        defaultCustomization.resultScreenCustomization.resultAnimationForegroundColor = buttonAndFeedbackBarTextColor
        defaultCustomization.resultScreenCustomization.uploadProgressFillColor = buttonAndFeedbackBarColor

        // Set Security Watermark Customization
        defaultCustomization.securityWatermarkImage = securityWatermarkImage

        // Set ID Scan Customization
        defaultCustomization.idScanCustomization.selectionScreenBackgroundColors = [frameColor, frameColor]
        defaultCustomization.idScanCustomization.selectionScreenForegroundColor = textColor
        defaultCustomization.idScanCustomization.reviewScreenBackgroundColors = [frameColor, frameColor]
        defaultCustomization.idScanCustomization.reviewScreenForegroundColor = buttonAndFeedbackBarTextColor
        defaultCustomization.idScanCustomization.reviewScreenTextBackgroundColor = buttonAndFeedbackBarColor
        defaultCustomization.idScanCustomization.captureScreenForegroundColor = buttonAndFeedbackBarTextColor
        defaultCustomization.idScanCustomization.captureScreenTextBackgroundColor = buttonAndFeedbackBarColor
        defaultCustomization.idScanCustomization.buttonBackgroundNormalColor = buttonAndFeedbackBarColor
        defaultCustomization.idScanCustomization.buttonBackgroundDisabledColor = buttonColorDisabled
        defaultCustomization.idScanCustomization.buttonBackgroundHighlightColor = buttonColorHighlight
        defaultCustomization.idScanCustomization.buttonTextNormalColor = buttonAndFeedbackBarTextColor
        defaultCustomization.idScanCustomization.buttonTextDisabledColor = buttonAndFeedbackBarTextColor
        defaultCustomization.idScanCustomization.buttonTextHighlightColor = buttonAndFeedbackBarTextColor
        defaultCustomization.idScanCustomization.captureScreenBackgroundColor = frameColor
        defaultCustomization.idScanCustomization.captureFrameStrokeColor = borderColor

        // MARK: - Font Configuration (matching web Config.ts)
        let regularFont = customFont(size: 16, weight: .regular)
        let mediumFont = customFont(size: 16, weight: .medium)
        let semiBoldFont = customFont(size: 18, weight: .semibold)
        let boldFont = customFont(size: 18, weight: .bold)

        // Guidance Customization Fonts
        defaultCustomization.guidanceCustomization.headerFont = semiBoldFont
        defaultCustomization.guidanceCustomization.subtextFont = regularFont
        defaultCustomization.guidanceCustomization.buttonFont = boldFont
        defaultCustomization.guidanceCustomization.readyScreenHeaderFont = semiBoldFont
        defaultCustomization.guidanceCustomization.readyScreenSubtextFont = regularFont
        defaultCustomization.guidanceCustomization.retryScreenHeaderFont = semiBoldFont
        defaultCustomization.guidanceCustomization.retryScreenSubtextFont = regularFont

        // ID Scan Customization Fonts
        defaultCustomization.idScanCustomization.headerFont = semiBoldFont
        defaultCustomization.idScanCustomization.subtextFont = regularFont
        defaultCustomization.idScanCustomization.buttonFont = boldFont

        // OCR Confirmation Customization Fonts
        defaultCustomization.ocrConfirmationCustomization.mainHeaderFont = boldFont
        defaultCustomization.ocrConfirmationCustomization.sectionHeaderFont = semiBoldFont
        defaultCustomization.ocrConfirmationCustomization.fieldLabelFont = regularFont
        defaultCustomization.ocrConfirmationCustomization.fieldValueFont = regularFont
        defaultCustomization.ocrConfirmationCustomization.inputFieldFont = regularFont
        defaultCustomization.ocrConfirmationCustomization.inputFieldPlaceholderFont = regularFont
        defaultCustomization.ocrConfirmationCustomization.buttonFont = boldFont

        // Result Screen Customization Font
        defaultCustomization.resultScreenCustomization.messageFont = regularFont

        // Feedback Customization Font
        defaultCustomization.feedbackCustomization.textFont = mediumFont

        // Initial Loading Animation Font
        defaultCustomization.initialLoadingAnimationCustomization.messageFont = regularFont

        return defaultCustomization
    }

    static var currentCustomization: FaceTecCustomization = retrieveConfigurationWizardCustomization()

    static let wasSDKConfiguredWithConfigWizard = true

}

extension UIColor {
    convenience init(hexString: String) {
        let hex = hexString.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int = UInt64()
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(red: CGFloat(r) / 255, green: CGFloat(g) / 255, blue: CGFloat(b) / 255, alpha: CGFloat(a) / 255)
    }
}
