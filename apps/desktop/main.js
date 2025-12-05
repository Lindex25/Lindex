/**
 * LINDEX Personal Desktop - MVP Electron Shell
 *
 * This is a minimal Electron wrapper that loads the LINDEX Next.js web application
 * from the local development server (http://localhost:3000).
 *
 * The shell provides a native desktop window with secure defaults (context isolation,
 * no node integration in renderer). Future versions will add native integrations like
 * drag-and-drop, local file access, system tray, and offline capabilities.
 */

const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Load the Next.js dev server
  win.loadURL('http://localhost:3000');

  // Open DevTools by default
  win.webContents.openDevTools();
}

// Create window when app is ready
app.whenReady().then(() => {
  createWindow();

  // On macOS, re-create a window when dock icon is clicked and no windows are open
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

