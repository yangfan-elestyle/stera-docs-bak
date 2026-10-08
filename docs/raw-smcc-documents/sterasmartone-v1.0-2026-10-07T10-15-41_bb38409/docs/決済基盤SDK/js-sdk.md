---
title: JavaScript SDK
excerpt: ''
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
      slug: server-sdk
      title: Server SDK
    - type: basic
      slug: ios-sdk
      title: iOS SDK
    - type: basic
      slug: android-sdk
      title: Android SDK
---
**JavaScript SDK** は stera smart one をウェブアプリに導入するための SDK です。<br />このガイドでは、stera smart one の JavaScript SDK をウェブアプリと連携する方法について詳しく説明します。

# 対応バージョン

- **JavaScript SDK** は、Safari、Chrome、Edge、Firefox の最新バージョンを推奨しています（リリースから3年以内のバージョンでの動作を保証します）。
- 開発環境：Chrome を推奨します。

# インストール方法

**JavaScript SDK** は、[https://js.elepay.io/v1/](https://js.elepay.io/v1/) にホストされおり、同ドメインを読み込んで使用します。

```
<script src="https://js.elepay.io/v1/elepay.js"></script>
```

moduleでelepay-js-sdkを利用する場合、npm package インストールしてください。

```
npm install --save elepay-js-sdk
```

# 実装

## 初期化

```javascript
var elepay = new Elepay('YOUR_PUBLISHABLE_KEY');
```

**npm packageでインストールした場合**

```javascript
import { loadElepay } from 'elepay-js-sdk';

const elepay = await loadElepay('YOUR_PUBLISHABLE_KEY');
```

**Elepay(publishableKey, options?)**

| パラメータ          | 型      | 必須                     | 説明                                                                                |
| :------------- | :----- | :--------------------- | :-------------------------------------------------------------------------------- |
| publishableKey | string | true                   | 公開鍵                                                                               |
| options        | object | false                  | 初期化オプション                                                                          |
| options.locale | string | false<br />デフォルト: auto | ja：日本語<br />en：英語<br />zh-CN：簡体字中国語<br />zh-TW：繁体字中国語<br />auto：ブラウザのロケールに応じて自動設定 |

## 支払い処理

Charge オブジェクトを取得した後、下記の js を呼び出して支払い処理を行います。

```javascript
elepay.handleCharge(chargeObject).then(function(result) {
  // ① 正常処理
  if (result.type === 'cancel') {
    // 支払いキャンセル
  } else if (result.type === 'success') {
    // 支払い成功
  }
}).catch(function(err) {
	// ② エラー処理
});
```

下記の決済方法が ①正常処理関数 を呼び出さず、charge extra 情報中の frontUrl への遷移を行います。

- LinePay
- Alipay
- UnionPay
- PayPay

**elepay.handleCharge(chargeObject)**

| パラメータ        | 型      | 必須   | 説明                     |
| :----------- | :----- | :--- | :--------------------- |
| chargeObject | object | true | サーバーから作成したChargeオブジェクト |

**frontUrl への遷移**

遷移する際、frontUrl に以下のパラメータをクエリストリングとして追加します。

- chargeId: Charge ID
- orderNo: オーダー番号
- amount: 支払い金額
- currency: 通貨コード
- status: ステータス（captured, failure, cancelled）。決済成功の場合は captured を指定します。

<br />
