package com.soyio.soyiorndk

import android.graphics.Color
import android.graphics.Typeface
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReactApplicationContext
import com.facetec.sdk.FaceTecCancelButtonCustomization
import com.facetec.sdk.FaceTecCustomization
import com.facetec.sdk.FaceTecSDK
import com.facetec.sdk.FaceTecSecurityWatermarkImage

internal object FacetecConfig {
  fun apply(reactContext: ReactApplicationContext, theme: ReadableMap?) {
    val colors = resolveThemeColors(theme)
    val customization = FaceTecCustomization()
    val regularFont = typeface(reactContext, Typeface.NORMAL)
    val mediumFont = typeface(reactContext, Typeface.NORMAL, "sans-serif-medium")
    val semiBoldFont = typeface(reactContext, Typeface.BOLD, "sans-serif-medium")
    val boldFont = typeface(reactContext, Typeface.BOLD)

    customization.frameCustomization.apply {
      cornerRadius = 20
      backgroundColor = colors.white
      borderColor = colors.white
    }

    customization.overlayCustomization.apply {
      showBrandingImage = false
      backgroundColor = colors.white
    }

    customization.guidanceCustomization.apply {
      backgroundColors = colors.white
      foregroundColor = colors.black
      buttonBackgroundNormalColor = colors.main
      buttonBackgroundDisabledColor = colors.disabled
      buttonBackgroundHighlightColor = colors.highlight
      buttonCornerRadius = 8
      buttonTextNormalColor = colors.white
      buttonTextDisabledColor = colors.white
      buttonTextHighlightColor = colors.white
      retryScreenImageBorderColor = colors.white
      retryScreenOvalStrokeColor = colors.white
      headerFont = semiBoldFont
      subtextFont = regularFont
      buttonFont = boldFont
      readyScreenHeaderFont = semiBoldFont
      readyScreenSubtextFont = regularFont
      retryScreenHeaderFont = semiBoldFont
      retryScreenSubtextFont = regularFont
    }

    customization.ovalCustomization.apply {
      strokeColor = colors.main
      progressColor1 = colors.main
      progressColor2 = colors.main
    }

    customization.feedbackCustomization.apply {
      backgroundColors = colors.black
      textColor = colors.white
      textFont = mediumFont
    }

    customization.cancelButtonCustomization.apply {
      location = FaceTecCancelButtonCustomization.ButtonLocation.TOP_LEFT
    }

    customization.resultScreenCustomization.apply {
      backgroundColors = colors.white
      foregroundColor = colors.black
      activityIndicatorColor = colors.main
      resultAnimationBackgroundColor = colors.main
      resultAnimationForegroundColor = colors.white
      uploadProgressFillColor = colors.main
      messageFont = regularFont
    }

    customization.securityWatermarkImage = FaceTecSecurityWatermarkImage.FACETEC

    customization.idScanCustomization.apply {
      selectionScreenForegroundColor = colors.black
      reviewScreenBackgroundColors = colors.white
      reviewScreenForegroundColor = colors.white
      reviewScreenTextBackgroundColor = colors.main
      captureScreenForegroundColor = colors.white
      captureScreenTextBackgroundColor = colors.black
      buttonBackgroundNormalColor = colors.main
      buttonBackgroundDisabledColor = colors.disabled
      buttonBackgroundHighlightColor = colors.highlight
      buttonTextNormalColor = colors.white
      buttonTextDisabledColor = colors.white
      buttonTextHighlightColor = colors.white
      captureScreenBackgroundColor = colors.white
      captureFrameStrokeColor = colors.white
      buttonCornerRadius = 8
      headerFont = semiBoldFont
      subtextFont = regularFont
      buttonFont = boldFont
    }

    customization.ocrConfirmationCustomization.apply {
      mainHeaderFont = boldFont
      sectionHeaderFont = semiBoldFont
      fieldLabelFont = regularFont
      fieldValueFont = regularFont
      inputFieldFont = regularFont
      inputFieldPlaceholderFont = regularFont
      buttonFont = boldFont
    }
    customization.initialLoadingAnimationCustomization.messageFont = regularFont

    FaceTecSDK.setCustomization(customization)
    FaceTecSDK.setLowLightCustomization(customization)
    FaceTecSDK.setDynamicDimmingCustomization(customization)
    applySpanishLocalization(reactContext)
  }

