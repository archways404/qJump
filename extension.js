const vscode = require('vscode');

function activate(context) {
	console.log('Congratulations, your extension "qjump" is now active!');

	const disposable = vscode.commands.registerCommand(
		'qjump.helloWorld',
		function () {
			// Get the active text editor
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showInformationMessage('No active editor found!');
				return;
			}

			// Get the visible ranges in the editor
			const visibleRanges = editor.visibleRanges;
			let visibleLinesText = '';

			// Iterate over each visible range
			visibleRanges.forEach((range) => {
				const start = range.start.line;
				const end = range.end.line;

				// Collect the visible lines
				for (let i = start; i <= end; i++) {
					const lineText = editor.document.lineAt(i).text;
					visibleLinesText += lineText + '\n';
				}
			});

			// Print the visible lines in the console
			console.log('Visible Lines:\n' + visibleLinesText);

			// Optionally, show the visible lines in an information message
			vscode.window.showInformationMessage(
				'Visible lines printed to the console!'
			);
		}
	);

	context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate,
};
