import type {
  AgentResponse,
  AgentStreamEvent,
  Attachment,
  ComfyImage,
  ComfyImageSaveResult,
  ComfyQueueResponse,
  IdeogramEffort,
  ImageModel,
  ProviderHealth,
  SearchProvider,
  SearchResult,
  Settings,
  TerminalResult,
  WorkspaceListResult,
  WorkspaceReadResult,
  WorkspaceWriteResult,
} from "./types";

export type CompactChatMessage = {
  role: "user" | "assistant";
  content: string;
  attachments?: Attachment[];
};

declare global {
  interface Window {
    localAgent: {
      getSettings: () => Promise<Settings>;
      saveSettings: (settings: Settings) => Promise<Settings>;
      checkProviders: () => Promise<ProviderHealth[]>;
      sendMessage: (payload: {
        messages: CompactChatMessage[];
        toolMode: "auto" | "web" | "none";
      }) => Promise<AgentResponse>;
      sendMessageStream: (
        payload: {
          messages: CompactChatMessage[];
          toolMode: "auto" | "web" | "none";
        },
        onEvent: (event: AgentStreamEvent) => void,
      ) => Promise<AgentResponse>;
      searchWeb: (payload: { query: string; provider?: SearchProvider }) => Promise<{
        provider: SearchProvider;
        results: SearchResult[];
      }>;
      queueComfy: (payload: {
        prompt: string;
        negativePrompt?: string;
        imageModel?: ImageModel;
        ideogramEffort?: IdeogramEffort;
        count?: number;
      }) => Promise<ComfyQueueResponse>;
      getComfyHistory: (payload: { promptId?: string }) => Promise<unknown>;
      getComfyImages: (payload: { promptId: string }) => Promise<{ promptId: string; images: ComfyImage[] }>;
      saveComfyImage: (payload: { image: ComfyImage }) => Promise<ComfyImageSaveResult>;
      runCommand: (payload: { command: string }) => Promise<TerminalResult>;
      listFiles: (payload?: { directory?: string; depth?: number }) => Promise<WorkspaceListResult>;
      readFile: (payload: { filePath: string }) => Promise<WorkspaceReadResult>;
      writeFile: (payload: { filePath: string; content: string; overwrite?: boolean }) => Promise<WorkspaceWriteResult>;
      appendFile: (payload: { filePath: string; content: string }) => Promise<WorkspaceWriteResult>;
      deleteFile: (payload: { filePath: string }) => Promise<{ root: string; relativePath: string; absolutePath: string }>;
      chooseWorkspace: () => Promise<Settings | null>;
      chooseAttachments: () => Promise<Attachment[]>;
      openPath: (targetPath: string) => Promise<void>;
      showPath: (targetPath: string) => Promise<void>;
    };
  }
}

export {};
