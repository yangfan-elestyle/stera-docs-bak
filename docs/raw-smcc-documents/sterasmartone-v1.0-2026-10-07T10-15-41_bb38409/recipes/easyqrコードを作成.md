---
title: EasyQRコードを作成
description: Checkoutページを生成
hidden: false
recipe:
  color: '#018FF4'
  icon: 🦉
---
```shell Shell
curl --request POST \
     --url https://api.elepay.io/codes \
     --header 'accept: application/json;charset=utf-8' \
     --header 'content-type: application/json;charset=utf-8' \
     --header 'authorization: Bearer [秘密鍵]'
     --data '
{
  "currency": "JPY",
  "items": [
    {
      "name": "商品1",
      "price": 100,
      "count": 1
    }
  ],
  "amount": 500,
  "orderNo": "0419"
}'
```

```node Node
const fetch = require('node-fetch');

const url = 'https://api.elepay.io/codes';
const options = {
  method: 'POST',
  headers: {
    'accept': 'application/json;charset=utf-8',
    'content-type': 'application/json;charset=utf-8',
    'authorization': 'Bearer [秘密鍵]'
  },
  body: JSON.stringify({
    currency: 'JPY',
    amount: 500,
    orderNo: '0419',
    items: [
      {
        name: '商品1',
        price: 100,
        count: 1
      }
    ]
  })
};

fetch(url, options)
  .then(res => res.json())
  .then(json => console.log(json))
  .catch(err => console.error(err));
```

```ruby Ruby
require 'uri'
require 'net/http'

url = URI("https://api.elepay.io/codes")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["accept"] = 'application/json;charset=utf-8'
request["content-type"] = 'application/json;charset=utf-8'
request["authorization" = 'Bearer [秘密鍵]'
request.body = "{\"currency\":\"JPY\",\"amount\":500,\"orderNo\":\"0419\",\"items\":[{\"name\":\"商品1\",\"price\":100,\"count\":1}]}"

response = http.request(request)
puts response.read_body
```

```php PHP
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.elepay.io/codes', [
  'body' => '{"amount":0,"currency":"JPY","orderNo":"string","description":"string","extra":{"additionalProp":"string"},"metadata":{"additionalProp":"string"},"expiryDuration":0,"frontUrl":"string","items":[{"name":"string","image":"string","price":0,"count":0}],"locationId":"string"}',
  'headers' => [
    'accept' => 'application/json;charset=utf-8',
    'content-type' => 'application/json;charset=utf-8',
    'authorization' => 'Bearer [秘密鍵]',
  ],
]);

echo $response->getBody();
```

```json Response Example
{"success":true}
```

# バックエンドサービスをリクエスト

<!-- shell@1-4 -->
<!-- node@3-8 -->
<!-- ruby@4-11 -->
<!-- php@4-10 -->



# 秘密鍵を設定

<!-- shell@5 -->
<!-- node@9 -->
<!-- ruby@12 -->
<!-- php@11 -->



# 決済対象の商品を定義

<!-- shell@6-18 -->
<!-- node@11-22 -->
<!-- ruby@13 -->
<!-- php@7 -->

