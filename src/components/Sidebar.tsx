import { Bot, Clock3, FolderOpen, MessageSquare, Plus, Settings as SettingsIcon, Terminal, UserRound } from "lucide-react";
import { t } from "../i18n";
import type { LanguageCode, Settings } from "../types";

export type ActiveView = "chat" | "history" | "workspace" | "terminal";

interface SidebarProps {
  activeView: ActiveView;
  settings: Settings | null;
  onNavigate: (view: ActiveView) => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
}

export function Sidebar({ activeView, settings, onNavigate, onNewChat, onOpenSettings }: SidebarProps) {
  const language = (settings?.appearance.language || "en") as LanguageCode;
  const userName = "Anatoly";

  return (
    <aside className="sidebar">
      <div className="brand-row">
        <div className="brand-mark">
          <Bot size={25} />
        </div>
        <div className="brand-copy">
          <strong>Local Agent Studio</strong>
          <span>v0.1.5</span>
        </div>
        <button className="icon-button new-chat-button" type="button" onClick={onNewChat} aria-label={t(language, "newChat")}>
          <Plus size={19} />
        </button>
      </div>

      <nav className="nav-list">
        <button className={activeView === "chat" ? "nav-item active" : "nav-item"} type="button" onClick={() => onNavigate("chat")}>
          <MessageSquare size={18} />
          {t(language, "chat")}
        </button>
        <button className={activeView === "history" ? "nav-item active" : "nav-item"} type="button" onClick={() => onNavigate("history")}>
          <Clock3 size={18} />
          {t(language, "history")}
        </button>
        <button className={activeView === "workspace" ? "nav-item active" : "nav-item"} type="button" onClick={() => onNavigate("workspace")}>
          <FolderOpen size={18} />
          {t(language, "workspace")}
        </button>
        <button className={activeView === "terminal" ? "nav-item active" : "nav-item"} type="button" onClick={() => onNavigate("terminal")}>
          <Terminal size={18} />
          {t(language, "terminal")}
        </button>
        <button className="nav-item" type="button" onClick={onOpenSettings}>
          <SettingsIcon size={18} />
          {t(language, "settings")}
        </button>
      </nav>

      <button className="profile-row" type="button" onClick={onOpenSettings}>
        <span className="profile-avatar">
          <UserRound size={17} />
        </span>
        <span>{userName}</span>
      </button>
    </aside>
  );
}
