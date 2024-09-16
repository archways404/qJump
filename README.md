
# qJump - A Quick Way to Navigate Your Code!

![qJump Logo](images/logo.webp)

**qJump** is a Visual Studio Code extension that allows you to quickly jump to any label or line number in your code. With qJump, you can navigate large files effortlessly, jumping directly to specific words or line numbers with a simple command.

I took inspiration from a well known and loved NeoVim plugin [Hop Neovim](https://github.com/smoka7/hop.nvim) by smoka7, so that is the basis of the plugin!

## Features

- **Jump to Labels:** Automatically generates labels for words within the visible range of the editor, allowing you to quickly jump to them by typing their label.
- **Jump to Line Number:** Directly jump to any line number by typing it in the input box.
- **Dynamic Label Generation:** Labels are generated based on the content of the visible range in the editor, allowing quick navigation in large files.
- **Automatic Update:** Labels are updated when scrolling stops, ensuring you always see the correct labels for the visible content.
- **Keyboard Shortcut:** Default keybinding is `Ctrl+Shift+J` (Windows and macOS) for easy access to the jump command.

## How to Use

1. Open a file in the editor.
2. Press the keyboard shortcut (`Ctrl+Shift+J`).
3. An input box will appear at the top. You can:
   - **Type a label**: Enter the label corresponding to the word you want to jump to (e.g., "A", "B", etc.).
   - **Enter a line number**: Directly jump to a specific line by entering its number.
4. Press `Enter` to jump to the specified label or line.

## Extension Settings

This extension does not contribute any additional settings.

## Keybindings

- `Ctrl+Shift+J` (Windows and macOS): Activates the quick jump command.

## Known Issues

- The extension currently generates labels only for words in the visible range of the editor. If you scroll or resize the editor, labels will be updated automatically.
- Limited to generating labels for alphanumeric words (including underscores).

## Requirements

- Visual Studio Code `^1.93.0`

## Installation

1. Download and install the extension from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/).
2. Or, manually install using the `.vsix` file:
   - Download the `.vsix` file.
   - In Visual Studio Code, go to Extensions > ... > Install from VSIX.

## Development

To work on this extension locally:

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Open the directory in Visual Studio Code.
4. Press `F5` to open a new window with the extension loaded.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Release Notes

### 0.0.1
- Initial release of qJump.

## License

This extension is licensed under the [MIT License](https://github.com/archways404/qJump/blob/main/LICENSE).
