import { app, BrowserWindow, desktopCapturer, dialog, ipcMain } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { writeFile } from "node:fs";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  // ======================================

  // ipcMain.on("get-storage-data", (event, dataReceived) => {
  //   console.log(dataReceived);
  //   event.reply("send-storage-data", store.get("decks"));
  // });

  // ipcMain.on("save-data", (_event, dataReceived) => {
  //   // store.set("decks", dataReceived);
  //   decks = dataReceived;
  // });
  // ======================================

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(createWindow);

// // Handle the request to get video sources from the renderer process
// ipcMain.handle("get-video-sources", async () => {
//   const sources = await desktopCapturer.getSources({
//     types: ["screen", "window"],
//   });
//   return sources; // Send the sources back to the renderer process
// });

// // Handle saving video files
// ipcMain.handle("dialog:showSaveDialog", async (event, options) => {
//   return await dialog.showSaveDialog(options);
// });

ipcMain.on("greet", (_event, args) => {
  console.log(args);
});

ipcMain.handle("getName2", (_event, args) => {
  return "Hello" + 1;
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

ipcMain.handle("buildMenu", async (_event, menuItems) => {
  return await dialog.showSaveDialog(menuItems);
});
