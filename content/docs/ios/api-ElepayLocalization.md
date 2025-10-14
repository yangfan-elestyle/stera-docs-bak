---
title: ElepayLocalization
---

A utility class responsible for managing localization settings in the Elepay SDK.

    final class ElepayLocalization

# Overview

This class provides functionality to:

- Switch between different supported languages
- Check language support status
- Access localized strings

Use the shared instance to interact with localization features:

    ElepayLocalization.shared.switchLanguage(code: .english)

# Topics

## Instance Methods

### isLocalized

    func isLocalized(for: ElepayLanguageCode) -> Bool

Checks if the SDK supports localization for a specific language.

- `languageCode` The language code to check support for

#### Return Value

true if localized resources exist for the specified language, false otherwise

#### Discussion

This method verifies if there are localized string resources available for the specified language code in the SDK’s bundle.

### isLocalized

    func isLocalized(for: ElepayLanguageCode, keys: [String]) -> Bool

Verifies if specific localization keys are available for a given language.

- `languageCode` The language code to check
- `keys` An array of localization keys to verify

#### Return Value

true if all keys have localized values, false if any key is missing a localization

#### Discussion

This method checks whether all specified keys have corresponding localized strings in the target language’s resources.

### switchLanguage

    func switchLanguage(code: ElepayLanguageCode)

Changes the SDK’s localization settings to use a specific language.

- `code` The language code to switch to. Uses ElepayLanguageCode enum values.

#### Discussion

This method allows you to override the system’s default language preferences. The change will take effect the next time a new ViewController is presented.

#### Important

Changes only affect newly presented ViewControllers.

    ElepayLocalization.shared.switchLanguage(code: .japanese)

## Type Properties

### shared

    static let shared: ElepayLocalization

The singleton instance for accessing localization functionality
