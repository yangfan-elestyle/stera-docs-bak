---
title: 戻り先ページのURLを設定
description: 決済結果を表示するページのURLを設定してください
hidden: true
recipe:
  color: '#018FF4'
  icon: 🦉
---
```shell Shell
curl --request POST \
     --url https://api.elepay.io/codes \
     --header 'accept: application/json;charset=utf-8' \
     --header 'authorization: Bearer <<user>>' \
     --header 'content-type: application/json;charset=utf-8'
     --data '
{
  "currency": "JPY",
  "frontUrl": "https://戻り先ページのURL",
  "amount": 200,
  "orderNo": "ORDER_NO_00001"
}
'
```

```json Response Example
{"success":true}
```

# 戻り先ページのURLを設定

<!-- shell@9 -->

