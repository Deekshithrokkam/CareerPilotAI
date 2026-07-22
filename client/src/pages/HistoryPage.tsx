import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, EmptyState, LoadingState } from "../components/ui";
import { api } from "../lib/api";
import { Session } from "../lib/types";

export function HistoryPage() {
  const [sessions, setSessions] = useState<Session[] | null>(null);
  useEffect(() => { api<{ sessions: Session[] }>("/api/interviews").then((data) => setSessions(data.sessions)); }, []);
  if (!sessions) return <LoadingState label="Loading history" />;
  return (
    <div className="px-4 py-6 pb-24 md:px-8">
      <Card>
        <h1 className="text-2xl font-bold text-ink">Interview history</h1>
        <div className="mt-5 overflow-x-auto">
          {sessions.length ? (
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500"><tr><th className="py-3">Topic</th><th>Role</th><th>Difficulty</th><th>Status</th><th>Score</th><th>Date</th></tr></thead>
              <tbody>{sessions.map((session) => (
                <tr key={session.id} className="border-b border-slate-100">
                  <td className="py-3 font-medium"><Link className="text-teal" to={session.status === "completed" ? `/interview/${session.id}/result` : `/interview/${session.id}`}>{session.topic}</Link></td>
                  <td>{session.target_role}</td><td>{session.difficulty}</td><td>{session.status}</td><td>{session.overall_score ?? "-"}</td><td>{new Date(session.created_at).toLocaleDateString()}</td>
                </tr>
              ))}</tbody>
            </table>
          ) : <EmptyState title="No interview history" body="Your completed and in-progress interviews will appear here." />}
        </div>
      </Card>
    </div>
  );
}
