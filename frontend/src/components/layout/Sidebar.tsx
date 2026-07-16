import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, UserCircle2, FlaskConical, MessageSquareText,
  LineChart, HeartPulse, Target, Wallet, Settings, Sparkles,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/digital-twin", label: "Digital Twin", icon: UserCircle2 },
  { to: "/simulator", label: "Scenario Simulator", icon: FlaskConical },
  { to: "/advisor", label: "AI Advisor", icon: MessageSquareText },
  { to: "/predictions", label: "Predictive Analytics", icon: LineChart },
  { to: "/health-score", label: "Financial Health", icon: HeartPulse },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/investments", label: "Investments", icon: Wallet },
  { to: "/profile", label: "Profile & Settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 px-4 py-6 border-r border-slate-200/60 dark:border-white/5 bg-white/50 dark:bg-surface-darkCard/40 backdrop-blur-xl">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-9 h-9 rounded-xl bg-grad-primary flex items-center justify-center shadow-glow">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <span className="font-display font-bold text-lg text-slate-800 dark:text-white">FinTwin AI</span>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-grad-primary text-white shadow-glow"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
              }`
            }
          >
            <Icon className="w-4.5 h-4.5 shrink-0" size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 mt-4 rounded-xl glass text-xs text-slate-500 dark:text-slate-400">
        Your financial digital twin, recalculated in real time.
      </div>
    </aside>
  );
}
