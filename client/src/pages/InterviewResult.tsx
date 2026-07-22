import { BookOpen, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, Card, LoadingState } from "../components/ui";
import { api } from "../lib/api";
import { Answer, Question, Session } from "../lib/types";

export function InterviewResult() {
  const { id } = useParams();
  const [data, setData] = useState<{ session: Session; questions: Question[]; answers: Answer[] } | null>(null);
  useEffect(() => { if (id) api<typeof data>(`/api/interviews/${id}`).then(setData); }, [id]);
  if (!data) return <LoadingState label="Loading report" />;
  const session = data.session;
  return (
    <div className="px-4 py-6 pb-24 md:px-8">
      <Card className="max-w-5xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><h1 className="text-2xl font-bold text-ink">Final interview report</h1><p className="mt-1 text-sm text-slate-600">{session.target_role} · {session.topic}</p></div>
          <div className="rounded-md bg-mint px-5 py-3 text-center"><p className="text-sm text-teal">Overall score</p><p className="text-3xl font-bold text-ink">{session.overall_score ?? 0}%</p></div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card className="shadow-none"><h2 className="flex items-center gap-2 font-semibold"><Trophy className="h-5 w-5 text-gold" /> Strong areas</h2><ul className="mt-3 list-disc pl-5 text-sm text-slate-700">{(session.strong_areas ?? []).map((item) => <li key={item}>{item}</li>)}</ul></Card>
          <Card className="shadow-none"><h2 className="flex items-center gap-2 font-semibold"><BookOpen className="h-5 w-5 text-coral" /> Topics to revise</h2><ul className="mt-3 list-disc pl-5 text-sm text-slate-700">{(session.topics_to_revise ?? []).map((item) => <li key={item}>{item}</li>)}</ul></Card>
        </div>
        <div className="mt-6 grid gap-4 text-sm leading-7 text-slate-700">
          <p><span className="font-semibold text-ink">Performance level:</span> {session.performance_level}</p>
          <p><span className="font-semibold text-ink">Technical summary:</span> {session.technical_summary}</p>
          <p><span className="font-semibold text-ink">Communication summary:</span> {session.communication_summary}</p>
          <p><span className="font-semibold text-ink">Next difficulty:</span> {session.next_difficulty}</p>
          <p className="rounded-md bg-slate-50 p-4">{session.final_message}</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3"><Link to="/study-plan"><Button>Generate study plan</Button></Link><Link to="/history"><Button className="bg-ink">View history</Button></Link></div>
      </Card>
    </div>
  );
}
