---
title: AlreadyMakingPayment
---


data class [AlreadyMakingPayment](../)(val paymentId: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)) : [ElepayError](../../)

The specified payment is in processing now.

## Constructors

| | |
|---|---|
| [AlreadyMakingPayment](../-already-making-payment) | <br>constructor(paymentId: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)) |

## Properties

| Name | Summary |
|---|---|
| [paymentId](../payment-id) | <br>val [paymentId](../payment-id): [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)<br>The id of the payment that is currently in processing. |