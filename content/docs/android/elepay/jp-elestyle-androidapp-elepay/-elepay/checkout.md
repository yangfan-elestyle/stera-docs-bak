---
title: checkout
---


@[JvmStatic](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.jvm/-jvm-static/index.html)

fun [checkout](../checkout)(checkoutJsonString: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html), fromActivity: [Activity](https://developer.android.com/reference/kotlin/android/app/Activity.html), resultListener: [ElepayResultListener](../../-elepay-result-listener/))

Process the checkout request.

Note: This method is supposed to be used when your project could neither use Kotlin nor support Java 8 lambda expression. If your project is based on Kotlin or can uses Java 8 lambda expressions, consider using the API that takes a [ElepayResultHandler](../../-elepay-result-handler/) callback.

#### Parameters

| | |
|---|---|
| checkoutJsonString | The raw string value of the checkout JSON object. |
| fromActivity | An [Activity](https://developer.android.com/reference/kotlin/android/app/Activity.html) instance used to show payment processing UI. |
| resultListener | The result handler |
@[JvmStatic](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.jvm/-jvm-static/index.html)

fun [checkout](../checkout)(checkoutJson: [JSONObject](https://developer.android.com/reference/kotlin/org/json/JSONObject.html), fromActivity: [Activity](https://developer.android.com/reference/kotlin/android/app/Activity.html), resultListener: [ElepayResultListener](../../-elepay-result-listener/))

Process the checkout request.

Note: This method is supposed to be used when your project could neither use Kotlin nor support Java 8 lambda expression. If your project is based on Kotlin or can uses Java 8 lambda expressions, consider using the API that takes a [ElepayResultHandler](../../-elepay-result-handler/) callback.

#### Parameters

| | |
|---|---|
| checkoutJson | A JSON object contains the checkout data. |
| fromActivity | An [Activity](https://developer.android.com/reference/kotlin/android/app/Activity.html) instance used to show payment processing UI. |
| resultListener | The result handler |
@[JvmStatic](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.jvm/-jvm-static/index.html)

fun [checkout](../checkout)(checkoutJsonString: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html), fromActivity: [Activity](https://developer.android.com/reference/kotlin/android/app/Activity.html), resultHandler: ([ElepayResult](../../-elepay-result/)) -&gt; [Unit](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-unit/index.html))

Process the checkout request.

#### Parameters

| | |
|---|---|
| checkoutJsonString | A string value represents the JSON object which contains the checkout data. |
| fromActivity | An [Activity](https://developer.android.com/reference/kotlin/android/app/Activity.html) instance used to show processing UI. |
| resultHandler | The result handler |
@[JvmStatic](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.jvm/-jvm-static/index.html)

fun [checkout](../checkout)(checkoutJson: [JSONObject](https://developer.android.com/reference/kotlin/org/json/JSONObject.html), fromActivity: [Activity](https://developer.android.com/reference/kotlin/android/app/Activity.html), resultHandler: ([ElepayResult](../../-elepay-result/)) -&gt; [Unit](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-unit/index.html))

Process the checkout request.

#### Parameters

| | |
|---|---|
| checkoutJson | A JSON object contains the checkout data. |
| fromActivity | An [Activity](https://developer.android.com/reference/kotlin/android/app/Activity.html) instance used to show processing UI. |
| resultHandler | The result handler |