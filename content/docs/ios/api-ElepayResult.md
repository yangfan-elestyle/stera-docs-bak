---
title: ElepayResult
---

Represents the outcome of a payment request in the Elepay system.

    enum ElepayResult

# Overview

This enum provides three possible states for a payment:

- A successful payment with a transaction ID
- A failed payment with an optional ID and error details
- A cancelled payment with the associated transaction ID

# Topics

## Enumeration Cases

### Cancelled

    case cancelled(id: String)

Indicates that the user or system cancelled the payment process.

- `id` The identifier of the cancelled transaction.

### Failed

    case failed(id: String?, error: ElepayError)

Indicates that the payment process failed.

- `id` The transaction identifier, if available. May be nil when failed retrieving payment id data.
- `error` The specific error that caused the payment to fail.

### Succeeded

    case succeeded(id: String)

Indicates that the payment process completed successfully.

- `id` The unique identifier of the successful transaction.

## Instance Properties

### debugDescription

    var debugDescription: String

A debug-friendly description of the payment result.
