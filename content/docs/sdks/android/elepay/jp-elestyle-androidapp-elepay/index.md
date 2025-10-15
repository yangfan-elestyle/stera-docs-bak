---
title: jp.elestyle.androidapp.elepay
---


## Types

| Name | Summary |
|---|---|
| [Elepay](-elepay/) | <br>object [Elepay](-elepay/)<br>Elepay SDK API |
| [ElepayConfiguration](-elepay-configuration/) | <br>class [ElepayConfiguration](-elepay-configuration/)(val apiKey: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html), val remoteHostBaseUrl: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html) = &quot;&quot;, val googlePayEnvironment: [GooglePayEnvironment](-google-pay-environment/)? = null, val languageKey: LanguageKey = LanguageKey.System, val theme: ElepayTheme = ElepayTheme.System)<br>The base configuration of elepay SDK. |
| [ElepayError](-elepay-error/) | <br>sealed class [ElepayError](-elepay-error/)<br>Defines the errors that the client may receive. |
| [ElepayResult](-elepay-result/) | <br>sealed class [ElepayResult](-elepay-result/)<br>The result of payment request. |
| [ElepayResultHandler](-elepay-result-handler/) | <br>typealias [ElepayResultHandler](-elepay-result-handler/) = ([ElepayResult](-elepay-result/)) -&gt; [Unit](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-unit/index.html)<br>Result handler type for the payment processing. |
| [ElepayResultListener](-elepay-result-listener/) | <br>fun interface [ElepayResultListener](-elepay-result-listener/)<br>Functional interface for notifying Elepay result. |
| [GooglePayEnvironment](-google-pay-environment/) | <br>enum [GooglePayEnvironment](-google-pay-environment/) : [Enum](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-enum/index.html)&lt;[GooglePayEnvironment](-google-pay-environment/)&gt; |
| [IsGooglePayReadyToUseListener](-is-google-pay-ready-to-use-listener/) | <br>fun interface [IsGooglePayReadyToUseListener](-is-google-pay-ready-to-use-listener/)<br>Functional interface for notifying result. |