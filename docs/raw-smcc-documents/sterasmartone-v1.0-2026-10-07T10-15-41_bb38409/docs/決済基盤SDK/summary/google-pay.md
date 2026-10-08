---
title: Google Pay
excerpt: ''
deprecated: false
hidden: false
metadata:
  title: ''
  description: ''
  robots: noindex
next:
  description: ''
---
# Android

SDK のセットアップ時に、`googlePayEnvironment`を指定します。

> Google Pay をご利用の際、Google 社への申請が必要となります。申請するには、TEST/PRODUCTION それぞれの環境でビルドしたアプリを提出する可能性があります。
>
> [Google Pay & Wallet Console](https://pay.google.com/business/console) で申請する際、Integration typeはGatewayを選択してください。

SDK を設定する際、`googlePayExistingPaymentRequired`（デフォルト値：true）を指定できます。これはユーザーの Google Pay に有効な支払いカードが存在するかどうかを検証するための設定です。

> true：Google Pay に少なくとも 1 枚の支払い可能なカードが必要です。
>
> false：Google Pay の支払いカードを検証しません。カードがない場合は、支払いダイアログ内で追加できます。

```kotlin
val configuration = ElepayConfiguration(
  apiKey = "" // test key or live key
  googlePayEnvironment = GooglePayEnvironment.TEST // or GooglePayEnvironment.PRODUCTION
  googlePayExistingPaymentRequired = false // default true
)
Elepay.setup(configuration)
```

Google Pay は Google Play Service に依存するので、ご利用の際 Google Play Service の使用可否を検証する必要があります。
SDK には、下記の Google Pay の使用可否に関するメソッドを提供しております。

```kotlin
// Googgle Payの利用は可能かどうかをチェックするメソッド。
fun checkIfGooglePayIsReadyToUse(
    activity: Activity,
    resultHandler: (Boolean) -> Unit
)
```

##### Google Pay 開発

1. `minSdkVersion` が公式要件を満たしていること：[https://developers.google.com/pay/api/android/guides/setup#app%20prerequisites](https://developers.google.com/pay/api/android/guides/setup#app%20prerequisites)
2. `AndroidManifest.xml` の設定：

```
<application>
  ...
  <meta-data
    android:name="com.google.android.gms.wallet.api.enabled"
    android:value="true" />
</application>
```

##### Google Pay PRODUCTION 検証

Google の要件に従い、PRODUCTION 環境の Google Pay は Google Play のリリース署名が必須です。次の手順に従ってください。

1. Google Pay API の利用申請。
   a. [https://developers.google.com/pay/api/android/guides/test-and-deploy/publish-your-integration](https://developers.google.com/pay/api/android/guides/test-and-deploy/publish-your-integration)
2. 必ず Google Play ストアからアプリをダウンロードしてテストします（リリース署名済み APK のローカルインストールは不可）。
   a. [https://developers.google.com/pay/api/android/guides/setup#app%20prerequisites](https://developers.google.com/pay/api/android/guides/setup#app%20prerequisites)
   b. リリース鍵で署名し Google Play ストアにアップロード後、テスターアカウントでダウンロードして Google Pay 機能を検証します。
3. `GooglePayEnvironment.TEST` ではなく `GooglePayEnvironment.PRODUCTION` を使用します。

##### TEST／PRODUCTION の違い

`googlePayExistingPaymentRequired` が true に設定されている場合：

1. **Test 環境**：Google Wallet アプリへの依存が必須です。テスト時には、Google Wallet アプリをインストールし、クレジットカードを登録しておく必要があります。これがないと Google Pay の支払いダイアログが起動せず、`checkIfGooglePayIsReadyToUse` が `false` を返します（強制的に支払いを行うと、エラーコード 10100 が返されます）。
2. **Production 環境**：実際のユーザーは Google Wallet または Google アカウントに支払いカードを登録している必要があります。登録がない場合、`checkIfGooglePayIsReadyToUse` が `false` を返します（強制的に支払いを行うと、エラーコード 10100 が返されます）。

`googlePayExistingPaymentRequired` が false に設定されている場合：

1. **Test 環境**：Google Pay の支払いダイアログにはテストカード情報が自動的に入力されます。
2. **Production 環境**：実際のユーザーが Google Pay に支払いカードを登録していない場合、支払いダイアログでカード追加を促す案内が表示されます。

<br />
