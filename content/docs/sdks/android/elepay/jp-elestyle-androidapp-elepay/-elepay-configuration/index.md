---
title: ElepayConfiguration
---


class [ElepayConfiguration](../)(val apiKey: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html), val remoteHostBaseUrl: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html) = &quot;&quot;, val googlePayEnvironment: [GooglePayEnvironment](../../-google-pay-environment/)? = null, val languageKey: LanguageKey = LanguageKey.System, val theme: ElepayTheme = ElepayTheme.System)

The base configuration of elepay SDK.

## Constructors

| | |
|---|---|
| [ElepayConfiguration](../-elepay-configuration) | <br>constructor(apiKey: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html), remoteHostBaseUrl: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html) = &quot;&quot;, googlePayEnvironment: [GooglePayEnvironment](../../-google-pay-environment/)? = null, languageKey: LanguageKey = LanguageKey.System, theme: ElepayTheme = ElepayTheme.System) |

## Properties

| Name | Summary |
|---|---|
| [apiKey](../api-key) | <br>val [apiKey](../api-key): [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)<br>The key that can be retrieved from your dashboard page. |
| [googlePayEnvironment](../google-pay-environment) | <br>val [googlePayEnvironment](../google-pay-environment): [GooglePayEnvironment](../../-google-pay-environment/)? = null<br>The environment of Google Pay. |
| [languageKey](../language-key) | <br>val [languageKey](../language-key): LanguageKey<br>The language used by the elepay sdk. |
| [remoteHostBaseUrl](../remote-host-base-url) | <br>val [remoteHostBaseUrl](../remote-host-base-url): [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)<br>The url used as the base url when accessing remote resources/APIs. |
| [theme](../theme) | <br>val [theme](../theme): ElepayTheme<br>The theme of ui components used by elepay SDK. |