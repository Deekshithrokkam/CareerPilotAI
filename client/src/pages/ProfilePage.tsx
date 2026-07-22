import { useEffect, useState } from "react";
import { Card, LoadingState } from "../components/ui";
import { api } from "../lib/api";
import { Profile } from "../lib/types";
import { ProfileForm, ProfileFormData } from "./ProfileForm";

const splitList = (value?: string) => value?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];

export function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    api<{ profile: Profile | null }>("/api/profile").then((data) => setProfile(data.profile)).finally(() => setLoading(false));
  }, []);
  async function save(values: ProfileFormData) {
    setError("");
    const data = await api<{ profile: Profile }>("/api/profile", {
      method: "PUT",
      body: JSON.stringify({
        ...values,
        known_technologies: splitList(values.known_technologies),
        weak_technologies: splitList(values.weak_technologies),
        onboarding_completed: true
      })
    });
    setProfile(data.profile);
  }
  if (loading) return <LoadingState />;
  return (
    <div className="px-4 py-6 pb-24 md:px-8">
      <Card className="max-w-4xl">
        <h1 className="text-2xl font-bold text-ink">Profile settings</h1>
        <div className="mt-6"><ProfileForm profile={profile} error={error} onSubmit={save} /></div>
      </Card>
    </div>
  );
}
