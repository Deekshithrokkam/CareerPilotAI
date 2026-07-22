import { BookOpen, History, LayoutDashboard, LogOut, Plane, Sparkles, UserRound } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/interview/new", label: "New interview", icon: Sparkles },
  { to: "/history", label: "History", icon: History },
  { to: "/study-plan", label: "Study plan", icon: BookOpen },
  { to: "/profile", label: "Profile", icon: UserRound }
];

export function AppLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white p-5 md:block">
        <NavLink to="/dashboard" className="flex items-center gap-3 text-lg font-bold text-ink">
          <Plane className="h-6 w-6 text-coral" /> CareerPilot AI
        </NavLink>
        <nav className="mt-8 grid gap-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${isActive ? "bg-mint text-teal" : "text-slate-600 hover:bg-slate-100"}`}>
              <Icon className="h-4 w-4" /> {label}
            </NavLink>
          ))}
        </nav>
        <button className="absolute bottom-5 left-5 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100" onClick={async () => { await signOut(); navigate("/login"); }}>
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </aside>
      <main className="md:pl-64">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <NavLink to="/dashboard" className="font-bold text-ink">CareerPilot AI</NavLink>
          <button aria-label="Logout" onClick={async () => { await signOut(); navigate("/login"); }}><LogOut className="h-5 w-5" /></button>
        </header>
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 grid grid-cols-5 border-t border-slate-200 bg-white md:hidden">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `grid justify-items-center gap-1 px-1 py-2 text-[11px] ${isActive ? "text-teal" : "text-slate-500"}`}>
            <Icon className="h-5 w-5" /> <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
