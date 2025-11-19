package com.soyio.soyiorndk

import com.facetec.sdk.FaceTecSDK
import okhttp3.Call
import okhttp3.Callback
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import okio.Buffer
import okio.ForwardingSink
import okio.buffer
import org.json.JSONObject
import java.io.IOException
import java.util.concurrent.TimeUnit

internal class FaceTecRequestService(
  baseUrl: String,
  private val resourcePath: String,
  private val requestableToken: String,
  private val authToken: String,
) {
  private val normalizedBaseUrl = if (baseUrl.endsWith('/')) baseUrl.dropLast(1) else baseUrl

  fun post(
    endpoint: String,
    payload: JSONObject,
    sessionId: String?,
    progress: ((Float) -> Unit)? = null,
    networkErrorMessage: String = DEFAULT_NETWORK_ERROR,
    onSuccess: (JSONObject) -> Unit,
    onFailure: (String) -> Unit,
  ) {
    val mediaType = "application/json; charset=utf-8".toMediaTypeOrNull()
    val requestBody = payload.toString().toRequestBody(mediaType)
    val bodyWithProgress = progress?.let { createProgressBody(requestBody, it) } ?: requestBody

    val request = Request.Builder()
      .url(buildUrl(endpoint))
      .header("Content-Type", "application/json")
      .header("Authorization", authToken)
      .header("X-Facetec-Session-Id", sessionId ?: "")
      .header(
        "X-Facetec-User-Agent",
        FaceTecSDK.createFaceTecAPIUserAgentString(sessionId ?: ""),
      )
      .post(bodyWithProgress)
      .build()

    client.newCall(request).enqueue(object : Callback {
      override fun onFailure(call: Call, e: IOException) {
        onFailure(e.message ?: networkErrorMessage)
      }

      override fun onResponse(call: Call, response: Response) {
        response.use {
          val responseBody = response.body?.string().orEmpty()
          if (!response.isSuccessful) {
            onFailure("FaceTec API error ${response.code}: $responseBody")
            return
          }

          try {
            val json = JSONObject(responseBody)
            onSuccess(json)
          } catch (exception: Exception) {
            onFailure(exception.message ?: "Failed to parse FaceTec response.")
          }
        }
      }
    })
  }

  private fun buildUrl(endpoint: String): String {
    return "$normalizedBaseUrl/api/internal/$resourcePath/$requestableToken/facetec/$endpoint"
  }

  private fun createProgressBody(originalBody: RequestBody, onProgress: (Float) -> Unit): RequestBody {
    return object : RequestBody() {
      override fun contentType() = originalBody.contentType()
      override fun contentLength() = originalBody.contentLength()

      override fun writeTo(sink: okio.BufferedSink) {
        val countingSink = object : ForwardingSink(sink) {
          var bytesWritten = 0L
          val totalLength = contentLength()
          override fun write(source: Buffer, byteCount: Long) {
            super.write(source, byteCount)
            bytesWritten += byteCount
            if (totalLength > 0) {
              onProgress(bytesWritten.toFloat() / totalLength.toFloat())
            }
          }
        }

        val bufferedSink = countingSink.buffer()
        originalBody.writeTo(bufferedSink)
        bufferedSink.flush()
      }
    }
  }

  companion object {
    private val client = OkHttpClient.Builder()
      .connectTimeout(60, TimeUnit.SECONDS)
      .readTimeout(60, TimeUnit.SECONDS)
      .writeTimeout(60, TimeUnit.SECONDS)
      .build()

    private const val DEFAULT_NETWORK_ERROR = "Network error while contacting FaceTec endpoint."
  }
}
