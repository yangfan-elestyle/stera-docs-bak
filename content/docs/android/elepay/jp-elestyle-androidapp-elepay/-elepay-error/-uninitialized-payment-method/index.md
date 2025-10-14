---
title: UninitializedPaymentMethod
---


data class [UninitializedPaymentMethod](../)(val errorCode: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html), val paymentMethod: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html), val message: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)) : [ElepayError](../../)

The specified payment method is not been initialized correctly. You may use the [errorCode](../error-code) for technical support.

## Constructors

| | |
|---|---|
| [UninitializedPaymentMethod](../-uninitialized-payment-method) | <br>constructor(errorCode: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html), paymentMethod: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html), message: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)) |

## Properties

| Name | Summary |
|---|---|
| [errorCode](../error-code) | <br>val [errorCode](../error-code): [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)<br>The error code indicates what the specific error occurred. You may use this value for our technical support. |
| [message](../message) | <br>val [message](../message): [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)<br>A simple brief message indicating what's going wrong. |
| [paymentMethod](../payment-method) | <br>val [paymentMethod](../payment-method): [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)<br>A string value refers to the payment method which has not initialized yet. |