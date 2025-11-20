package com.soyio.soyiorndk

import android.app.Activity
import com.facebook.react.bridge.Promise
import com.facetec.sdk.FaceTecIDScanProcessor
import com.facetec.sdk.FaceTecIDScanResult
import com.facetec.sdk.FaceTecIDScanResultCallback
import com.facetec.sdk.FaceTecIDScanStatus
import com.facetec.sdk.FaceTecSessionActivity
import org.json.JSONObject

class SoyioIdOnlyProcessor(
  activity: Activity,
  sessionToken: String,
  baseUrl: String,
  resourcePath: String,
  requestableToken: String,
  authToken: String,
  promise: Promise,
) : BaseFaceTecProcessor(promise, FACETEC_ID_ERROR), FaceTecIDScanProcessor {

  private val requestService = FaceTecRequestService(
    baseUrl = baseUrl,
    resourcePath = resourcePath,
    requestableToken = requestableToken,
    authToken = authToken,
  )

  init {
    FaceTecSessionActivity.createAndLaunchSession(activity, this, sessionToken)
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
      networkErrorMessage = "Network error while uploading FaceTec ID scan.",
      onSuccess = { json ->
        val error = json.optBoolean("error")
        val wasProcessed = json.optBoolean("wasProcessed")
        val scanResultBlob = json.optString("scanResultBlob")
        val errorMessage = json.optString("errorMessage")

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
    private const val FACETEC_ID_ERROR = "FACETEC_ID_ERROR"
  }
}
