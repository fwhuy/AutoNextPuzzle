# AutoNextPuzzle for Firefox

A Firefox port of [AutoNextPuzzle](https://github.com/fwhuy/AutoNextPuzzle), based on release v1.1.

## Testing locally

1. Open `about:debugging#/runtime/this-firefox` in Firefox.
2. Select **This Firefox**.
3. Click **Load Temporary Add-on**.
4. Select `manifest.json` from this directory.
5. Open [Chess.com Puzzles](https://www.chess.com/puzzles).
6. Click the extension icon in the toolbar to configure the delay. The default is 5 ms.

Temporary add-ons are removed when Firefox restarts. Permanent installations require an XPI signed by Mozilla.

## Features

- Automatically clicks the Next or Continue button after completing a puzzle.
- Includes an on-page toggle to enable or disable the extension.
- Supports configurable delays from 0 to 10,000 milliseconds.
- Saves settings using Firefox's local extension storage.
- Does not collect or transmit user data.

## Compatibility

The Firefox build uses the Promise-based `browser.storage.local` API. The storage adapter retains compatibility with Chrome's `chrome.storage.sync` API.

## Credits

Based on AutoNextPuzzle v1.1 by Huy. The original MIT license is included in `LICENSE`.