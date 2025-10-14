---
title: Overview
---

Elepay SDK for iOS provides seamless integration of multi-payment solutions into your iOS and iPadOS applications.

The elepay SDK for iOS offers a comprehensive payment solution that simplifies the integration of various payment methods into your application. With our All-in-One SDK, you can:

- Process multiple payment methods through a unified interface
- Handle secure card payments
- Support multiple languages out of the box
- Configure payment methods based on device capabilities

For detailed integration steps and best practices, visit our comprehensive guide: [→ Import Guide for elepay iOS SDK](https://developer.elepay.io/docs/ios-sdk)

# Topics

## Core Payment Functionality

These essential classes and enums form the backbone of payment processing:

### Discussion

    - Elepay - Main class for payment initialization and processing
    - ElepayResultHandler - Handles payment completion callbacks
    - ElepayResult - Represents payment operation results
    - ElepayError - Defines possible error scenarios
    - ElepayCardParams - Configures card payment parameters

`class Elepay`

Elepay SDK

`typealias ElepayResultHandler`

A closure type that handles the payment result callback.

`enum ElepayResult`

Represents the outcome of a payment request in the Elepay system.

`enum ElepayError`

An enumeration representing various errors that can occur during payment processing with ElepaySDK.

`class ElepayCardParams`

A class that represents credit card parameters used for payment processing.

## Configuration and Compatibility

Manage payment method availability and SDK settings:

### Discussion

    - ElepayPaymentConfiguration - Customize SDK behavior and check payment method compatibility

`class ElepayPaymentConfiguration`

A configuration class that manages payment service availability and SDK settings.

## Internationalization

The SDK provides built-in multi-language support:

### Discussion

    - ElepayLocalization - Controls runtime language settings
    - ElepayLanguageCode - Supported language identifiers

`class ElepayLocalization`

A utility class responsible for managing localization settings in the Elepay SDK.

`enum ElepayLanguageCode`

ElepayLanguageCode provides language code support for the elepay SDK.
