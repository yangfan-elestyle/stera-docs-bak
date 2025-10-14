---
title: ElepayError
---


sealed class [ElepayError](../)

Defines the errors that the client may receive.

#### Inheritors

| |
|---|
| [SDKNotSetup](-s-d-k-not-setup/) |
| [UnsupportedPaymentMethod](-unsupported-payment-method/) |
| [AlreadyMakingPayment](-already-making-payment/) |
| [InvalidPayload](-invalid-payload/) |
| [UninitializedPaymentMethod](-uninitialized-payment-method/) |
| [SystemError](-system-error/) |
| [PaymentFailure](-payment-failure/) |
| [PermissionRequired](-permission-required/) |

## Types

| Name | Summary |
|---|---|
| [AlreadyMakingPayment](-already-making-payment/) | <br>data class [AlreadyMakingPayment](-already-making-payment/)(val paymentId: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)) : [ElepayError](../)<br>The specified payment is in processing now. |
| [InvalidPayload](-invalid-payload/) | <br>data class [InvalidPayload](-invalid-payload/)(val errorCode: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html), val message: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)) : [ElepayError](../)<br>The data of the payment is invalid. You may use the [errorCode](-invalid-payload/error-code) for technical support. |
| [PaymentFailure](-payment-failure/) | <br>data class [PaymentFailure](-payment-failure/)(val errorCode: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html), val message: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)) : [ElepayError](../)<br>Payment is failed. |
| [PermissionRequired](-permission-required/) | <br>data class [PermissionRequired](-permission-required/)(val permissions: [List](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-list/index.html)&lt;[String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)&gt;) : [ElepayError](../)<br>The required permissions are not granted for the current payment processing. |
| [SDKNotSetup](-s-d-k-not-setup/) | <br>data class [SDKNotSetup](-s-d-k-not-setup/)(val errorCode: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html), val message: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)) : [ElepayError](../)<br>The SDK has not been initialized correctly. Make sure the `Elepay.setup` is correctly called. |
| [SystemError](-system-error/) | <br>data class [SystemError](-system-error/)(val errorCode: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html), val message: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)) : [ElepayError](../)<br>An internal system error. |
| [UninitializedPaymentMethod](-uninitialized-payment-method/) | <br>data class [UninitializedPaymentMethod](-uninitialized-payment-method/)(val errorCode: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html), val paymentMethod: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html), val message: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)) : [ElepayError](../)<br>The specified payment method is not been initialized correctly. You may use the [errorCode](-uninitialized-payment-method/error-code) for technical support. |
| [UnsupportedPaymentMethod](-unsupported-payment-method/) | <br>data class [UnsupportedPaymentMethod](-unsupported-payment-method/)(val paymentMethod: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)) : [ElepayError](../)<br>The specified payment method is not supported. |