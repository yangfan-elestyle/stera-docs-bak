---
title: au PAY
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
# iOS

## iOS 9 及び以降のシステムについて

SDK for iOS v3.2.1 から、下記 Scheme を LSApplicationQueriesSchemes に追加しなくでも利用できます。実際に決済アプリがインストールされてない場合は、SDK から [エラーコード](doc:error-code) 「10110」が返信します。

SDK for iOS v3.2.1 以前の場合、au PAY アプリに遷移するために、Xcode の **PROJECT** → **TARGETS** にある **Info**タグ（或いは `Info.plist`）で、`LSApplicationQueriesSchemes` Key を追加してください。

```xml
<string>auwallet</string>
```

## iOS App の Callback URL Scheme について

stera smart one デフォルト _URL Scheme_ については、[こちら](https://developer.elepay.io/docs/ios-sdk#section-1-url-scheme-の追加)をご参照ください。

# Android

特別な処理が必要ありません
