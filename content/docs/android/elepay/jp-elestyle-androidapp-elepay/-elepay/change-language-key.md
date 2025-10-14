---
title: changeLanguageKey
---


@[JvmStatic](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.jvm/-jvm-static/index.html)

fun [changeLanguageKey](../change-language-key)(languageKey: LanguageKey)

Change the language which is used by elepay SDK internally.

This change only takes effects **before** the payment processing. After calling [processPayment](../process-payment), all changes to the LanguageKey will be ignored.

#### Parameters

| | |
|---|---|
| languageKey | The new language key to be applied by the elepay SDK. |