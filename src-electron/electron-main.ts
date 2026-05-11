import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));


let mainWindow: BrowserWindow | undefined;

const createWindow = () => {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, '../icons/icon.png'),
    width: 1200,
    height: 800,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD || ''),
    },
  });

  void (async () => {
    if (process.env.DEV) {
      await mainWindow?.loadURL(process.env.APP_URL as string);
      if (process.env.DEBUGGING) {
        // if on DEV or Production with debug enabled
        mainWindow?.webContents.openDevTools();
      } else {
        // we're on DEV and do not want to see the dev tools
        // mainWindow?.webContents.closeDevTools();
      }
    } else {
      await mainWindow?.loadURL(`file://${__dirname}/index.html`);
    }
  })();

  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === undefined) {
    createWindow();
  }
});

// IPC Example
// Here we are listening to a window saying, "Oh hey! An event was triggered in the renderer thread!"
ipcMain.on('electron-app:notify', (_event, { title, message }) => {
  if (mainWindow) {
    mainWindow.webContents.send('electron-app:notify', {
      title,
      message,
    });
  }
});
