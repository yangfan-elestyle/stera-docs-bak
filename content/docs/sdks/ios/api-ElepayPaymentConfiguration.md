---
title: ElepayPaymentConfiguration
---

A configuration class that manages payment service availability and SDK settings.

    final class ElepayPaymentConfiguration

# Overview

The `ElepayPaymentConfiguration` class provides functionality to:

- Check the availability of third-party payment services
- Verify if required payment apps are installed on the user’s device
- Configure SDK behavior settings

# Usage

Always access the configuration through the shared instance:

    let config = Elepay.paymentConfiguration

# Important Notes

- Always use the `paymentConfiguration` instance from the `Elepay` class
- Some internal properties are automatically configured during runtime
- Use this class to customize default SDK behavior

# Topics

## Instance Properties

### cardScanningEnabled

    var cardScanningEnabled: Bool

Controls the availability of the built-in card scanning feature.

#### Discussion

When enabled, users can scan their credit cards using the device’s camera in the credit card input view. This feature enhances the user experience by automating card information entry.
The default value is true.

## Instance Methods

### deviceSupportsApplePay

    func deviceSupportsApplePay() -> Bool

Determines if the current device has Apple Pay capability.

#### Return Value

true if the device supports Apple Pay, false otherwise.

#### Discussion

This method checks two conditions:

- The presence of PassKit payment authorization functionality
- The device’s ability to make payments using Apple Pay

### downloadRPay

    func downloadRPay()

Initiates the download of the Rakuten Pay application.

#### Discussion

This convenience method helps users download the RPay application when it’s not installed on their device. It redirects users to the App Store page for RPay.

#### Note

This method should typically be called after checking isRPayInstalled() returns false and the user agrees to download the application.

#### Important

After downloading and installing RPay, users will need to set up their account before they can make payments.

### isApplePayEnabled

    func isApplePayEnabled() -> Bool

Determines if Apple Pay can be used for payments.

#### Return Value

true if Apple Pay is both supported and properly configured, false otherwise.

#### Discussion

This method checks both device capability and proper configuration:
Verifies if an Apple Merchant ID has been set in the elepay account
Confirms the device supports Apple Pay

### isAuPayInstalled

    func isAuPayInstalled() -> Bool

Checks if au PAY application is installed on the user’s device.

#### Return Value

A boolean value indicating whether au PAY is available.

#### Discussion

This method verifies the presence of the au PAY application by attempting to resolve the au PAY URL scheme. It’s essential to perform this check before initiating an au PAY payment flow to ensure the best possible user experience.

#### Important

Configuration Required Before using this method, you must configure your app’s Info.plist file. Add the following entry under `LSApplicationQueriesSchemes`:

    <key>LSApplicationQueriesSchemes</key>
    <array>
        <string>auwallet</string>
    </array>

#### Warning

Without the proper Info.plist configuration, this method will always return `false` due to iOS security restrictions on URL scheme queries.

### isLinePayInstalled

    func isLinePayInstalled() -> Bool

Checks if LINE Pay application is installed on the user’s device.

#### Return Value

A boolean value indicating whether LINE Pay is available.

#### Discussion

This method verifies the presence of the LINE Pay application by attempting to resolve the LINE Pay URL scheme. It’s a crucial check before initiating a LINE Pay payment flow to ensure the best possible user experience.

#### Important

Configuration Required Before using this method, you must configure your app’s Info.plist file. Add the following entry under `LSApplicationQueriesSchemes`:

    <key>LSApplicationQueriesSchemes</key>
    <array>
        <string>line</string>
    </array>

#### Warning

Without the proper Info.plist configuration, this method will always return `false` due to iOS security restrictions on URL scheme queries.

### isPayPayInstalled

    func isPayPayInstalled() -> Bool

Checks if PayPay application is installed on the user’s device.

#### Return Value

A boolean value indicating whether PayPay is available.

#### Discussion

This method verifies the presence of the PayPay application by attempting to resolve the PayPay URL scheme. It’s a crucial check before initiating a PayPay payment flow to ensure the best possible user experience.

#### Important

Configuration Required Before using this method, you must configure your app’s Info.plist file. Add the following entry under `LSApplicationQueriesSchemes`:

    <key>LSApplicationQueriesSchemes</key>
    <array>
        <string>paypay</string>
    </array>

#### Warning

Without the proper Info.plist configuration, this method will always return `false` due to iOS security restrictions on URL scheme queries.

### isRPayInstalled

    func isRPayInstalled() -> Bool

Checks if Rakuten Pay (RPay) application is installed on the user’s device.

#### Return Value

A boolean value indicating whether RPay is available.

#### Discussion

This method verifies the presence of the RPay application through the RPay SDK bridge. It’s essential to perform this check before initiating an RPay payment flow to ensure the best possible user experience.

#### Important

Configuration Required Before using this method, you must configure your app’s Info.plist file. Add the following entry under `LSApplicationQueriesSchemes`:

    <key>LSApplicationQueriesSchemes</key>
    <array>
        <string>rakutenpaysdk</string>
    </array>

#### Warning

Without the proper Info.plist configuration, this method will always return `false` due to iOS security restrictions on URL scheme queries.

### isWeChatPayInstalled

    func isWeChatPayInstalled() -> Bool

Checks if WeChat Pay application is installed on the user’s device.

#### Return Value

A boolean value indicating whether WeChat Pay is available.

#### Discussion

This method verifies the presence of the WeChat Pay application by attempting to resolve both the standard WeChat URL scheme and the WeChat ULAPI URL scheme. It’s essential to perform this check before initiating a WeChat Pay payment flow to ensure the best possible user experience.

#### Important

Configuration Required Before using this method, you must configure your app’s Info.plist file. Add the following entries under `LSApplicationQueriesSchemes`:

    <key>LSApplicationQueriesSchemes</key>
    <array>
        <string>weixin</string>
        <string>weixinURLAPI</string>
    </array>

#### Warning

Without the proper Info.plist configuration, this method will always return `false` due to iOS security restrictions on URL scheme queries.
