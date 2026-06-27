import { useState } from "react";
import { FolderOpen, Save, X } from "lucide-react";
import { languageLabels } from "../i18n";
import type { IdeogramEffort, ImageModel, LanguageCode, SearchProvider, Settings, ThemeMode, ThinkingMode } from "../types";

interface SettingsDrawerProps {
  settings: Settings;
  onCancel: () => void;
  onSave: (settings: Settings) => Promise<void>;
  onChooseWorkspace: () => void;
}

function cloneSettings(settings: Settings): Settings {
  return JSON.parse(JSON.stringify(settings)) as Settings;
}

export function SettingsDrawer({ settings, onCancel, onSave, onChooseWorkspace }: SettingsDrawerProps) {
  const [draft, setDraft] = useState<Settings>(() => cloneSettings(settings));
  const [saving, setSaving] = useState(false);

  function patch<T extends keyof Settings>(section: T, value: Partial<Settings[T]>) {
    setDraft((current) => ({
      ...current,
      [section]: {
        ...(current[section] as object),
        ...value,
      },
    }));
  }

  async function save() {
    setSaving(true);
    try {
      await onSave(draft);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="drawer-backdrop">
      <aside className="settings-drawer">
        <div className="drawer-header">
          <div>
            <h2>Settings</h2>
          </div>
          <button className="icon-button" type="button" onClick={onCancel} aria-label="Close settings">
            <X size={18} />
          </button>
        </div>

        <div className="settings-sections">
          <section>
            <h3>Appearance</h3>
            <label>
              Theme
              <select value={draft.appearance.theme} onChange={(event) => patch("appearance", { theme: event.target.value as ThemeMode })}>
                <option value="system">system</option>
                <option value="light">light</option>
                <option value="dark">dark</option>
              </select>
            </label>
            <label>
              Language
              <select value={draft.appearance.language} onChange={(event) => patch("appearance", { language: event.target.value as LanguageCode })}>
                {(Object.keys(languageLabels) as LanguageCode[]).map((language) => (
                  <option key={language} value={language}>
                    {languageLabels[language]}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section>
            <h3>Workspace</h3>
            <label>
              Path
              <div className="field-row">
                <input value={draft.workspacePath} onChange={(event) => setDraft({ ...draft, workspacePath: event.target.value })} />
                <button className="quiet-button icon-text" type="button" onClick={onChooseWorkspace}>
                  <FolderOpen size={15} />
                  Browse
                </button>
              </div>
            </label>
          </section>

          <section>
            <h3>Agent Limits</h3>
            <div className="two-col">
              <label>
                Web searches
                <input
                  type="number"
                  min="1"
                  max="3"
                  value={draft.agent.maxWebSearches}
                  onChange={(event) => patch("agent", { maxWebSearches: Number(event.target.value) })}
                />
              </label>
              <label>
                Image jobs
                <input
                  type="number"
                  min="1"
                  max="3"
                  value={draft.agent.maxImageJobs}
                  onChange={(event) => patch("agent", { maxImageJobs: Number(event.target.value) })}
                />
              </label>
            </div>
          </section>

          <section>
            <h3>Ollama LLM</h3>
            <label>
              Base URL
              <input value={draft.ollama.baseUrl} onChange={(event) => patch("ollama", { baseUrl: event.target.value })} />
            </label>
            <label>
              Model
              <input list="ollama-model-presets" value={draft.ollama.model} onChange={(event) => patch("ollama", { model: event.target.value })} />
              <datalist id="ollama-model-presets">
                <option value="auto" />
                <option value="gemma4:e2b" />
                <option value="gemma4:e4b" />
              </datalist>
            </label>
            <label>
              API key
              <input type="password" value={draft.ollama.apiKey} onChange={(event) => patch("ollama", { apiKey: event.target.value })} />
            </label>
            <label>
              Reasoning
              <select value={draft.ollama.thinking} onChange={(event) => patch("ollama", { thinking: event.target.value as ThinkingMode })}>
                <option value="auto">auto</option>
                <option value="off">off</option>
                <option value="on">on</option>
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
                <option value="max">max</option>
              </select>
            </label>
            <div className="two-col">
              <label>
                Temperature
                <input
                  type="number"
                  min="0"
                  max="2"
                  step="0.05"
                  value={draft.ollama.temperature}
                  onChange={(event) => patch("ollama", { temperature: Number(event.target.value) })}
                />
              </label>
              <label>
                Context
                <input
                  type="number"
                  min="1024"
                  step="1024"
                  value={draft.ollama.contextTokens}
                  onChange={(event) => patch("ollama", { contextTokens: Number(event.target.value) })}
                />
              </label>
            </div>
          </section>

          <section>
            <h3>Search</h3>
            <label>
              Provider
              <select value={draft.search.provider} onChange={(event) => patch("search", { provider: event.target.value as SearchProvider })}>
                <option value="auto">auto</option>
                <option value="searxng">SearXNG</option>
                <option value="serpapi">SerpAPI</option>
                <option value="ollama">Ollama Web Search</option>
              </select>
            </label>
            <label>
              SearXNG URL
              <input value={draft.searxng.baseUrl} onChange={(event) => patch("searxng", { baseUrl: event.target.value })} />
            </label>
            <label>
              SerpAPI key
              <input type="password" value={draft.serpApi.apiKey} onChange={(event) => patch("serpApi", { apiKey: event.target.value })} />
            </label>
            <label>
              Ollama search key
              <input
                type="password"
                value={draft.ollamaSearch.apiKey}
                onChange={(event) => patch("ollamaSearch", { apiKey: event.target.value })}
              />
            </label>
          </section>

          <section>
            <h3>ComfyUI</h3>
            <label>
              Base URL
              <input value={draft.comfy.baseUrl} onChange={(event) => patch("comfy", { baseUrl: event.target.value })} />
            </label>
            <label>
              Legacy fallback workflow JSON path
              <input value={draft.comfy.workflowPath} onChange={(event) => patch("comfy", { workflowPath: event.target.value })} />
            </label>
            <label>
              Checkpoint
              <input value={draft.comfy.defaultCheckpoint} onChange={(event) => patch("comfy", { defaultCheckpoint: event.target.value })} />
            </label>
            <label>
              Negative prompt
              <textarea value={draft.comfy.negativePrompt} rows={3} onChange={(event) => patch("comfy", { negativePrompt: event.target.value })} />
            </label>
          </section>

          <section>
            <h3>Image Models</h3>
            <label>
              Default model
              <select value={draft.image.model} onChange={(event) => patch("image", { model: event.target.value as ImageModel })}>
                <option value="z-image-turbo">Z-Image-Turbo</option>
                <option value="flux2-klein-9b">Flux.2 klein 9b</option>
                <option value="ideogram-v4">Ideogram v4</option>
              </select>
            </label>
            <div className="two-col">
              <label>
                Repeat
                <input
                  type="number"
                  min="1"
                  max="3"
                  value={draft.image.repeat}
                  onChange={(event) => patch("image", { repeat: Number(event.target.value) })}
                />
              </label>
              <label>
                Ideogram effort
                <select value={draft.image.ideogramEffort} onChange={(event) => patch("image", { ideogramEffort: event.target.value as IdeogramEffort })}>
                  <option value="turbo">turbo</option>
                  <option value="default">default</option>
                  <option value="quality">quality</option>
                </select>
              </label>
            </div>
            <label>
              Resolution
              <input value={draft.image.ideogramResolution} onChange={(event) => patch("image", { ideogramResolution: event.target.value })} />
            </label>
            <label>
              Z-Image checkpoint
              <input value={draft.image.zImageCheckpoint} onChange={(event) => patch("image", { zImageCheckpoint: event.target.value })} />
            </label>
            <label>
              Flux checkpoint
              <input value={draft.image.fluxCheckpoint} onChange={(event) => patch("image", { fluxCheckpoint: event.target.value })} />
            </label>
            <label>
              Z-Image workflow
              <input value={draft.image.zImageWorkflowPath} onChange={(event) => patch("image", { zImageWorkflowPath: event.target.value })} />
            </label>
            <label>
              Flux workflow
              <input value={draft.image.fluxWorkflowPath} onChange={(event) => patch("image", { fluxWorkflowPath: event.target.value })} />
            </label>
            <label>
              Ideogram v4 workflow
              <input value={draft.image.ideogramWorkflowPath} onChange={(event) => patch("image", { ideogramWorkflowPath: event.target.value })} />
            </label>
          </section>

          <section>
            <h3>Sandbox</h3>
            <label>
              Mode
              <select value={draft.sandbox.mode} onChange={(event) => patch("sandbox", { mode: event.target.value as Settings["sandbox"]["mode"] })}>
                <option value="subprocess">subprocess</option>
                <option value="docker">docker</option>
              </select>
            </label>
            <label>
              Subprocess shell
              <select value={draft.sandbox.shell} onChange={(event) => patch("sandbox", { shell: event.target.value as Settings["sandbox"]["shell"] })}>
                <option value="powershell">PowerShell</option>
                <option value="cmd">cmd.exe</option>
              </select>
            </label>
            <label>
              Docker image
              <input value={draft.sandbox.dockerImage} onChange={(event) => patch("sandbox", { dockerImage: event.target.value })} />
            </label>
          </section>
        </div>

        <div className="drawer-footer">
          <button className="quiet-button" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="primary-button" type="button" onClick={save} disabled={saving}>
            <Save size={15} />
            Save
          </button>
        </div>
      </aside>
    </div>
  );
}
