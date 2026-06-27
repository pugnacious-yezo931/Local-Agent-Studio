import { useCallback, useEffect, useMemo, useState } from "react";
import { FileText, Folder, FolderOpen, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import { t } from "../i18n";
import type { Settings, WorkspaceFile } from "../types";

interface WorkspacePanelProps {
  settings: Settings | null;
  onChooseWorkspace: () => void;
}

export function WorkspacePanel({ settings, onChooseWorkspace }: WorkspacePanelProps) {
  const language = settings?.appearance.language || "en";
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [selected, setSelected] = useState<WorkspaceFile | null>(null);
  const [content, setContent] = useState("");
  const [newPath, setNewPath] = useState("note.txt");
  const [status, setStatus] = useState("");

  const root = useMemo(() => settings?.workspacePath || "", [settings?.workspacePath]);

  const refresh = useCallback(async () => {
    const result = await window.localAgent.listFiles({ depth: 3 });
    setFiles(result.files);
  }, []);

  useEffect(() => {
    refresh().catch((error) => setStatus(error instanceof Error ? error.message : String(error)));
  }, [refresh, root]);

  async function openFile(file: WorkspaceFile) {
    setSelected(file);
    setStatus("");
    if (file.type === "directory") {
      return;
    }
    if (!file.isText) {
      setContent("");
      setStatus("Preview is available for text files only.");
      return;
    }
    const result = await window.localAgent.readFile({ filePath: file.relativePath });
    setContent(result.content);
  }

  async function saveFile() {
    if (!selected || selected.type !== "file") {
      return;
    }
    const result = await window.localAgent.writeFile({ filePath: selected.relativePath, content, overwrite: true });
    setSelected(result.info);
    setStatus(`Saved ${result.relativePath}`);
    await refresh();
  }

  async function createFile() {
    const result = await window.localAgent.writeFile({ filePath: newPath, content: "", overwrite: false });
    setSelected(result.info);
    setContent("");
    setStatus(`Created ${result.relativePath}`);
    await refresh();
  }

  async function deleteFile() {
    if (!selected) {
      return;
    }
    await window.localAgent.deleteFile({ filePath: selected.relativePath });
    setStatus(`Deleted ${selected.relativePath}`);
    setSelected(null);
    setContent("");
    await refresh();
  }

  return (
    <section className="workspace-view">
      <header className="workspace-header">
        <div>
          <h1>{t(language, "workspace")}</h1>
          <button className="link-button" type="button" onClick={onChooseWorkspace}>
            {root || t(language, "noDirectory")}
          </button>
        </div>
        <div className="workspace-header-actions">
          <button className="quiet-button icon-text" type="button" onClick={refresh}>
            <RefreshCw size={15} />
            Refresh
          </button>
          <button className="quiet-button icon-text" type="button" onClick={() => root && window.localAgent.openPath(root)}>
            <FolderOpen size={15} />
            Open
          </button>
        </div>
      </header>

      <div className="workspace-grid">
        <aside className="file-browser">
          <div className="new-file-row">
            <input value={newPath} onChange={(event) => setNewPath(event.target.value)} aria-label="New file path" />
            <button className="icon-button" type="button" onClick={createFile} aria-label="Create file">
              <Plus size={17} />
            </button>
          </div>
          <div className="file-list">
            {files.map((file) => (
              <button
                className={selected?.relativePath === file.relativePath ? "file-row active" : "file-row"}
                type="button"
                key={file.relativePath}
                onClick={() => openFile(file)}
                title={file.absolutePath}
              >
                {file.type === "directory" ? <Folder size={16} /> : <FileText size={16} />}
                <span>{file.relativePath}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="file-editor">
          <div className="file-editor-header">
            <strong>{selected?.relativePath || "No file selected"}</strong>
            <div>
              <button className="quiet-button icon-text" type="button" onClick={deleteFile} disabled={!selected}>
                <Trash2 size={15} />
                Delete
              </button>
              <button className="primary-button" type="button" onClick={saveFile} disabled={!selected || selected.type !== "file" || !selected.isText}>
                <Save size={15} />
                {t(language, "save")}
              </button>
            </div>
          </div>
          <textarea
            className="editor-textarea"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            disabled={!selected || selected.type !== "file" || !selected.isText}
            spellCheck={false}
          />
          {status ? <div className="workspace-status">{status}</div> : null}
        </main>
      </div>
    </section>
  );
}
