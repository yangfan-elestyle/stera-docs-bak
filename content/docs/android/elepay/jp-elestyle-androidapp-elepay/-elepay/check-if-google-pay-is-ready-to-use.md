---
title: checkIfGooglePayIsReadyToUse
---


@[JvmStatic](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.jvm/-jvm-static/index.html)

fun [checkIfGooglePayIsReadyToUse](../check-if-google-pay-is-ready-to-use)(activity: [Activity](https://developer.android.com/reference/kotlin/android/app/Activity.html), resultListener: [IsGooglePayReadyToUseListener](../../-is-google-pay-ready-to-use-listener/)): Job

@[JvmStatic](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.jvm/-jvm-static/index.html)

fun [checkIfGooglePayIsReadyToUse](../check-if-google-pay-is-ready-to-use)(activity: [Activity](https://developer.android.com/reference/kotlin/android/app/Activity.html), resultHandler: ([Boolean](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-boolean/index.html)) -&gt; [Unit](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-unit/index.html)): Job

suspend fun [checkIfGooglePayIsReadyToUse](../check-if-google-pay-is-ready-to-use)(activity: [Activity](https://developer.android.com/reference/kotlin/android/app/Activity.html)): [Boolean](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-boolean/index.html)

Check if Google Pay is ready to use.

Make sure call this method after [setup](../setup).

The checking is performed asynchronously. This method do not verify if the app's environment is good to use Google Pay.