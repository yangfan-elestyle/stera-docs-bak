---
title: APIガイド
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
      slug: error-code
      title: エラーコード
    - type: link
      title: APIリファレンス
      url: https://developer.elepay.io/reference
---
# 概要

stera smart one のAPI は、REST をベースに構成された決済 API です。支払い、返金など、運用における様々な処理ができます。

# 認証

API を利用するには、ユーザー登録を行い、APIキーを取得する必要があります。APIキーには二種類あります、テストキー( Test key )と本番キー( Live key )です。テストキーはテスト環境( Test )で使えます。本番キーは本番環境( Live )で使えます。テスト環境と本番環境についての詳細は_[初期設定](https://guides.sterasmartone.com/docs/init-setting)_をご覧ください。

<HTMLBlock>{`
<table style="width: 100%; border-collapse: collapse;">
<thead>
<tr>
  <th style="border: 1px solid #ddd; padding: 8px;">No</th>
  <th style="border: 1px solid #ddd; padding: 8px;">名前</th>
  <th style="border: 1px solid #ddd; padding: 8px;">用途</th>
</tr>
</thead>
<tbody>
<tr>
  <td style="border: 1px solid #ddd; padding: 8px;"><p>1</p>
</td>
  <td style="border: 1px solid #ddd; padding: 8px;"><p>テストキー</p>
</td>
  <td style="border: 1px solid #ddd; padding: 8px;"><p>本番の支払い処理を行うサーバーへは接続されず、実際の支払い情報として計上されることもありません。</p>
</td>
</tr>
<tr>
  <td style="border: 1px solid #ddd; padding: 8px;"><p>2</p>
</td>
  <td style="border: 1px solid #ddd; padding: 8px;"><p>本番キー</p>
</td>
  <td style="border: 1px solid #ddd; padding: 8px;"><p>本番の支払い処理を行うサーバーへ接続します。<br>(本番申請を行うことで利用できるようになります。)</p>
</td>
</tr>
</tbody>
</table>
`}</HTMLBlock>

パブリックキーは、アプリの決済画面の HTML 内に組み込む公開用の API キーで、トークンを生成する際に使用します。API呼出すの認証は、シークレットキーをユーザーネームとして扱い、パスワードは省略して、Basic 認証経由で行われます。Bearer認証を利用したい場合、HTTP Basic 認証ヘッダーの代わりにHTTP Bearer認証ヘッダーを使用してください。 シークレットキーは、全ての API リクエスト操作が可能となる重要なキーなので、取扱いにご注意ください。

| No | 名前       | 用途                        |
| :- | :------- | :------------------------ |
| 1  | パブリックキー  | HTML内に埋め込むトークン生成用のパブリックキー |
| 2  | シークレットキー | サーバー側認証用シークレットキー          |

> 📘 Basic 認証
> 
> Basic認証では、ユーザ名とパスワードの組みをコロン ":" でつなぎ、Base64でエンコードして送信する。
> 
> 1. 下記ようにシークレットキーと「空白」をコロン ":" でつなぎます  
>    `sk_live_xxxxxxxxxxxxxxxxxxxxx:`
> 
> 2. この値をBase64でエンコードします  
>    `c2tfbGl2ZV94eHh4eHh4eHh4eHh4eHh4eHh4eHg6`
> 
> 3. エンコードされた値下記のように HTTP Basic 認証ヘッダーとして送信します  
>    `Authorization: Basic c2tfbGl2ZV94eHh4eHh4eHh4eHh4eHh4eHh4eHg6`

> 📘 Bearer 認証
> 
> Bearer認証を利用したい場合、HTTP Basic 認証ヘッダーの代わりに下記ようなHTTP Bearer認証ヘッダーを使用してください。  
> `Authorization: Bearer sk_live_xxxxxxxxxxxxxxxxxxxxx`

# プロトコル

セキュリティのために、stera smart one サーバーに対する全ての API 通信は、必ず HTTPS で行うようにしてください。

# メソッド

stera smart one API へのリクエストでは、GET、POST、DELETE の3種類の HTTP メソッドを利用できます。

# レスポンス形式

API からのレスポンスデータは全て JSON 形式で返されます。

# タイムスタンプ

日次に関するデータは、UTC タイムゾーンの UNIX タイムスタンプ形式で表示されます。一部入金予定日や入金実行日など秒数の関係ないものは、Date 型(例： 2023-12-01) で表示されます。

# API リファレンス

下記の API を提供しています。詳しくは[**_API developer.リファレンス_**](https://guides.sterasmartone.com/reference/listcharges)をご覧ください。

| No | API 名前 | メソッド     | 備考              |
| :- | :----- | :------- | :-------------- |
| 1  | Charge |          |                 |
|    |        | list     | 支払い一覧の取得        |
|    |        | create   | Chargeオブジェクトを作成 |
|    |        | retrieve | 支払いを検索          |
| 2  | Refund |          |                 |
|    |        | list     | 返金一覧の取得         |
|    |        | create   | Refundオブジェクトの作成 |
|    |        | retrieve | 返金の検索           |