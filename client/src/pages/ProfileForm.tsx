import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, ErrorAlert, Field } from "../components/ui";
import { difficulties, targetRoles } from "../lib/constants";
import { Profile } from "../lib/types";

const schema = z.object({
  full_name: z.string().min(2),
  university: z.string().optional(),
  current_year: z.string().optional(),
  target_role: z.string().optional(),
  experience_level: z.string().optional(),
  preferred_difficulty: z.string().optional(),
  known_technologies: z.string().optional(),
  weak_technologies: z.string().optional(),
  daily_preparation_minutes: z.coerce.number().min(15).max(240)
});
export type ProfileFormData = z.infer<typeof schema>;

export function ProfileForm({ profile, error, onSubmit, submitLabel = "Save profile" }: { profile?: Profile | null; error?: string; submitLabel?: string; onSubmit: (values: ProfileFormData) => Promise<void> }) {
  const form = useForm<ProfileFormData>({ resolver: zodResolver(schema), defaultValues: { daily_preparation_minutes: 60 } });
  useEffect(() => {
    if (profile) {
      form.reset({
        full_name: profile.full_name,
        university: profile.university ?? "",
        current_year: profile.current_year ?? "",
        target_role: profile.target_role ?? "Full-Stack Developer",
        experience_level: profile.experience_level ?? "Beginner",
        preferred_difficulty: profile.preferred_difficulty ?? "Easy",
        known_technologies: profile.known_technologies?.join(", ") ?? "",
        weak_technologies: profile.weak_technologies?.join(", ") ?? "",
        daily_preparation_minutes: profile.daily_preparation_minutes ?? 60
      });
    }
  }, [profile, form]);
  const errors = form.formState.errors;
  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      <ErrorAlert message={error} />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Full name" error={errors.full_name?.message}><input className="focus-ring rounded-md border border-slate-300 px-3 py-2" {...form.register("full_name")} /></Field>
        <Field label="University" error={errors.university?.message}><input className="focus-ring rounded-md border border-slate-300 px-3 py-2" {...form.register("university")} /></Field>
        <Field label="Current year" error={errors.current_year?.message}><input className="focus-ring rounded-md border border-slate-300 px-3 py-2" {...form.register("current_year")} /></Field>
        <Field label="Experience level"><select className="focus-ring rounded-md border border-slate-300 px-3 py-2" {...form.register("experience_level")}><option>Beginner</option><option>Intermediate</option><option>Advanced beginner</option></select></Field>
        <Field label="Target role"><select className="focus-ring rounded-md border border-slate-300 px-3 py-2" {...form.register("target_role")}>{targetRoles.map((item) => <option key={item}>{item}</option>)}</select></Field>
        <Field label="Preferred difficulty"><select className="focus-ring rounded-md border border-slate-300 px-3 py-2" {...form.register("preferred_difficulty")}>{difficulties.map((item) => <option key={item}>{item}</option>)}</select></Field>
      </div>
      <Field label="Known technologies"><input className="focus-ring rounded-md border border-slate-300 px-3 py-2" placeholder="React, SQL, Git" {...form.register("known_technologies")} /></Field>
      <Field label="Weak technologies"><input className="focus-ring rounded-md border border-slate-300 px-3 py-2" placeholder="PostgreSQL, Security" {...form.register("weak_technologies")} /></Field>
      <Field label="Daily preparation minutes"><input className="focus-ring rounded-md border border-slate-300 px-3 py-2" type="number" {...form.register("daily_preparation_minutes")} /></Field>
      <Button disabled={form.formState.isSubmitting}><Save className="h-4 w-4" /> {submitLabel}</Button>
    </form>
  );
}
