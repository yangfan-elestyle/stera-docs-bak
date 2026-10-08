---
title: 導入の流れ
excerpt: ''
deprecated: false
hidden: false
metadata:
  title: ''
  description: ''
  robots: index
next:
  pages:
    - title: 開発ガイド
      type: link
      url: >-
        https://guides.sterasmartone.com/docs/%E9%96%8B%E7%99%BA%E3%82%AC%E3%82%A4%E3%83%89p
---
下記の手順で stera smart one を導入することができます。

# 1\. SDK のダウンロード

* Server SDK をダウンロードします。
* Client SDK をダウンロードします。

# 2\. Server SDK の組み込み

[***Server SDK***](https://guides.sterasmartone.com/docs/server-sdk)をインストールし、Server SDK を使って決済オブジェクトを生成します。

# 3\.  Client SDK の組み込み

Client SDK([***iOS SDK***](https://guides.sterasmartone.com/docs/ios-sdk), [***Android SDK***](https://guides.sterasmartone.com/docs/android-sdk), [***Javascript SDK***](https://guides.sterasmartone.com/docs/js-sdk)) をインストールし、Server SDK から生成した決済オブジェクトを使って、クライアント SDK で決済を行います。

# 4\. Webhook の設定

サーバー側の [Webhook](https://guides.sterasmartone.com/docs/webhook)を設定して、決済の実行結果を受け取ります。

# 5\. 決済結果の問い合わせ

実際の利用シーンにより、Webhook 通知が届かなかった場合、決済の結果を問い合わせることもできます。

> 📘 TestモードとLiveモード
>
> 上記の手順はTestとLive環境の両方に対応しています。TestとLive環境について、詳しくは「[**TestモードとLiveモード**](https://guides.sterasmartone.com/docs/init-setting)」をご覧ください。