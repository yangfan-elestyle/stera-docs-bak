---
title: Failed
---


class [Failed](../)(val paymentId: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)?, val error: [ElepayError](../../../-elepay-error/)) : [ElepayResult](../../)

The payment failed, with an associated error object.

## Constructors

| | |
|---|---|
| [Failed](../-failed) | <br>constructor(paymentId: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)?, error: [ElepayError](../../../-elepay-error/)) |

## Properties

| Name | Summary |
|---|---|
| [error](../error) | <br>val [error](../error): [ElepayError](../../../-elepay-error/)<br>The specific [ElepayError](../../../-elepay-error/) that occurred. Uses this value to retrieve the error's detail. |
| [paymentId](../payment-id) | <br>val [paymentId](../payment-id): [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)?<br>The id of the payment which is failed processing. This value could be `null` if the error occurred before the payment id could be retrieved. |