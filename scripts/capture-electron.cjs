const fs = require("node:fs");
const path = require("node:path");
const { app, BrowserWindow, ipcMain } = require("electron");
const { readSettings, saveSettings } = require("../electron/backend/config.cjs");
const { checkProviders } = require("../electron/backend/providers.cjs");
const { sendAgentMessage, sendAgentMessageStream } = require("../electron/backend/llm.cjs");
const { searchWeb } = require("../electron/backend/search.cjs");
const { queueComfyPrompt, getComfyHistory } = require("../electron/backend/comfy.cjs");
const { runCommand } = require("../electron/backend/sandbox.cjs");
const { describeAttachments } = require("../electron/backend/attachments.cjs");
const {
  appendTextFile,
  deleteWorkspacePath,
  listFiles,
  readTextFile,
  writeTextFile,
} = require("../electron/backend/files.cjs");

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function submitComposer(window, text) {
  await window.webContents.executeJavaScript(`
    (() => {
      const textarea = document.querySelector(".composer textarea");
      if (!textarea) {
        throw new Error("Composer textarea not found");
      }
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set;
      setter.call(textarea, ${JSON.stringify(text)});
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
      textarea.dispatchEvent(new KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
        bubbles: true,
        cancelable: true
      }));
    })();
  `);
}

async function main() {
  app.setName("Local Agent Studio");
  await app.whenReady();
  const userDataDir = app.getPath("userData");
  const getSettings = () => readSettings(userDataDir);

  ipcMain.handle("settings:get", () => getSettings());
  ipcMain.handle("settings:save", (_event, settings) => saveSettings(userDataDir, settings));
  ipcMain.handle("providers:check", () => checkProviders(getSettings()));
  ipcMain.handle("agent:message", (_event, payload) =>
    sendAgentMessage({ messages: payload.messages, toolMode: payload.toolMode, settings: getSettings() }),
  );
  ipcMain.handle("agent:stream", (event, payload) =>
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
  ipcMain.handle("search:web", (_event, payload) => searchWeb({ query: payload.query, provider: payload.provider, settings: getSettings() }));
  ipcMain.handle("comfy:queue", (_event, payload) =>
    queueComfyPrompt({
      prompt: payload.prompt,
      negativePrompt: payload.negativePrompt,
      imageModel: payload.imageModel,
      ideogramEffort: payload.ideogramEffort,
      count: payload.count,
      settings: getSettings(),
    }),
  );
  ipcMain.handle("comfy:history", (_event, payload) => getComfyHistory({ promptId: payload.promptId, settings: getSettings() }));
  ipcMain.handle("terminal:run", (_event, payload) => runCommand({ command: payload.command, settings: getSettings() }));
  ipcMain.handle("files:list", (_event, payload = {}) => listFiles({ settings: getSettings(), directory: payload.directory || "", depth: payload.depth ?? 2 }));
  ipcMain.handle("files:read", (_event, payload) => readTextFile({ settings: getSettings(), filePath: payload.filePath }));
  ipcMain.handle("files:write", (_event, payload) =>
    writeTextFile({ settings: getSettings(), filePath: payload.filePath, content: payload.content || "", overwrite: payload.overwrite ?? true }),
  );
  ipcMain.handle("files:append", (_event, payload) => appendTextFile({ settings: getSettings(), filePath: payload.filePath, content: payload.content || "" }));
  ipcMain.handle("files:delete", (_event, payload) => deleteWorkspacePath({ settings: getSettings(), filePath: payload.filePath }));
  ipcMain.handle("dialog:workspace", () => getSettings());
  ipcMain.handle("dialog:attachments", () => describeAttachments([]));
  ipcMain.handle("path:open", () => undefined);
  ipcMain.handle("path:show", () => undefined);

  const window = new BrowserWindow({
    width: 1500,
    height: 950,
    show: false,
    backgroundColor: "#f7f9f8",
    webPreferences: {
      preload: path.join(__dirname, "..", "electron", "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  await window.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  await wait(2600);

  if (process.env.LOCAL_AGENT_CAPTURE_INTERACT) {
    await submitComposer(window, "/run Write-Output ok");
    await wait(2200);
  }

  const image = await window.capturePage();
  const outDir = path.join(__dirname, "..", "docs");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "rendered-screen.png"), image.toPNG());

  app.quit();
}

main().catch((error) => {
  console.error(error);
  app.exit(1);
});
