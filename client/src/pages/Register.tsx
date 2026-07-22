import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button, Card, ErrorAlert, Field } from "../components/ui";
import { supabase } from "../lib/supabase";

const schema = z.object({ fullName: z.string().min(2), email: z.string().email(), password: z.string().min(6) });
type FormData = z.infer<typeof schema>;

export function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });
  async function onSubmit(values: FormData) {
    setError("");
    const { error: authError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { full_name: values.fullName } }
    });
    if (authError) return setError(authError.message);
    navigate("/onboarding");
  }
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-ink">Create your account</h1>
        <p className="mt-2 text-sm text-slate-600">Set up your student profile and begin practicing.</p>
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <ErrorAlert message={error} />
          <Field label="Full name" error={errors.fullName?.message}><input className="focus-ring rounded-md border border-slate-300 px-3 py-2" {...register("fullName")} /></Field>
          <Field label="Email" error={errors.email?.message}><input className="focus-ring rounded-md border border-slate-300 px-3 py-2" {...register("email")} /></Field>
          <Field label="Password" error={errors.password?.message}><input className="focus-ring rounded-md border border-slate-300 px-3 py-2" type="password" {...register("password")} /></Field>
          <Button disabled={isSubmitting}><UserPlus className="h-4 w-4" /> Register</Button>
        </form>
        <p className="mt-5 text-sm text-slate-600">Already registered? <Link className="font-semibold text-teal" to="/login">Log in</Link></p>
      </Card>
    </main>
  );
}
