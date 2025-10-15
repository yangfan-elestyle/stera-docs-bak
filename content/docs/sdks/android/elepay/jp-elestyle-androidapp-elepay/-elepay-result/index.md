---
title: ElepayResult
---


sealed class [ElepayResult](../)

The result of payment request.

#### Inheritors

| |
|---|
| [Succeeded](-succeeded/) |
| [Failed](-failed/) |
| [Canceled](-canceled/) |

## Types

| Name | Summary |
|---|---|
| [Canceled](-canceled/) | <br>class [Canceled](-canceled/)(val paymentId: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)) : [ElepayResult](../)<br>The payment is canceled. |
| [Failed](-failed/) | <br>class [Failed](-failed/)(val paymentId: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)?, val error: [ElepayError](../../-elepay-error/)) : [ElepayResult](../)<br>The payment failed, with an associated error object. |
| [Succeeded](-succeeded/) | <br>class [Succeeded](-succeeded/)(val paymentId: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)) : [ElepayResult](../)<br>The payment process succeeded. |