import { useState } from "react";
import { motion } from "framer-motion";
import { LogOut, Moon, Sun, User, Mail, Calendar } from "lucide-react";
import { AppLayout } from "../components/layout/AppLayout";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);

  return (
    <AppLayout title="Profile & Settings">
      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-grad-primary flex items-center justify-center text-white text-2xl font-bold shadow-glow">
              {user?.full_name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg">{user?.full_name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <User size={16} className="text-brand-500" /> {user?.full_name}
            </div>
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <Mail size={16} className="text-brand-500" /> {user?.email}
            </div>
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <Calendar size={16} className="text-brand-500" />
              Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
            </div>
          </div>
        </GlassCard>

        <GlassCard delay={0.05}>
          <h3 className="font-display font-semibold text-lg mb-4">Appearance</h3>
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5">
            <div className="flex items-center gap-3">
              {theme === "dark" ? <Moon size={18} className="text-brand-400" /> : <Sun size={18} className="text-amber-500" />}
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {theme === "dark" ? "Dark Mode" : "Light Mode"}
              </span>
            </div>
            <button
              onClick={toggleTheme}
              className={`w-12 h-6 rounded-full relative transition-colors ${theme === "dark" ? "bg-grad-primary" : "bg-slate-300"}`}
            >
              <motion.span
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow"
                animate={{ left: theme === "dark" ? 26 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          <h3 className="font-display font-semibold text-lg mt-8 mb-4">Account</h3>
          {!confirmLogout ? (
            <Button variant="danger" onClick={() => setConfirmLogout(true)}>
              <LogOut size={16} /> Log out
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500 dark:text-slate-400">Are you sure?</span>
              <Button variant="danger" size="sm" onClick={() => { logout(); navigate("/login"); }}>
                Yes, log out
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmLogout(false)}>
                Cancel
              </Button>
            </div>
          )}
        </GlassCard>
      </div>
    </AppLayout>
  );
}
