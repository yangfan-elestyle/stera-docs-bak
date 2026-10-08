---
title: デバイスにCheckout用QRコードを導入
excerpt: 固定デバイスで柔軟な決済が可能になるように設定する。
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
      slug: sso-hosted
      title: ホスティングのCheckoutページを導入
    - type: basic
      slug: checkout
      title: Checkout
---
> - 導入工数：ローコード、約40分  
> - 実装スタイル：QRコードの埋め込み  
> - UIの自由度：制限あり  

お客様や店舗スタッフがデバイスを操作し、支払いQRコードを表示するための3つの手順。

### ステップ1：商品・サービスの支払い用のEasyQRコードを作成します

<TutorialTile backgroundColor="#018FF4" emoji="🦉" id="681c83ee62dcfe001e1aa06f" link="https://guides.sterasmartone.com/v1.0/recipes/easyqrコードを作成" slug="easyqrコードを作成" title="EasyQRコードを作成" />

### ステップ2：埋め込みUIのスタイルを設定し、端末に適用

stera smart oneでは，一定範囲のUIカスタマイズ機能を提供し、一般的な用途に適しています。

ChatGPT сказал:

<TutorialTile backgroundColor="#018FF4" emoji="🦉" id="681c856ad4f28100470db7b4" link="https://guides.sterasmartone.com/v1.0/recipes/widget-ui-設定方法" slug="widget-ui-設定方法" title="Widget UI 設定方法" />

<br />

<HTMLBlock>{`
<table style="width: 100%; border-collapse: collapse;">
<thead>
<tr>
  <th style="border: 1px solid #ddd; padding: 8px;">Param</th>
  <th style="border: 1px solid #ddd; padding: 8px;">Type</th>
  <th style="border: 1px solid #ddd; padding: 8px;">Description</th>
</tr>
</thead>
<tbody>
<tr>
  <td style="border: 1px solid #ddd; padding: 8px;"><p>options</p>
</td>
  <td style="border: 1px solid #ddd; padding: 8px;"><p><code>object</code></p>
</td>
  <td style="border: 1px solid #ddd; padding: 8px;"><p>ウィジェットオプション</p>
</td>
</tr>
<tr>
  <td style="border: 1px solid #ddd; padding: 8px;"><p>options.container</p>
</td>
  <td style="border: 1px solid #ddd; padding: 8px;"><p><code>string</code></p>
</td>
  <td style="border: 1px solid #ddd; padding: 8px;"><p>配置先のDOM要素のCSSセレクターを表す文字列</p>
</td>
</tr>
<tr>
  <td style="border: 1px solid #ddd; padding: 8px;"><p>options.direction</p>
</td>
  <td style="border: 1px solid #ddd; padding: 8px;"><p><code>string</code></p>
</td>
  <td style="border: 1px solid #ddd; padding: 8px;"><p>ウィジェットレイアウト 縦:vertical(デフォルト) 横:horizontal</p>
</td>
</tr>
<tr>
  <td style="border: 1px solid #ddd; padding: 8px;"><p>options.icon</p>
</td>
  <td style="border: 1px solid #ddd; padding: 8px;"><p><code>boolean</code></p>
</td>
  <td style="border: 1px solid #ddd; padding: 8px;"><p>trueならブランドアイコン入りQRコードを表示。デフォルトはfalse</p>
</td>
</tr>
<tr>
  <td style="border: 1px solid #ddd; padding: 8px;"><p>options.parts.amount</p>
</td>
  <td style="border: 1px solid #ddd; padding: 8px;"><p><code>boolean</code></p>
</td>
  <td style="border: 1px solid #ddd; padding: 8px;"><p>trueなら金額を表示。デフォルトはtrue</p>
</td>
</tr>
<tr>
  <td style="border: 1px solid #ddd; padding: 8px;"><p>options.parts.paymentLogo</p>
</td>
  <td style="border: 1px solid #ddd; padding: 8px;"><p><code>boolean</code></p>
</td>
  <td style="border: 1px solid #ddd; padding: 8px;"><p>trueなら決済方法アイコンを表示。デフォルトはtrue</p>
</td>
</tr>
<tr>
  <td style="border: 1px solid #ddd; padding: 8px;"><p>options.parts.tip</p>
</td>
  <td style="border: 1px solid #ddd; padding: 8px;"><p><code>boolean</code></p>
</td>
  <td style="border: 1px solid #ddd; padding: 8px;"><p>trueならヘルプメッセージを表示。デフォルトはtrue</p>
</td>
</tr>
<tr>
  <td style="border: 1px solid #ddd; padding: 8px;"><p>options.theme.primaryColor</p>
</td>
  <td style="border: 1px solid #ddd; padding: 8px;"><p><code>boolean</code></p>
</td>
  <td style="border: 1px solid #ddd; padding: 8px;"><p>メイン色</p>
</td>
</tr>
<tr>
  <td style="border: 1px solid #ddd; padding: 8px;"><p>options.theme.borderColor</p>
</td>
  <td style="border: 1px solid #ddd; padding: 8px;"><p><code>boolean</code></p>
</td>
  <td style="border: 1px solid #ddd; padding: 8px;"><p>ウィジェット罫線色。null:罫線なし</p>
</td>
</tr>
<tr>
  <td style="border: 1px solid #ddd; padding: 8px;"><p>options.theme.backgroundColor</p>
</td>
  <td style="border: 1px solid #ddd; padding: 8px;"><p><code>boolean</code></p>
</td>
  <td style="border: 1px solid #ddd; padding: 8px;"><p>ウィジェット背景色。デフォルトは白</p>
</td>
</tr>
</tbody>
</table>
`}</HTMLBlock>

