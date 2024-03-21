import * as vscode from 'vscode';
import generateCode from './handlers/generateCodeHandler';

export function activate(context: vscode.ExtensionContext) {
    let generateCodeCommand = vscode.commands.registerCommand('extension.generateCode', async () => {
        const editor = vscode.window.activeTextEditor;

        if (editor) {
            const selection = editor.selection;
            const selectedText = editor.document.getText(selection);
			const language = editor.document.languageId;

            const replacedText = await generateCode(selectedText, language);

            editor.edit(editBuilder => {
                editBuilder.replace(selection, replacedText);
            });
        }
    });

	let saveToken = vscode.commands.registerCommand('extension.saveToken', () => {
        vscode.window.showInputBox({
            prompt: 'Enter your token',
            password: true
        }).then(token => {
            if (token) {
                vscode.workspace.getConfiguration("generateCodeUsingGemini").update('geminiToken', token, true);
                vscode.window.showInformationMessage('Token saved successfully!');
            }
        });
    });

    context.subscriptions.push(generateCodeCommand);
    context.subscriptions.push(saveToken);
}

export function deactivate() {}
