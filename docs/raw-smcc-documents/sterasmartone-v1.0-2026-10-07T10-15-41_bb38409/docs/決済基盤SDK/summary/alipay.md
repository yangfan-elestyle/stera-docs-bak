---
title: Alipay
excerpt: Alipayは、アント・フィナンシャル社のiOS, AndroidやWebブラウザで、簡単かつ安全に支払いができる決済サービスです。
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

Alipay アプリに遷移するために、Xcode の **PROJECT** → **TARGETS** にある **Info**タグ（或いは `Info.plist`）で、`LSApplicationQueriesSchemes` Key を追加してください。

```text
<string>alipay</string>
```

## iOS App の Callback URL Scheme について

stera smart one デフォルト *URL Scheme* については、[こちら](https://developer.elepay.io/docs/ios-sdk#section-1-url-scheme-の追加)をご参照ください。

# Android

アリペイを使うために、[アリペイのsdk](https://doc.open.alipay.com/doc2/detail.htm?treeId=54\&articleId=104509\&docType=1)をダウンロードし、プロジェクトのlibsフォルダーに配置します。

> 📘
>
> アリペイのsdk名はこのような形になります。\
> alipaySdk-15.6.8-20191021122455-noUtdid.aar

そして、アプリの`build.gradle`に、アリペイsdkの依存関係を追加します。

```groovy
dependencies {
  // ... other dependencies
  implementation files('libs/alipaySdk-20170725.jar')
}
```
