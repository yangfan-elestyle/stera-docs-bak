---
title: InnerServerAPIClientWrap
---


@[RestrictTo](https://developer.android.com/reference/kotlin/androidx/annotation/RestrictTo.html)(value = [[RestrictTo.Scope.LIBRARY_GROUP](https://developer.android.com/reference/kotlin/androidx/annotation/RestrictTo.Scope.LIBRARY_GROUP.html)])

object [InnerServerAPIClientWrap](../)

## Types

| Name | Summary |
|---|---|
| [InnerException](-inner-exception/) | <br>class [InnerException](-inner-exception/)(val code: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html), message: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)) : [Exception](https://developer.android.com/reference/kotlin/java/lang/Exception.html) |

## Functions

| Name | Summary |
|---|---|
| [fetchCommonHeaders](../fetch-common-headers) | <br>fun [fetchCommonHeaders](../fetch-common-headers)(pKey: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html) = ConfigManager.appKey): [Map](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-map/index.html)&lt;[String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html), [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)&gt; |
| [get](../get) | <br>fun [get](../get)(url: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html), headers: [Map](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-map/index.html)&lt;[String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html), [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)&gt; = mapOf(), params: [Map](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-map/index.html)&lt;[String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html), [Any](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-any/index.html)&gt; = mapOf(), appendElepayHeader: [Boolean](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-boolean/index.html) = true): [Result](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-result/index.html)&lt;[JSONObject](https://developer.android.com/reference/kotlin/org/json/JSONObject.html)&gt; |
| [post](../post) | <br>fun [post](../post)(url: [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html), headers: [Map](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-map/index.html)&lt;[String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html), [String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)&gt; = mapOf(), json: [JSONObject](https://developer.android.com/reference/kotlin/org/json/JSONObject.html), appendElepayHeader: [Boolean](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-boolean/index.html) = true): [Result](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-result/index.html)&lt;[JSONObject](https://developer.android.com/reference/kotlin/org/json/JSONObject.html)&gt; |