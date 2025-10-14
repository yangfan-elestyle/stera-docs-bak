---
title: Elepay
---

Elepay SDK

    final class Elepay

# Overview

The main class of elepay SDK that handles all payment-related operations. This class serves as the entry point for integrating payment functionality into your application. Only one SDK instance should be used throughout your application’s lifecycle.

# Topics

## Setup

### initApp

    static func initApp(key: String, apiURLString: String?)

Initializes the Elepay SDK with the necessary configuration.

- `key` The public API key obtained from the elepay console.
- `apiURLString` The URL of your private SaaS API (optional). Only required for private SaaS implementations.

#### Note

This method should be called early in your app’s lifecycle, typically in `application(_:didFinishLaunchingWithOptions:)`.

## Versions

### sdkVersion

    static let sdkVersion: String

The current version string of the Elepay SDK for iOS. This version follows semantic versioning (major.minor.patch). Returns “0.0.0” if the version cannot be determined.

## Meta Properties

### appKey

    static var appKey: String

The public API key used to initialize the SDK.

#### Discussion

This key is set during initialization and is used for all subsequent API calls.

#### Important

Keep this key secure and never expose it in client-side code.

### initializing

    static var initializing: Bool

Indicates whether the SDK is currently in the initialization process.

#### Return Value

true if the SDK is currently initializing, false otherwise.

#### Important

A false value does not indicate successful initialization. Always check isInitialized for the final initialization status.

### isInitialized

    static var isInitialized: Bool

Indicates whether the SDK has been successfully initialized.

#### Return Value

true if initialization is complete and successful, false otherwise.

#### Note

This property should be checked before making any payment requests.

#### See Also

initializing to check if initialization is in progress.

### isMakingPayments

    static var isMakingPayments: Bool

Indicates whether a payment process is currently active.

#### Return Value

true if a payment is being processed, false otherwise.

#### Important

The SDK supports only one active payment process at a time.

## Charge API

### handlePayment - json

    static func handlePayment(chargeJSON: String, cardParams: ElepayCardParams?, viewController: UIViewController, completion: ElepayResultHandler) -> Bool

Processes a payment using the charge data received from elepay’s Charge API.

- `chargeJSON` The JSON string response from elepay’s Charge API.
- `cardParams` Optional parameters for custom credit card UI. Pass nil to use the default credit card input interface.
- `viewController` The view controller where payment UI will be presented.
- `completion` Callback executed after payment completion. Provides payment result through ElepayResult.

#### Return Value

Boolean indicating if the payment request was successfully initiated.

#### Important

The completion handler is always called, regardless of the return value.

### handlePayment - data

    static func handlePayment(chargeData: Data, cardParams: ElepayCardParams?, viewController: UIViewController, completion: ElepayResultHandler) -> Bool

Processes a payment using raw charge data from elepay’s Charge API.

- `chargeData` The raw JSON Data response from elepay’s Charge API.
- `cardParams` Optional parameters for custom credit card UI.
- `viewController` The view controller where payment UI will be presented.
- `completion` Callback executed after payment completion.

#### Return Value

Boolean indicating if the payment request was successfully initiated.

#### Important

The completion handler is always called, regardless of the return value.

### handlePayment - dictionary

    static func handlePayment(charge: [String : Any], cardParams: ElepayCardParams?, viewController: UIViewController, completion: ElepayResultHandler) -> Bool

Processes a payment using a dictionary of charge data.

- `charge` Dictionary containing charge information.
- `cardParams` Optional parameters for custom credit card UI.
- `viewController` The view controller where payment UI will be presented.
- `completion` Callback executed after payment completion.

#### Return Value

Boolean indicating if the payment request was successfully initiated.

#### Important

The completion handler is always called, regardless of the return value.

## Source API

### handleSource - json

    static func handleSource(sourceJSON: String, cardParams: ElepayCardParams?, viewController: UIViewController, completion: ElepayResultHandler) -> Bool

Handle response you’ve got from elepay’s *Source API*.

- `sourceJSON` The result of elepay’s *Source API*, a JSON formatted `String` is required.
- `cardParams` Optional. Use `cardParams` for customized Credit Card input UI. You can pass `nil` to use the default Credit Card input UI.
- `viewController` The UIViewController tell elepay SDK where to display further payment UI. You should always use a currentlly visible ViewController.
- `completion` The block to execute after the payment is **succeed**, **failed** or **cancelled by user**. This block takes the following parameter: `result`. For values, check `ElepayResult`’s document.

#### Return Value

`true` if all input parameters are parsed correctlly. `false` if something wrong happened before acctually process the payment request. **NOTE**: `completion` block will always be called no matter what the return value is.

### handleSource - data

    static func handleSource(sourceData: Data, cardParams: ElepayCardParams?, viewController: UIViewController, completion: ElepayResultHandler) -> Bool

Processes a payment source from raw JSON Data.

- `sourceData` Raw JSON data containing the payment source details
- `cardParams` Custom credit card parameters for a customized input UI. Pass `nil` to use the default UI
- `viewController` The view controller from which to present payment-related UI. Must be currently visible
- `completion` Callback executed after payment completion with the following possible states:
  - `.succeeded`: Payment was successful
  - `.failed`: Payment failed with error details
  - `.cancelled`: User cancelled the payment

#### Return Value

true if parameters are valid and payment processing started successfully, false otherwise.

#### Discussion

Similar to the string-based handler but accepts Data input instead of a JSON string.

#### Note

This variant is useful when you already have the source data in Data format, avoiding unnecessary string conversion.

### handleSource - dictionary

    static func handleSource(source: [String : Any], cardParams: ElepayCardParams?, viewController: UIViewController, completion: ElepayResultHandler) -> Bool

