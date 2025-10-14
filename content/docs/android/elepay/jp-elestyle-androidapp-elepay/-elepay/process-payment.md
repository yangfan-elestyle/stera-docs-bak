---
title: processPayment
---


@[JvmStatic](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.jvm/-jvm-static/index.html)

fun [processPayment](../process-payment)(chargeData: [JSONObject](https://developer.android.com/reference/kotlin/org/json/JSONObject.html), fromActivity: [Activity](https://developer.android.com/reference/kotlin/android/app/Activity.html), resultListener: [ElepayResultListener](../../-elepay-result-listener/)): [Boolean](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-boolean/index.html)

Process the payment request.

This is a Java compatible version.

#### Return

`true` for successfully parsed the payment data and handled the data to the processor.

#### Parameters

| | |
|---|---|
| chargeData | A JSON object that contains the payment data, data structure may be different from payment methods. |
| fromActivity | An [Activity](https://developer.android.com/reference/kotlin/android/app/Activity.html) instance used to redirect to show payment processing UI. |
| resultListener | The result handler |
@[JvmStatic](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.jvm/-jvm-static/index.html)

fun [processPayment](../process-payment)(chargeDataString: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html), fromActivity: [Activity](https://developer.android.com/reference/kotlin/android/app/Activity.html), resultListener: [ElepayResultListener](../../-elepay-result-listener/)): [Boolean](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-boolean/index.html)

Process the payment request.

Note: This method is supposed to be used when your project could neither use Kotlin nor support Java 8 lambda expression. If your project is based on Kotlin or can uses Java 8 lambda expressions, consider using the API that takes a [ElepayResultHandler](../../-elepay-result-handler/) callback.

#### Return

`true` for successfully parsed the payment data and handled the data to the processor.

#### Parameters

| | |
|---|---|
| chargeDataString | The raw string value of the charge data JSON object that contains the payment data. |
| fromActivity | An [Activity](https://developer.android.com/reference/kotlin/android/app/Activity.html) instance used to redirect to show payment processing UI. |
| resultListener | The result handler |
@[JvmStatic](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.jvm/-jvm-static/index.html)

fun [processPayment](../process-payment)(chargeDataString: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html), fromActivity: [Activity](https://developer.android.com/reference/kotlin/android/app/Activity.html), resultHandler: ([ElepayResult](../../-elepay-result/)) -&gt; [Unit](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-unit/index.html)): [Boolean](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-boolean/index.html)

Process the payment request.

#### Return

`true` for successfully parsed the payment data and passed the data to the processor.

#### Parameters

| | |
|---|---|
| chargeDataString | The raw string value of the charge data JSON object that contains the payment data. |
| fromActivity | An [Activity](https://developer.android.com/reference/kotlin/android/app/Activity.html) instance used to redirect to show payment processing UI. |
| resultHandler | The result handler |
@[JvmStatic](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.jvm/-jvm-static/index.html)

fun [processPayment](../process-payment)(chargeData: [JSONObject](https://developer.android.com/reference/kotlin/org/json/JSONObject.html), fromActivity: [Activity](https://developer.android.com/reference/kotlin/android/app/Activity.html), resultHandler: ([ElepayResult](../../-elepay-result/)) -&gt; [Unit](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-unit/index.html)): [Boolean](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-boolean/index.html)

Process the payment request.

#### Return

`true` for successfully parsed the payment data and passed the data to the processor.

#### Parameters

| | |
|---|---|
| chargeData | A JSON object that contains the payment data, data structure may be different from payment methods. |
| fromActivity | An [Activity](https://developer.android.com/reference/kotlin/android/app/Activity.html) instance used to redirect to show payment processing UI. |
| resultHandler | The result handler |