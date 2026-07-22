import { BookOpen, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Card, EmptyState, ErrorAlert, LoadingState } from "../components/ui";
import { api } from "../lib/api";
import { StudyPlan } from "../lib/types";

export function StudyPlanPage() {
  const [plans, setPlans] = useState<StudyPlan[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function load() {
    const data = await api<{ plans: StudyPlan[] }>("/api/study-plans");
    setPlans(data.plans);
  }
  useEffect(() => { load(); }, []);
  async function createPlan() {
    setBusy(true);
    setError("");
    try {
      await api("/api/study-plans", { method: "POST", body: JSON.stringify({}) });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create a study plan.");
    } finally {
      setBusy(false);
    }
  }
  if (!plans) return <LoadingState label="Loading study plans" />;
  const latest = plans[0];
  return (
    <div className="px-4 py-6 pb-24 md:px-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-ink">Seven-day study plan</h1><p className="text-sm text-slate-600">Turn weak areas into a focused week of practice.</p></div>
        <Button onClick={createPlan} disabled={busy}><Plus className="h-4 w-4" /> Generate plan</Button>
      </div>
      <ErrorAlert message={error} />
      {latest ? (
        <div className="mt-4 grid gap-4">
          <Card><h2 className="flex items-center gap-2 font-semibold text-ink"><BookOpen className="h-5 w-5 text-teal" /> {latest.plan_title}</h2><p className="mt-1 text-sm text-slate-500">Created {new Date(latest.created_at).toLocaleString()}</p></Card>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {latest.plan_content.days.map((day) => (
              <Card key={day.day}>
                <p className="text-sm font-semibold text-coral">Day {day.day}</p>
                <h3 className="mt-1 text-lg font-semibold text-ink">{day.topic}</h3>
                <p className="mt-2 text-sm text-slate-600">{day.objective}</p>
                <div className="mt-4 grid gap-2 text-sm text-slate-700">
                  <p><span className="font-semibold">Learn:</span> {day.learning_activity}</p>
                  <p><span className="font-semibold">Practice:</span> {day.practice_activity}</p>
                  <p><span className="font-semibold">Time:</span> {day.duration_minutes} minutes</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : <div className="mt-4"><EmptyState title="No study plan yet" body="Generate a personalized seven-day plan after setting up your profile." /></div>}
    </div>
  );
}
