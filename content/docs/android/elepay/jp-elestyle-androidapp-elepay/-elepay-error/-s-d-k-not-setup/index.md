---
title: SDKNotSetup
---


data class [SDKNotSetup](../)(val errorCode: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html), val message: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)) : [ElepayError](../../)

The SDK has not been initialized correctly. Make sure the `Elepay.setup` is correctly called.

## Constructors

| | |
|---|---|
| [SDKNotSetup](../-s-d-k-not-setup) | <br>constructor(errorCode: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html), message: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)) |

## Properties

| Name | Summary |
|---|---|
| [errorCode](../error-code) | <br>val [errorCode](../error-code): [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)<br>The error code. |
| [message](../message) | <br>val [message](../message): [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)<br>The helping message may or may not be empty indicating the state. |