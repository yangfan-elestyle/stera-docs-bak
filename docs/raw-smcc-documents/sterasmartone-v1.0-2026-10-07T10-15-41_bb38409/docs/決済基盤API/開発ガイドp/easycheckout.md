---
title: EasyCheckout
excerpt: ''
deprecated: false
hidden: true
metadata:
  title: ''
  description: ''
  robots: index
next:
  description: ''
  pages:
    - type: basic
      slug: api-reference
      title: API Reference
    - type: basic
      slug: js-sdk
      title: JavaScript SDK
---
# EasyCheckoutの概要

EasyCheckoutは stera smart one が提供しているMPM型の動的QRコード機能です。主に下記の利用シーンで動的にQRコードを表示し、お客様がQRコードを読み取ってお支払いする利用シーンに使われます。

* ECウェブサイト
* セルフオーダー
* 精算機
* 券売機
* 自動販売機

  ![](/docs/7debf55b9ddcc1cd1b1f68ef7ee94fc9a1e9a7e9d3b6bcf11fa67662007ab8a2-image.png)

# EasyCheckout利用流れ

### 1\. Codeオブジェクトの新規生成

stera smart one サーバーがコードリクエストに対して Code オブジェクトを新規生成し、サーバー側に返します。\
APIについて、APIリファレンスの[EasyCheckout](https://guides.sterasmartone.com/reference/createcode)をご参照してください。

```curl
curl --request POST 'https://api.elepay.io/codes' \
-u [秘密鍵]: \
--header 'Content-Type: application/json' \
--data-raw '{
        "amount": 200,
        "orderNo": "ORDER_NO_00001",
        "frontUrl": "https://戻り先ページのURL"
}'
```
```java
CodeApi codeApi = new CodeApi();
codeApi.getApiClient().setUsername("[秘密鍵]");
CodeReq codeReq = new CodeReq();
codeReq.setAmount(200);
codeReq.setOrderNo("ORDER_NO_00001");
codeReq.setFrontUrl("https://戻り先ページのURL");
CodeDto code = codeApi.createCode(codeReq);
```

### 2\. 支払い画面への遷移

Javascript SDKを利用して、支払い画面へ遷移します。Javascript SDKは自動的端末の種類を判断して、デスクトップの場合はCheckout画面へ、モバイルの場合はPayment画面へ遷移します

```html
<script src="https://js.elepay.io/v1/elepay.js"></script>
<script>
  var elepay = new Elepay("<公開鍵>")
  elepay.checkout("<CodeオブジェクトID>")
</script>
```

### 3\. お客様の支払い

・お客様がQRコードをスキャンして、支払処理を行います\
・お支払い画面のブランド名、ロゴ、決済方法などは stera smart one 管理画面の「EasyCheckout」で設定できます。

### 4\. 戻り先ページへ遷移

「1」で設定したfrontUrlへ遷移します。frontUrlのquery stringに下記ような結果ステータスが含まれます。

<Table align={["left","left","left"]}>
  <thead>
    <tr>
      <th>
        名前
      </th>

      <th>
        タイプ
      </th>

      <th>
        説明
      </th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>
        status
      </td>

      <td>
        string
      </td>

      <td>
        結果ステータス\
        captured: 支払完了\
        cancelled: 支払キャンセル\
        failure: 支払失敗  

        * frontUrlの結果ステータスを信頼しないでください。正確な支払結果はWebhookを利用して受信してください。
      </td>
    </tr>
  </tbody>
</Table>

### 5\. Webhook イベントの受信

支払いが成功の場合、stera smart one は Webhook に設定された URL に `charge.captured` イベントの通知を送信します。

# iOS App で Checkout の利用（エンドユーザー向けのApp）

下記リンクへ参照してください：\
[iOS SDK - Checkout 機能](ios-sdk#checkout-%E6%A9%9F%E8%83%BD)

# Android App で Checkout の利用（エンドユーザー向けのApp）

下記リンクへ参照してください：\
[Android SDK - Checkout 処理](android-sdk#checkout-処理)
