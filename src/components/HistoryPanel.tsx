import { Download, MessageSquarePlus, Upload } from "lucide-react";
import { t } from "../i18n";
import type { ChatMessage, Settings } from "../types";

interface HistoryPanelProps {
  messages: ChatMessage[];
  settings: Settings | null;
  onNewChat: () => void;
  onBackToChat: () => void;
  onExportChat: () => void;
  onImportChat: () => void;
}

export function HistoryPanel({ messages, settings, onNewChat, onBackToChat, onExportChat, onImportChat }: HistoryPanelProps) {
  const language = settings?.appearance.language || "en";
  const userMessages = messages.filter((message) => message.role === "user");

  return (
    <section className="history-view">
      <header className="workspace-header">
        <div>
          <h1>{t(language, "history")}</h1>
        </div>
        <div className="workspace-header-actions">
          <button className="quiet-button icon-text" type="button" onClick={onImportChat}>
            <Upload size={15} />
            Import
          </button>
          <button className="quiet-button icon-text" type="button" onClick={onExportChat}>
            <Download size={15} />
            Export
          </button>
          <button className="primary-button" type="button" onClick={onNewChat}>
            <MessageSquarePlus size={16} />
            {t(language, "newChat")}
          </button>
        </div>
      </header>
      <div className="history-list">
        {userMessages.length ? (
          userMessages.map((message) => (
            <button className="history-row" type="button" key={message.id} onClick={onBackToChat}>
              <strong>{message.content.slice(0, 90) || "Message"}</strong>
              <span>{message.createdAt}</span>
            </button>
          ))
        ) : (
          <button className="history-row empty" type="button" onClick={onBackToChat}>
            <strong>{t(language, "chat")}</strong>
            <span>{t(language, "ready")}</span>
          </button>
        )}
      </div>
    </section>
  );
}
