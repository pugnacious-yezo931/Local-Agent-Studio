import { MessageSquarePlus } from "lucide-react";
import { t } from "../i18n";
import type { ChatMessage, Settings } from "../types";

interface HistoryPanelProps {
  messages: ChatMessage[];
  settings: Settings | null;
  onNewChat: () => void;
  onBackToChat: () => void;
}

export function HistoryPanel({ messages, settings, onNewChat, onBackToChat }: HistoryPanelProps) {
  const language = settings?.appearance.language || "en";
  const userMessages = messages.filter((message) => message.role === "user");

  return (
    <section className="history-view">
      <header className="workspace-header">
        <div>
          <h1>{t(language, "history")}</h1>
        </div>
        <button className="primary-button" type="button" onClick={onNewChat}>
          <MessageSquarePlus size={16} />
          {t(language, "newChat")}
        </button>
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
