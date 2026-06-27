# Local Agent Studio Promo Plan

## GitHub Assets

Use these images:

- README dark hero: `docs/assets/github-hero-dark.png`
- GitHub social preview: `docs/assets/github-social-light-social.jpg`
- Alternative social preview: `docs/assets/github-hero-dark-social.jpg`

GitHub social preview upload path:

1. Open repository on GitHub.
2. Go to `Settings`.
3. Find `Social preview`.
4. Upload `docs/assets/github-social-light-social.jpg`.

README hero snippet:

```md
![Local Agent Studio](docs/assets/github-hero-dark.png)

# Local Agent Studio

Local-first Agent Mode for Windows: chat, web search, workspace files, ComfyUI image generation, databases, and sandbox commands through your own local/API providers.
```

Suggested badges:

```md
![Windows](https://img.shields.io/badge/Windows-10%2B-0078D6?logo=windows&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-local%20LLM-111?logo=ollama&logoColor=white)
![ComfyUI](https://img.shields.io/badge/ComfyUI-images-0f766e)
![Electron](https://img.shields.io/badge/Electron-desktop-47848f?logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React%2FVite-frontend-61dafb?logo=react&logoColor=111)
![License](https://img.shields.io/badge/license-TBD-lightgrey)
```

## Where To Promote

Best first wave:

- Hacker News `Show HN`: post only when there is a public repo/release people can try. Good title: `Show HN: Local Agent Studio - local-first Agent Mode for Windows`.
- Product Hunt: launch after README, screenshots, installer, demo video, and a short landing page are ready.
- Reddit communities: `r/LocalLLaMA`, `r/ollama`, `r/ComfyUI`, `r/selfhosted`, `r/opensource`, `r/coolgithubprojects`. Read each community's self-promo rules first.
- GitHub itself: topics like `ollama`, `comfyui`, `local-ai`, `agent`, `electron`, `windows`, `desktop-app`, `open-source`, `llm`.
- Dev.to / Hashnode / Medium: write a build log, not just an announcement.
- X/Twitter, Bluesky, Mastodon, LinkedIn: short demo clips work better than screenshots.
- Discords: Ollama, ComfyUI, local AI, open-source/self-hosting groups. Ask for feedback rather than dropping a link.
- Awesome lists later: submit PRs only when docs, releases, and screenshots are solid.

Post angle:

```text
I built a Windows desktop app that turns Ollama + ComfyUI + web search + workspace files into a local Agent Mode.

It can chat, search up to 3 times, summarize results, create/edit files, generate images through ComfyUI workflows, and build local JSON/CSV/SQLite databases.

Looking for feedback from people running local LLMs on Windows.
```

## YouTube Presentation

Target length: 2:30-3:30.

Title ideas:

- `I Built a Local ChatGPT Agent Mode for Windows`
- `Local Agent Studio: Ollama + ComfyUI + Files + Search in One Desktop App`
- `Run Your Own Agent Mode Locally on Windows`

Thumbnail text:

- `LOCAL AGENT MODE`
- `Ollama + ComfyUI`
- `ChatGPT-style, but local`

Structure:

1. Hook, 0:00-0:15
   - "What if ChatGPT Agent Mode ran locally on your Windows PC with your own Ollama models and ComfyUI workflows?"
   - Show the app window and one fast result.

2. Problem, 0:15-0:35
   - Local AI tools are powerful but scattered: Ollama, ComfyUI, search, terminal, files.
   - The goal is one normal chatbot interface that can use them.

3. Main demo, 0:35-1:50
   - Ask a normal question that needs web search.
   - Ask it to create a file and show it in Workspace.
   - Generate an image with Z-Image/Flux/Ideogram.
   - Create a database from JSON objects.
   - Open reasoning panel for a model that supports thinking.

4. Settings, 1:50-2:20
   - Show Ollama model selection.
   - Show image model selection.
   - Show theme/language settings.
   - Show search providers and workspace directory.

5. Why it matters, 2:20-2:55
   - Local-first.
   - Works with your own API keys.
   - Windows desktop app.
   - Extensible workflows.

6. Call to action, 2:55-3:15
   - "Try the release, star the repo, and open issues with models/workflows you want supported."

Voiceover draft:

```text
This is Local Agent Studio, a local-first Agent Mode for Windows.

Instead of juggling Ollama, ComfyUI, search tools, terminal commands, and workspace files separately, the app puts them behind a normal chat interface.

You can ask a regular question, and when current information is needed, it searches the web, summarizes the result, and cites sources instead of dumping raw search text.

It can also work with your local workspace. For example, I can ask it to create a test file, then open the Workspace tab and edit that file directly.

For images, it talks to ComfyUI and supports workflows like Z-Image-Turbo, Flux.2 klein 9b, and Ideogram v4, including effort selection for Ideogram.

It can also turn objects into local databases, saving JSON, CSV, and SQLite files.

The whole point is simple: a ChatGPT-style desktop agent that runs locally or through your own API keys.

If you run local LLMs on Windows, try it, star the repo, and tell me what tool support you want next.
```

Shot list:

- `00_intro_app_window.mp4`: open app, show clean chat UI.
- `01_web_search.mp4`: ask price/current info query, show summarized answer.
- `02_workspace_file.mp4`: create file, open Workspace tab, edit/save.
- `03_image_generation.mp4`: queue image generation, show ComfyUI job.
- `04_database.mp4`: paste JSON, create database, show files.
- `05_settings.mp4`: model/theme/language/provider settings.

## Feature Ideas

High impact:

- Native tool calling schema with a visible approval step for risky actions.
- Built-in model capability registry: text, image input, audio input, video input, reasoning, context size.
- File downloads/attachments inside chat for every created file.
- Search result source cards with price extraction tables.
- ComfyUI job watcher that pulls finished images into the chat automatically.
- Conversation history saved as local projects.
- Project templates: "Research", "Coding", "Image generation", "Data/database".
- One-click installer checks: Ollama installed, ComfyUI reachable, SearXNG optional.

Developer-focused:

- Plugin system for new tools.
- Git integration: status, diff, commit message, changelog.
- Repo indexing/RAG over workspace files.
- SQLite browser/editor inside Workspace.
- JSON/CSV preview tables.
- Terminal command approval queue.

Creator-focused:

- Video generation workflows through ComfyUI.
- Prompt library for image models.
- Batch image generation panel.
- YouTube script generator + thumbnail generator.
- Export chat as Markdown/PDF.

Trust and polish:

- Safety modes: chat-only, ask-before-write, autonomous workspace.
- Visible tool timeline per answer.
- Better error recovery when search providers are not configured.
- First-run setup wizard.
- Signed app icon and branded installer.
