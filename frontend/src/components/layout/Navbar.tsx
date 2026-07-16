import { Moon, Sun, LogOut, Bell } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export function Navbar({ title }: { title: string }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-4 bg-white/60 dark:bg-surface-dark/60 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/5">
      <h1 className="font-display font-bold text-lg sm:text-xl text-slate-800 dark:text-white">{title}</h1>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
          <Bell size={18} />
        </button>
        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-white/10">
          <div className="w-8 h-8 rounded-full bg-grad-primary flex items-center justify-center text-white text-xs font-bold">
            {user?.full_name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{user?.full_name}</span>
        </div>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-accent-coral/10 hover:text-accent-coral transition-colors"
          aria-label="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
