---
title: Union Pay（銀聯雲閃付）
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

## iOS 9 及び以降のシステムについて

Union Pay 関連アプリに遷移するために、Xcode の **PROJECT** → **TARGETS** にある **Info**タグ（或いは `Info.plist`）で、`LSApplicationQueriesSchemes` Key を追加してください。

```text
<string>uppaysdk</string>
 <string>uppaywallet</string>
 <string>uppayx1</string>
 <string>uppayx2</string>
 <string>uppayx3</string>
```

## iOS App の Callback URL Scheme について

stera smart one デフォルト *URL Scheme* については、[こちら](https://developer.elepay.io/docs/ios-sdk#section-1-url-scheme-の追加)をご参照ください。
