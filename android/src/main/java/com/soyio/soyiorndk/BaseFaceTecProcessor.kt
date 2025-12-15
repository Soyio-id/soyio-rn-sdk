package com.soyio.soyiorndk

import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import java.util.concurrent.atomic.AtomicBoolean

abstract class BaseFaceTecProcessor(
  private val promise: Promise,
  private val errorCode: String,
) {
  private val mainHandler = Handler(Looper.getMainLooper())
  private val promiseCompleted = AtomicBoolean(false)
  protected val defaultError = "unknown_error"
  protected val flowCancelledError = "FLOW_CANCELLED"

  protected fun resolveSuccess() {
    if (promiseCompleted.compareAndSet(false, true)) {
      mainHandler.post {
        val result = Arguments.createMap().apply { putBoolean("success", true) }
        promise.resolve(result)
      }
    }
  }

  protected fun resolveFailure(message: String = defaultError) {
    if (promiseCompleted.compareAndSet(false, true)) {
      mainHandler.post {
        val result = Arguments.createMap().apply {
          putBoolean("success", false)
          putString("error", message)
        }
        promise.resolve(result)
      }
    }
  }

  protected fun reject(message: String) {
    if (promiseCompleted.compareAndSet(false, true)) {
      mainHandler.post { promise.reject(errorCode, message) }
    }
  }
}
