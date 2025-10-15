---
title: UnsupportedPaymentMethod
---


data class [UnsupportedPaymentMethod](../)(val paymentMethod: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)) : [ElepayError](../../)

The specified payment method is not supported.

## Constructors

| | |
|---|---|
| [UnsupportedPaymentMethod](../-unsupported-payment-method) | <br>constructor(paymentMethod: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)) |

## Properties

| Name | Summary |
|---|---|
| [paymentMethod](../payment-method) | <br>val [paymentMethod](../payment-method): [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)<br>The payment method which is not supported yet. |