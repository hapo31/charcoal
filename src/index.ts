import { app, BrowserWindow, dialog, ipcMain, screen, clipboard } from "electron";

class OCRApp {

  private window: BrowserWindow | null = null;

  constructor() {
    app.on("ready", () => {
      this.window = new BrowserWindow({
        width: 1280,
        height: 960,
        webPreferences: {
          nodeIntegration: true
        }
      });

      this.window.loadURL(`file://${__dirname}/index.html`);
      this.window.setMenu(null);
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

    ipcMain.handle("get-content-size", () => {
      return this.window?.getContentSize();
    });

    ipcMain.handle("get-display-dpi", () => {
      if (this.window == null) {
        return;
      }
      const [x, y] = this.window.getPosition();
      const display = screen.getDisplayNearestPoint({x, y});

      return display.scaleFactor;
    });

    ipcMain.handle("set-window-size", (_, width: number, height: number) => {
      this.window?.setContentSize(width, height);
    });

    ipcMain.handle("set-text-clipboard", (_, text) => {
      clipboard.writeText(text);
    });
  }
}

new OCRApp();
