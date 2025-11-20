package com.soyio.soyiorndk

import android.app.Activity
import com.facebook.react.bridge.Promise
import com.facetec.sdk.FaceTecFaceScanProcessor
import com.facetec.sdk.FaceTecFaceScanResultCallback
import com.facetec.sdk.FaceTecIDScanProcessor
import com.facetec.sdk.FaceTecIDScanResult
import com.facetec.sdk.FaceTecIDScanResultCallback
import com.facetec.sdk.FaceTecIDScanStatus
import com.facetec.sdk.FaceTecSessionActivity
import com.facetec.sdk.FaceTecSessionResult
import com.facetec.sdk.FaceTecSessionStatus
import org.json.JSONObject

class SoyioValidationProcessor(
  activity: Activity,
  sessionToken: String,
  baseUrl: String,
  resourcePath: String,
  requestableToken: String,
  authToken: String,
  promise: Promise,
  private val onLivenessSuccess: (() -> Unit)? = null,
) : BaseFaceTecProcessor(promise, FACETEC_VALIDATION_ERROR), FaceTecFaceScanProcessor, FaceTecIDScanProcessor {

  private val requestService = FaceTecRequestService(
    baseUrl = baseUrl,
    resourcePath = resourcePath,
    requestableToken = requestableToken,
    authToken = authToken,
  )

  init {
    FaceTecSessionActivity.createAndLaunchSession(
      activity,
      this,
      this,
      sessionToken,
    )
  }

  override fun processSessionWhileFaceTecSDKWaits(
    sessionResult: FaceTecSessionResult,
    faceScanResultCallback: FaceTecFaceScanResultCallback,
  ) {
    if (sessionResult.status != FaceTecSessionStatus.SESSION_COMPLETED_SUCCESSFULLY) {
      faceScanResultCallback.cancel()
      resolveFailure(flowCancelledError)
      return
    }

    val payload = JSONObject().apply {
      put("face_scan", sessionResult.faceScanBase64)
      put("audit_trail_image", sessionResult.auditTrailCompressedBase64?.getOrNull(0) ?: "")
      put("low_quality_audit_trail_image", sessionResult.lowQualityAuditTrailCompressedBase64?.getOrNull(0) ?: "")
      put("session_id", sessionResult.sessionId ?: "")
    }

    requestService.post(
      endpoint = "liveness_check",
      payload = payload,
      sessionId = sessionResult.sessionId,
      progress = { progress -> faceScanResultCallback.uploadProgress(progress) },
      onSuccess = { json ->
        val error = json.optBoolean("error")
        val wasProcessed = json.optBoolean("wasProcessed")
        val errorMessage = json.optString("errorMessage")
        val scanResultBlob = json.optString("scanResultBlob")

        if (error || !wasProcessed || scanResultBlob.isNullOrBlank()) {
          faceScanResultCallback.cancel()
          resolveFailure(errorMessage.takeIf { it.isNotBlank() } ?: defaultError)
          return@post
        }

        faceScanResultCallback.proceedToNextStep(scanResultBlob)
        onLivenessSuccess?.invoke()
      },
      onFailure = {
        faceScanResultCallback.cancel()
        resolveFailure(it.ifBlank { defaultError })
      },
    )
  }

  override fun processIDScanWhileFaceTecSDKWaits(
    idScanResult: FaceTecIDScanResult,
    idScanResultCallback: FaceTecIDScanResultCallback,
  ) {
    if (idScanResult.status != FaceTecIDScanStatus.SUCCESS) {
      idScanResultCallback.cancel()
      resolveFailure(flowCancelledError)
      return
    }

    val payload = JSONObject().apply {
      put("id_scan", idScanResult.idScanBase64)
      put("session_id", idScanResult.sessionId ?: "")
      put("id_scan_front_image", idScanResult.frontImagesCompressedBase64?.getOrNull(0) ?: "")
      put("id_scan_back_image", idScanResult.backImagesCompressedBase64?.getOrNull(0) ?: "")
    }

    requestService.post(
      endpoint = "id_check",
      payload = payload,
      sessionId = idScanResult.sessionId,
      progress = { progress -> idScanResultCallback.uploadProgress(progress) },
      onSuccess = { json ->
        val error = json.optBoolean("error")
        val wasProcessed = json.optBoolean("wasProcessed")
        val errorMessage = json.optString("errorMessage")
        val scanResultBlob = json.optString("scanResultBlob")

        if (error || !wasProcessed || scanResultBlob.isNullOrBlank()) {
          idScanResultCallback.cancel()
          resolveFailure(errorMessage.takeIf { it.isNotBlank() } ?: defaultError)
          return@post
        }

        idScanResultCallback.proceedToNextStep(scanResultBlob)
        resolveSuccess()
      },
      onFailure = {
        idScanResultCallback.cancel()
        resolveFailure(it.ifBlank { defaultError })
      },
    )
  }

  companion object {
    private const val FACETEC_VALIDATION_ERROR = "FACETEC_VALIDATION_ERROR"
  }
}
