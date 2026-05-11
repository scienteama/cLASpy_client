import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  sendNotification: (title: string, message: string) => {
    ipcRenderer.send('electron-app:notify', { title, message });
  },
  onNotification: (callback: (data: { title: string; message: string }) => void) => {
    ipcRenderer.on('electron-app:notify', (_event, data) => {
      callback(data);
    });
  },
});