  private fun resolveThemeColors(theme: ReadableMap?): ThemeColors {
    val main = theme?.getOptionalColor("mainColor") ?: Color.parseColor(DEFAULT_MAIN_COLOR)
    val highlight = theme?.getOptionalColor("highlightColor") ?: Color.parseColor(DEFAULT_HIGHLIGHT_COLOR)
    val disabled = theme?.getOptionalColor("disabledColor") ?: Color.parseColor(DEFAULT_DISABLED_COLOR)
    return ThemeColors(main = main, highlight = highlight, disabled = disabled)
  }

  private fun ReadableMap.getOptionalColor(key: String): Int? {
    if (!hasKey(key) || isNull(key)) return null
    val value = getString(key) ?: return null
    return try {
      Color.parseColor(value)
    } catch (_: IllegalArgumentException) {
      null
    }
  }

  private fun typeface(reactContext: ReactApplicationContext, style: Int, fallbackFamily: String = "sans-serif"): Typeface {
    val base = try {
      Typeface.createFromAsset(reactContext.assets, ROBOTO_FLEX_PATH)
    } catch (_: Exception) {
      null
    } ?: Typeface.create(fallbackFamily, Typeface.NORMAL)

    return Typeface.create(base, style)
  }

  private fun applySpanishLocalization(reactContext: ReactApplicationContext) {
    try {
      val resources = reactContext.resources
      // FaceTec resources merge into the host app package, so resolve ids from the host package.
      val hostPackage = reactContext.packageName
      val overrides = HashMap<Int, String>()

      FACETEC_STRING_KEYS.forEach { keyName ->
        val valueResId = resources.getIdentifier(
          "soyio_facetec_${keyName.removePrefix("FaceTec_")}",
          "string",
          hostPackage,
        )
        val faceTecResId = resources.getIdentifier(keyName, "string", hostPackage)
        if (valueResId != 0 && faceTecResId != 0) {
          overrides[faceTecResId] = resources.getString(valueResId)
        }
      }

      if (overrides.isNotEmpty()) {
        FaceTecSDK.setDynamicStrings(overrides)
      }
    } catch (_: Exception) {
      // Silently ignore; FaceTec will fall back to its bundled defaults.
    }
  }

  private data class ThemeColors(
    val main: Int,
    val highlight: Int,
    val disabled: Int,
    val black: Int = Color.parseColor("#000000"),
    val white: Int = Color.parseColor("#FFFFFF"),
  )

