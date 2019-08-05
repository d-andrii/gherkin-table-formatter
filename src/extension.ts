import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('extension.formatGherkinTable', () => {
		const editor = vscode.window.activeTextEditor;

		if (editor) {
			const document = editor.document;
			const selection = editor.selection;
			const alignment: string = vscode.workspace.getConfiguration('gherkin-table-formatter').get('alignment') || 'left';

			const text = document.getText(selection);
			let lines = text.split('\n');
			const charsInColumns: number[] = [];
			const indents = [];

			const matchFirstLine = lines[0].match(/^\s+/);
			indents[0] = matchFirstLine === null ? '' : matchFirstLine[0];
			const matchSecondLine = lines[1].match(/^\s+/);
			indents[1] = matchSecondLine === null ? '' : matchSecondLine[0];

			lines = lines.map((line) => line.trim());
			lines = lines.map((line) => {
				let columns = line.split('|');
				columns = columns
					.filter((item) => item.trim())
					.map((item) => item.trim());
				columns = columns.map((column, index) => {
					if (charsInColumns[index] === undefined || column.length > charsInColumns[index]) {
						charsInColumns[index] = column.length;
					}
					return column;
				});
				return columns.join('|');
			});

			lines = lines.map((line) => {
				let columns = line.split('|');
				columns = columns.map((column, index) => {
					const length = column.length;
					if (length < charsInColumns[index]) {
						if (alignment === 'left') {
							column = column + ' '.repeat(charsInColumns[index] - length);
						} else {
							column = ' '.repeat(charsInColumns[index] - length) + column;
						}
					}
					return ' ' + column + ' ';
				});
				return '|' + columns.join('|') + '|';
			});

			let result = indents[0] + lines[0] + '\n' + indents[1];
			lines.shift();
			result += lines.join('\n' + indents[1]);
			editor.edit((builder) => {
				builder.replace(selection, result);
			});
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
