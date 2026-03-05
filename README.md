# ♟️ Chess.com Auto-Next Puzzle Extension

A Chrome/Brave extension that automatically clicks the "Next" or "Continue" button after you complete a puzzle on Chess.com, because chess.com decided to remove it.

##  Features

- **Automatic Advancement**: Automatically clicks the Next/Continue button after puzzle completion
- **Configurable Delay**: Set custom delay (in milliseconds) before auto-clicking (default: 5ms)
- **Easy Toggle**: Enable or disable the feature with a toggle switch on the puzzle page (like old chess.com)
- **Browser Support**: Works on both Google Chrome and Brave Browser


##  Installation

### Chrome

#### Method 1: Packed Extension (Recommended - Easiest)

1. **Download the packed extension:**
   - Download `AutoNextPuzzle.crx` from [Releases](https://github.com/fwhuy/AutoNextPuzzle/releases/latest)
   - ⚠️ Chrome may delete the crx for some reason, and if so move on to Method 2 instead or download on another browser.

2. **Install in Chrome:**
   - Open Google Chrome and navigate to `chrome://extensions/`
   - Enable **Developer mode** (toggle switch in the top-right corner)
   - Drag and drop the `.crx` file into the Chrome extensions page
   - Click **Add extension** when prompted
   - The extension icon should appear in your Chrome toolbar

**Note:** If Chrome blocks the installation, you may need to use Method 2 (Unpacked) instead.

#### Method 2: Unpacked Extension (For Development/Testing)

1. **Download the source code:**
   - Download `AutoNextPuzzle.zip` from [Releases](https://github.com/fwhuy/AutoNextPuzzle/releases/latest)
   - Or clone the repository: `git clone https://github.com/fwhuy/AutoNextPuzzle.git`

2. **Extract the ZIP file** (if downloaded):
   - Right-click the downloaded ZIP file
   - Select "Extract All" or use your preferred extraction tool
   - Choose a location and extract the files to a folder

3. **Load the extension in Chrome:**
   - Open Google Chrome and navigate to `chrome://extensions/`
   - Enable **Developer mode** (toggle switch in the top-right corner)
   - Click **Load unpacked**
   - Select the folder containing the extracted extension files (the folder with `manifest.json`, `src/`, and `icons/` folders)
   - The extension icon should appear in your Chrome toolbar

**Note:** Keep the extension folder in a permanent location. If you move or delete it, you'll need to reload the extension.

---

### Brave Browser

Brave blocks `.crx` installs from outside the Chrome Web Store, so you must load the extension as **unpacked**. This is straightforward:

1. **Download the source code:**
   - Download `AutoNextPuzzle.zip` from [Releases](https://github.com/fwhuy/AutoNextPuzzle/releases/latest)
   - Or clone the repository: `git clone https://github.com/fwhuy/AutoNextPuzzle.git`

2. **Extract the ZIP file** (if downloaded):
   - Right-click the downloaded ZIP file
   - Select "Extract All" or use your preferred extraction tool
   - Choose a permanent location and extract the files to a folder

3. **Enable Developer mode in Brave:**
   - Open Brave and navigate to `brave://extensions/`
   - Toggle **Developer mode** on (top-right corner)

4. **Load the extension:**
   - Click **Load unpacked**
   - Select the folder containing the extracted files (the folder with `manifest.json`, `src/`, and `icons/`)
   - The extension icon will appear in your Brave toolbar

5. **Allow the extension to run:**
   - Brave may show a warning that the extension is not from the Web Store — this is expected for sideloaded extensions
   - Click **Keep** or dismiss the warning to keep the extension active
   - If Brave asks again on restart, click **Keep** each time or pin the extension to make it easier to manage

**Note:** Keep the extension folder in a permanent location. If you move or delete it, you'll need to reload it from `brave://extensions/`.

##  Usage

1. **Initial Setup**:
   - Install the extension (see Installation above)
   - Navigate to any Chess.com puzzle page
   - The Auto-Next toggle will appear in the bottom-right corner of the page

2. **Configure Settings**:
   - **Toggle Auto-Next**: Click the toggle switch in the bottom-right corner to enable/disable
   - **Adjust Delay**: Click the extension icon in your Chrome/Brave toolbar to open the popup
     - Adjust **Delay (milliseconds)** to your preferred waiting time
     - Default: 5ms (0.005 seconds) for instant advancement
     - Recommended range: 5-2000ms
     - Click **Save Settings**

3. **Start Solving Puzzles**:
   - Navigate to Chess.com puzzles
   - Solve puzzles as normal
   - After completion, the extension will automatically click "Next" after your set delay (if enabled)
   - Continue your puzzle streak seamlessly!

## ⚙️ Settings Explained


##  Privacy & Permissions

This extension requires minimal permissions:

- **storage**: To save your settings (enabled/disabled state and delay preference)
- **Host permission** (`https://www.chess.com/*`): To run the content script on Chess.com pages only

**No data is collected, transmitted, or stored externally.** All settings are saved locally in your browser.

##  License

This project is open source and available under the MIT License.

##  Disclaimer

This extension is not affiliated with, endorsed by, or officially connected with Chess.com. It is an independent tool created to enhance the user experience.

Use this extension responsibly and in accordance with Chess.com's Terms of Service.

