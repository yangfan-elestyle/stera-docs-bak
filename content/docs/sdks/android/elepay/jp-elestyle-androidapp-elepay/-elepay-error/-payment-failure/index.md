---
title: PaymentFailure
---


data class [PaymentFailure](../)(val errorCode: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html), val message: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)) : [ElepayError](../../)

Payment is failed.

You may use the [errorCode](../error-code) for technical support.

## Constructors

| | |
|---|---|
| [PaymentFailure](../-payment-failure) | <br>constructor(errorCode: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html), message: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)) |

## Properties

| Name | Summary |
|---|---|
| [errorCode](../error-code) | <br>val [errorCode](../error-code): [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)<br>The error code indicates what the specific error occurred. You may use this value for our technical support. |
| [message](../message) | <br>val [message](../message): [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)<br>A message associated with this error. |