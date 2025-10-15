---
title: ElepayLanguageCode
---

ElepayLanguageCode provides language code support for the elepay SDK.

    enum ElepayLanguageCode

# Overview

This enumeration manages supported languages and handles language code conversions between system locale identifiers and elepay’s internal representation.

# Topics

## Enumeration Cases

### english

    case english

Represents English

### japanese

    case japanese

Represents Japanese (日本語)

### simplifiedChinese

    case simplifiedChinese

Represents Simplified Chinese (中文简体)

### system

    case system

Represents the system’s default language setting

### traditionalChinese

    case traditionalChinese

Represents Traditional Chinese (中文繁體)

## Initializers

### init

    init?(rawValue: String)

    init(stringPresentation: String)

Initializes an `ElepayLanguageCode` from a string representation.

- `stringPresentation` A language code string that can be see in Important Note.

#### Discussion

This initializer converts various language code formats into elepay’s internal representation. It supports both ISO 639-1 and ISO 639-2 language codes.

#### Note

If an unsupported language code is provided, it will default to English.

#### Important

The language code matching is case-insensitive.

    language code:
    1. An ISO language code (e.g., "en", "ja", "zh-Hans", "zh-Hant")
    2. A system language code from `NSLocale.preferredLanguages`
    3. "system" or "" to use system default language
