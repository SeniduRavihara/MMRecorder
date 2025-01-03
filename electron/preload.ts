import { ipcRenderer, contextBridge } from "electron";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) =>
      listener(event, ...args)
    );
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },

  // You can expose other APTs you need here.
  // ...
});

// ------------------------------------------------

const WINDOW_API = {
  greet: (message: string) => ipcRenderer.send("greet", message),
  getName: () => ipcRenderer.invoke("getName2"),
  // getData: () => ipcRenderer.invoke("getData"),

  // Desktop Capturer API
  getSources: (options: Electron.SourcesOptions) =>
    ipcRenderer.invoke("getSources", options),

  buildMenu: () => ipcRenderer.invoke("buildMenu"),

  showSaveDialog: (options) => ipcRenderer.invoke("showSaveDialog", options),
  
  saveFile: (data) => ipcRenderer.invoke("saveFile", data),

  onSourceSelected: (callback) =>
    ipcRenderer.on("source-selected", (_event, source) => callback(source)),
};

contextBridge.exposeInMainWorld("api", WINDOW_API);
