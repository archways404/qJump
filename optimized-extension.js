const vscode = require('vscode');

function activate(context) {
	console.log('Congratulations, your extension "qjump" is now active!');

	let decorations = [];
	let scrollTimeout;
	let lastVisibleRange = null;

	const renderLabels = (editor) => {
		if (!editor) {
			return [];
		}

		// Clear previous decorations
		decorations.forEach((decoration) => decoration.dispose());
		decorations = [];

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
		const ranges = labels.map((label) => {
			const range = new vscode.Range(
				label.position.line,
				label.position.character,
				label.position.line,
				label.position.character
			);

			const decorationType = vscode.window.createTextEditorDecorationType({
				before: {
					contentText: label.label.toUpperCase(),
					color: 'cyan',
					backgroundColor: 'rgba(0, 0, 0, 0.1)',
					fontWeight: 'bold',
					margin: '0 0.2em 0 0',
				},
			});

			editor.setDecorations(decorationType, [range]);
			decorations.push(decorationType);

			return range;
		});

		return labels;
	};

	const disposable = vscode.commands.registerCommand(
		'qjump.hop',
		async function () {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showInformationMessage('No active editor found!');
				return;
			}

			// Render labels initially
			let labels = renderLabels(editor);

			// Listen for scroll or visible range change events to rerender labels
			const onVisibleRangeChange =
				vscode.window.onDidChangeTextEditorVisibleRanges((event) => {
					if (event.textEditor === editor) {
						// Only re-render if visible range has changed
						if (lastVisibleRange !== JSON.stringify(event.visibleRanges)) {
							lastVisibleRange = JSON.stringify(event.visibleRanges);

							// Clear the previous timeout to avoid unnecessary rerendering
							if (scrollTimeout) {
								clearTimeout(scrollTimeout);
							}

							// Set a new timeout to render labels after scrolling stops
							scrollTimeout = setTimeout(() => {
								labels = renderLabels(editor);
							}, 200);
						}
					}
				});
			context.subscriptions.push(onVisibleRangeChange);

			// Wait for user input
			const pickedLabel = await vscode.window.showInputBox({
				placeHolder: 'Type a label or line number to jump to...',
			});
			if (!pickedLabel) {
				// Clean up decorations if input is canceled
				decorations.forEach((decoration) => decoration.dispose());
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
				const newSelection = new vscode.Selection(lineIndex, 0, lineIndex, 0);
				editor.selection = newSelection;
				editor.revealRange(
					new vscode.Range(newSelection.start, newSelection.end)
				);

				// Clean up decorations
				decorations.forEach((decoration) => decoration.dispose());
				return;
			}

			// If not a line number, proceed with label-based jump
			const selectedLabel = labels.find(
				(label) => label.label === pickedLabel.toLowerCase()
			);
			if (!selectedLabel) {
				vscode.window.showInformationMessage('Invalid label!');
				decorations.forEach((decoration) => decoration.dispose());
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

			// Clean up decorations
			decorations.forEach((decoration) => decoration.dispose());
		}
	);

	context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate,
};
