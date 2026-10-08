---
title: WeChat Pay
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
# 事前準備

NativeアプリからWeChat Payを呼び出す場合の事前準備として、WeChat Open Platformのアカウント作成およびApp IDの発行が必要となります。

以下のWeChat Payドキュメントをご確認ください。
[https://pay.weixin.qq.com/doc/global/v3/en/4012356387](https://pay.weixin.qq.com/doc/global/v3/en/4012356387)

また、stera smart oneのアクセスモード「1. Select Access Mode」については、「1.2 Institutional Mode」としてご認識ください。

# iOS

## iOS App の Callback URL Scheme について

決済モジュールデフォルト _URL Scheme_ については、[こちら](https://developer.elepay.io/docs/ios-sdk#section-1-url-scheme-の追加)をご参照ください。

それ以外にも、WeChat 専用の _URL Scheme_ （`wx`から始まるもの）が必要です。<br />[「stera smart one 管理画面」](https://dashboard.sterasmartone.com) > **開発設定** > **アプリ設定**にある **URL Scheme** > **WeChat Pay** 項目を確認してください。なお、WeChat Pay が未開通の場合、該当項目は表示しません。

## iOS 9 及び以降のシステムについて

WeChat Pay アプリに遷移するために、Xcode の **PROJECT** → **TARGETS** にある **Info**タグ（或いは `Info.plist`）で、`LSApplicationQueriesSchemes` Key を追加してください。

```text
<string>weixin</string>
<string>weixinULAPI</string>
```

# Android

WeChat Pay は、WeChatライブラリに依存するので、WeChat SDKのdenpendencyを`build.gradle`に追加します。<br />最新のwechatのバージョンはお勧めしますが、最新版のバージョンは[wechat sdk maven](https://bintray.com/wechat-sdk-team/maven)にご参照ください。

```groovy
dependencies {
  // ... other dependencies
  implementation　"com.tencent.mm.opensdk:wechat-sdk-android-without-mta:version"
}
```

そして、プロジェクト`AndroidManifest.xml`の中に、下記のような`activity-alias`を追加する必要があります。<br />WeChat Payは、`パッケージ名.wxapi.WXPayEntryActivity`を探すため、SDKに既存のコードにリンクします。

```xml
<!-- ほかのactivity記述 -->
<activity name="...">
</activity>

<!-- wechat payを使うために、これが必要 -->
<activity-alias
    android:name="パッケージ名.wxapi.WXPayEntryActivity"
    android:exported="true"
    android:targetActivity="jp.elestyle.androidapp.elepay.activity.wxapi.WXPayEntryActivity" />
```

<br />
