import { Send, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Card, ErrorAlert, LoadingState, SecondaryButton } from "../components/ui";
import { api } from "../lib/api";
import { supabase } from "../lib/supabase";
import { Answer, Question, Session } from "../lib/types";

type InterviewData = { session: Session; questions: Question[]; answers: Answer[] };

const statusLabels: Record<string, string> = {
  waiting: "Waiting",
  generating_question: "Generating question",
  question_ready: "Question ready",
  evaluating_answer: "Evaluating answer",
  generating_feedback: "Generating feedback",
  saving_result: "Saving result",
  completed: "Completed",
  failed: "Failed"
};

export function InterviewRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<InterviewData | null>(null);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const latestQuestion = useMemo(() => data?.questions[data.questions.length - 1], [data]);
  const latestAnswer = useMemo(() => data?.answers.find((item) => item.question_id === latestQuestion?.id), [data, latestQuestion]);
  const answeredCount = data?.answers.length ?? 0;

  const refresh = useCallback(async () => {
    if (!id) return;
    const next = await api<InterviewData>(`/api/interviews/${id}`);
    setData(next);
    if (next.session.status === "completed") navigate(`/interview/${id}/result`);
  }, [id, navigate]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!id || !data?.session.user_id) return;
    const channel = supabase
      .channel(`interview-${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "interview_sessions", filter: `id=eq.${id}` }, (payload) => {
        const next = payload.new as Session;
        if (next.user_id === data.session.user_id) setData((current) => current ? { ...current, session: next } : current);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, data?.session.user_id]);

  async function generateNextQuestion() {
    if (!id) return;
    setBusy(true);
    setError("");
    try {
      await api(`/api/interviews/${id}/question`, { method: "POST" });
      await refresh();
      setAnswer("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate a question.");
    } finally {
      setBusy(false);
    }
  }

  async function submitAnswer() {
    if (!id || !latestQuestion) return;
    setBusy(true);
    setError("");
    try {
      await api(`/api/interviews/${id}/answer`, { method: "POST", body: JSON.stringify({ question_id: latestQuestion.id, student_answer: answer }) });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your answer.");
    } finally {
      setBusy(false);
    }
  }

  async function completeInterview() {
    if (!id) return;
    setBusy(true);
    setError("");
    try {
      await api(`/api/interviews/${id}/complete`, { method: "POST" });
      navigate(`/interview/${id}/result`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not complete the interview.");
    } finally {
      setBusy(false);
    }
  }

  if (!data) return <LoadingState label="Loading interview" />;
  const allAnswered = answeredCount >= data.session.total_questions;
  return (
    <div className="px-4 py-6 pb-24 md:px-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">{data.session.topic} interview</h1>
          <p className="text-sm text-slate-600">{answeredCount} of {data.session.total_questions} answered · {data.session.difficulty}</p>
        </div>
        <span className="rounded-md bg-mint px-3 py-2 text-sm font-semibold text-teal">{statusLabels[data.session.processing_status] ?? data.session.processing_status}</span>
      </div>
      <ErrorAlert message={error} />
      <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <Card>
          {!latestQuestion ? (
            <div className="grid gap-4">
              <p className="text-slate-700">Start by generating your first question. CareerPilot will ask one question at a time.</p>
              <Button onClick={generateNextQuestion} disabled={busy}><Sparkles className="h-4 w-4" /> Generate question</Button>
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="rounded-md bg-slate-50 p-4">
                <p className="text-sm font-semibold text-teal">Question {latestQuestion.question_order}</p>
                <h2 className="mt-2 text-xl font-semibold leading-8 text-ink">{latestQuestion.question}</h2>
                <p className="mt-2 text-sm text-slate-500">Skill tested: {latestQuestion.skill_tested}</p>
              </div>
              {!latestAnswer ? (
                <>
                  <textarea className="focus-ring min-h-48 rounded-md border border-slate-300 p-3" value={answer} onChange={(event) => setAnswer(event.target.value)} maxLength={4000} placeholder="Write your answer in clear interview style." />
                  <Button onClick={submitAnswer} disabled={busy || answer.trim().length < 5}><Send className="h-4 w-4" /> Submit answer</Button>
                </>
              ) : allAnswered ? (
                <Button onClick={completeInterview} disabled={busy}>Generate final report</Button>
              ) : (
                <Button onClick={generateNextQuestion} disabled={busy}>Next question</Button>
              )}
            </div>
          )}
        </Card>
        <Card>
          <h2 className="font-semibold text-ink">Latest feedback</h2>
          {latestAnswer ? (
            <div className="mt-4 grid gap-4 text-sm text-slate-700">
              <div className="rounded-md bg-gold/20 p-3"><span className="font-bold text-ink">{latestAnswer.score}/10</span> · {latestAnswer.result}</div>
              <p><span className="font-semibold">Technical:</span> {latestAnswer.technical_feedback}</p>
              <p><span className="font-semibold">Communication:</span> {latestAnswer.communication_feedback}</p>
              <div><p className="font-semibold">Improved answer</p><p className="mt-1">{latestAnswer.improved_answer}</p></div>
              {latestAnswer.follow_up_question ? <p><span className="font-semibold">Follow-up:</span> {latestAnswer.follow_up_question}</p> : null}
            </div>
          ) : <p className="mt-4 text-sm text-slate-600">Feedback appears after you submit an answer.</p>}
          <Link to="/dashboard"><SecondaryButton className="mt-5 w-full">Back to dashboard</SecondaryButton></Link>
        </Card>
      </div>
    </div>
  );
}
