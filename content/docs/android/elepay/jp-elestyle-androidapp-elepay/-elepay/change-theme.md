---
title: changeTheme
---


fun [changeTheme](../change-theme)(theme: ElepayTheme)

Change the theme of the elepay SDK ui components.

This change only takes effects **before** the payment processing. After calling [processPayment](../process-payment), [processSource](../process-source) or [checkout](../checkout), all changes to the [theme](../change-theme) will be ignored.

#### Parameters

| | |
|---|---|
| theme | The new theme to be applied by the elepay SDK. |