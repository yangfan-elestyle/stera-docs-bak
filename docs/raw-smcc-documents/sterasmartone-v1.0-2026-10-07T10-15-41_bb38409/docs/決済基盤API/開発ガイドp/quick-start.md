---
title: 概要
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
      slug: init-setting
      title: 初期設定
---
# 利用の流れ

## 利用の申し込み

![](https://files.readme.io/82a235464b775e86b80eaba21ef55d31ca3bdc3ac45177f83a6fe4f6058755a6-image.png)

stera smart one（各決済方法を含む）を申込みには、ご運営のサービスの実態が確認できる資料が必要になります。

・オンラインサービスの場合は、ご運営のWEBサイトもしくはアプリのURL、「特定商取引法に基づく表記」ページのURL、「個人情報保護方針」ページのURLなど実際運営者、及び商材が確認できる資料が必要です。サービスが公開される前の場合は、サービスの仕様書、特に商品・サービスの決済流れの説明資料が必要になります。

・オフラインサービスの場合は、店舗の実態が確認できる資料（店舗の外観、内装写真など）が必要です。営業開始前の場合は、経営場所の賃貸・売買契約書など、これからサービスの展開の事実を確認出来る資料が必要です。

詳しくは stera smart one の[ホームページ](https://support.smbc-card.com/merchant)までお問い合わせください。

> 🚧 テストアカウントについて
>
> stera smart one を利用するために、実際に決済を行うサービス（オンライン決済、対面決済）が必要です。開発のみのテスト用アカウントは各決済会社の審査に通れないため、ご提供できかねます。技術確認は当ドキュメントの [API Reference](https://guides.sterasmartone.com/reference) までご参考ください。

## ログイン

ご案内された stera smart one の管理画面にユーザ名、パスワードでログインできます。

<Image align="center" src="https://files.readme.io/84bf450-SCR-20240430-juxf-2.png" />

## API キー

stera smart one を利用するためには、全てのリクエストを公開鍵、秘密鍵を使って暗号化と複号化をする必要があります。

公開鍵、秘密鍵は共に以下の手順で確認できます。\
stera smart one 管理画面の左側のメニューから "開発設定" を選択。 "公開鍵"、"秘密鍵" にあるものがそれぞれの値となります。

> 📘 Live モードと Test モードの鍵について
>
> 公開鍵、秘密鍵とも Test モードと Live モードでは異なる値となります。Test モードから Live モードに切り替えた場合は、鍵も Liveモードのものを使うようにしてください。

![](https://files.readme.io/c54cfdc35da13157cb8b03a9bdaadb6bc312043795a41581764fa1a733a8c3f5-_2024-11-13_14.50.03.png)

## 動作確認

動作確認のために、Test モードで Charge を試してみましょう

```shell
curl --request POST \
  --url https://api.elepay.io/charges \
  --header 'Authorization: Basic sk_test_xxxxxxxxxxxxxxxxxxxxx:' \
  --header 'accept: application/json;charset=utf-8' \
  --header 'content-type: application/json;charset=utf-8'
```
