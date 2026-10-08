---
title: EasyQR
excerpt: ''
deprecated: false
hidden: true
metadata:
  title: ''
  description: ''
  robots: noindex
next:
  description: ''
  pages:
    - type: link
      title: APIリファレンス
      url: https://developer.elepay.io/reference
    - type: link
      title: JavaScript SDKリファレンス
      url: https://developer.elepay.io/docs/js-sdk-reference
---
# EasyQRの概要

EasyQRはelepayが提供しているMPM型の動的QRコード機能です。主にウェブサイト、タブレット、券売機、精算機などの画面で動的にQRコードを表示し、お客様がQRコードを読み取ってお支払いする利用シーンに使われます。

![868](https://files.readme.io/599156a-easyqr-processing.png "easyqr-processing.png")

# EasyQR利用流れ

## 1. EasyQR Codeオブジェクトの新規生成

elepay サーバーがコードリクエストに対して Code オブジェクトを新規生成し、サーバー側に返します。\
APIについて、APIリファレンスの[EasyQR](https://developer.elepay.io/reference#closecode)をご参照してください。

## 2. QRコードを表示

表示方法は二つあります\
・Javascript SDKのEasyQR Code Widgetを利用して、QRコードを表示します。

```javascript
{
  "codes": [
    {
      "code": "var elepay = new Elepay('公開鍵')
      var widget = elepay.createCodeWidget({
      	container: '#widget'
      })
      widget.on('success', () => {
      	// 決済完了後処理
      })
      widget.on('expired', () => {
      	// 新しいEasyQRコードを生成するなと
      })
      widget.show('サーバー側生成したCodeオブジェクトのID')
    }
  ]
}
```

> EasyQR Code Widgetのレイアウトはオプションで設定することが可能です。詳細は [Javascript SDKリファレンス](doc:javascript-sdkリファレンス) を参考してください。

・Code オブジェクトのcodeUrlをQRコードに変換して表示します。

## 3. お客様の支払い

・お客様がQRコードをスキャンして、支払処理を行います\
・お支払い画面のブランド名、ロゴ、決済方法などはelepay管理画面の「EasyQR設定」で設定できます。

## 4. Webhook イベントの受信

支払いが成功の場合、elepay は Webhook に設定された URL に `charge.captured` イベントの通知を送信します。
