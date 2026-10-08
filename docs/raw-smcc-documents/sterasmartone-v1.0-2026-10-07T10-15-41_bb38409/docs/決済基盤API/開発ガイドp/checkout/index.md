---
title: Checkout
excerpt: Checkoutを企業のWebや端末へ迅速に導入・設定
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
      slug: qrwidget
      title: デバイスにCheckout用QRコードを導入
    - type: endpoint
      slug: createcode
      title: Create EasyQR code
---
EasyCheckoutはstera smart oneが提供しているMPM型の動的QRコード機能です。主に下記の利用シーンで動的にQRコードを表示し、お客様がQRコードを読み取ってお支払いする利用シーンに使われます。

* ECウェブサイト
* セルフオーダー
* 精算機
* 券売機
* 自動販売機

![](https://files.readme.io/99db5342ab4fb12bab717470e9df68f0658f60d57a9bd18779f4fcd4c987086a-image.png)

### 導入方法

<Table align={["left","left"]}>
  <thead>
    <tr>
      <th>
        [ホスティング型](https://guides.sterasmartone.com/docs/sso-hosted)
      </th>

      <th>
        [埋め込み型](https://guides.sterasmartone.com/docs/qrwidget)
      </th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>
        ![](https://files.readme.io/1549a376af48980f8a7225dfc3f20da5f9391d18b3fd9936a162debeac85aeca-image.png)
      </td>

      <td>
        ![](https://files.readme.io/1bbf18acef17ee812b911805f01a046a6b306db5b8483eb1f370eb5e62651277-image.png)
      </td>
    </tr>

    <tr>
      <td>
        ・導入工数：ローコード、約20分\
        ・実装スタイル：ホスティングページ\
        ・UIの自由度：制限あり
      </td>

      <td>
        ・導入工数：ローコード、約40分\
        ・実装スタイル：QRコードの埋め込み\
        ・UIの自由度：制限あり
      </td>
    </tr>
  </tbody>
</Table>

### フロー

<Image align="center" src="https://files.readme.io/e13e00aa210c4ec76df5e0ed9fe49266a4db06bfaa82aa651344f36fd3433d5e-easyqr.png" />
