---
title: ElepayError
---

An enumeration representing various errors that can occur during payment processing with ElepaySDK.

    enum ElepayError

# Overview

`ElepayError` provides specific error cases for different scenarios that might occur during payment processing, such as unsupported payment methods, invalid data, or server-side issues. Each error case includes relevant information like error codes and messages to help with debugging and error handling.

Example usage:

    do {
        try makePayment()
    } catch let error as ElepayError {
        switch error {
        case .paymentFailure(let code, let message):
            print("Payment failed with code: \(code), message: \(message)")
        case .serverError(let code, let message):
            print("Server error occurred: \(code), \(message)")
        }
    }

# Topics

## Enumeration Cases

### AlreadyMakingPayment

    case alreadyMakingPayment(id: String)

Indicates that a payment operation is already in progress for the given ID.

- `id` The ID of the payment that is currently being processed

### InvalidPayload

    case invalidPayload(errorCode: String, message: String)

Indicates that the payment data provided is invalid or malformed.

- `errorCode` A unique identifier for debugging purposes
- `message` A detailed description of what caused the validation failure

### PaymentFailure

    case paymentFailure(errorCode: String, message: String)

Indicates that the payment operation failed to complete successfully.

- `errorCode` A unique identifier for debugging purposes
- `message` Information about why the payment failed

### PaymentMethodNotInitialized

    case paymentMethodNotInitialized(errorCode: String, message: String)

Indicates that the payment method hasn’t been properly initialized before use.

- `errorCode` A unique identifier for debugging purposes
- `message` Additional details about the initialization failure

### ServerError

    case serverError(errorCode: String, message: String)

Indicates an error occurred on the server side during payment processing.

- `errorCode` A unique identifier for debugging purposes
- `message` Details about the server error

### SystemError

    case systemError(errorCode: String, message: String)

Represents an internal system error within the SDK.

- `errorCode` A unique identifier for debugging purposes
- `message` Detailed information about the system error

### UnsupportedPaymentMethod

    case unsupportedPaymentMethod(errorCode: String, paymentMethod: String)

Indicates that the specified payment method is not supported by the SDK.

- `errorCode` A unique identifier for this error type
- `paymentMethod` The name of the unsupported payment method

## Instance Properties

### errorCode

    var errorCode: String?

Get the error code directly. If there is no `errorCode` in `ElepayError` cases, `nil` will be returned.