**例えば**

| 縦向き | 横向き | 決済方法を表示しない | QRコードのみ |
| :--- | :--- | :--- | --- |
| ![](https://files.readme.io/98b430a38db9c5c25fb8ba2637bb8c3bf10caf40e8c174101735f3cc02228ca8-CleanShot_2025-01-31_at_17.22.532x.png) | ![](https://files.readme.io/15bfcfb72d1557761c07eb9db21b08fffe2b7c07f72b3db9d131a587073fab2d-CleanShot_2025-01-31_at_17.23.152x.png) | ![](https://files.readme.io/50903d3f7bc013db627a75ab494db46fba157cef96d70ebb1c0368d3448cbbac-CleanShot_2025-01-31_at_17.24.272x.png) | ![](https://files.readme.io/e0378caa12e4675e18e78ea1c804e796cf39cfbd48771e461ef8163d4121a8a6-CleanShot_2025-01-31_at_17.25.242x.png) |

### ステップ3：お客様が支払いを完了し、支払い状況を処理

Widget は、支払いの進行状況を検知するための[イベント](https://developer.elepay.io/docs/js-sdk-reference#codeswidget)を提供しています。

| 進行状況 | |
| :--- | :--- |
| 支払い成功 | `widget.on('success', function (event, codeObject) {// 決済完了後処理  });` |
| 支払い期限切れ | `widget.on('expired', function (event, codeObject) {// 新しいEasyQRコードを生成するなど });` |
| 支払いエラー | `widget.on('error', function (event, error) { // エラー処理  });` |
| ウィジェットを破棄 | `widget.destroy();` |

### 他の設定

#### CheckoutページのUIカスタマイズ

お客様が見るCheckoutページは、stera smart oneの[簡単決済>設定>基本設定] でアイコンやカラースキームなどを調整できます。

#### 決済方法の設定

stera smart oneの[簡単決済>設定>決済方法管理] で利用可能な決済方法の管理（確認・有効化・無効化）が可能です。今後追加される支払い手段も、すぐに利用できます。

#### ロケーション情報を追加

EasyQRコードの作成時にロケーション情報を追加できます。また、stera smart oneの[ロケーション]で管理可能です。