import { FormEvent, useState } from "react";
import { Play, Terminal } from "lucide-react";
import type { Settings, TerminalResult } from "../types";

interface TerminalPanelProps {
  settings: Settings | null;
  onRun: (command: string) => Promise<TerminalResult>;
}

export function TerminalPanel({ settings, onRun }: TerminalPanelProps) {
  const [command, setCommand] = useState("Get-ChildItem");
  const [result, setResult] = useState<TerminalResult | null>(null);
  const [running, setRunning] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!command.trim() || running) {
      return;
    }
    setRunning(true);
    try {
      setResult(await onRun(command));
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="terminal-panel">
      <div className="panel-header">
        <div>
          <h2>Sandbox Runner</h2>
          <p>
            {settings?.sandbox.mode || "subprocess"} in {settings?.workspacePath || "workspace"}
          </p>
        </div>
        <span className="tool-chip">
          <Terminal size={14} />
          {settings?.sandbox.mode || "subprocess"}
        </span>
      </div>

      <form className="terminal-form" onSubmit={submit}>
        <input value={command} onChange={(event) => setCommand(event.target.value)} placeholder="Command" />
        <button className="primary-button" type="submit" disabled={running || !command.trim()}>
          <Play size={15} />
          Run
        </button>
      </form>

      <pre className="terminal-output">
        {result
          ? `$ ${command}\n\nExit code: ${result.exitCode}\nDuration: ${result.durationMs} ms\n\n${result.stdout}${result.stderr ? `\n${result.stderr}` : ""}`
          : "No command output yet."}
      </pre>
    </section>
  );
}
