import { Bot, Box, Cloud, Image, Plug, RefreshCw, Search, Settings as SettingsIcon, ShieldCheck } from "lucide-react";
import type { ProviderHealth, Settings } from "../types";

interface ProviderInspectorProps {
  providers: ProviderHealth[];
  settings: Settings | null;
  onRefresh: () => void;
  onOpenSettings: () => void;
}

function iconFor(id: string) {
  if (id === "ollama") {
    return <Bot size={18} />;
  }
  if (id === "comfy") {
    return <Image size={18} />;
  }
  if (id === "docker") {
    return <Box size={18} />;
  }
  if (id === "runpod") {
    return <Cloud size={18} />;
  }
  if (id === "mcp") {
    return <Plug size={18} />;
  }
  return <Search size={18} />;
}

function selectedWorkflow(settings: Settings | null) {
  if (!settings) {
    return "not loaded";
  }
  if (settings.image.model === "flux2-klein-9b") {
    return settings.image.fluxWorkflowPath;
  }
  if (settings.image.model === "ideogram-v4") {
    return settings.image.ideogramWorkflowPath;
  }
  const custom = settings.image.customModels?.find((model) => model.id === settings.image.model);
  if (custom) {
    return custom.workflowPath;
  }
  return settings.image.zImageWorkflowPath;
}

export function ProviderInspector({ providers, settings, onRefresh, onOpenSettings }: ProviderInspectorProps) {
  return (
    <aside className="inspector">
      <div className="panel-header compact">
        <div>
          <h2>Provider Inspector</h2>
        </div>
        <button className="icon-button" type="button" onClick={onRefresh} aria-label="Refresh providers">
          <RefreshCw size={17} />
        </button>
      </div>

      <div className="provider-list">
        {providers.map((provider) => (
          <div className="provider-card" key={provider.id}>
            <div className="provider-main">
              <span className="provider-icon">{iconFor(provider.id)}</span>
              <div>
                <strong>{provider.name}</strong>
                <span>{provider.endpoint}</span>
              </div>
            </div>
            <div className="provider-meta">
              <span className={`status-badge ${provider.status}`}>{provider.status}</span>
              <span>{provider.latencyMs === null ? "configured" : `${provider.latencyMs} ms`}</span>
            </div>
            <p>{provider.details}</p>
          </div>
        ))}
      </div>

      <div className="settings-summary">
        <div className="summary-title">
          <ShieldCheck size={17} />
          Selected Tool Settings
          <button className="icon-button small" type="button" onClick={onOpenSettings} aria-label="Open settings">
            <SettingsIcon size={15} />
          </button>
        </div>
        <dl>
          <div>
            <dt>Ollama model</dt>
            <dd>{settings?.ollama.model || "not set"}</dd>
          </div>
          <div>
            <dt>Selected workflow</dt>
            <dd>{selectedWorkflow(settings)}</dd>
          </div>
          <div>
            <dt>Image model</dt>
            <dd>
              {settings?.image.model || "z-image-turbo"}
              {settings?.image.model === "ideogram-v4" ? ` / ${settings.image.ideogramEffort}` : ""}
            </dd>
          </div>
          <div>
            <dt>Search provider</dt>
            <dd>{settings?.search.provider || "searxng"}</dd>
          </div>
          <div>
            <dt>Sandbox mode</dt>
            <dd>{settings?.sandbox.mode || "subprocess"}</dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}
