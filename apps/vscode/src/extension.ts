import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('Markdown Reader extension is now active!');

  // Đăng ký lệnh mở Outline & Preview
  const openPreviewCommand = vscode.commands.registerCommand(
    'markdownReader.openPreview',
    (uri?: vscode.Uri) => {
      const targetUri = uri || vscode.window.activeTextEditor?.document.uri;
      if (!targetUri) {
        vscode.window.showWarningMessage('Vui lòng mở một file Markdown trước.');
        return;
      }

      MarkdownPreviewPanel.createOrShow(context.extensionUri, targetUri);
    }
  );

  context.subscriptions.push(openPreviewCommand);
}

export function deactivate() {}

class MarkdownPreviewPanel {
  public static currentPanel: MarkdownPreviewPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri, documentUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.ViewColumn.Beside
      : vscode.ViewColumn.One;

    if (MarkdownPreviewPanel.currentPanel) {
      MarkdownPreviewPanel.currentPanel._panel.reveal(column);
      MarkdownPreviewPanel.currentPanel.update(documentUri);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'markdownReader',
      'Markdown Reader & Outline',
      column,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'dist')]
      }
    );

    MarkdownPreviewPanel.currentPanel = new MarkdownPreviewPanel(panel, extensionUri, documentUri);
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    documentUri: vscode.Uri
  ) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    this.update(documentUri);

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Lắng nghe thay đổi tài liệu trong VS Code để đồng bộ
    vscode.workspace.onDidChangeTextDocument(
      e => {
        if (e.document.uri.toString() === documentUri.toString()) {
          this._panel.webview.postMessage({
            type: 'update',
            content: e.document.getText(),
            fileName: e.document.fileName
          });
        }
      },
      null,
      this._disposables
    );

    // Lắng nghe message từ Webview gửi lên
    this._panel.webview.onDidReceiveMessage(
      async message => {
        switch (message.type) {
          case 'format':
            vscode.commands.executeCommand('editor.action.formatDocument');
            break;
          case 'edit':
            // Cập nhật text document từ webview edit
            const doc = await vscode.workspace.openTextDocument(documentUri);
            const edit = new vscode.WorkspaceEdit();
            const fullRange = new vscode.Range(
              doc.positionAt(0),
              doc.positionAt(doc.getText().length)
            );
            edit.replace(documentUri, fullRange, message.content);
            await vscode.workspace.applyEdit(edit);
            break;
        }
      },
      null,
      this._disposables
    );
  }

  public async update(documentUri: vscode.Uri) {
    const document = await vscode.workspace.openTextDocument(documentUri);
    this._panel.title = `Reader: ${document.fileName.split(/[\\/]/).pop()}`;
    this._panel.webview.html = this._getHtmlForWebview(document);
  }

  private _getHtmlForWebview(document: vscode.TextDocument): string {
    const content = document.getText();
    const fileName = document.fileName.split(/[\\/]/).pop() || 'Untitled.md';

    // HTML Webview nhúng client app
    return `<!DOCTYPE html>
    <html lang="vi" class="dark">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Markdown Reader</title>
      <style>
        body { margin: 0; padding: 0; background-color: #0d0f14; color: #cdd3df; font-family: sans-serif; }
      </style>
    </head>
    <body>
      <div id="root">
        <div style="padding: 24px;">
          <h2 style="color: #6366f1;">Markdown Reader Webview Active</h2>
          <p>Tệp đang đọc: <strong>${fileName}</strong></p>
          <p>Kích thước: ${content.length} ký tự</p>
        </div>
      </div>
      <script>
        const vscode = acquireVsCodeApi();
        window.initialMarkdown = ${JSON.stringify(content)};
        window.initialFileName = ${JSON.stringify(fileName)};
      </script>
    </body>
    </html>`;
  }

  public dispose() {
    MarkdownPreviewPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }
}
