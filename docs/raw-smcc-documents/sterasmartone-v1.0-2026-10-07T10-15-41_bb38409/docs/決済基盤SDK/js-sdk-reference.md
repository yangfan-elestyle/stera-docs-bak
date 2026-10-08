---
title: JavaScript SDK Reference
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
<a name="Elepay"></a>

## Elepay

**Kind**: global class  

* [Elepay](#Elepay)
  * [new Elepay(key, options)](#new_Elepay_new)
  * [.handleCharge(charge)](#Elepay+handleCharge) ⇒ <code>Promise</code>
  * [.handleSource(source)](#Elepay+handleSource) ⇒ <code>Promise</code>
  * [.createCodeWidget(options)](#Elepay+createCodeWidget) ⇒ <code>CodesWidget</code>
  * [.checkout(code)](#Elepay+checkout) ⇒ <code>Promise</code>

<a name="new_Elepay_new"></a>

### new Elepay(key, options)

SDKを初期化

**Returns**: [<code>Elepay</code>](#Elepay) - Elepay インスタンス  

<Table>
  <thead>
    <tr>
      <th>
        Param
      </th>

      <th>
        Type
      </th>

      <th>
        Description
      </th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>
        key
      </td>

      <td>
        <code>string</code>
      </td>

      <td>
        必須 公開鍵
      </td>
    </tr>

    <tr>
      <td>
        options
      </td>

      <td>
        <code>object</code>
      </td>

      <td>
        オプション
      </td>
    </tr>

    <tr>
      <td>
        options.locale
      </td>

      <td>
        <code>string</code>
      </td>

      <td>
        言語設定。デフォルトはauto(ブラウザのロケールに応じて自動設定)で、他にja,en,zh-CN,zh-TWを指定できます。
      </td>
    </tr>
  </tbody>
</Table>

<a name="Elepay+handleCharge"></a>

### elepay.handleCharge(charge) ⇒ <code>Promise</code>

Charge オブジェクトを渡して、支払い処理を行います。

**Kind**: instance method of [<code>Elepay</code>](#Elepay)\
**Returns**: <code>Promise</code> - 支払い処理結果のPromise。frontUrl設定必要の決済方法はfrontUrlで決済結果を戻ります。  

<Table>
  <thead>
    <tr>
      <th>
        Param
      </th>

      <th>
        Type
      </th>

      <th>
        Description
      </th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>
        charge
      </td>

      <td>
        <code>object</code>
      </td>

      <td>
        必須 サーバー側作成した Charge オブジェクト
      </td>
    </tr>
  </tbody>
</Table>

**Example**  

```js
elepay.handleCharge(chargeObject).then(function(result) {
  // 正常処理
  if (result.type === 'cancel') {
    // 支払いキャンセル
  } else if (result.type === 'success') {
    // 支払い成功
  }
}).catch(function(err) {
  // エラー処理
})
```

<a name="Elepay+handleSource"></a>

### elepay.handleSource(source) ⇒ <code>Promise</code>

Source オブジェクトを渡して、承認処理を行います。

**Kind**: instance method of [<code>Elepay</code>](#Elepay)\
**Returns**: <code>Promise</code> - 承認処理結果のPromise。frontUrl設定必要の決済方法はfrontUrlで承認結果を戻ります。  

<Table>
  <thead>
    <tr>
      <th>
        Param
      </th>

      <th>
        Type
      </th>

      <th>
        Description
      </th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>
        source
      </td>

      <td>
        <code>object</code>
      </td>

      <td>
        必須 サーバー側作成した Source オブジェクト
      </td>
    </tr>
  </tbody>
</Table>

**Example**  

```js
elepay.handleSource(source).then(function(result) {
  // 正常処理
  if (result.type === 'cancel') {
    // キャンセル
  } else if (result.type === 'success') {
    // 承認成功
  }
}).catch(function(err) {
  // エラー処理
})
```

<a name="Elepay+createCodeWidget"></a>

### elepay.createCodeWidget(options) ⇒ <code>CodesWidget</code>

EasyQRウィジェットを生成します

**Kind**: instance method of [<code>Elepay</code>](#Elepay)\
**Returns**: <code>CodesWidget</code> - EasyQRウィジェットインスタンス  

<Table>
  <thead>
    <tr>
      <th>
        Param
      </th>

      <th>
        Type
      </th>

      <th>
        Description
      </th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>
        options
      </td>

      <td>
        <code>object</code>
      </td>

      <td>
        ウィジェットオプション
      </td>
    </tr>

    <tr>
      <td>
        options.container
      </td>

      <td>
        <code>string</code>
      </td>

      <td>
        配置先のDOM要素のCSSセレクターを表す文字列
      </td>
    </tr>

    <tr>
      <td>
        options.direction
      </td>

      <td>
        <code>string</code>
      </td>

      <td>
        ウィジェットレイアウト 縦:vertical(デフォルト) 横:horizontal
      </td>
    </tr>

    <tr>
      <td>
        options.icon
      </td>

      <td>
        <code>boolean</code>
      </td>

      <td>
        trueならブランドアイコン入りQRコードを表示。デフォルトはfalse
      </td>
    </tr>

    <tr>
      <td>
        options.parts.amount
      </td>

      <td>
        <code>boolean</code>
      </td>

      <td>
        trueなら金額を表示。デフォルトはtrue
      </td>
    </tr>

    <tr>
      <td>
        options.parts.paymentLogo
      </td>

      <td>
        <code>boolean</code>
      </td>

      <td>
        trueなら決済方法アイコンを表示。デフォルトはtrue
      </td>
    </tr>

    <tr>
      <td>
        options.parts.tip
      </td>

      <td>
        <code>boolean</code>
      </td>

      <td>
        trueならヘルプメッセージを表示。デフォルトはtrue
      </td>
    </tr>

    <tr>
      <td>
        options.theme.primaryColor
      </td>

      <td>
        <code>boolean</code>
      </td>

      <td>
        メイン色
      </td>
    </tr>

    <tr>
      <td>
        options.theme.borderColor
      </td>

      <td>
        <code>boolean</code>
      </td>

      <td>
        ウィジェット罫線色。null:罫線なし
      </td>
    </tr>

    <tr>
      <td>
        options.theme.backgroundColor
      </td>

      <td>
        <code>boolean</code>
      </td>

      <td>
        ウィジェット背景色。デフォルトは白
      </td>
    </tr>
  </tbody>
</Table>

**Example**  

```js
var widget = elepay.createCodeWidget({
  container: '#widget'
})
widget.on('success', () => {
  // 決済完了後処理
})
widget.on('expired', () => {
  // 新しいEasyQRコードを生成するなと
})
widget.show('cod_028123beb9f8c853fa845f4')
```

<a name="Elepay+checkout"></a>

### elepay.checkout(code) ⇒ <code>Promise</code>

EasyCheckout 処理を行います。

**Kind**: instance method of [<code>Elepay</code>](#Elepay)\
**Returns**: <code>Promise</code> - Checkout処理のPromise。エラーの場合だけ、処理する必要があります。  

<Table>
  <thead>
    <tr>
      <th>
        Param
      </th>

      <th>
        Type
      </th>

      <th>
        Description
      </th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>
        code
      </td>

      <td>
        <code>object</code>
      </td>

      <td>
        必須 サーバー側作成した EasyQR オブジェクトID
      </td>
    </tr>
  </tbody>
</Table>

**Example**  

```js
elepay.checkout('cod_028123beb9f8c853fa845f4').catch(function(err) {
  // エラー処理
})
```

<a name="CodesWidget"></a>

## CodesWidget

EasyQRウィジェットクラス

**Kind**: global class  

* [CodesWidget](#CodesWidget)
  * [.show(code)](#CodesWidget+show)
  * [.destroy()](#CodesWidget+destroy)
  * ["success" (ev, codeObject)](#CodesWidget+event_success)
  * ["expired" (ev, codeObject)](#CodesWidget+event_expired)
  * ["error" (ev, error)](#CodesWidget+event_error)

<a name="CodesWidget+show"></a>

### codesWidget.show(code)

EasyQRウィジェットを表示します

**Kind**: instance method of [<code>CodesWidget</code>](#CodesWidget)  

<Table>
  <thead>
    <tr>
      <th>
        Param
      </th>

      <th>
        Type
      </th>

      <th>
        Description
      </th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>
        code
      </td>

      <td>
        <code>string</code>
      </td>

      <td>
        必須 サーバー側作成した EasyQR オブジェクトID
      </td>
    </tr>
  </tbody>
</Table>

**Example**  

```js
widget.show('cod_028123beb9f8c853fa845f4')
```

<a name="CodesWidget+destroy"></a>

### codesWidget.destroy()

EasyQRウィジェットを破棄します

**Kind**: instance method of [<code>CodesWidget</code>](#CodesWidget)\ <a name="CodesWidget+event_success"></a>

### "success" (ev, codeObject)

支払完了イベント

**Kind**: event emitted by [<code>CodesWidget</code>](#CodesWidget)  

<Table>
  <thead>
    <tr>
      <th>
        Param
      </th>

      <th>
        Type
      </th>

      <th>
        Description
      </th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>
        ev
      </td>

      <td>
        <code>object</code>
      </td>

      <td>
        イベント
      </td>
    </tr>

    <tr>
      <td>
        ev.type
      </td>

      <td>
        <code>string</code>
      </td>

      <td>
        success
      </td>
    </tr>

    <tr>
      <td>
        codeObject
      </td>

      <td>
        <code>object</code>
      </td>

      <td>
        EasyQRコードオブジェクト
      </td>
    </tr>
  </tbody>
</Table>

**Example**  

```js
widget.on('success', function (ev, codeObject) {
  // 決済完了後処理
})
```

<a name="CodesWidget+event_expired"></a>

### "expired" (ev, codeObject)

EasyQRコード期限切れイベント

**Kind**: event emitted by [<code>CodesWidget</code>](#CodesWidget)  

<Table>
  <thead>
    <tr>
      <th>
        Param
      </th>

      <th>
        Type
      </th>

      <th>
        Description
      </th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>
        ev
      </td>

      <td>
        <code>object</code>
      </td>

      <td>
        イベント
      </td>
    </tr>

    <tr>
      <td>
        ev.type
      </td>

      <td>
        <code>string</code>
      </td>

      <td>
        expired
      </td>
    </tr>

    <tr>
      <td>
        codeObject
      </td>

      <td>
        <code>object</code>
      </td>

      <td>
        EasyQRコードオブジェクト
      </td>
    </tr>
  </tbody>
</Table>

**Example**  

```js
widget.on('expired', function (ev, codeObject) {
  // 新しいEasyQRコードを生成するなと
})
```

<a name="CodesWidget+event_error"></a>

### "error" (ev, error)

エラーイベント

**Kind**: event emitted by [<code>CodesWidget</code>](#CodesWidget)  

<Table>
  <thead>
    <tr>
      <th>
        Param
      </th>

      <th>
        Type
      </th>

      <th>
        Description
      </th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>
        ev
      </td>

      <td>
        <code>object</code>
      </td>

      <td>
        イベント
      </td>
    </tr>

    <tr>
      <td>
        ev.type
      </td>

      <td>
        <code>string</code>
      </td>

      <td>
        error
      </td>
    </tr>

    <tr>
      <td>
        error
      </td>

      <td>
        <code>Error</code>
      </td>

      <td>
        エラーオブジェクト
      </td>
    </tr>
  </tbody>
</Table>

**Example**  

```js
widget.on('error', function (ev, err) {
  // エラー処理
})
```
