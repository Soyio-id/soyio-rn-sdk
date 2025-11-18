package com.soyio.soyiorndk

import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.Promise
import java.util.concurrent.atomic.AtomicBoolean

abstract class BaseFaceTecProcessor(
  private val promise: Promise,
  private val errorCode: String,
) {
  private val mainHandler = Handler(Looper.getMainLooper())
  private val promiseCompleted = AtomicBoolean(false)

  protected fun resolve(value: Boolean) {
    if (promiseCompleted.compareAndSet(false, true)) {
      mainHandler.post { promise.resolve(value) }
    }
  }

  protected fun reject(message: String) {
    if (promiseCompleted.compareAndSet(false, true)) {
      mainHandler.post { promise.reject(errorCode, message) }
    }
  }
}
