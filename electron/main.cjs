const path = require("node:path");
const { app, BrowserWindow, dialog, ipcMain, shell } = require("electron");
const { readSettings, saveSettings } = require("./backend/config.cjs");
const { checkProviders } = require("./backend/providers.cjs");
const { sendAgentMessage, sendAgentMessageStream } = require("./backend/llm.cjs");
const { searchWeb } = require("./backend/search.cjs");
const { queueComfyPrompt, getComfyHistory, getComfyImages, saveComfyImageToWorkspace } = require("./backend/comfy.cjs");
const { runCommand } = require("./backend/sandbox.cjs");
const { describeAttachments } = require("./backend/attachments.cjs");
const {
  appendTextFile,
  deleteWorkspacePath,
  listFiles,
  readTextFile,
  writeTextFile,
} = require("./backend/files.cjs");

let mainWindow;

app.setName("Local Agent Studio");

function userDataDir() {
  return app.getPath("userData");
}

function getSettings() {
  return readSettings(userDataDir());
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 950,
    minWidth: 1180,
    minHeight: 760,
    backgroundColor: "#f7f9f8",
    title: "Local Agent Studio",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (process.env.LOCAL_AGENT_DEV) {
    await mainWindow.loadURL("http://127.0.0.1:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    await mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

function registerHandlers() {
  ipcMain.handle("settings:get", () => getSettings());

  ipcMain.handle("settings:save", (_event, settings) => saveSettings(userDataDir(), settings));

  ipcMain.handle("providers:check", async () => checkProviders(getSettings()));

  ipcMain.handle("agent:message", async (_event, payload) =>
    sendAgentMessage({
      messages: payload.messages,
      toolMode: payload.toolMode,
      settings: getSettings(),
    }),
  );

  ipcMain.handle("agent:stream", async (event, payload) =>
    sendAgentMessageStream({
      messages: payload.messages,
      toolMode: payload.toolMode,
      settings: getSettings(),
      onEvent: (streamEvent) => {
        event.sender.send("agent:stream:event", {
          requestId: payload.requestId,
          event: streamEvent,
        });
      },
    }),
  );

  ipcMain.handle("search:web", async (_event, payload) =>
    searchWeb({
      query: payload.query,
      provider: payload.provider,
      settings: getSettings(),
    }),
  );

  ipcMain.handle("comfy:queue", async (_event, payload) =>
    queueComfyPrompt({
      prompt: payload.prompt,
      negativePrompt: payload.negativePrompt,
      imageModel: payload.imageModel,
      ideogramEffort: payload.ideogramEffort,
      count: payload.count,
      settings: getSettings(),
    }),
  );

  ipcMain.handle("comfy:history", async (_event, payload) =>
    getComfyHistory({
      promptId: payload.promptId,
      settings: getSettings(),
    }),
  );

  ipcMain.handle("comfy:images", async (_event, payload) =>
    getComfyImages({
      promptId: payload.promptId,
      settings: getSettings(),
    }),
  );

  ipcMain.handle("comfy:save-image", async (_event, payload) =>
    saveComfyImageToWorkspace({
      image: payload.image,
      settings: getSettings(),
    }),
  );

  ipcMain.handle("terminal:run", async (_event, payload) =>
    runCommand({
      command: payload.command,
      settings: getSettings(),
    }),
  );

  ipcMain.handle("files:list", async (_event, payload = {}) =>
    listFiles({
      settings: getSettings(),
      directory: payload.directory || "",
      depth: payload.depth ?? 2,
    }),
  );

  ipcMain.handle("files:read", async (_event, payload) =>
    readTextFile({
      settings: getSettings(),
      filePath: payload.filePath,
    }),
  );

  ipcMain.handle("files:write", async (_event, payload) =>
    writeTextFile({
      settings: getSettings(),
      filePath: payload.filePath,
      content: payload.content || "",
      overwrite: payload.overwrite ?? true,
    }),
  );

  ipcMain.handle("files:append", async (_event, payload) =>
    appendTextFile({
      settings: getSettings(),
      filePath: payload.filePath,
      content: payload.content || "",
    }),
  );

  ipcMain.handle("files:delete", async (_event, payload) =>
    deleteWorkspacePath({
      settings: getSettings(),
      filePath: payload.filePath,
    }),
  );

  ipcMain.handle("dialog:attachments", async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openFile", "multiSelections"],
      title: "Attach files",
      filters: [
        { name: "Supported files", extensions: ["png", "jpg", "jpeg", "webp", "gif", "txt", "md", "json", "csv", "pdf", "mp3", "wav", "m4a", "mp4", "webm", "mov"] },
        { name: "All files", extensions: ["*"] },
      ],
    });

    if (result.canceled || !result.filePaths.length) {
      return [];
    }

    return describeAttachments(result.filePaths);
  });

  ipcMain.handle("dialog:workspace", async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory", "createDirectory"],
      title: "Select Local Agent workspace",
    });

    if (result.canceled || !result.filePaths.length) {
      return null;
    }

    const settings = getSettings();
    settings.workspacePath = result.filePaths[0];
    return saveSettings(userDataDir(), settings);
  });

  ipcMain.handle("path:open", async (_event, targetPath) => {
    if (!targetPath) {
      return;
    }
    await shell.openPath(targetPath);
  });

  ipcMain.handle("path:show", async (_event, targetPath) => {
    if (!targetPath) {
      return;
    }
    shell.showItemInFolder(targetPath);
  });
}

app.whenReady().then(async () => {
  registerHandlers();
  await createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
