---
title: WooCommerce Plugin
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
## 概要

stera smart oneはWooCommerce専用のPluginを提供しています。

## プラグインのインストール

stera smart one for WooCommerce pluginのインストール方法を紹介します。

1. Plugin のダウンロード<br />以下のリリースページから、最新のpluginをzip方式でダウンロードしてください。<br />[elepay for WooCommerce](https://github.com/elestyle/woocommerce-gateway-elepay/releases)

> 📘
>
> ダウンロード済みのzipファイルを解凍しないでください。

2. WordPressの管理画面に、管理者権限でログインしてください。<br />「プラグイン」→「新規追加」ボタンをクリックしてください。

![](https://files.readme.io/adcc6f4-image-20210901-022542.png "image-20210901-022542.png")

3. 「プラグインを追加画面」にて、STEP 1でダウンロードしたzipファイルをアップロードしてください。

![](https://files.readme.io/bd3442f-image-20210901-025522.png "image-20210901-025522.png")

4. インストール結果画面にて「プラグインを有効化」ボタンをクリックしてください。

![](https://files.readme.io/cc04219-image-20210901-025604.png "image-20210901-025604.png")

5. 「プラグイン」の一覧リストから「elepay Plug-in for WooCommerce」が表示されましたら、利用可能な状態になります。

![](https://files.readme.io/1459aae-image-20210901-025655.png "image-20210901-025655.png")

以上でプラグインのインストールが完成しました。

## プラグインの初期設定

プラグインの初期設定方法をご紹介します。

1. WordPressの管理画面に、管理者権限でログインしてください。<br />「設定」→「決済」→「elepay決済-QRコード決済」→「管理」をクリックしてください。

![](https://files.readme.io/90c1229-image-20210901-025839.png "image-20210901-025839.png")

2. 「有効/無効」にて、「elepay有効にする」をチェックして、「公開鍵」と「秘密鍵」に、stera smart one管理画面から取得した開発キーを入力してください。最後に「変更を保存」ボタンをクリックしてください。

   elepay開発キーの入手方法は「[概要](doc:quick-start) 」へご参照ください。

> ❗️
>
> ご注意：テスト環境の開発キー（pk\_test、sk\_testから始まるキー）をご利用の場合は、実際に決済が行いないため、注文状況に「支払い済み」が表示されていても、絶対に商品を発送しないてください！

![](https://files.readme.io/69e2d28-image-20210901-031006.png "image-20210901-031006.png")

3. Webhookリンクをコピーしてください。

![](https://files.readme.io/cd45b44-image-20210901-030500.png "image-20210901-030500.png")

4. stera smart one管理画面の「開発設定」→「Webhook」にて、「新規」ボタンをクリックしてください。

![](https://files.readme.io/2762d21-image-20210405-084536.png "image-20210405-084536.png")

5. STEP 3 にてコピーしたWebhookリンクを「URL」にペーストして、下の「イベントタイプ」にある「支払成功」をチェックしてから、「OK」をクリックしてください。

![](https://files.readme.io/36c9403-image-20210405-085341.png "image-20210405-085341.png")

以上で全ての設定が完了しました。<br />購入者様のEC-CUBEのお支払い方法選択画面から、stera smart oneの決済方法一覧が見れます。

> 📘
>
> stera smart oneに有効の決済方法のみ表示されます。ブラウザーやデバイスに対応していない決済方法は自動で非表示になります。

<br />
