const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("localAgent", {
  getSettings: () => ipcRenderer.invoke("settings:get"),
  saveSettings: (settings) => ipcRenderer.invoke("settings:save", settings),
  checkProviders: () => ipcRenderer.invoke("providers:check"),
  checkUpdates: () => ipcRenderer.invoke("updates:check"),
  sendMessage: (payload) => ipcRenderer.invoke("agent:message", payload),
  sendMessageStream: (payload, onEvent) => {
    const requestId = `stream-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const listener = (_event, message) => {
      if (message?.requestId === requestId) {
        onEvent(message.event);
      }
    };

    ipcRenderer.on("agent:stream:event", listener);
    return ipcRenderer
      .invoke("agent:stream", {
        ...payload,
        requestId,
      })
      .finally(() => {
        ipcRenderer.removeListener("agent:stream:event", listener);
      });
  },
  searchWeb: (payload) => ipcRenderer.invoke("search:web", payload),
  queueComfy: (payload) => ipcRenderer.invoke("comfy:queue", payload),
  getComfyHistory: (payload) => ipcRenderer.invoke("comfy:history", payload),
  getComfyImages: (payload) => ipcRenderer.invoke("comfy:images", payload),
  saveComfyImage: (payload) => ipcRenderer.invoke("comfy:save-image", payload),
  listMcpTools: () => ipcRenderer.invoke("mcp:list-tools"),
  callMcpTool: (payload) => ipcRenderer.invoke("mcp:call-tool", payload),
  runCommand: (payload) => ipcRenderer.invoke("terminal:run", payload),
  listFiles: (payload) => ipcRenderer.invoke("files:list", payload),
  readFile: (payload) => ipcRenderer.invoke("files:read", payload),
  writeFile: (payload) => ipcRenderer.invoke("files:write", payload),
  appendFile: (payload) => ipcRenderer.invoke("files:append", payload),
  deleteFile: (payload) => ipcRenderer.invoke("files:delete", payload),
  exportFile: (payload) => ipcRenderer.invoke("files:export", payload),
  exportChat: (payload) => ipcRenderer.invoke("chat:export", payload),
  importChat: () => ipcRenderer.invoke("chat:import"),
  chooseWorkspace: () => ipcRenderer.invoke("dialog:workspace"),
  chooseAttachments: () => ipcRenderer.invoke("dialog:attachments"),
  importAttachments: (payload) => ipcRenderer.invoke("attachments:import", payload),
  openPath: (targetPath) => ipcRenderer.invoke("path:open", targetPath),
  showPath: (targetPath) => ipcRenderer.invoke("path:show", targetPath),
});
