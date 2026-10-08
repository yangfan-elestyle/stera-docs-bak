---
title: PayPal
excerpt: ''
deprecated: false
hidden: false
metadata:
  title: ''
  description: ''
  robots: index
next:
  description: ''
---
# 概要

## iOS App の Callback URL Scheme について

stera smart one デフォルト *URL Scheme* については、[こちら](https://developer.elepay.io/docs/ios-sdk#section-1-url-scheme-の追加)をご参照ください。

それ以外にも、あなたのアプリの *Bundle ID* から始まる PayPal 専用 *URL Scheme* を追加してください。\
[「stera smart one 管理画面」](https://dashboard.sterasmartone.com) > **開発設定** > **アプリ設定**にある **URL Scheme** > **PayPal** 項目を確認してください。

## iOS 9 及び以降のシステムについて

PayPal アプリに遷移するために、Xcode の **PROJECT** → **TARGETS** にある **Info**タグ（或いは `Info.plist`）で、`LSApplicationQueriesSchemes` Key を追加してください。

```text
<string>com.paypal.ppclient.touch.v1</string>
<string>com.paypal.ppclient.touch.v2</string>
```
