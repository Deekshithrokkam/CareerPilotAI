import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button, SecondaryButton } from "../components/ui";

export function Landing() {
  return (
    <main className="min-h-screen bg-[#f7faf8]">
      <section className="grid min-h-[92vh] items-center gap-10 px-6 py-10 md:grid-cols-[1fr_0.9fr] md:px-12 lg:px-20">
        <div>
          <div className="inline-flex items-center gap-2 rounded-md bg-mint px-3 py-2 text-sm font-semibold text-teal">
            <Sparkles className="h-4 w-4" /> Real-time AI interview practice
          </div>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight text-ink md:text-6xl">CareerPilot AI</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-650">
            Practice technical and HR interviews, get structured feedback, track weak areas, and turn every attempt into a focused seven-day study plan.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register"><Button>Start practicing <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link to="/login"><SecondaryButton>Log in</SecondaryButton></Link>
          </div>
        </div>
        <div className="relative rounded-lg border border-slate-200 bg-white p-4 shadow-xl">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
            alt="Students preparing together"
            className="aspect-[4/3] w-full rounded-md object-cover"
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {["Gemini questions", "Private feedback", "Progress tracking"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-teal" /> {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
