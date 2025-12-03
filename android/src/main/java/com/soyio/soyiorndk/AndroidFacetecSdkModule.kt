package com.soyio.soyiorndk

import android.app.Activity
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facetec.sdk.FaceTecSDK

class AndroidFacetecSdkModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private var isInitialized = false

  override fun getName(): String = NAME

  @ReactMethod
  fun addListener(eventName: String) {
    // No-op: required for NativeEventEmitter support
  }

  @ReactMethod
  fun removeListeners(count: Int) {
    // No-op
  }

  @ReactMethod
  fun initialize(options: ReadableMap, promise: Promise) {
    if (isInitialized) {
      val result = Arguments.createMap().apply { putBoolean("success", true) }
      promise.resolve(result)
      return
    }

    val productionKeyText = options.getNullableString(MOBILE_PRODUCTION_KEY_TEXT, promise) ?: ""
    val deviceKeyIdentifier = options.getRequiredString(DEVICE_KEY_IDENTIFIER, promise) ?: return
    val publicFaceScanEncryptionKey = options.getRequiredString(PUBLIC_FACE_SCAN_KEY, promise) ?: return

    val activity: Activity? = currentActivity
    val context = activity ?: reactApplicationContext

    val initializeSdk = {
      val theme = if (options.hasKey(THEME) && !options.isNull(THEME)) options.getMap(THEME) else null
      FacetecConfig.apply(reactApplicationContext, theme)

      val callback = { successful: Boolean ->
        isInitialized = successful
        if (successful) {
          val result = Arguments.createMap().apply { putBoolean("success", true) }
          promise.resolve(result)
        } else {
          val result = Arguments.createMap().apply {
            putBoolean("success", false)
            putString("error", "FaceTec SDK did not finish initialization. Verify the provided keys and device settings.")
          }
          promise.resolve(result)
        }
      }

      if (productionKeyText.isBlank()) {
        FaceTecSDK.initializeInDevelopmentMode(
          context,
          deviceKeyIdentifier,
          publicFaceScanEncryptionKey,
          callback,
        )
      } else {
        FaceTecSDK.initializeInProductionMode(
          context,
          productionKeyText,
          deviceKeyIdentifier,
          publicFaceScanEncryptionKey,
          callback,
        )
      }
    }

    if (UiThreadUtil.isOnUiThread()) {
      initializeSdk()
    } else {
      UiThreadUtil.runOnUiThread(initializeSdk)
    }
  }

  @ReactMethod
  fun initializeFaceTecSDK(config: ReadableMap, promise: Promise) {
    val mapped = Arguments.createMap().apply {
      putString(MOBILE_PRODUCTION_KEY_TEXT, config.getString("mobileProductionKey") ?: "")
      putString(DEVICE_KEY_IDENTIFIER, config.getString("deviceKey") ?: "")
      putString(PUBLIC_FACE_SCAN_KEY, config.getString("publicKey") ?: "")
      if (config.hasKey("theme") && !config.isNull("theme")) {
        putMap(THEME, config.getMap("theme"))
      }
    }
    initialize(mapped, promise)
  }

  @ReactMethod
  fun startLivenessSession(options: ReadableMap, promise: Promise) {
    if (!isInitialized) {
      promise.reject(FACETEC_NOT_INITIALIZED, "Initialize FaceTec SDK before starting a session.")
      return
    }

    val sessionToken = options.getRequiredString(SESSION_TOKEN, promise) ?: return
    val requestableToken = options.getRequiredString(REQUESTABLE_TOKEN, promise) ?: return
    val resourcePath = options.getRequiredString(RESOURCE_PATH, promise) ?: return
    val baseUrl = options.getRequiredString(BASE_URL, promise) ?: return
    val authToken = options.getRequiredString(AUTH_TOKEN, promise) ?: return
    val isIdOnly = if (options.hasKey(IS_ID_ONLY)) options.getBoolean(IS_ID_ONLY) else false

    val activity: Activity? = currentActivity
    if (activity == null) {
      promise.reject(NO_ACTIVITY, "Unable to access current Activity to show FaceTec UI.")
      return
    }

    if (isIdOnly) {
      SoyioIdOnlyProcessor(
        activity,
        sessionToken,
        baseUrl,
        resourcePath,
        requestableToken,
        authToken,
        promise,
      )
    } else {
      SoyioValidationProcessor(
        activity,
        sessionToken,
        baseUrl,
        resourcePath,
        requestableToken,
        authToken,
        promise,
        { sendEvent(LIVENESS_SUCCESS_EVENT, null) },
      )
    }
  }

  @ReactMethod
  fun startLivenessAndIDVerification(config: ReadableMap, promise: Promise) {
    startVerification(config, promise, false)
  }

  @ReactMethod
  fun startIDOnlyVerification(config: ReadableMap, promise: Promise) {
    startVerification(config, promise, true)
  }

  private fun startVerification(config: ReadableMap, promise: Promise, isIdOnly: Boolean) {
    val facetecToken = config.getString("facetecSessionToken")
    val soyioToken = config.getString("soyioSessionToken")
    val requestableToken = config.getString("disclosureRequestToken")
    val baseUrl = config.getString("baseUrl")

    if (facetecToken.isNullOrBlank() || soyioToken.isNullOrBlank() || requestableToken.isNullOrBlank() || baseUrl.isNullOrBlank()) {
      promise.reject(FACETEC_INVALID_CONFIG, "Invalid FaceTec verification configuration.")
      return
    }

    val resourcePath = try {
      mapTokenToResourcePath(requestableToken)
    } catch (error: IllegalArgumentException) {
      promise.reject(FACETEC_INVALID_CONFIG, error.message)
      return
    }

    val options = Arguments.createMap().apply {
      putString(SESSION_TOKEN, facetecToken)
      putString(REQUESTABLE_TOKEN, requestableToken)
      putString(RESOURCE_PATH, resourcePath)
      putString(BASE_URL, baseUrl)
      putString(AUTH_TOKEN, soyioToken)
      putBoolean(IS_ID_ONLY, isIdOnly)
    }

    startLivenessSession(options, promise)
  }

  private fun ReadableMap.getRequiredString(key: String, promise: Promise): String? {
    if (!hasKey(key)) {
      promise.reject(MISSING_OPTION, "Missing required FaceTec initialization field: $key")
      return null
    }

    val value = getString(key)
    if (value.isNullOrBlank()) {
      promise.reject(MISSING_OPTION, "Field '$key' must be a non-empty string")
      return null
    }

    return value
  }

  private fun ReadableMap.getNullableString(key: String, promise: Promise): String? {
    if (!hasKey(key)) {
      return null
    }

    return getString(key)
  }

  companion object {
    const val NAME = "AndroidFacetecSdk"
    private const val MOBILE_PRODUCTION_KEY_TEXT = "mobileProductionKeyText"
    private const val DEVICE_KEY_IDENTIFIER = "deviceKeyIdentifier"
    private const val PUBLIC_FACE_SCAN_KEY = "publicFaceScanEncryptionKey"
    private const val FACETEC_INIT_FAILED = "FACETEC_INIT_FAILED"
    private const val MISSING_OPTION = "FACETEC_INIT_OPTION_MISSING"
    private const val FACETEC_NOT_INITIALIZED = "FACETEC_NOT_INITIALIZED"
    private const val NO_ACTIVITY = "FACETEC_NO_ACTIVITY"
    private const val SESSION_TOKEN = "sessionToken"
    private const val REQUESTABLE_TOKEN = "requestableToken"
    private const val RESOURCE_PATH = "resourcePath"
    private const val BASE_URL = "baseUrl"
    private const val AUTH_TOKEN = "authToken"
    private const val IS_ID_ONLY = "isIdOnly"
    private const val THEME = "theme"
    private const val FACETEC_INVALID_CONFIG = "FACETEC_INVALID_CONFIG"
    private const val LIVENESS_SUCCESS_EVENT = "onLivenessSuccess"
    private val TOKEN_PREFIXES = mapOf(
      "dreq_" to "disclosure_requests",
      "dsreq_" to "data_subject_requests",
      "authreq_" to "auth_requests",
      "va_" to "validation_attempts",
      "aa_" to "auth_attempts",
      "sa_" to "signature_attempts",
    )
  }

  private fun mapTokenToResourcePath(token: String): String {
    return TOKEN_PREFIXES.entries.firstOrNull { token.startsWith(it.key) }?.value
      ?: throw IllegalArgumentException("Unrecognized token prefix for $token")
  }

  private fun sendEvent(event: String, params: WritableMap?) {
    reactApplicationContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(event, params)
  }
}
