const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: true,
      worldSafeExecuteJavaScript: true
    }
  });

  // Em desenvolvimento, usa localhost:3001
  if (isDev) {
    console.log('Carregando em modo desenvolvimento...');
    mainWindow.loadURL('http://localhost:3001');
    // Abre o DevTools automaticamente em desenvolvimento
    mainWindow.webContents.openDevTools();
  } else {
    // Em produção, carrega o arquivo index.html gerado pelo Next.js
    console.log('Carregando em modo produção...');
    const indexPath = path.join(__dirname, '../out/index.html');
    console.log('Tentando carregar:', indexPath);
    mainWindow.loadFile(indexPath);
  }

  // Log de erros
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Falha ao carregar:', errorCode, errorDescription);
  });
}

app.whenReady().then(() => {
  console.log('Electron está pronto...');
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
