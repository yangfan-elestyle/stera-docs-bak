---
title: 楽天ペイ
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

RPay を使うには、SDK の他に RPay 独自の Framework（非公開）をプロジェクトのビルド依存関係に追加する必要があります。RPayKit.framework の入手方法やビルド依存関係の追加方法については、stera smart one サポートまでお問い合わせください。

## iOS 9 及び以降のシステムについて

楽天ペイアプリに遷移するために、Xcode の **PROJECT** → **TARGETS** にある **Info**タグ（或いは `Info.plist`）で、`LSApplicationQueriesSchemes` Key を追加してください。

```text
<string>rakutenpaysdk</string>
```

## iOS App の Callback URL Scheme について

stera smart one デフォルト _URL Scheme_ については、[こちら](https://developer.elepay.io/docs/ios-sdk#section-1-url-scheme-の追加)をご参照ください。

# Android

RPayを使うには、SDKの他にRakuten Pay独自のaarファイル（非公開）をプロジェクトのビルド依存関係に追加する必要があります。ビルド依存関係の追加方法については、Android Developerの[公式サイト](https://developer.android.com/studio/projects/android-library#psd-add-aar-jar-dependency)にご参考ください。

> 📘
>
> Rakuten Pay aarファイルのダウンロード先は、stera smart one サポートまでお問い合わせしてください。

<br />
