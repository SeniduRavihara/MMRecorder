"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(
      channel,
      (event, ...args2) => listener(event, ...args2)
    );
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
  // You can expose other APTs you need here.
  // ...
});
const WINDOW_API = {
  greet: (message) => electron.ipcRenderer.send("greet", message),
  getName: () => electron.ipcRenderer.invoke("getName2"),
  // getData: () => ipcRenderer.invoke("getData"),
  // Desktop Capturer API
  getSources: (options) => electron.ipcRenderer.invoke("getSources", options),
  buildMenu: () => electron.ipcRenderer.invoke("buildMenu"),
  showSaveDialog: (options) => electron.ipcRenderer.invoke("showSaveDialog", options),
  saveFile: (data) => electron.ipcRenderer.invoke("saveFile", data),
  onSourceSelected: (callback) => electron.ipcRenderer.on("source-selected", (_event, source) => callback(source))
};
electron.contextBridge.exposeInMainWorld("api", WINDOW_API);
