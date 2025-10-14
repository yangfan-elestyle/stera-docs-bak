---
title: ElepayCardParams
---

A class that represents credit card parameters used for payment processing.

    @objc
    class ElepayCardParams

# Overview

This class encapsulates all necessary information required for credit card transactions, including card number, expiration date, CVC, and cardholder details.

# Topics

## Instance Properties

### address

    var address: String?

The billing address associated with the card.

#### Note

This field is optional and may be required for certain transactions.

### currency

    var currency: String?

The currency code for the card when used for payouts.

#### Important

Only set this when tokenizing debit cards for managed account payouts.

#### Note

The card can be used as a transfer destination for funds in this currency.

### cvc

    var cvc: String?

The Card Verification Code (CVC) or Card Verification Value (CVV).

#### Note

This is typically a 3 or 4 digit number printed on the back of the card.

### expMonth

    var expMonth: UInt

The card’s expiration month in 2-digit format.

#### Note

Valid values are 1 through 12.

### expYear

    var expYear: UInt

The card’s expiration year in 2-digit format.

#### Note

This should be the last two digits of the year (e.g., ‘23’ for 2023).

### name

    var name: String?

The full name of the cardholder as it appears on the card.

#### Note

This field is optional but recommended for verification purposes.

### number

    var number: String?

The card number as entered by the user.

#### Note

This should be the complete card number without any formatting.

## Instance Methods

### last4

    func last4() -> String?

Retrieves the last 4 digits of the card number.

#### Return Value

A string containing the last 4 digits of the card number if available, nil otherwise.
