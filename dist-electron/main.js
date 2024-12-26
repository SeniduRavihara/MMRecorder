import { app, BrowserWindow, ipcMain, desktopCapturer, Menu, dialog } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { writeFile } from "node:fs";
createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(createWindow);
ipcMain.on("greet", (_event, args) => {
  console.log(args);
});
ipcMain.handle("getName2", (_event, args) => {
  return "Hello1";
});
ipcMain.handle("getSources", async (_event, options) => {
  return await desktopCapturer.getSources(options);
});
ipcMain.on("saveFile", async (_event, options) => {
  const { filePath, buffer } = options;
  if (filePath) {
    writeFile(filePath, buffer, () => console.log("Video saved successfully!"));
  }
});
ipcMain.handle("buildMenu", async (event) => {
  const inputSources = await desktopCapturer.getSources({
    types: ["window", "screen"]
  });
  const videoOptionsMenu = Menu.buildFromTemplate(
    inputSources.map((source) => ({
      label: source.name,
      click: () => {
        event.sender.send("source-selected", source);
      }
    }))
  );
  videoOptionsMenu.popup();
});
ipcMain.handle("showSaveDialog", async (_event, options) => {
  return await dialog.showSaveDialog(options);
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
