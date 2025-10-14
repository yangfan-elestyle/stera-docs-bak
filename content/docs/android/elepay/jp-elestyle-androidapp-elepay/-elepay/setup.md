---
title: setup
---


@[JvmStatic](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.jvm/-jvm-static/index.html)

fun [setup](../setup)(config: [ElepayConfiguration](../../-elepay-configuration/))

Setup elepay SDK.

This method should be called before calling any other elepay SDK methods. The configuration passed to elepay SDK will be used only once, and all configurations are not mutable.

#### Parameters

| | |
|---|---|
| config | See [ElepayConfiguration](../../-elepay-configuration/) for details. |