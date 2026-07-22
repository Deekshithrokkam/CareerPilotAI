import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button, Card, ErrorAlert, Field } from "../components/ui";
import { supabase } from "../lib/supabase";

const schema = z.object({ email: z.string().email(), password: z.string().min(6) });
type FormData = z.infer<typeof schema>;

export function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });
  async function onSubmit(values: FormData) {
    setError("");
    const { error: authError } = await supabase.auth.signInWithPassword(values);
    if (authError) return setError(authError.message);
    navigate("/dashboard");
  }
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-ink">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-600">Log in to continue your interview practice.</p>
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <ErrorAlert message={error} />
          <Field label="Email" error={errors.email?.message}><input className="focus-ring rounded-md border border-slate-300 px-3 py-2" {...register("email")} /></Field>
          <Field label="Password" error={errors.password?.message}><input className="focus-ring rounded-md border border-slate-300 px-3 py-2" type="password" {...register("password")} /></Field>
          <Button disabled={isSubmitting}><LogIn className="h-4 w-4" /> Log in</Button>
        </form>
        <p className="mt-5 text-sm text-slate-600">New here? <Link className="font-semibold text-teal" to="/register">Create an account</Link></p>
      </Card>
    </main>
  );
}
