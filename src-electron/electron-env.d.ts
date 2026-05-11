// Extend Window interface to include Electron API
declare global {
  interface Window {
    electronAPI?: {
      sendNotification: (title: string, message: string) => void;
      onNotification: (callback: (data: { title: string; message: string }) => void) => void;
    };
  }
}

export {};
