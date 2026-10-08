---
title: LINE Pay
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

ElepaySDK for iOS v3.2.1 から、下記 Scheme を LSApplicationQueriesSchemes に追加しなくでも利用できます。実際に決済アプリがインストールされてない場合は、SDK から [エラーコード](doc:error-code) 「10110」が返信します。

ElepaySDK for iOS v3.2.1 以前の場合、LINE アプリに遷移するために、Xcode の **PROJECT** → **TARGETS** にある **Info**タグ（或いは `Info.plist`）で、`LSApplicationQueriesSchemes` Key を追加してください。

```xml
<string>line</string>
```

## iOS App の Callback URL Scheme について

stera smart one デフォルト *URL Scheme* については、[こちら](https://developer.elepay.io/docs/ios-sdk#section-1-url-scheme-の追加)をご参照ください。

# Android

> 🚧
>
> elepay Android SDK 1.8.0 以降、`AndroidManifest.xml`ファイルに指定するコールバックActivityは、`ElepayCallbackActivity`にまとめることが可能になります。1.7.1までの支払い方法ごとの設定方法はサポート停止になりますので、1.8.0以降のバージョンをご利用の際に`ElepayCallbackActivity`をご使用ください。詳細は[概要ページ](https://developer.elepay.io/docs/summary)へご参照ください。

Line Pay を使うために、stera smart one アカウントの「アプリ設定」ページから「URL Scheme」をプロジェクトの`AndroidManifest.xml`に追加する必要があります。

```xml
<activity
    android:name="jp.elestyle.androidapp.elepay.activity.linepay.LinePayActivity"
    android:exported="true">
    <intent-filter>
        <data android:scheme="ep8bd64f25c5545b99c43e295"
              android:host="linepay"/> ←このschemeは「アプリ設定」ページより取得してください。

        <action android:name="android.intent.action.VIEW" />

        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
    </intent-filter>
</activity>
```

scheme より起動される Activity をカスタマイズする場合は、`jp.elestyle.androidapp.elepay.activity.linepay.LinePayActivity`から継承する必要があります。