Processes a payment source from a dictionary representation.

- `source` Dictionary containing payment source details
- `cardParams` Custom credit card parameters for a customized input UI. Pass nil to use the default UI
- `viewController` The view controller from which to present payment-related UI. Must be currently visible
- `completion` Callback executed after payment completion with the following possible states:
  - `.succeeded`: Payment was successful
  - `.failed`: Payment failed with error details
  - `.cancelled`: User cancelled the payment

#### Return Value

true if parameters are valid and payment processing started successfully, false otherwise.

#### Discussion

Provides direct handling of payment source data in dictionary format.

#### Note

This is the core implementation that other variants ultimately call.

#### Warning

The source dictionary must contain all required fields for the selected payment method.

## Checkout API

### checkout - json

    static func checkout(checkoutJSONString: String, from: UIViewController, resultHandler: ElepayResultHandler)

Initiates a checkout process using a JSON string.

- `checkoutJSONString` A JSON-formatted string obtained from Elepay’s Checkout API. This string contains all necessary payment information.
- `viewController` The view controller from which to present the payment interface. Should be the currently visible view controller in your app.
- `resultHandler` A closure that handles the payment result.

#### Discussion

This method serves as an entry point for payment processing using the Elepay SDK. It converts the provided JSON string into the required format and proceeds with the checkout process.

#### Note

The result handler receives an ElepayResult enum that indicates whether the payment succeeded, failed, or was cancelled. See ElepayResult documentation for details.

#### Important

Always ensure the view controller parameter is currently visible to the user to prevent UI presentation issues.

### checkout - data

    static func checkout(checkoutJSONData: Data, from: UIViewController, resultHandler: ElepayResultHandler)

Initiates a checkout process using JSON Data.

- `checkoutJSONData` Raw JSON data obtained from Elepay’s Checkout API. Must contain valid payment information in the expected format.
- `viewController` The view controller from which to present the payment interface. Should be the currently visible view controller in your app.
- `resultHandler` A closure that handles the payment result.

#### Discussion

This method accepts raw JSON data for payment processing. It’s useful when you already have the checkout data in Data format, eliminating the need for string conversion.

#### Note

The result handler receives an ElepayResult enum that indicates whether the payment succeeded, failed, or was cancelled. See ElepayResult documentation for details.

### checkout - dictionary

    static func checkout(checkoutJSON: [String : Any], from: UIViewController, resultHandler: ElepayResultHandler)

Initiates a checkout process using a Dictionary representation of checkout data.

- `checkoutJSON` A dictionary containing the checkout information from Elepay’s Checkout API. Must contain all required payment details in key-value format.
- `viewController` The view controller from which to present the payment interface. Should be the currently visible view controller in your app.
- `resultHandler` A closure that handles the payment result.

#### Discussion

This is the final entry point for payment processing, accepting a parsed dictionary of checkout information. This method is called internally by other checkout methods after they process their respective input formats.

#### Note

The result handler receives an ElepayResult enum that indicates whether the payment succeeded, failed, or was cancelled. See ElepayResult documentation for details.

## Configurations

### shared

    static let shared: Elepay

The shared singleton instance of the Elepay client.

#### Discussion

Use this shared instance to interact with the Elepay SDK. Only one SDK instance can be used in your App to handle payments.

### paymentConfiguration

    let paymentConfiguration: ElepayPaymentConfiguration

Configuration handler for third-party payment services and app availability checking.

#### Discussion

Use this property to check and configure various payment methods’ availability.

## Application Callback Handlers

### handleOpenURL

    static func handleOpenURL(URL, options: [UIApplication.OpenURLOptionsKey : Any]) -> Bool

Handles system URL callbacks from various payment methods.

- `url` The callback URL received from the payment system
- `options` Additional options provided by UIKit, typically from `application(_:open:options:)`

#### Return Value

A boolean indicating whether the URL was successfully handled by the SDK.

- `true` The URL was recognized and processed as a payment callback
- `false` The URL was not recognized as a supported payment callback

#### Discussion

This method should be called from your app’s `UIApplicationDelegate` when receiving payment callbacks. Supported payment methods include:

- PayPay
- Merpay
- WeChat Pay
- Alipay
- Line Pay
- And more

### handleUniversalLink

    static func handleUniversalLink(UIApplication, continue: NSUserActivity, restorationHandler: ([Any]?) -> Void) -> Bool

Handles Universal Links callbacks from payment systems.

- `application` The singleton app instance
- `userActivity` Contains the Universal Link data and context
- `restorationHandler` A callback for restoring the app state (if needed)

#### Return Value

A boolean indicating whether the Universal Link was handled.

- `true` The link was recognized and processed as a payment callback
- `false` The link was not recognized as a supported payment callback

#### Discussion

This method processes Universal Links (deep links) from payment providers that support this feature. Currently supported payment methods for Universal Links:

- WeChat Pay
- Ksher
- Stripe

Implementation Guide:

- Call this method in your `UIApplicationDelegate`’s `application(_:continue:restorationHandler:)`.
- Ensure your app has properly configured Universal Links in your Apple Developer account.
- Add the associated domains capability to your app if not already present.

## Others

### userInterfaceStyle

    static var userInterfaceStyle: UIUserInterfaceStyle

Controls the user interface style of the Elepay SDK.

#### Discussion

- Use `.light` for light mode only
- Use `.dark` for dark mode only

#### Note

Default value is `.unspecified`, which follows the system’s appearance.

### openDebugMode

    static func openDebugMode()

Enables Elepay SDK’s debug log output.

#### Discussion

Call this function to see detailed logs from the SDK in the console. It is recommended to use this only during development.
