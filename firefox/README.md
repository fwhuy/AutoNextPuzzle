A port of AutoNextPuzzle for [Firefox](https://github.com/fwhuy/AutoNextPuzzle). This port is based on version 1.1 of the released version.

## Testing locally
1. Open the `about:debugging#/runtime/this-firefox` page in Firefox. 2. Select "This Firefox". 3. Click "Load Temporary Add-on". 4. Select `manifest.json` from this directory. 5. Open a page at https://www.chess.com/puzzles`.. 6. Use the button in the extension toolbar to change the delay. The delay is set to 5ms by default.

Temporary add-ons will be removed when the browser is restarted. Permanent add-ons need to be an XPI signed by Mozilla.

The extension is active on pages with the following URL: "https://www.chess.com/puzzles`" The extension will click the "Next" or "Continue" button automatically after the puzzle is complete. There is an on-page toggle button to enable or disable the extension. The extension has a configurable delay between 0 to 10,000 milliseconds. The settings are saved in the local extension storage on Firefox. The extension does not collect or send any user data.

## Compatibility
The Promise based `browser.storage.local` API is used for the Firefox build. The storage adapter preserves the original behavior of the Chrome `chrome.storage.sync` API when used in a Chromium based browser.

## Credits
This work is derived from AutoNextPuzzle v1.1 by Huy. The license from upstream, the MIT license, is available in `LICENSE`.
