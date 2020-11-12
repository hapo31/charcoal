import { app, BrowserWindow, dialog, ipcMain } from "electron";

class OCRApp {

  private window: BrowserWindow | null = null;
  
  constructor() {
    app.on("ready", () => {
      this.window = new BrowserWindow({
        webPreferences: {
          nodeIntegration: true
        }
      });

      this.window.loadURL(`file://${__dirname}/index.html`);
      this.window.webContents.openDevTools();
      
    });

    app.on("window-all-closed", () => {
      app.quit();
    });

    this.registIpcEvents();
  }


  private registIpcEvents() {
    ipcMain.handle("fileopen-dialog", async (event) => {
      if (!this.window) {
        return null;
      }
      const result = await dialog.showOpenDialog(this.window);
      if (result.canceled) {
        return null;
      }

      return result.filePaths[0];
    });
  }
}

new OCRApp();