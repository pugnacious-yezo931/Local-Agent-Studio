# Architecture

## Runtime

- `src/` - React/Vite renderer.
- `electron/main.cjs` - Electron main process and IPC handlers.
- `electron/preload.cjs` - safe `window.localAgent` bridge.
- `electron/backend/` - local adapters for settings, health checks, Ollama, search, image generation and sandbox commands.

The renderer never gets Node.js access directly. It calls the preload bridge, and main process handlers execute local/network work.

## Providers

Ollama:

- Health: `GET /api/tags`
- Chat: `POST /api/chat`
- Streaming: enabled through `agent:stream` IPC events.
- Default base URL: `http://localhost:11434`
- If model is `auto`, backend chooses the first local model from `/api/tags`.

Search:

- SearXNG: `GET /search?q=...&format=json`
- SerpAPI: `GET https://serpapi.com/search.json?engine=google&q=...&api_key=...`
- Ollama Web Search: `POST https://ollama.com/api/web_search` with `Authorization: Bearer <OLLAMA_API_KEY>`
- The agent can generate 1-3 focused search queries, merge the results, then ask Ollama to summarize instead of showing raw snippets.

ComfyUI:

- Health: `GET /system_stats`
- Queue: `POST /prompt`
- History hook: `GET /history/{prompt_id}`
- Built-in workflows live in `electron/workflows` and are packaged with the app:
  - `image_z_image_turbo.json`
  - `image_flux2_text_to_image_9b.json`
  - `ideogram_v4.json`
- Local image presets patch known prompt/seed/settings nodes in those workflow JSON files before calling `/prompt`.
- Ideogram v4 is a ComfyUI workflow, not an external Ideogram API call.
- Supported UI effort values for Ideogram v4 are `turbo`, `default`, `quality`, mapped to the workflow `CustomCombo` choices `Turbo`, `Default`, `Quality`.

Sandbox:

- `subprocess`: PowerShell or cmd inside `workspacePath`.
- `docker`: `docker run --rm -v <workspace>:/workspace -w /workspace <image> bash -lc <command>`.

## Desktop Shell

The requested target was a React/Vite desktop app. Tauri was considered first, but this machine did not have Rust/Cargo during the initial implementation, so the verified local build uses Electron. The app can be migrated to Tauri later without changing the renderer much.

## Primary Docs Used

- Ollama API: https://docs.ollama.com/api
- Ollama chat endpoint: https://docs.ollama.com/api/chat
- Ollama Web Search: https://docs.ollama.com/capabilities/web-search
- ComfyUI server routes: https://docs.comfy.org/development/comfyui-server/comms_routes
- SerpAPI Search API: https://serpapi.com/search-api
- SearXNG Search API: https://docs.searxng.org/dev/search_api.html
