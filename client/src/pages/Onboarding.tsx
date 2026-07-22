import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui";
import { api } from "../lib/api";
import { ProfileForm, ProfileFormData } from "./ProfileForm";

const splitList = (value?: string) => value?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];

export function Onboarding() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  async function save(values: ProfileFormData) {
    setError("");
    await api("/api/profile", {
      method: "PUT",
      body: JSON.stringify({
        ...values,
        known_technologies: splitList(values.known_technologies),
        weak_technologies: splitList(values.weak_technologies),
        onboarding_completed: true
      })
    });
    navigate("/dashboard");
  }
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <Card className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-ink">Set up your interview profile</h1>
        <p className="mt-2 text-sm text-slate-600">CareerPilot uses this to tune questions and feedback to your current level.</p>
        <div className="mt-6"><ProfileForm error={error} onSubmit={save} submitLabel="Finish onboarding" /></div>
      </Card>
    </main>
  );
}
