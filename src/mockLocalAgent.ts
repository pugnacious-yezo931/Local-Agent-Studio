import type {
  AgentResponse,
  AgentStreamEvent,
  ComfyQueueResponse,
  ProviderHealth,
  SearchResult,
  Settings,
  TerminalResult,
  WorkspaceFile,
  WorkspaceReadResult,
} from "./types";

const mockSettings: Settings = {
  version: 1,
  workspacePath: "C:\\LocalAgentStudio\\workspace",
  appearance: {
    theme: "system",
    language: "en",
  },
  agent: {
    maxWebSearches: 3,
    maxImageJobs: 3,
  },
  ollama: {
    baseUrl: "http://localhost:11434",
    model: "auto",
    apiKey: "",
    thinking: "auto",
    temperature: 0.35,
    contextTokens: 8192,
    timeoutMs: 120000,
  },
  search: {
    provider: "searxng",
    maxResults: 5,
  },
  serpApi: {
    apiKey: "",
    engine: "google",
    location: "",
  },
  ollamaSearch: {
    apiKey: "",
    maxResults: 5,
  },
  searxng: {
    baseUrl: "http://localhost:8080",
  },
  comfy: {
    baseUrl: "http://localhost:8188",
    workflowPath: "",
    defaultCheckpoint: "sd_xl_base_1.0.safetensors",
    negativePrompt: "low quality, blurry, distorted, watermark, text",
  },
  image: {
    model: "z-image-turbo",
    repeat: 1,
    ideogramEffort: "default",
    ideogramResolution: "2048x2048",
    zImageCheckpoint: "z_image_turbo.safetensors",
    fluxCheckpoint: "flux2_klein_9b.safetensors",
    zImageWorkflowPath: "electron\\workflows\\image_z_image_turbo.json",
    fluxWorkflowPath: "electron\\workflows\\image_flux2_text_to_image_9b.json",
    ideogramWorkflowPath: "electron\\workflows\\ideogram_v4.json",
  },
  sandbox: {
    mode: "subprocess",
    shell: "powershell",
    dockerImage: "ubuntu:24.04",
    timeoutMs: 60000,
  },
};

const mockFile: WorkspaceFile = {
  name: "note.txt",
  relativePath: "note.txt",
  absolutePath: `${mockSettings.workspacePath}\\note.txt`,
  type: "file",
  size: 12,
  modifiedAt: new Date().toISOString(),
  isText: true,
};

const mockProviders: ProviderHealth[] = [
  {
    id: "ollama",
    name: "Ollama",
    kind: "LLM",
    endpoint: "http://localhost:11434",
    status: "healthy",
    latencyMs: 31,
    details: "Models: llama3.1:8b, qwen2.5-coder:7b",
  },
  {
    id: "comfy",
    name: "ComfyUI",
    kind: "Image/Video",
    endpoint: "http://localhost:8188",
    status: "healthy",
    latencyMs: 44,
    details: "system_stats OK",
  },
  {
    id: "searxng",
    name: "SearXNG",
    kind: "Search",
    endpoint: "http://localhost:8080",
    status: "healthy",
    latencyMs: 118,
    details: "JSON search OK",
  },
];

function previewResponse(): AgentResponse {
  return {
    content:
      "Preview mode: in Electron this message goes through the local Ollama API.\n\n```ts\nconst streaming = true;\n```\n\n**Markdown** is enabled.",
    thinking: "Preview reasoning is shown here when a model returns it.",
    model: mockSettings.ollama.model,
    toolResults: [],
  };
}

function mockRead(filePath = "note.txt", content = "Preview file"): WorkspaceReadResult {
  return {
    root: mockSettings.workspacePath,
    relativePath: filePath,
    absolutePath: `${mockSettings.workspacePath}\\${filePath}`,
    content,
    info: {
      ...mockFile,
      name: filePath,
      relativePath: filePath,
      absolutePath: `${mockSettings.workspacePath}\\${filePath}`,
      size: content.length,
    },
  };
}

export function installMockLocalAgent() {
  if (window.localAgent) {
    return;
  }

  window.localAgent = {
    getSettings: async () => mockSettings,
    saveSettings: async (settings: Settings) => settings,
    checkProviders: async () => mockProviders,
    sendMessage: async (): Promise<AgentResponse> => previewResponse(),
    sendMessageStream: async (_payload, onEvent: (event: AgentStreamEvent) => void): Promise<AgentResponse> => {
      const response = previewResponse();
      for (const token of response.content.match(/.{1,18}/g) || []) {
        onEvent({ type: "token", token });
        await new Promise((resolve) => setTimeout(resolve, 15));
      }
      onEvent({ type: "done", response });
      return response;
    },
    searchWeb: async (): Promise<{ provider: "searxng"; results: SearchResult[] }> => ({
      provider: "searxng",
      results: [
        {
          title: "SearXNG preview result",
          url: "http://localhost:8080",
          content: "Mock result used only when the renderer is opened without Electron preload.",
          source: "SearXNG",
        },
      ],
    }),
    queueComfy: async (): Promise<ComfyQueueResponse> => ({
      provider: "comfy",
      model: "z-image-turbo",
      count: 1,
      clientId: "preview-client",
      promptId: "preview-prompt",
      number: 1,
      jobs: [{ clientId: "preview-client", promptId: "preview-prompt", number: 1 }],
    }),
    getComfyHistory: async () => ({}),
    runCommand: async (): Promise<TerminalResult> => ({
      exitCode: 0,
      stdout: "Preview command output",
      stderr: "",
      durationMs: 12,
      timedOut: false,
    }),
    listFiles: async () => ({
      root: mockSettings.workspacePath,
      directory: "",
      files: [mockFile],
    }),
    readFile: async (payload) => mockRead(payload.filePath),
    writeFile: async (payload) => mockRead(payload.filePath, payload.content),
    appendFile: async (payload) => mockRead(payload.filePath, payload.content),
    deleteFile: async (payload) => ({
      root: mockSettings.workspacePath,
      relativePath: payload.filePath,
      absolutePath: `${mockSettings.workspacePath}\\${payload.filePath}`,
    }),
    chooseWorkspace: async () => mockSettings,
    chooseAttachments: async () => [],
    openPath: async () => undefined,
    showPath: async () => undefined,
  };
}
