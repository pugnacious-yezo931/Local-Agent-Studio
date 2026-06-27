export type ChatRole = "user" | "assistant";
export type LogLevel = "INFO" | "WARN" | "ERROR";
export type ToolMode = "auto" | "web" | "none";
export type SearchProvider = "auto" | "searxng" | "serpapi" | "ollama";
export type ThemeMode = "system" | "light" | "dark";
export type LanguageCode = "en" | "ru" | "uk" | "de" | "pl";
export type ThinkingMode = "auto" | "off" | "on" | "low" | "medium" | "high" | "max";
export type ImageModel = "z-image-turbo" | "flux2-klein-9b" | "ideogram-v4";
export type IdeogramEffort = "turbo" | "default" | "quality";

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  source: string;
}

export interface Attachment {
  id: string;
  name: string;
  path: string;
  mimeType: string;
  kind: "image" | "audio" | "video" | "text" | "file";
  size: number;
}

export interface WorkspaceFile {
  name: string;
  relativePath: string;
  absolutePath: string;
  type: "directory" | "file";
  size: number;
  modifiedAt: string;
  isText: boolean;
}

export interface WorkspaceListResult {
  root: string;
  directory: string;
  files: WorkspaceFile[];
}

export interface WorkspaceReadResult {
  root: string;
  relativePath: string;
  absolutePath: string;
  content: string;
  info: WorkspaceFile;
}

export interface WorkspaceWriteResult extends WorkspaceReadResult {}

export interface ToolResult {
  type: "search" | "comfy" | "terminal" | "file" | "database";
  label: string;
  status?: "running" | "done" | "error";
  query?: string;
  results?: SearchResult[];
  payload?: any;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  toolResults?: ToolResult[];
  attachments?: Attachment[];
  thinking?: string;
  pending?: boolean;
}

export interface AppLog {
  id: string;
  time: string;
  level: LogLevel;
  source: string;
  message: string;
  durationMs?: number | null;
}

export interface ProviderHealth {
  id: string;
  name: string;
  kind: string;
  endpoint: string;
  status: "healthy" | "warning" | "error";
  latencyMs: number | null;
  details: string;
}

export interface Settings {
  version: number;
  workspacePath: string;
  appearance: {
    theme: ThemeMode;
    language: LanguageCode;
  };
  agent: {
    maxWebSearches: number;
    maxImageJobs: number;
  };
  ollama: {
    baseUrl: string;
    model: string;
    apiKey: string;
    thinking: ThinkingMode;
    temperature: number;
    contextTokens: number;
    timeoutMs: number;
  };
  search: {
    provider: SearchProvider;
    maxResults: number;
  };
  serpApi: {
    apiKey: string;
    engine: string;
    location: string;
  };
  ollamaSearch: {
    apiKey: string;
    maxResults: number;
  };
  searxng: {
    baseUrl: string;
  };
  comfy: {
    baseUrl: string;
    workflowPath: string;
    defaultCheckpoint: string;
    negativePrompt: string;
  };
  image: {
    model: ImageModel;
    repeat: number;
    ideogramEffort: IdeogramEffort;
    ideogramResolution: string;
    zImageCheckpoint: string;
    fluxCheckpoint: string;
    zImageWorkflowPath: string;
    fluxWorkflowPath: string;
    ideogramWorkflowPath: string;
  };
  sandbox: {
    mode: "subprocess" | "docker";
    shell: "powershell" | "cmd";
    dockerImage: string;
    timeoutMs: number;
  };
}

export interface AgentResponse {
  content: string;
  thinking?: string;
  model: string;
  metrics?: {
    totalDurationNs?: number;
    promptTokens?: number;
    completionTokens?: number;
  };
  toolResults?: ToolResult[];
}

export type AgentStreamEvent =
  | { type: "status"; message: string }
  | { type: "tool-start"; toolResult: ToolResult }
  | { type: "tool-finish"; toolResult: ToolResult }
  | { type: "thinking"; token: string }
  | { type: "token"; token: string }
  | { type: "done"; response: AgentResponse }
  | { type: "error"; message: string };

export interface TerminalResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
  timedOut: boolean;
}

export interface ComfyQueueResponse {
  clientId: string;
  promptId?: string;
  number?: number;
  nodeErrors?: unknown;
  provider?: "comfy" | "ideogram";
  model?: ImageModel;
  count?: number;
  jobs?: Array<{
    clientId?: string;
    promptId?: string;
    number?: number;
    nodeErrors?: unknown;
    images?: Array<{
      url?: string;
      path?: string;
      seed?: number;
      resolution?: string;
      isSafe?: boolean;
    }>;
  }>;
}
