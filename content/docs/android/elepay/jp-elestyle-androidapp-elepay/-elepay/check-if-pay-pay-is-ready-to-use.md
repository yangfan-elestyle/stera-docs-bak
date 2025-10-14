---
title: checkIfPayPayIsReadyToUse
---


@[JvmStatic](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.jvm/-jvm-static/index.html)

fun [checkIfPayPayIsReadyToUse](../check-if-pay-pay-is-ready-to-use)(activity: [Activity](https://developer.android.com/reference/kotlin/android/app/Activity.html)): [Boolean](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-boolean/index.html)

Check if the PayPay app could be open for the payment processing.

User may need this method before showing PayPay payment method. Because PayPay currently only supports in-app processing, the PayPay app is required for PayPay payment processing.