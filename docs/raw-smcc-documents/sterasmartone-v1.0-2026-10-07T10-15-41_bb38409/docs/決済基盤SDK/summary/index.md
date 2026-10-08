---
title: 決済方法
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
モバイルSDK（iOS、Android™）をご利用する際に、各支払い方法の設定に関しては、本ページで記載します。

> ◯：個別設定が必要、△：共通の設定をすれば結構です、X：特別の設定がありません

# iOS 開発設置

| Payment                                                               | URL Scheme | LSApplicationQueriesSchemes | Apple Pay Merchant ID |
| :-------------------------------------------------------------------- | :--------- | :-------------------------- | :-------------------- |
| [PayPay](doc:paypay)                                                  | △          | ◯ \*1                       | ー                     |
| [LinePay](doc:line-pay)                                               | △          | ◯ \*1                       | ー                     |
| [メルペイ](doc:merpay)                                                    | △          | X                           | ー                     |
| [d払い](https://developer.elepay.io/docs/docomo-payd%E6%89%95%E3%81%84) | X          | X                           | ー                     |
| [au PAY](doc:au-pay)                                                  | △          | ◯ \*1                       | ー                     |
| [楽天ペイ](doc:rakuten-pay)                                               | △          | ◯                           | ー                     |
| [Paidy](doc:paidy)                                                    | X          | X                           | ー                     |
| [atone](doc:atone)                                                    | X          | X                           | ー                     |
| [WeChat Pay](doc:wechatpay)                                           | ◯          | ◯                           | ー                     |
| [Alipay](doc:alipay)                                                  | △          | ◯                           | ー                     |
| [Union Pay（銀聯雲閃付）](doc:unionpay)                                      | △          | ◯                           | ◯                     |
| [PayPal](doc:paypal)                                                  | X          | ◯                           | ー                     |
| [Apple Pay](doc:apple-pay)                                            | X          | X                           | ◯                     |
| [Credit Card](doc:credit-card)                                        | X          | X                           | ー                     |

\*1：SDK for iOS v3.2.1 から、各決済方法アプリの Scheme を LSApplicationQueriesSchemes に追加しなくでも利用可能になります。実際に決済アプリがインストールされてない場合は、SDK から [エラーコード](doc:error-code) 「10110」が返信します。

# Android 開発設定

## 決済方法のプロバイダーについて

### GoAllpay

GoAllpayをご利用する場合、プロジェクトの設定にGoAllpay SDKの情報追加が必要となります。<br />詳細の設定方法はGoAllpaySDKのドキュメント[（中国語）](https://git.allpayx.com/OpenAPI/common/src/master/v5/android/Android_Integration_Specification_CH.md)、[（英語）](https://git.allpayx.com/OpenAPI/common/src/master/v5/android/Android_Integration_Specification_EN.md)にご参考ください。

> 📘 配置方法
>
> プロジェクトのルートのbuild.gradleに以下の情報を追加してください。<br />repositories {<br />// ... 他のmaven repo<br />// GoAllpay SDK のmaven repo<br />maven {<br />url '[https://s01.oss.sonatype.org/content/repositories/releases/'](https://s01.oss.sonatype.org/content/repositories/releases/')<br />}<br />}
>
> アプリモジュールのbuild.gradleに以下の情報を追加してください。<br />dependencies {<br />// ... other dependencies<br />api("io.github.goallpay:allpaysdk:5.2.5")<br />}

## 各決済方法の開発設定

| Payment                                                               | AndroidManifest.xml (Process Activity) | build.gradle (Library Dependency) |
| :-------------------------------------------------------------------- | :------------------------------------- | :-------------------------------- |
| [PayPay](doc:paypay)                                                  | ◯                                      | X                                 |
| [LinePay](doc:line-pay)                                               | ◯                                      | X                                 |
| [メルペイ](doc:merpay)                                                    | ◯                                      | X                                 |
| [d払い](https://developer.elepay.io/docs/docomo-payd%E6%89%95%E3%81%84) | X                                      | X                                 |
| [au PAY](doc:au-pay)                                                  | ◯                                      | X                                 |
| [楽天ペイ](doc:rakuten-pay)                                               | X                                      | ◯                                 |
| [Paidy](doc:paidy)                                                    | X                                      | X                                 |
| [atone](doc:atone)                                                    | X                                      | X                                 |
| [WeChat Pay](doc:wechatpay)                                           | ◯                                      | ◯                                 |
| [Alipay](doc:alipay)                                                  | X                                      | ◯                                 |
| [Union Pay（銀聯雲閃付）](doc:unionpay)                                      | X                                      | X                                 |
| [PayPal](doc:paypal)                                                  | X                                      | X                                 |
| [Apple Pay](doc:apple-pay)                                            | X                                      | X                                 |
| [Credit Card](doc:credit-card)                                        | X                                      | X                                 |

Android SDK 1.8.0 以降、`AndroidManifest.xml`ファイルに指定するコールバックActivityは、下記のようにひとつにまとめることができます。また、1.7.1までの支払い方法ごとの設定方法はサポート停止になりますので、1.8.0以降のバージョンをご利用の際に`ElepayCallbackActivity`をご使用ください。

> 📘
>
> 専用の URL Scheme の取得方法は「[iOS / Android SDK用URL Schemeの取得](doc:ios-android-sdk-url-scheme)」へご参照ください。

```xml
<activity
    android:name="jp.elestyle.androidapp.elepay.activity.ElepayCallbackActivity"
    android:launchMode="singleTask"
    android:exported="true">
    <intent-filter>
        <data android:scheme="ep1234567890abcdef" /> ←このschemeは「アプリ設定」ページより取得してください。

        <action android:name="android.intent.action.VIEW" />

        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
    </intent-filter>
</activity>
```

<br />
