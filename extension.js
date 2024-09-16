const vscode = require('vscode');

function activate(context) {
    console.log('Congratulations, your extension "qjump" is now active!');

		let decorations = [];
		let scrollTimeout;
		let lastVisibleRange = null;
		let isMenuOpen = false; // Flag to track if the input box is open

		const renderLabels = (editor) => {
			if (!editor) {
				return [];
			}

			// Clear previous decorations
			clearDecorations();

			// Get all visible lines in the editor
			const visibleRanges = editor.visibleRanges;
			let positions = [];

			visibleRanges.forEach((range) => {
				const start = range.start.line;
				const end = range.end.line;

				for (let lineIndex = start; lineIndex <= end; lineIndex++) {
					const line = editor.document.lineAt(lineIndex);
					const lineText = line.text;

					// Collect positions of words, including those surrounded by special characters
					const wordRegex = /[a-zA-Z0-9_]+/g;
					let match;
					while ((match = wordRegex.exec(lineText)) !== null) {
						positions.push({ line: lineIndex, character: match.index });
					}
				}
			});

			// Generate labels for all positions, including more than 26 if necessary
			const generateLabels = (num) => {
				const alphabet = 'abcdefghijklmnopqrstuvwxyz';
				const labels = [];

				for (let i = 0; i < num; i++) {
					let label = '';
					let n = i;

					do {
						label = alphabet[n % 26] + label;
						n = Math.floor(n / 26) - 1;
					} while (n >= 0);

					labels.push(label);
				}
				return labels;
			};

			const labelList = generateLabels(positions.length);
			const labels = positions.map((pos, index) => ({
				label: labelList[index],
				position: pos,
			}));

			// Create decorations for labels (batched)
			labels.forEach((label) => {
				const decorationType = vscode.window.createTextEditorDecorationType({
					before: {
						contentText: label.label.toUpperCase(),
						color: 'cyan',
						backgroundColor: 'rgba(0, 0, 0, 0.1)',
						fontWeight: 'bold',
						margin: '0 0.2em 0 0',
					},
				});

				const range = new vscode.Range(
					label.position.line,
					label.position.character,
					label.position.line,
					label.position.character
				);
				editor.setDecorations(decorationType, [range]);
				decorations.push(decorationType);
			});

			return labels;
		};

		const clearDecorations = () => {
			decorations.forEach((decoration) => decoration.dispose());
			decorations = [];
		};

    const disposable = vscode.commands.registerCommand(
			'qjump.hop',
			async function () {
				const editor = vscode.window.activeTextEditor;
				if (!editor) {
					vscode.window.showInformationMessage('No active editor found!');
					return;
				}

				let labels;
				const onVisibleRangeChange =
					vscode.window.onDidChangeTextEditorVisibleRanges((event) => {
						if (event.textEditor === editor && isMenuOpen) {
							// Only update if menu is open
							if (lastVisibleRange !== JSON.stringify(event.visibleRanges)) {
								lastVisibleRange = JSON.stringify(event.visibleRanges);

								if (scrollTimeout) {
									clearTimeout(scrollTimeout);
								}

								scrollTimeout = setTimeout(() => {
									labels = renderLabels(editor);
								}, 200);
							}
						}
					});
				context.subscriptions.push(onVisibleRangeChange);

				try {
					// Render labels initially
					labels = renderLabels(editor);
					isMenuOpen = true; // Set flag to indicate that the input box is open

					// Wait for user input
					const pickedLabel = await vscode.window.showInputBox({
						placeHolder: 'Type a label or line number to jump to...',
					});
					isMenuOpen = false; // Reset flag when input box is closed

					if (!pickedLabel) {
						return;
					}

					// Check if the input is a line number
					const lineNumber = parseInt(pickedLabel, 10);
					if (
						!isNaN(lineNumber) &&
						lineNumber > 0 &&
						lineNumber <= editor.document.lineCount
					) {
						const lineIndex = lineNumber - 1;
						const newSelection = new vscode.Selection(
							lineIndex,
							0,
							lineIndex,
							0
						);
						editor.selection = newSelection;
						editor.revealRange(
							new vscode.Range(newSelection.start, newSelection.end)
						);
						return;
					}

					// If not a line number, proceed with label-based jump
					const selectedLabel = labels.find(
						(label) => label.label === pickedLabel.toLowerCase()
					);
					if (!selectedLabel) {
						vscode.window.showInformationMessage('Invalid label!');
						return;
					}

					const selectedPosition = selectedLabel.position;
					const newSelection = new vscode.Selection(
						selectedPosition.line,
						selectedPosition.character,
						selectedPosition.line,
						selectedPosition.character
					);
					editor.selection = newSelection;
					editor.revealRange(
						new vscode.Range(newSelection.start, newSelection.end)
					);
				} finally {
					// Clean up decorations and unsubscribe from events
					clearDecorations();
					onVisibleRangeChange.dispose();
				}
			}
		);

		context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate,
};
