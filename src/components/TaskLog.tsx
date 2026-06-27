import { Trash2 } from "lucide-react";
import type { AppLog } from "../types";

interface TaskLogProps {
  logs: AppLog[];
}

export function TaskLog({ logs }: TaskLogProps) {
  return (
    <section className="task-log">
      <div className="task-log-header">
        <h2>Live Task Log</h2>
        <button className="icon-button small" type="button" aria-label="Clear log">
          <Trash2 size={15} />
        </button>
      </div>
      <div className="log-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Level</th>
              <th>Source</th>
              <th>Message</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{log.time}</td>
                <td>
                  <span className={`log-level ${log.level.toLowerCase()}`}>{log.level}</span>
                </td>
                <td>{log.source}</td>
                <td>{log.message}</td>
                <td>{log.durationMs === null || log.durationMs === undefined ? "-" : `${log.durationMs} ms`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
