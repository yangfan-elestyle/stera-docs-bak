---
title: ホスティングのCheckoutページを導入
excerpt: お客様がウェブサイトのボタンをクリックすると、stera smart oneホスティングのCheckoutページに移動します。
deprecated: false
hidden: false
metadata:
  title: ''
  description: ''
  robots: index
next:
  description: ''
  pages:
    - type: basic
      slug: qrwidget
      title: デバイスにCheckout用QRコードを導入
    - type: basic
      slug: checkout
      title: Checkout
---
> - 導入工数：ローコード、約20分
> - 実装スタイル：ホスティングページ
> - UIの自由度：制限あり

サイト内で商品を選択済みのお客様が、購入準備が整ったら、以下の手順で導入してください。

### ステップ1：選択された商品用のEasyQRコードを作成します

<TutorialTile backgroundColor="#018FF4" emoji="🦉" id="681c83ee62dcfe001e1aa06f" link="https://guides.sterasmartone.com/v1.0/recipes/easyqrコードを作成" slug="easyqrコードを作成" title="EasyQRコードを作成" />

#### Checkoutページを設定

「[Create EasyQR code](https://guides.sterasmartone.com/reference/createcode)」のコード例：

```shell
     --data '
{
  "currency": "JPY",
  "extra": {
    "defaultPaymentMethod": "paypay" # 特定ブランドの決済QRコード
  },
  "amount": 266,  # 合計金額を表示
  "items": [     # 各商品の詳細を表示
    {
      "name": "お茶",
      "price": 108,
      "count": 1
    },
    {
      "name": "コーラ",
      "price": 158,
      "count": 1
    }
  ]
}
'
```

| 各商品の詳細を表示                                                                                               | 合計金額のみを表示                                                                                               | 特定ブランドの決済QRコード                                                                                          |
| :------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------ |
| ![](https://files.readme.io/561e8f4eb56cc69195fae551b4003cac5f287b91c1180b97c414c572cb0e4d6c-image.png) | ![](https://files.readme.io/fdfa6f6c89671f21da0c49a86a440b156f6b48603faaf6ab5a40f530f3635091-image.png) | ![](https://files.readme.io/b839861abb314abe309c7774597672a0b092501ab38416b9a322e95c2da32a4d-image.png) |

### ステップ2：サイトに支払いボタンを追加し、お客様をCheckoutページへ移動

Javascript SDKを利用して、Checkoutページへ移動します。Javascript SDKは自動的端末の種類を判断して、デスクトップの場合はCheckoutページへ、モバイルの場合はPaymentページへ移動します。

```javascript
<script src="https://js.elepay.io/v1/elepay.js"></script>
<script>
  var elepay = new Elepay("<公開鍵>")
  elepay.checkout("<QRCode ID>")
</script>
```

### ステップ3：お客様が支払いを完了し、遷移ページと支払い状況を処理

<TutorialTile backgroundColor="#018FF4" emoji="🦉" id="681c84966542d50030e5aaa2" link="https://guides.sterasmartone.com/v1.0/recipes/戻り先ページのurlを設定" slug="戻り先ページのurlを設定" title="戻り先ページのURLを設定" />

決済処理後、リダイレクト時に支払いステータス（例：status=captured）が付加され、フロント側で処理の成否を判断できます。

- captured: 支払完了
- cancelled: 支払キャンセル
- failure: 支払失敗

> 例：[https://example.com/thank-you?status=captured]

> 👍 決済状況を正確に把握するためには、Webhookでイベント通知を受信する方法が最適です。
>
> stera smart oneの[開発設定>Webhook] で受信URLを設定できます。
>
> 支払いが成功の場合、stera smart one は Webhook に設定された URL に `charge.captured` イベントの通知を送信します。

### 他の設定

#### CheckoutページのUIカスタマイズ

お客様が見るCheckoutページは、stera smart oneの[簡単決済>設定>基本設定] でアイコンやカラースキームなどを調整できます。

#### 決済方法の設定

stera smart oneの[簡単決済>設定>決済方法管理] で利用可能な決済方法の管理（確認・有効化・無効化）が可能です。今後追加される支払い手段も、すぐに利用できます。

#### ロケーション情報を追加

EasyQRコードの作成時にロケーション情報を追加できます。また、stera smart oneの[ロケーション]で管理可能です。