  private const val ROBOTO_FLEX_PATH = "fonts/RobotoFlex.ttf"
  private const val DEFAULT_MAIN_COLOR = "#3340CF"
  private const val DEFAULT_HIGHLIGHT_COLOR = "#2A35B0"
  private const val DEFAULT_DISABLED_COLOR = "#9BA3D8"
  private val FACETEC_STRING_KEYS = listOf(
    // Actions
    "FaceTec_action_ok",
    "FaceTec_action_im_ready",
    "FaceTec_action_try_again",
    "FaceTec_action_continue",
    "FaceTec_action_take_photo",
    "FaceTec_action_accept_photo",
    "FaceTec_action_retake_photo",
    "FaceTec_action_confirm",
    "FaceTec_action_scan_nfc",
    "FaceTec_action_scan_nfc_card",
    "FaceTec_action_skip_nfc",
    // Accessibility
    "FaceTec_accessibility_cancel_button",
    "FaceTec_accessibility_torch_button",
    "FaceTec_accessibility_tap_guidance",
    "FaceTec_accessibility_feedback_move_phone_away",
    "FaceTec_accessibility_feedback_move_phone_closer",
    "FaceTec_accessibility_feedback_face_too_far_left",
    "FaceTec_accessibility_feedback_face_too_far_right",
    "FaceTec_accessibility_feedback_face_too_low",
    "FaceTec_accessibility_feedback_face_too_high",
    "FaceTec_accessibility_feedback_face_rotated_too_far_left",
    "FaceTec_accessibility_feedback_face_rotated_too_far_right",
    "FaceTec_accessibility_feedback_face_pointing_too_far_left",
    "FaceTec_accessibility_feedback_face_pointing_too_far_right",
    "FaceTec_accessibility_feedback_face_not_on_camera",
    "FaceTec_accessibility_feedback_hold_device_to_eye_level",
    // Presession
    "FaceTec_presession_frame_your_face",
    "FaceTec_presession_position_face_straight_in_oval",
    "FaceTec_presession_hold_steady_3",
    "FaceTec_presession_hold_steady_2",
    "FaceTec_presession_hold_steady_1",
    "FaceTec_presession_remove_dark_glasses",
    "FaceTec_presession_neutral_expression",
    "FaceTec_presession_conditions_too_bright",
    "FaceTec_presession_brighten_your_environment",
    // Feedback
    "FaceTec_feedback_center_face",
    "FaceTec_feedback_face_not_found",
    "FaceTec_feedback_move_phone_away",
    "FaceTec_feedback_move_phone_closer",
    "FaceTec_feedback_move_phone_to_eye_level",
    "FaceTec_feedback_face_not_looking_straight_ahead",
    "FaceTec_feedback_face_not_upright",
    "FaceTec_feedback_hold_steady",
    "FaceTec_feedback_use_even_lighting",
    // Instructions
    "FaceTec_instructions_header_ready_1",
    "FaceTec_instructions_header_ready_2",
    "FaceTec_instructions_message_ready_1",
    "FaceTec_instructions_message_ready_2",
    // Retry
    "FaceTec_retry_header",
    "FaceTec_retry_subheader_message",
    "FaceTec_retry_your_image_label",
    "FaceTec_retry_ideal_image_label",
    "FaceTec_retry_instruction_message_1",
    "FaceTec_retry_instruction_message_2",
    "FaceTec_retry_instruction_message_3",
    // Camera Permission
    "FaceTec_camera_permission_header",
    "FaceTec_camera_permission_message_enroll",
    "FaceTec_camera_permission_message_auth",
    "FaceTec_camera_permission_enable_camera",
    "FaceTec_camera_permission_launch_settings",
    // Initializing
    "FaceTec_initializing_camera",
    // ID Scan
    "FaceTec_idscan_type_selection_header",
    "FaceTec_idscan_capture_id_front_instruction_message",
    "FaceTec_idscan_capture_id_back_instruction_message",
    "FaceTec_idscan_review_id_front_instruction_message",
    "FaceTec_idscan_review_id_back_instruction_message",
    "FaceTec_idscan_additional_review_message",
    "FaceTec_idscan_ocr_confirmation_main_header",
    "FaceTec_idscan_ocr_confirmation_scroll_message",
    "FaceTec_idscan_feedback_flip_id_to_back_message",
    "FaceTec_idscan_capture_screen_focus_message",
    "FaceTec_idscan_capture_tap_to_focus_message",
    "FaceTec_idscan_capture_hold_steady_message",
    // ID Scan - NFC
    "FaceTec_idscan_nfc_status_disabled_message",
    "FaceTec_idscan_nfc_status_ready_message",
    "FaceTec_idscan_nfc_card_status_ready_message",
    "FaceTec_idscan_nfc_status_starting_message",
    "FaceTec_idscan_nfc_card_status_starting_message",
    "FaceTec_idscan_nfc_status_scanning_message",
    "FaceTec_idscan_nfc_status_weak_connection_message",
    "FaceTec_idscan_nfc_status_finished_with_success_message",
    "FaceTec_idscan_nfc_status_finished_with_error_message",
    "FaceTec_idscan_nfc_card_status_finished_with_error_message",
    "FaceTec_idscan_nfc_status_skipped_message",
    // Result Messages
    "FaceTec_result_success_message",
    "FaceTec_result_facescan_upload_message",
    "FaceTec_result_idscan_upload_message",
    "FaceTec_result_nfc_upload_message",
    "FaceTec_result_idscan_unsuccess_message",
    "FaceTec_result_idscan_success_front_side_message",
    "FaceTec_result_idscan_success_front_side_back_next_message",
    "FaceTec_result_idscan_success_front_side_nfc_next_message",
    "FaceTec_result_idscan_success_back_side_message",
    "FaceTec_result_idscan_success_back_side_nfc_next_message",
    "FaceTec_result_idscan_success_passport_message",
    "FaceTec_result_idscan_success_passport_nfc_next_message",
    "FaceTec_result_idscan_success_user_confirmation_message",
    "FaceTec_result_idscan_success_nfc_message",
    "FaceTec_result_idscan_success_additional_review_message",
    "FaceTec_result_idscan_skip_or_error_nfc_message",
    "FaceTec_result_idscan_retry_face_did_not_match_message",
    "FaceTec_result_idscan_retry_id_not_fully_visible_message",
    "FaceTec_result_idscan_retry_ocr_results_not_good_enough_message",
    "FaceTec_result_idscan_retry_id_type_not_supported_message",
    "FaceTec_result_idscan_retry_barcode_not_read_message",
    // Retry - Official ID Photo
    "FaceTec_retry_official_id_photo_subheader_message",
    "FaceTec_retry_official_id_photo_instruction_message",
    "FaceTec_retry_official_id_photo_your_image_label",
    "FaceTec_retry_official_id_photo_ideal_image_label",
  )
}
