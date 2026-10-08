---
title: App Clips
excerpt: App Clips にて stera smart one を利用する場合の注意点
deprecated: false
hidden: false
metadata:
  title: ''
  description: ''
  robots: index
next:
  description: ''
---
## 日本語

StripeApplePay Plugin for iOS は App Clips を開発する際に、アプリのサイズを小さくするための軽量化した SDK です。

### 導入方法

- Cocoapods でインストールする場合：

```ruby
pod 'Elepay_StripeApplePay_Plugin', "~> 0.1.0"
```

- 直接 XCFramework をダウンロードの場合、下記URLからダウンロードしてください。<br />[→ Elepay\_StripeApplePay\_Plugin リリースページ](https://github.com/elestyle/elepay-stripeapplepay-plugin/releases)

該当 plugin は必ず [elepay iOS SDK](https://github.com/elestyle/elepay-ios-sdk) と一緒に利用しないといけませんので、ご注意ください。

### システム要件

- iOS 11.0 以上、Xcode 12.5.1 以上
- StripeApplePay SDK は内蔵済みのため、Stripe SDK や StripeAppleSDK のインポートが不要です
- App Clip の target に既に Stripe SDK をインポートしている場合は、こちらの plugin が機能的に重複になるため、同時にご利用しないてください

### 設置例

App Clips で該当 plugin を利用する際に Podfile の設置例

```ruby
# Uncomment the next line to define a global platform for your project
platform :ios, '11.0'

project 'Example.xcodeproj'
workspace 'Example.xcworkspace'

def elepay_pods
  use_frameworks!

  # Pods for the full functional App
  pod 'ElepaySDK', '~> 3.4.0'
  pod 'Stripe', '~> 21.13.0'
  
  # The Chinese Payment Methods Plugin, use this plugin only when you need support WeChat Pay
  pod 'Elepay_ChinesePayments_Plugin', '~> 2.1.0'
end

def elepay_app_clip_pods
  use_frameworks!

  # Pods for the App Clip
  pod 'ElepaySDK', '~> 3.4.0'
  pod 'Elepay_StripeApplePay_Plugin', "~> 0.1.0"
end

target 'YourFullFunctionalAppTarget' do
  elepay_pods
end

target 'YourAppClipTarget' do
  elepay_app_clip_pods
end
```

## English

The StripeApplePay Plugin for iOS provides a lightweight plugin for offering Apple Pay in an App Clip.<br />You can now remove Stripe SDK when making App Clips to reduce the binary size.

### How to use the plugin

- Install using Cocoapods:

```ruby
pod 'Elepay_StripeApplePay_Plugin', "~> 0.1.0"
```

- Directly download the XCFramework:<br />[→ Elepay\_StripeApplePay\_Plugin Releases Page](https://github.com/elestyle/elepay-stripeapplepay-plugin/releases)

**NOTE:** The plugin does NOT work by itself. You should always install this plugin with [elepay iOS SDK](https://github.com/elestyle/elepay-ios-sdk).

### System Requirement

- iOS 11.0 and above, Xcode 12.5.1 and above
- The `Elepay-StripeApplePay-Plugin` already has StripeApplePay SDK embedded, so you need to import only `ElepaySDK` and `Elepay-StripeApplePay-Plugin` when buiding your App Clip.
- Do not import Stripe SDK or StripeApplePaySDK in the same App Clip target with this plugin.

### Example

The sample Podfile when using the plugin for your App Clip

```ruby
# Uncomment the next line to define a global platform for your project
platform :ios, '11.0'

project 'Example.xcodeproj'
workspace 'Example.xcworkspace'

def elepay_pods
  use_frameworks!

  # Pods for the full functional App
  pod 'ElepaySDK', '~> 3.4.0'
  pod 'Stripe', '~> 21.13.0'
  
  # The Chinese Payment Methods Plugin, use this plugin only when you need support WeChat Pay
  pod 'Elepay_ChinesePayments_Plugin', '~> 2.1.0'
end

def elepay_app_clip_pods
  use_frameworks!

  # Pods for the App Clip
  pod 'ElepaySDK', '~> 3.4.0'
  pod 'Elepay_StripeApplePay_Plugin', "~> 0.1.0"
end

target 'YourFullFunctionalAppTarget' do
  elepay_pods
end

target 'YourAppClipTarget' do
  elepay_app_clip_pods
end
```

<br />
