import { ArrowRight, BookOpen, History, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, EmptyState, ErrorAlert, LoadingState, SecondaryButton } from "../components/ui";
import { api } from "../lib/api";
import { Session } from "../lib/types";

type DashboardData = {
  metrics: { total_interviews: number; completed_interviews: number; average_score: number; topics_practiced: number };
  recent_sessions: Session[];
  progress: Array<{ topic: string; average_score: number; attempts: number }>;
};

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");
    try {
      const next = await api<DashboardData>("/api/dashboard");
      setData(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) return <LoadingState label="Preparing your dashboard" />;
  if (error) {
    return (
      <div className="px-4 py-6 pb-24 md:px-8">
        <Card className="max-w-2xl">
          <h1 className="text-2xl font-bold text-ink">Dashboard unavailable</h1>
          <p className="mt-2 text-sm text-slate-600">CareerPilot could not load your dashboard data.</p>
          <div className="mt-5"><ErrorAlert message={error} /></div>
          <SecondaryButton className="mt-5" onClick={loadDashboard}>Try again</SecondaryButton>
        </Card>
      </div>
    );
  }
  if (!data) return null;
  const metricCards = [
    ["Interviews", data.metrics.total_interviews],
    ["Completed", data.metrics.completed_interviews],
    ["Average score", `${data.metrics.average_score}%`],
    ["Topics", data.metrics.topics_practiced]
  ];
  return (
    <div className="px-4 py-6 pb-24 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-ink">Dashboard</h1><p className="text-sm text-slate-600">Track practice, feedback, and next steps.</p></div>
        <Link to="/interview/new"><Button>Start interview <ArrowRight className="h-4 w-4" /></Button></Link>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map(([label, value]) => <Card key={label.toString()}><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-ink">{value}</p></Card>)}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Card>
          <h2 className="flex items-center gap-2 font-semibold text-ink"><History className="h-5 w-5 text-coral" /> Recent interviews</h2>
          <div className="mt-4 grid gap-3">
            {data.recent_sessions.length ? data.recent_sessions.map((session) => (
              <Link key={session.id} to={session.status === "completed" ? `/interview/${session.id}/result` : `/interview/${session.id}`} className="rounded-md border border-slate-200 p-3 hover:border-teal">
                <div className="flex items-center justify-between gap-3"><span className="font-medium">{session.topic}</span><span className="text-sm text-slate-500">{session.status}</span></div>
                <p className="mt-1 text-sm text-slate-600">{session.target_role} · {session.difficulty}</p>
              </Link>
            )) : <EmptyState title="No interviews yet" body="Start your first mock interview when you are ready." />}
          </div>
        </Card>
        <Card>
          <h2 className="flex items-center gap-2 font-semibold text-ink"><TrendingUp className="h-5 w-5 text-teal" /> Topic progress</h2>
          <div className="mt-4 grid gap-3">
            {data.progress.length ? data.progress.slice(0, 6).map((item) => (
              <div key={item.topic}>
                <div className="flex justify-between text-sm"><span>{item.topic}</span><span>{item.average_score}/10</span></div>
                <div className="mt-1 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-gold" style={{ width: `${Math.min(100, Number(item.average_score) * 10)}%` }} /></div>
              </div>
            )) : <EmptyState title="No topic data" body="Progress appears after your first evaluated answer." />}
            <Link className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-teal" to="/study-plan"><BookOpen className="h-4 w-4" /> Generate a study plan</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
