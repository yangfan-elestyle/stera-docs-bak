---
title: Apple Pay
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

Apple Pay の実装方法を紹介します。

# 仕組み

Apple Pay は Apple 製デバイスがお財布代わりになる簡単な決済方法です。

# iOS での利用

## Apple Pay の設定について

[Apple Payの設定方法](https://developer.apple.com/documentation/passkit/apple_pay/setting_up_apple_pay_requirements)を参照してください。

1. Apple Merchant ID を登録します\
   Apple Pay をご利用するには、Apple Merchant IDを登録する必要があります。

2. Apply Pay 証明書の作成\
   Apple Payで利用する証明書を取得します。\
   取得の過程で、秘密鍵／公開鍵ペアの生成 を要求されます。\
   秘密鍵を紛失しないよう十分ご注意ください。\
   鍵ペアは PKCS12形式 にまとめ、エクスポートパスワード を設定してください。\
   PKCS12をstera smart one チームまで提出してください。