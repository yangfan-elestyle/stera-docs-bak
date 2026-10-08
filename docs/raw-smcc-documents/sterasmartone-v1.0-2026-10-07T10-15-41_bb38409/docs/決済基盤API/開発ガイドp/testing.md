---
title: テスト情報
excerpt: ''
deprecated: false
hidden: true
metadata:
  title: ''
  description: ''
  robots: noindex
next:
  description: ''
---
ここではTest環境での決済テスト情報を説明します。

# 共通

<Table align={["left","left"]}>
  <thead>
    <tr>
      <th>
        処理
      </th>

      <th>
        説明
      </th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>
        支払い
      </td>

      <td>
        * 決済方法ごとに支払いテスト情報が異なります。
        * 本当のユーザアカウント :\
           Alipay、雲支払、LinePay
        * テストアカウント:\
           UnionPay, Creditcard、ApplePay、\
           Google Pay、Paypal、Paidy
      </td>
    </tr>

    <tr>
      <td>
        返金
      </td>

      <td>
        * elepay Adminで手動返金処理できます。
        * 手動返金しない場合、60日後自動的に返金いたします。
      </td>
    </tr>
  </tbody>
</Table>

# Alipay

<Table align={["left","left"]}>
  <thead>
    <tr>
      <th>
        処理
      </th>

      <th>
        テスト情報
      </th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>
        支払い
      </td>

      <td>
        * 本当のAlipayのユーザカウントで支払います。
      </td>
    </tr>
  </tbody>
</Table>

# UnionPay

<Table align={["left","left"]}>
  <thead>
    <tr>
      <th>
        処理
      </th>

      <th>
        テスト情報
      </th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>
        支払い
      </td>

      <td>
        * テストアカウント情報で支払います。
        * テストカード情報A\
          Card Number：5200-8311-1111-1113\
          Mobile：135-5253-5506\
          CVN2(CVC)：123\
          Exp.Date：2019年11月\
          SMS Code for PC：111111\
          SMS Code for Mobile：123456
        * テストカード情報B\
          Card Number：6226388000000095\
          Mobile：181-0000-0000\
          CVN2(CVC)：248\
          Exp.Date：2019年12月\
          SMS Code for PC：111111\
          SMS Code for Mobile：123456
      </td>
    </tr>
  </tbody>
</Table>

# CreditCard

<Table align={["left","left"]}>
  <thead>
    <tr>
      <th>
        処理
      </th>

      <th>
        テスト情報
      </th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>
        支払い
      </td>

      <td>
        * テストアカウントで支払います。
        * テストカード情報-VISA\
          Credit Card Number: 4000-0039-2000-0003\
          Credit Card Type: VISA\
          Expiration Date:  11/22\
          Name: elepay\
          CVC: 111
        * テストカード情報-MasterCard\
          Credit Card Number: 5555-5555-5555-4444\
          Credit Card Type: MasterCard\
          Expiration Date:  11/22\
          Name: elepay\
          CVC: 111
        * テストカード情報-American Express\
          Credit Card Number: 378-2822-4631-0005\
          Credit Card Type: Americatn Express\
          Expiration Date:  11/22\
          CVC: 111\
          Name: elepay
      </td>
    </tr>
  </tbody>
</Table>

# Paypal

<Table align={["left","left"]}>
  <thead>
    <tr>
      <th>
        処理
      </th>

      <th>
        テスト情報
      </th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>
        支払い
      </td>

      <td>
        * テストアカウントでログインして支払います。\
          login id: [test@elepay.io](mailto:test@elepay.io)\
          password : 12345678

        * テストカード情報\
          Credit Card Number: 4525-9168-1353-4406\
          Credit Card Type: VISA\
          Expiration Date:  09/2023
      </td>
    </tr>
  </tbody>
</Table>
