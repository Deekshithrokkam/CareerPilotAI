import { zodResolver } from "@hookform/resolvers/zod";
import { Rocket } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button, Card, ErrorAlert, Field } from "../components/ui";
import { api } from "../lib/api";
import { difficulties, interviewTypes, questionCounts, targetRoles, topicsByRole } from "../lib/constants";
import { Session } from "../lib/types";

const schema = z.object({
  target_role: z.enum(targetRoles),
  interview_type: z.enum(interviewTypes),
  topic: z.string().min(2),
  difficulty: z.enum(difficulties),
  total_questions: z.coerce.number().refine((value) => [3, 5, 10].includes(value))
});
type FormData = z.infer<typeof schema>;

export function InterviewSetup() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const form = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { target_role: "Full-Stack Developer", interview_type: "Technical", topic: "React", difficulty: "Easy", total_questions: 3 } });
  const role = form.watch("target_role");
  async function start(values: FormData) {
    setError("");
    const data = await api<{ session: Session }>("/api/interviews/start", { method: "POST", body: JSON.stringify(values) });
    navigate(`/interview/${data.session.id}`);
  }
  return (
    <div className="px-4 py-6 pb-24 md:px-8">
      <Card className="max-w-3xl">
        <h1 className="text-2xl font-bold text-ink">New mock interview</h1>
        <form className="mt-6 grid gap-4" onSubmit={form.handleSubmit(start)}>
          <ErrorAlert message={error} />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Target role"><select className="focus-ring rounded-md border border-slate-300 px-3 py-2" {...form.register("target_role")}>{targetRoles.map((item) => <option key={item}>{item}</option>)}</select></Field>
            <Field label="Interview type"><select className="focus-ring rounded-md border border-slate-300 px-3 py-2" {...form.register("interview_type")}>{interviewTypes.map((item) => <option key={item}>{item}</option>)}</select></Field>
            <Field label="Topic"><select className="focus-ring rounded-md border border-slate-300 px-3 py-2" {...form.register("topic")}>{topicsByRole[role].map((item) => <option key={item}>{item}</option>)}</select></Field>
            <Field label="Difficulty"><select className="focus-ring rounded-md border border-slate-300 px-3 py-2" {...form.register("difficulty")}>{difficulties.map((item) => <option key={item}>{item}</option>)}</select></Field>
            <Field label="Question count"><select className="focus-ring rounded-md border border-slate-300 px-3 py-2" {...form.register("total_questions")}>{questionCounts.map((item) => <option key={item} value={item}>{item}</option>)}</select></Field>
          </div>
          <Button disabled={form.formState.isSubmitting}><Rocket className="h-4 w-4" /> Create interview</Button>
        </form>
      </Card>
    </div>
  );
}
