import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('extension.formatGherkinTable', () => {
		const editor = vscode.window.activeTextEditor;

		if (editor) {
			const document = editor.document;
			const selection = editor.selection;
			const alignment: 'left' | 'right' = vscode.workspace.getConfiguration('gherkin-table-formatter').get('alignment') || 'left';

			const text = document.getText(selection);
			let lines = text.split('\n');
			const charsInColumns: number[] = [];
			const indents: string[] = [];

			const matchFirstLine = lines[0].match(/^\s+/);
			indents[0] = matchFirstLine === null ? '' : matchFirstLine[0];
			const matchSecondLine = lines[1].match(/^\s+/);
			indents[1] = matchSecondLine === null ? indents[0] : matchSecondLine[0];

			lines = lines.map((line) => line.trim());
			lines = lines.map((line) => {
				if (!(/^\|.*\|$/.test(line))) {
					return line;
				}
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
				return '|' + columns.join('|') + '|';
			});

			lines = lines.map((line) => {
				if (!(/^\|.*\|$/.test(line))) {
					return line;
				}
				let columns = line.split('|');
				columns = columns
					.filter((item) => item.trim())
					.map((item) => item.trim());
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

	const generate = vscode.commands.registerCommand('extension.generateGherkinTableFromSelection', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const document = editor.document;
			const selection = editor.selection;

			const text = document.getText(selection);
			let lines = text.split('\n');
			const charsInColumns: number[] = [];
			let indent = '';

			const matchFirstLine = lines[0].match(/^\s+/);
			indent = matchFirstLine === null ? '' : matchFirstLine[0];
			const matchSecondLine = lines[1].match(/^\s+/);
			indent = matchSecondLine === null ? indent : matchSecondLine[0];

			lines.forEach((line) => {
				if (!(/^\s*\|.*\|\s*$/.test(line))) {
					return;
				}
				let columns = line.split('|');
				columns = columns
					.filter((item) => item.trim());
				columns.forEach((column, index) => {
					if (charsInColumns[index] === undefined || column.length > charsInColumns[index]) {
						charsInColumns[index] = column.length;
					}
				});
			});

			const result = charsInColumns.map((count) => ' '.repeat(count));
			console.log(result.join('|'));
			lines = lines.map((line) => {
				if (line.trim() === '') {
					return indent + '|' + result.join('|') + '|';
				} else {
					return line;
				}
			});
			editor.edit((builder) => {
				builder.replace(selection, lines.join('\n'));
			});
		}
	});
	context.subscriptions.push(disposable, generate);
}

export function deactivate() {}
