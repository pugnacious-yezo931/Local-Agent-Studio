import { Bot, FolderOpen, Save } from "lucide-react";
import type { Settings } from "../types";

interface SetupWizardProps {
  settings: Settings;
  onChooseWorkspace: () => Promise<void>;
  onContextDateToggle: (enabled: boolean) => void;
  onFinish: () => Promise<void>;
}

export function SetupWizard({ settings, onChooseWorkspace, onContextDateToggle, onFinish }: SetupWizardProps) {
  return (
    <div className="setup-screen">
      <section className="setup-panel">
        <div className="setup-mark">
          <Bot size={28} />
        </div>
        <div>
          <h1>Set up Local Agent Studio</h1>
          <p>Choose where the agent can create, edit, preview, and download files.</p>
        </div>

        <div className="setup-workspace">
          <span>Workspace</span>
          <strong>{settings.workspacePath}</strong>
          <button className="quiet-button icon-text" type="button" onClick={onChooseWorkspace}>
            <FolderOpen size={15} />
            Choose folder
          </button>
        </div>

        <label className="setup-option">
          <input
            type="checkbox"
            checked={settings.context?.includeLocalDateTime ?? true}
            onChange={(event) => onContextDateToggle(event.target.checked)}
          />
          <span>
            <strong>Share this PC date and time with the LLM</strong>
            <small>The assistant will know today from your computer instead of guessing or searching for the date.</small>
          </span>
        </label>

        <div className="setup-actions">
          <button className="primary-button" type="button" onClick={onFinish}>
            <Save size={15} />
            Start
          </button>
        </div>
      </section>
    </div>
  );
}
