// tslint:disable
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "init" is now active!');
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
    const disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
      // The code you place here will be executed every time your command is executed
      console.log('hello world from ext-host');
      console.log('Congratulations ===> ', vscode.workspace.getConfiguration('application').get('confirmExit'))
      // vscode.window.showInformationMessage('info');
      vscode.window.showErrorMessage('error', {
        modal: true
      });
      // 插件执行主进程命令
      // vscode.commands.executeCommand('core.about');
      // Display a message box to the user
      // vscode.window.showInformationMessage('Hello World!');
    });

    vscode.workspace.onDidChangeConfiguration((event) => {
      console.log('Configuration Change ==> ', event)
      const section = 'application.confirmExit'
      console.log(`section ${section} has change ? `, event.affectsConfiguration(section))
    })

    const disposableMessage = vscode.commands.registerCommand('extension.showInformationMessage', () => {
      vscode.window.showInformationMessage('info');
    });

    const disposableMessageModal = vscode.commands.registerCommand('extension.showErrorMessageModal', () => {
      vscode.window.showErrorMessage('error', {
        modal: true
      });
    });
    vscode.languages.registerHoverProvider('javascript', {
      provideHover(document, position, token) {
          return new vscode.Hover('I am a hover!');
      },
    });



  // context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
