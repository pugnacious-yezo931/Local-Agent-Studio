const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

function defaultSettings() {
  const homeWorkspace = path.join(os.homedir(), "LocalAgentStudio", "workspace");
  const workflowDir = path.join(__dirname, "..", "workflows");

  return {
    version: 1,
    workspacePath: process.env.LOCAL_AGENT_WORKSPACE || homeWorkspace,
    appearance: {
      theme: process.env.LOCAL_AGENT_THEME || "system",
      language: process.env.LOCAL_AGENT_LANGUAGE || "en",
    },
    agent: {
      maxWebSearches: 3,
      maxImageJobs: 3,
    },
    ollama: {
      baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      model: process.env.OLLAMA_MODEL || "auto",
      apiKey: process.env.OLLAMA_API_KEY || "",
      thinking: process.env.OLLAMA_THINKING || "auto",
      temperature: 0.35,
      contextTokens: 8192,
      timeoutMs: 120000,
    },
    search: {
      provider: process.env.SEARCH_PROVIDER || "searxng",
      maxResults: 5,
    },
    serpApi: {
      apiKey: process.env.SERPAPI_API_KEY || "",
      engine: "google",
      location: "",
    },
    ollamaSearch: {
      apiKey: process.env.OLLAMA_API_KEY || "",
      maxResults: 5,
    },
    searxng: {
      baseUrl: process.env.SEARXNG_BASE_URL || "http://localhost:8080",
    },
    comfy: {
      baseUrl: process.env.COMFYUI_BASE_URL || "http://localhost:8188",
      workflowPath: "",
      defaultCheckpoint: "sd_xl_base_1.0.safetensors",
      negativePrompt: "low quality, blurry, distorted, watermark, text",
    },
    image: {
      model: process.env.IMAGE_MODEL || "z-image-turbo",
      repeat: 1,
      ideogramEffort: "default",
      ideogramResolution: "2048x2048",
      zImageCheckpoint: process.env.Z_IMAGE_CHECKPOINT || "z_image_turbo.safetensors",
      fluxCheckpoint: process.env.FLUX2_KLEIN_CHECKPOINT || "flux2_klein_9b.safetensors",
      zImageWorkflowPath: process.env.Z_IMAGE_WORKFLOW_PATH || path.join(workflowDir, "image_z_image_turbo.json"),
      fluxWorkflowPath: process.env.FLUX2_WORKFLOW_PATH || path.join(workflowDir, "image_flux2_text_to_image_9b.json"),
      ideogramWorkflowPath: process.env.IDEOGRAM_WORKFLOW_PATH || path.join(workflowDir, "ideogram_v4.json"),
    },
    sandbox: {
      mode: "subprocess",
      shell: "powershell",
      dockerImage: "ubuntu:24.04",
      timeoutMs: 60000,
    },
  };
}

function settingsPath(userDataDir) {
  return path.join(userDataDir, "settings.json");
}

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function mergeDeep(base, override) {
  const result = { ...base };
  for (const [key, value] of Object.entries(override || {})) {
    if (isPlainObject(value) && isPlainObject(result[key])) {
      result[key] = mergeDeep(result[key], value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function ensureWorkspace(settings) {
  if (settings.workspacePath) {
    fs.mkdirSync(settings.workspacePath, { recursive: true });
  }
}

function readSettings(userDataDir) {
  const filePath = settingsPath(userDataDir);
  const defaults = defaultSettings();

  if (!fs.existsSync(filePath)) {
    ensureWorkspace(defaults);
    return defaults;
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);
  const merged = mergeDeep(defaults, parsed);
  ensureWorkspace(merged);
  return merged;
}

function saveSettings(userDataDir, settings) {
  const merged = mergeDeep(defaultSettings(), settings);
  ensureWorkspace(merged);
  fs.mkdirSync(userDataDir, { recursive: true });
  fs.writeFileSync(settingsPath(userDataDir), JSON.stringify(merged, null, 2), "utf8");
  return merged;
}

module.exports = {
  defaultSettings,
  readSettings,
  saveSettings,
  settingsPath,
};
