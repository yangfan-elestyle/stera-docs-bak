---
title: （変更前）エラーコード
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
      slug: webhook
      title: Webhook
---
ここでは stera smart one で発生するエラーコードについて説明します。

# API の HTTP 接続ステータスコード

基本的に、三種類のステータスコードが返されます。

| コード     | 説明                                                               |
| :------ | :--------------------------------------------------------------- |
| **2xx** | **Success 成功**<br />リクエストは正常に受理された                               |
| **4xx** | **Client Error クライアント側のエラー**<br />クライアントからのリクエストに誤りがあった。         |
| **5xx** | **Server Error サーバ側のエラー**<br />stera smart one サーバがリクエストの処理に失敗した |

# エラーコードの詳細

<Table align={["left","left","left","left"]}>
  <thead>
    <tr>
      <th>
        コード
      </th>

      <th>
        説明
      </th>

      <th>
        詳細
      </th>

      <th>
        発生元
      </th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>
        **10000**
      </td>

      <td>
        SDK not initialized.<br />SDKが初期化していません
      </td>

      <td>

      </td>

      <td>
        iOS SDK
      </td>
    </tr>

    <tr>
      <td>
        **10001**
      </td>

      <td>
        This service is inactive.<br />該当アプリはまだ有効していません
      </td>

      <td>
        Inactive Application. Please wait for your application been approved by stera smart one.

        アプリが stera smart one の審査を通るまでお待ちください。
      </td>

      <td>
        API
      </td>
    </tr>

    <tr>
      <td>
        **10002**
      </td>

      <td>
        This paymentMethod is inactive.<br />該当決済方法はまだ有効していません
      </td>

      <td>
        Inactive Payment Method.

        決済方法が stera smart one の設定を完了までお待ちください。
      </td>

      <td>
        API
      </td>
    </tr>

    <tr>
      <td>
        **10003**
      </td>

      <td>
        The payment method is invalid.<br />無効な決済方法
      </td>

      <td>
        Invalid Payment Method.

        stera smart one が対応していない決済方法です。
      </td>

      <td>
        API
      </td>
    </tr>

    <tr>
      <td>
        **10011**
      </td>

      <td>
        SDK initialization is not finished yet.<br />SDKの初期化処理がまだ完了していません
      </td>

      <td>
        It is recommended to initialize the SDK as soon as your App starts.<br />If you make a payment request immediately after calling the SDK's initialization method, there is a high possibility that the error will occur.

        SDK の初期化は、アプリが起動しましたらすぐ行う事を推奨します。<br />SDKの初期化方法を呼び出したあと直ぐに、決済リクエストをしますと、該当エラーを発生する可能性が高くなります。
      </td>

      <td>
        iOS SDK
      </td>
    </tr>

    <tr>
      <td>
        **10100**
      </td>

      <td>
        Required payment method not supported by user device.<br />ユーザーの設備が該当決済方法に対応していません
      </td>

      <td>
        e.g. The OS is too old to support such payment method. or Apple Pay is disabled on user device, or there is no valid credit card in Wallet.app of iOS system.<br />NOTE: You will also get this error if Apple Pay is not enabled in Xcode build settings.

        例：システムバージョンが古いため、選択された決済方法にサポートされませんや、ユーザーのiOS設備がApple Payに対応していませんか、利用できるクレジットカードをiOSの財布アプリに登録していません。<br />また、Xcodeの開発設定に、Apple Payを有効に設定してない場合でも、該当エラーが発生します。
      </td>

      <td>
        iOS SDK
      </td>
    </tr>

    <tr>
      <td>
        **10101**
      </td>

      <td>
        Credit card is declined.<br />無効なクレジットカード
      </td>

      <td>
        e.g. Wrong card number, expired card.

        例：カードナンバーが不正、カードの有効期間が不正など。
      </td>

      <td>
        API, Android SDK, iOS SDK
      </td>
    </tr>

    <tr>
      <td>
        **10102**
      </td>

      <td>
        Invalid amount.<br />金額が不正
      </td>

      <td>
        User has input an invalid amount, the charging could not be processed.

        金額が過大もしくは過小など。
      </td>

      <td>
        API, Android SDK
      </td>
    </tr>

    <tr>
      <td>
        **10103**
      </td>

      <td>
        Invalid charge ID<br />「Charge ID」が不正
      </td>

      <td>

      </td>

      <td>
        Android SDK
      </td>
    </tr>

    <tr>
      <td>
        **10104**
      </td>

      <td>
        Invalid payload<br />「Payload」が不正
      </td>

      <td>
        Could not parse the given payload data.

        SDKに不正なデータを送信しました。
      </td>

      <td>
        Android SDK, iOS SDK
      </td>
    </tr>

    <tr>
      <td>
        **10105**
      </td>

      <td>
        Invalid payload (Same as 10104, developer do not need to care about the difference)<br />「Payload」が不正。<br />開発者側は、このエラーが「10104」と一緒です。
      </td>

      <td>
        Could not parse the given payload data.

        SDKに不正なデータを送信しました。
      </td>

      <td>
        Android SDK, iOS SDK
      </td>
    </tr>

    <tr>
      <td>
        **10106**
      </td>

      <td>
        Invalid resource<br />「resources」が不正。
      </td>

      <td>
        Payload is not for current platform.<br />e.g. Using Web's payload on iOS App.

        使っている Payload は別のプラットフォームのデータ。<br />例：Web 用の Payload を iOS SDK に送信した場合。
      </td>

      <td>
        Android SDK, iOS SDK
      </td>
    </tr>

    <tr>
      <td>
        **10107**
      </td>

      <td>
        Invalid status<br />「status」が不正。
      </td>

      <td>
        "status" of Payload is not valid for processing.

        Payload の status は不正のため処理できません。
      </td>

      <td>
        Android SDK, iOS SDK
      </td>
    </tr>

    <tr>
      <td>
        **10108**
      </td>

      <td>
        The charge is already refunded.<br />該当決済は既に返金済み
      </td>

      <td>

      </td>

      <td>
        API
      </td>
    </tr>

    <tr>
      <td>
        **10109**
      </td>

      <td>
        Not captured, refused refund<br />該当決済は未完成のため、返金出来ません
      </td>

      <td>

      </td>

      <td>
        API
      </td>
    </tr>

    <tr>
      <td>
        **10100**
      </td>

      <td>
        Payment method unsupported by user device<br />ユーザーのデバイスが該当決済方法に対応していません
      </td>

      <td>
        e.g.: When using Apple Pay, the user's device has no supported credit card added or the device dose not support Apple Pay at all.

        例：ユーザーのスマホにApple Payで利用可能なクレジットカードが登録していないか、スマホのApple Payが無効に設定したしました。
      </td>

      <td>
        iOS SDK, Android SDK
      </td>
    </tr>

    <tr>
      <td>
        **10110**
      </td>

      <td>
        3rd party payment App not installed<br />決済事業者のアプリがインストールされていません
      </td>

      <td>
        e.g: PayPay App or WeChat App is not installed. You should handle this error code and lead user to the install page for better experience.

        例：PayPayアプリやWeChatアプリがインストールされていません。このエラーコードを処理し、ユーザーをインストールページに誘導してエクスペリエンスを向上させる必要があります。
      </td>

      <td>
        iOS SDK, Android SDK
      </td>
    </tr>

    <tr>
      <td>
        **10111**
      </td>

      <td>
        Not found error.<br />データが存在しません
      </td>

      <td>
        e.g: Charge ID cannot be found in stera smart one system.

        例：「Charge ID」が存在しません。
      </td>

      <td>
        API
      </td>
    </tr>

    <tr>
      <td>
        **40012**
      </td>

      <td>
        Order number is required.<br />「注文番号」が必須
      </td>

      <td>

      </td>

      <td>
        API
      </td>
    </tr>

    <tr>
      <td>
        **40013**
      </td>

      <td>
        FrontUrl is required.<br />「frontUrl」が必須
      </td>

      <td>

      </td>

      <td>
        API
      </td>
    </tr>

    <tr>
      <td>
        **40015**
      </td>

      <td>
        Buyer name is required.<br />「注文者のお名前」が必須
      </td>

      <td>

      </td>

      <td>
        API
      </td>
    </tr>

    <tr>
      <td>
        **40018**
      </td>

      <td>
        Buyer zip is required.<br />「注文者の郵便番号」が必須
      </td>

      <td>

      </td>

      <td>
        API
      </td>
    </tr>

    <tr>
      <td>
        **40019**
      </td>

      <td>
        Buyer address1 is required.<br />「注文者の住所１」が必須
      </td>

      <td>

      </td>

      <td>
        API
      </td>
    </tr>

    <tr>
      <td>
        **40020**
      </td>

      <td>
        Buyer address2 is required.<br />「注文者の住所２」が必須
      </td>

      <td>

      </td>

      <td>
        API
      </td>
    </tr>

    <tr>
      <td>
        **40021**
      </td>

      <td>
        The orderNo length is invalid.<br />「注文番号」の長さが不正、最大桁数が20桁です。
      </td>

      <td>

      </td>

      <td>
        API
      </td>
    </tr>

    <tr>
      <td>
        **40022**
      </td>

      <td>
        The order\_no already be used.<br />「注文番号」が重複しています
      </td>

      <td>

      </td>

      <td>
        API
      </td>
    </tr>

    <tr>
      <td>
        **40023**
      </td>

      <td>
        The currency is invalid.<br />「通貨コード」が不正
      </td>

      <td>

      </td>

      <td>
        API
      </td>
    </tr>

    <tr>
      <td>
        **40024**
      </td>

      <td>
        Product name is required.<br />「注文商品の名称」が必須
      </td>

      <td>

      </td>

      <td>
        API
      </td>
    </tr>

    <tr>
      <td>
        **40025**
      </td>

      <td>
        This charge does not support partial refund.<br />該当決済は一部返金できません
      </td>

      <td>

      </td>

      <td>
        API
      </td>
    </tr>

    <tr>
      <td>
        **40026**
      </td>

      <td>
        This charge does not support refund.<br />該当決済は返金できません
      </td>

      <td>

      </td>

      <td>
        API
      </td>
    </tr>

    <tr>
      <td>
        **40027**
      </td>

      <td>
        Invalid request body.<br />リクエストボディは不正
      </td>

      <td>

      </td>

      <td>
        API
      </td>
    </tr>

    <tr>
      <td>
        **40028**
      </td>

      <td>
        Source is not supported for this payment method.<br />該当決済方法はSource決済できません
      </td>

      <td>

      </td>

      <td>
        API
      </td>
    </tr>

    <tr>
      <td>
        **40029**
      </td>

      <td>
        Multiple source is not supported for the payment method.<br />該当決済方法は複数Sourceを保存できません
      </td>

      <td>

      </td>

      <td>
        API
      </td>
    </tr>

    <tr>
      <td>
        **40030**
      </td>

      <td>
        Source id or customer id is invalid.<br />リクエストボディにCustomer IDあるいはSource IDは不正
      </td>

      <td>

      </td>

      <td>
        API
      </td>
    </tr>

    <tr>
      <td>
        **40031**
      </td>

      <td>
        Source id is not suitable for the payment method.<br />Source IDと決済方法は合わない
      </td>

      <td>

      </td>

      <td>
        API
      </td>
    </tr>

    <tr>
      <td>
        **40034**
      </td>

      <td>
        This charge does not support multiple refund.<br />該当決済は複数回返金できません
      </td>

      <td>

      </td>

      <td>
        API
      </td>
    </tr>

    <tr>
      <td>
        **40035**
      </td>

      <td>
        Payment resource is invalid.<br />「Resource」は不正
      </td>

      <td>

      </td>

      <td>
        API
      </td>
    </tr>

    <tr>
      <td>
        **40101**
      </td>

      <td>
        Offline code is expired.<br />「決済コード」が期限切れになっています
      </td>

      <td>

      </td>

      <td>
        API
      </td>
    </tr>

    <tr>
      <td>
        **40102**
      </td>

      <td>
        Offline code is invalid.<br />「決済コード」が不正
      </td>

      <td>

      </td>

      <td>
        API
      </td>
    </tr>

    <tr>
      <td>
        **40103**
      </td>

      <td>
        Not enough balance.<br />残高が不足しています
      </td>

      <td>

      </td>

      <td>
        API
      </td>
    </tr>

    <tr>
      <td>
        **40104**
      </td>

      <td>
        Not supported card.<br />カードがサポートしていない
      </td>

      <td>

      </td>

      <td>
        API
      </td>
    </tr>

    <tr>
      <td>
        **40105**
      </td>

      <td>
        Charge has already been closed.<br />決済できない
      </td>

      <td>

      </td>

      <td>
        API
      </td>
    </tr>

    <tr>
      <td>
        **40106**
      </td>

      <td>
        Amount limit exceeded.<br />決済可能金額を超えています。
      </td>

      <td>

      </td>

      <td>
        API
      </td>
    </tr>

    <tr>
      <td>
        **40110**
      </td>

      <td>
        Other offline error occurred.<br />その他エラーが発生しました
      </td>

      <td>

      </td>

      <td>
        API
      </td>
    </tr>

    <tr>
      <td>
        **50000**
      </td>

      <td>
        An error occurred on stera smart one server.<br />予期せぬエラーが発生した
      </td>

      <td>

      </td>

      <td>
        API
      </td>
    </tr>

    <tr>
      <td>
        **50001**
      </td>

      <td>
        Bad network.<br />通信障害が発生しました
      </td>

      <td>
        Generic network error.

        stera smart one サーバーとの通信が中断しました。
      </td>

      <td>
        Android SDK, iOS SDK
      </td>
    </tr>

    <tr>
      <td>
        **50002**
      </td>

      <td>
        Invalid data received.<br />データが不正
      </td>

      <td>
        e.g. The data received is not from stera smart one server

        例：対応出来ないデータが受信しました。
      </td>

      <td>
        Android SDK, iOS SDK, HTML5 SDK
      </td>
    </tr>

    <tr>
      <td>
        **50003**
      </td>

      <td>
        An error occurred when communicating with payment provider<br />各決済サーバとの通信障害が発生しました
      </td>

      <td>

      </td>

      <td>
        API
      </td>
    </tr>

    <tr>
      <td>

      </td>

      <td>

      </td>

      <td>

      </td>

      <td>

      </td>
    </tr>
  </tbody>
</Table>

<br />