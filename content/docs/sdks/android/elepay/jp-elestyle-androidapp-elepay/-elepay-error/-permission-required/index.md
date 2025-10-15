---
title: PermissionRequired
---


data class [PermissionRequired](../)(val permissions: [List](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-list/index.html)&lt;[String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)&gt;) : [ElepayError](../../)

The required permissions are not granted for the current payment processing.

## Constructors

| | |
|---|---|
| [PermissionRequired](../-permission-required) | <br>constructor(permissions: [List](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-list/index.html)&lt;[String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)&gt;) |

## Properties

| Name | Summary |
|---|---|
| [permissions](../permissions) | <br>val [permissions](../permissions): [List](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-list/index.html)&lt;[String](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/index.html)&gt;<br>A list of permission strings that has not granted. The values of this list are the same as the ones in package [android.Manifest.permission](https://developer.android.com/reference/kotlin/android/Manifest.permission.html) |