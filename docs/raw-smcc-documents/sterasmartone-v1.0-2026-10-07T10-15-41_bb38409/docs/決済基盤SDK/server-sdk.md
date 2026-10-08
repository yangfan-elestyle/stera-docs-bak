---
title: Server SDK
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
      slug: ios-sdk
      title: iOS SDK
    - type: basic
      slug: android-sdk
      title: Android SDK
    - type: basic
      slug: h5-sdk
      title: H5 SDK
---
stera smart one ではさまざまな言語や EC サービスをサポートしております。より幅広い開発者の方をサポートするため、今後も SDK を増やしていく予定です。

# 公式 SDK

- Java
- PHP
- Ruby (準備中)
- Python (準備中)

## Java

JDK 1.8以上が必要です。

### 手動インストール

Github から SDK をダウンロードし、libs の下にある jar ファイルをインポートします。

### maven インストール

SDK の追加

```xml
<dependency>
    <groupId>io.elepay</groupId>
    <artifactId>elepay-java-sdk</artifactId>
    <version>1.2.2</version>
</dependency>
```

### gradle インストール

SDK の追加

```
compile 'io.elepay:elepay-java-sdk:1.2.2'
```

## PHP

PHP 7.3 以上が必要です。

### 手動インストール

```
require_once('/path/to/ElepayApi/vendor/autoload.php');
```

### Composer でインストール

1. `composer.json`に下記のコードを追加

```
{
  "require": {
    "elestyle/elepay-php-sdk": ">=1.2.0"
  }
}
```

2. `composer install`を実行

```
composer install
```

<br />
