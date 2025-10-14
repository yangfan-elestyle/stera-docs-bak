---
title: processWechatPayResponse
---


@[JvmStatic](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.jvm/-jvm-static/index.html)

fun [processWechatPayResponse](../process-wechat-pay-response)(baseResponse: BaseResp)

Process the Wechat Pay response explicitly.

When start the Wechat Pay from elepay SDK and you have your own customised WXPayEntryActivity for other purpose, you can pass the response here to let elepay handle the result properly.

#### Parameters

| | |
|---|---|
| baseResponse | The response instance passed into WXPayEntryActivity.onResp |