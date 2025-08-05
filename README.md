# Site Tracking Detector Extension

This browser extension helps detect and block tracking scripts on websites, enhancing your privacy while browsing.

## Features

- Detects common tracking scripts on web pages
- Blocks or notifies you about detected trackers
- Easy-to-use popup interface

## Installation

1. Clone or download this repository.
2. In your browser, go to the extensions page (`chrome://extensions` for Chrome).
3. Enable "Developer mode".
4. Click "Load unpacked" and select this project folder.

## Usage

- Click the extension icon to open the popup.
- View detected trackers and take action as needed.

## Development

- `background.js`: Handles background tasks and event listeners.
- `content.js`: Injected into web pages to detect trackers.
- `manifest.json`: Extension configuration.
- `popup/`: Contains the popup UI files.

## License

MIT