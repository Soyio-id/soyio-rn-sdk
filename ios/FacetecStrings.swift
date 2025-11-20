import Foundation
import FaceTecSDK

class FacetecStrings {
    static let spanish: [String: String] = [
        // Actions
        "FaceTec_action_ok": "Aceptar",
        "FaceTec_action_im_ready": "Comenzar validación",
        "FaceTec_action_try_again": "Volver a intentarlo",
        "FaceTec_action_continue": "Continuar",
        "FaceTec_action_take_photo": "Tomar foto",
        "FaceTec_action_accept_photo": "Aceptar",
        "FaceTec_action_retake_photo": "Volver",
        "FaceTec_action_confirm": "Confirmar información",
        "FaceTec_action_scan_nfc": "Escanear NFC",
        "FaceTec_action_scan_nfc_card": "Escanear chip",
        "FaceTec_action_skip_nfc": "Omitir este paso",

        // Accessibility
        "FaceTec_accessibility_cancel_button": "Cancelar",
        "FaceTec_accessibility_torch_button": "Interruptor de iluminación",
        "FaceTec_accessibility_tap_guidance": "Toca dos veces cualquier parte de la pantalla para ver indicaciones sobre cómo alinear tu rostro.",
        "FaceTec_accessibility_feedback_move_phone_away": "Tu rostro está demasiado cerca",
        "FaceTec_accessibility_feedback_move_phone_closer": "Tu rostro está demasiado lejos",
        "FaceTec_accessibility_feedback_face_too_far_left": "Tu rostro está demasiado a la izquierda",
        "FaceTec_accessibility_feedback_face_too_far_right": "Tu rostro está demasiado a la derecha",
        "FaceTec_accessibility_feedback_face_too_low": "Tu rostro está demasiado abajo",
        "FaceTec_accessibility_feedback_face_too_high": "Tu rostro está demasiado arriba",
        "FaceTec_accessibility_feedback_face_rotated_too_far_left": "Tu rostro gira demasiado a la izquierda",
        "FaceTec_accessibility_feedback_face_rotated_too_far_right": "Tu rostro gira demasiado a la derecha",
        "FaceTec_accessibility_feedback_face_pointing_too_far_left": "Tu rostro está demasiado inclinado hacia la izquierda",
        "FaceTec_accessibility_feedback_face_pointing_too_far_right": "Tu rostro está demasiado inclinado hacia la derecha",
        "FaceTec_accessibility_feedback_face_not_on_camera": "El rostro no se ve en la cámara o está demasiado lejos",
        "FaceTec_accessibility_feedback_hold_device_to_eye_level": "Mantén el dispositivo a la altura de los ojos",

        // Presession
        "FaceTec_presession_frame_your_face": "Encuadra tu rostro en el óvalo",
        "FaceTec_presession_position_face_straight_in_oval": "Mira hacia el frente",
        "FaceTec_presession_hold_steady_3": "Mantente quieto durante: 3",
        "FaceTec_presession_hold_steady_2": "Mantente quieto durante: 2",
        "FaceTec_presession_hold_steady_1": "Mantente quieto durante: 1",
        "FaceTec_presession_remove_dark_glasses": "Quítate los lentes oscuros",
        "FaceTec_presession_neutral_expression": "Expresión neutra, sin sonreír",
        "FaceTec_presession_conditions_too_bright": "Demasiada luz",
        "FaceTec_presession_brighten_your_environment": "Ilumina tu entorno",

        // Feedback
        "FaceTec_feedback_center_face": "Centra tu rostro",
        "FaceTec_feedback_face_not_found": "Encuadra tu rostro",
        "FaceTec_feedback_move_phone_away": "Aléjate",
        "FaceTec_feedback_move_phone_closer": "Acércate",
        "FaceTec_feedback_move_phone_to_eye_level": "Coloca la cámara a la altura de los ojos",
        "FaceTec_feedback_face_not_looking_straight_ahead": "Mira hacia el frente",
        "FaceTec_feedback_face_not_upright": "Mantén la cabeza recta",
        "FaceTec_feedback_hold_steady": "Quédate quieto",
        "FaceTec_feedback_use_even_lighting": "Ilumina el rostro de forma más uniforme",

        // Instructions
        "FaceTec_instructions_header_ready_1": "Prepárate para",
        "FaceTec_instructions_header_ready_2": "tu videoselfie",
        "FaceTec_instructions_message_ready_1": "Encuadra tu rostro en el óvalo",
        "FaceTec_instructions_message_ready_2": "Presiona \"Comenzar validación\"",

        // Retry
        "FaceTec_retry_header": "Intentémoslo otra vez",
        "FaceTec_retry_subheader_message": "Necesitamos una videoselfie más nítida",
        "FaceTec_retry_your_image_label": "Tu selfie",
        "FaceTec_retry_ideal_image_label": "Pose ideal",
        "FaceTec_retry_instruction_message_1": "Usa una pose y iluminación ideal",
        "FaceTec_retry_instruction_message_2": "Expresión neutra, sin sonreír",
        "FaceTec_retry_instruction_message_3": "Demasiado borrosa, limpie la cámara",

        // Camera Permission
        "FaceTec_camera_permission_header": "Habilita la cámara",
        "FaceTec_camera_permission_message_enroll": "Permisos de cámara deshabilitados.\nVerifique la configuración de tu sistema operativo",
        "FaceTec_camera_permission_message_auth": "Permisos de cámara deshabilitados.\nVerifique la configuración de tu sistema operativo",
        "FaceTec_camera_permission_enable_camera": "Habilitar la cámara",
        "FaceTec_camera_permission_launch_settings": "Abrir la configuración",

        // Initializing
        "FaceTec_initializing_camera": "Estamos protegiendo la conexión ...",

        // ID Scan
        "FaceTec_idscan_type_selection_header": "Ahora, prepárate para escanear\ntu carnet",
        "FaceTec_idscan_capture_id_front_instruction_message": "Frente de tu carnet",
        "FaceTec_idscan_capture_id_back_instruction_message": "Reverso de tu carnet",
        "FaceTec_idscan_review_id_front_instruction_message": "Verifica que sea nítida y legible",
        "FaceTec_idscan_review_id_back_instruction_message": "Verifica que sea nítida y legible",
        "FaceTec_idscan_additional_review_message": "Se requiere\nuna verificación adicional",
        "FaceTec_idscan_ocr_confirmation_main_header": "Revisar y confirmar",
        "FaceTec_idscan_ocr_confirmation_scroll_message": "Desplácese hacia abajo",
        "FaceTec_idscan_feedback_flip_id_to_back_message": "Sigamos con el reverso de tu carnet",
        "FaceTec_idscan_capture_screen_focus_message": "Presiona para enfocar",
        "FaceTec_idscan_capture_tap_to_focus_message": "Toca la pantalla para enfocar",
        "FaceTec_idscan_capture_hold_steady_message": "Mantente quieto",

        // ID Scan - NFC
        "FaceTec_idscan_nfc_status_disabled_message": "Habilita el NFC\nen la configuración de tu dispositivo\npara continuar",
        "FaceTec_idscan_nfc_status_ready_message": "Prepárate para escanear\nel chip de tu pasaporte electrónico",
        "FaceTec_idscan_nfc_card_status_ready_message": "Prepárate para escanear\nel chip de tu carnet",
        "FaceTec_idscan_nfc_status_starting_message": "Acerca el teléfono a la parte\nposterior del ePasaporte\npara escanear el chip NFC",
        "FaceTec_idscan_nfc_card_status_starting_message": "Acerca el teléfono a tu carnet\npara escanear el chip NFC",
        "FaceTec_idscan_nfc_status_scanning_message": "Manténlo quieto,\nescaneando el chip NFC",
        "FaceTec_idscan_nfc_status_weak_connection_message": "Intentemos\notro escaneo",
        "FaceTec_idscan_nfc_status_finished_with_success_message": "Escaneo de documentos\ncompletado",
        "FaceTec_idscan_nfc_status_finished_with_error_message": "No se puede leer\nel chip del pasaporte electrónico",
        "FaceTec_idscan_nfc_card_status_finished_with_error_message": "No se puede leer\nel chip del carnet",
        "FaceTec_idscan_nfc_status_skipped_message": "Escaneo NFC\nomitido",

        // Result Messages
        "FaceTec_result_success_message": "Validación de identidad completa",
        "FaceTec_result_facescan_upload_message": "Subiendo el escaneo 3D\nencriptado de tu rostro",
        "FaceTec_result_idscan_upload_message": "Subiendo el escaneo encriptado\n de tu carnet",
        "FaceTec_result_nfc_upload_message": "Subiendo\nla información NFC\nencriptada",
        "FaceTec_result_idscan_unsuccess_message": "La foto del carnet\nno coincide con el rostro del usuario",
        "FaceTec_result_idscan_success_front_side_message": "Escaneo de carnet completado",
        "FaceTec_result_idscan_success_front_side_back_next_message": "Lado frontal del carnet\nescaneado",
        "FaceTec_result_idscan_success_front_side_nfc_next_message": "Frente del carnet\nescaneado",
        "FaceTec_result_idscan_success_back_side_message": "Escaneo de carnet completado",
        "FaceTec_result_idscan_success_back_side_nfc_next_message": "Reverso del carnet\nescaneado",
        "FaceTec_result_idscan_success_passport_message": "Escaneo de pasaporte completado",
        "FaceTec_result_idscan_success_passport_nfc_next_message": "Pasaporte escaneado",
        "FaceTec_result_idscan_success_user_confirmation_message": "Escaneo de carnet con fotografía\ncompletado",
        "FaceTec_result_idscan_success_nfc_message": "Escaneo de carnet completado",
        "FaceTec_result_idscan_success_additional_review_message": "Captura de la fotografía de carnet\ncompletada",
        "FaceTec_result_idscan_skip_or_error_nfc_message": "Información de carnet\nsubida",
        "FaceTec_result_idscan_retry_face_did_not_match_message": "El rostro no coincide\nlo suficiente",
        "FaceTec_result_idscan_retry_id_not_fully_visible_message": "El carnet\nno es totalmente visible",
        "FaceTec_result_idscan_retry_ocr_results_not_good_enough_message": "El texto del carnet no es legible",
        "FaceTec_result_idscan_retry_id_type_not_supported_message": "No se admite este tipo de identificación\nUtiliza una identificación diferente",
        "FaceTec_result_idscan_retry_barcode_not_read_message": "No se pudo escanear el código de barras\nInténtalo de nuevo",

        // Retry - Official ID Photo
        "FaceTec_retry_official_id_photo_subheader_message": "La foto debe tener más calidad",
        "FaceTec_retry_official_id_photo_instruction_message": "Usa luz interior,\nsin sonreír, lentes con reflejos o sombrero",
        "FaceTec_retry_official_id_photo_your_image_label": "Tu imagen",
        "FaceTec_retry_official_id_photo_ideal_image_label": "Cara conforme",
    ]
}
