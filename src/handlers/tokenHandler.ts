import * as vscode from 'vscode';

function getToken(): string | undefined {
    const token =vscode.workspace
    .getConfiguration("generateCodeUsingGemini")
    .get("geminiToken");

    if (typeof token === 'string' && token.length > 0) {
        return token;
    }
    return undefined;
}

export default getToken;